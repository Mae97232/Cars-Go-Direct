import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
      numeroVoieEtablissement?: string | null;
      typeVoieEtablissement?: string | null;
      libelleVoieEtablissement?: string | null;
      codePostalEtablissement?: string | null;
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

function cleanText(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function buildAddress(parts: Array<string | null | undefined>) {
  const cleanParts = parts.map(cleanText).filter(Boolean);
  return cleanParts.length > 0 ? cleanParts.join(" ") : null;
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

    const apiKey = process.env.INSEE_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          reason: "La clé API Insee est manquante sur le serveur.",
        },
        { status: 500 }
      );
    }

    const sireneRes = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${cleanSiret}`,
      {
        method: "GET",
        headers: {
          "X-INSEE-Api-Key-Integration": apiKey,
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

      console.error("INSEE_SIRENE_ERROR", {
        status: sireneRes.status,
        statusText: sireneRes.statusText,
        body: text,
      });

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
    const adresse = etab?.adresseEtablissement;

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
        .join(" ")
        .trim() ||
      null;

    const city = adresse?.libelleCommuneEtablissement ?? null;
    const zipCode = adresse?.codePostalEtablissement ?? null;

    const fullAddress = buildAddress([
      adresse?.numeroVoieEtablissement,
      adresse?.typeVoieEtablissement,
      adresse?.libelleVoieEtablissement,
    ]);

    const ape =
      periode?.activitePrincipaleEtablissement ||
      unite?.activitePrincipaleUniteLegale ||
      null;

    const searchText = [legalName, fullAddress, zipCode, city]
      .filter((value) => typeof value === "string" && value.trim() !== "")
      .join(", ");

    return NextResponse.json({
      success: true,
      siret: etab.siret,
      siren: etab.siren ?? null,
      legal_name: legalName,
      city,
      zip_code: zipCode,
      address: fullAddress,
      ape,
      decision: "approved",
      reason: "Entreprise active trouvée. Compte validé automatiquement.",
      google_search_text: searchText || null,
    });
  } catch (error) {
    console.error("INSEE FULL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        reason: "Erreur serveur pendant la vérification du SIRET.",
      },
      { status: 500 }
    );
  }
}