import { NextResponse } from "next/server";

type InseeTokenResponse = {
  access_token: string;
};

type InseeEtablissementResponse = {
  etablissement?: {
    siret?: string;
    siren?: string;
    uniteLegale?: {
      denominationUniteLegale?: string | null;
      nomUniteLegale?: string | null;
      prenom1UniteLegale?: string | null;
      activitePrincipaleUniteLegale?: string | null;
      etatAdministratifUniteLegale?: string | null;
    };
    adresseEtablissement?: {
      libelleCommuneEtablissement?: string | null;
    };
    periodesEtablissement?: Array<{
      etatAdministratifEtablissement?: string | null;
      activitePrincipaleEtablissement?: string | null;
    }>;
  };
};

function normalizeSiret(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const { siret } = await req.json();
    const cleanSiret = normalizeSiret(String(siret ?? ""));

    if (!/^\d{14}$/.test(cleanSiret)) {
      return NextResponse.json(
        {
          success: false,
          reason: "Le SIRET doit contenir exactement 14 chiffres.",
        },
        { status: 400 }
      );
    }

    const isDev =
      process.env.NODE_ENV !== "production" ||
      process.env.INSEE_BYPASS === "true";

    if (isDev) {
      return NextResponse.json({
        success: true,
        siret: cleanSiret,
        siren: cleanSiret.slice(0, 9),
        legal_name: "Garage Test",
        city: "Le Havre",
        ape: "4520A",
        decision: "approved",
        reason: "Mode développement : SIRET accepté automatiquement.",
      });
    }

    const clientId = process.env.INSEE_CLIENT_ID;
    const clientSecret = process.env.INSEE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          reason:
            "Les identifiants API Insee sont manquants dans le serveur (.env.local).",
        },
        { status: 500 }
      );
    }

    const tokenRes = await fetch("https://api.insee.fr/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json(
        {
          success: false,
          reason: "Impossible d’obtenir le token Insee.",
          details: text,
        },
        { status: 502 }
      );
    }

    const tokenData = (await tokenRes.json()) as InseeTokenResponse;

    const sireneRes = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${cleanSiret}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (sireneRes.status === 404) {
      return NextResponse.json(
        {
          success: false,
          reason: "Aucune entreprise trouvée pour ce SIRET.",
        },
        { status: 404 }
      );
    }

    if (!sireneRes.ok) {
      const text = await sireneRes.text();
      return NextResponse.json(
        {
          success: false,
          reason: "Erreur lors de la vérification du SIRET.",
          details: text,
        },
        { status: 502 }
      );
    }

    const data = (await sireneRes.json()) as InseeEtablissementResponse;

    const etab = data.etablissement;
    const unite = etab?.uniteLegale;
    const periode = etab?.periodesEtablissement?.[0];

    if (!etab?.siret) {
      return NextResponse.json(
        {
          success: false,
          reason: "SIRET introuvable.",
        },
        { status: 404 }
      );
    }

    if (unite?.etatAdministratifUniteLegale !== "A") {
      return NextResponse.json(
        {
          success: false,
          reason: "L’entreprise existe mais n’est pas active.",
        },
        { status: 400 }
      );
    }

    if (periode?.etatAdministratifEtablissement !== "A") {
      return NextResponse.json(
        {
          success: false,
          reason: "L’établissement existe mais n’est pas actif.",
        },
        { status: 400 }
      );
    }

    const legalName =
      unite?.denominationUniteLegale ||
      [unite?.nomUniteLegale, unite?.prenom1UniteLegale]
        .filter(Boolean)
        .join(" ") ||
      null;

    const city = etab?.adresseEtablissement?.libelleCommuneEtablissement ?? null;
    const ape =
      periode?.activitePrincipaleEtablissement ||
      unite?.activitePrincipaleUniteLegale ||
      null;

    return NextResponse.json({
      success: true,
      siret: etab.siret,
      siren: etab.siren ?? null,
      legal_name: legalName,
      city,
      ape,
      decision: "approved",
      reason: "Entreprise active trouvée. Compte validé automatiquement.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        reason: "Erreur serveur pendant la vérification du SIRET.",
      },
      { status: 500 }
    );
  }
}