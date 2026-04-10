import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TextSearchPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
};

type TextSearchResponse = {
  places?: TextSearchPlace[];
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
};

function normalizePhone(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function scoreCandidate(
  candidate: TextSearchPlace,
  garageName: string,
  city: string,
  website: string,
  phone: string
) {
  let score = 0;

  const candidateName = normalizeText(candidate.displayName?.text);
  const candidateAddress = normalizeText(candidate.formattedAddress);
  const candidateWebsite = normalizeText(candidate.websiteUri);
  const candidatePhone = normalizePhone(candidate.nationalPhoneNumber);

  const wantedName = normalizeText(garageName);
  const wantedCity = normalizeText(city);
  const wantedWebsite = normalizeText(website);
  const wantedPhone = normalizePhone(phone);

  if (wantedName && candidateName.includes(wantedName)) score += 40;
  if (wantedName && wantedName.includes(candidateName) && candidateName) score += 20;

  if (wantedCity && candidateAddress.includes(wantedCity)) score += 20;

  if (wantedWebsite && candidateWebsite && candidateWebsite.includes(wantedWebsite.replace(/^https?:\/\//, ""))) {
    score += 30;
  }

  if (wantedPhone && candidatePhone && candidatePhone.endsWith(wantedPhone.slice(-9))) {
    score += 30;
  }

  if (typeof candidate.rating === "number") score += 2;
  if (typeof candidate.userRatingCount === "number" && candidate.userRatingCount > 0) {
    score += Math.min(candidate.userRatingCount, 20);
  }

  return score;
}

export async function POST(req: Request) {
  try {
    const { proAccountId } = await req.json();

    if (!proAccountId) {
      return NextResponse.json(
        { success: false, reason: "proAccountId manquant." },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

    if (!googleApiKey) {
      return NextResponse.json(
        { success: false, reason: "Clé Google Maps manquante sur le serveur." },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select(
        "id, garage_name, city, address, zip_code, website, phone, google_place_id"
      )
      .eq("id", proAccountId)
      .maybeSingle();

    if (proError || !proAccount) {
      return NextResponse.json(
        { success: false, reason: "Garage introuvable." },
        { status: 404 }
      );
    }

    const query = [
      proAccount.garage_name,
      proAccount.address,
      proAccount.zip_code,
      proAccount.city,
      "France",
    ]
      .filter(Boolean)
      .join(", ");

    if (!query) {
      return NextResponse.json(
        { success: false, reason: "Informations insuffisantes pour rechercher le garage." },
        { status: 400 }
      );
    }

    const textSearchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri",
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: "fr",
          regionCode: "FR",
          maxResultCount: 5,
        }),
        cache: "no-store",
      }
    );

    if (!textSearchRes.ok) {
      const text = await textSearchRes.text();

      return NextResponse.json(
        {
          success: false,
          reason: "Erreur Google Text Search.",
          details: text,
        },
        { status: 502 }
      );
    }

    const textSearchData = (await textSearchRes.json()) as TextSearchResponse;
    const candidates = textSearchData.places ?? [];

    if (!candidates.length) {
      await supabase
        .from("pro_accounts")
        .update({
          google_match_status: "not_found",
          google_place_id: null,
          google_rating: null,
          google_reviews_count: null,
          google_maps_url: null,
        })
        .eq("id", proAccountId);

      return NextResponse.json({
        success: false,
        reason: "Aucune fiche Google trouvée.",
      });
    }

    const ranked = [...candidates]
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(
          candidate,
          proAccount.garage_name || "",
          proAccount.city || "",
          proAccount.website || "",
          proAccount.phone || ""
        ),
      }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];

    if (!best?.candidate?.id || best.score < 35) {
      await supabase
        .from("pro_accounts")
        .update({
          google_match_status: "manual_review",
        })
        .eq("id", proAccountId);

      return NextResponse.json({
        success: false,
        reason: "Matching Google trop incertain, vérification manuelle recommandée.",
        candidates: ranked.map((r) => ({
          place_id: r.candidate.id,
          name: r.candidate.displayName?.text || null,
          address: r.candidate.formattedAddress || null,
          score: r.score,
        })),
      });
    }

    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${best.candidate.id}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,googleMapsUri",
        },
        cache: "no-store",
      }
    );

    if (!detailsRes.ok) {
      const text = await detailsRes.text();

      return NextResponse.json(
        {
          success: false,
          reason: "Erreur Google Place Details.",
          details: text,
        },
        { status: 502 }
      );
    }

    const details = (await detailsRes.json()) as PlaceDetailsResponse;

    await supabase
      .from("pro_accounts")
      .update({
        google_place_id: details.id || best.candidate.id,
        google_rating: details.rating ?? null,
        google_reviews_count: details.userRatingCount ?? null,
        google_maps_url: details.googleMapsUri ?? null,
        google_match_status: "matched",
      })
      .eq("id", proAccountId);

    return NextResponse.json({
      success: true,
      place_id: details.id || best.candidate.id,
      google_rating: details.rating ?? null,
      google_reviews_count: details.userRatingCount ?? null,
      google_maps_url: details.googleMapsUri ?? null,
      matched_name: details.displayName?.text || null,
      matched_address: details.formattedAddress || null,
    });
  } catch (error) {
    console.error("GOOGLE_MATCH_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        reason: "Erreur serveur pendant le matching Google.",
      },
      { status: 500 }
    );
  }
}