// src/lib/vehicle-catalog.ts

export const VEHICLE_TYPES = [
  "Tourisme",
  "Utilitaire",
  "Société",
] as const;

export type VehicleTypeCatalog = (typeof VEHICLE_TYPES)[number];

export const BODY_TYPES = [
  "Berline",
  "Citadine",
  "SUV",
  "Break",
  "Coupé",
  "Cabriolet",
  "Monospace",
  "Ludospace",
  "Fourgonnette",
  "Fourgon",
  "Van",
  "Pick-up",
  "Châssis cabine",
  "Minibus",
] as const;

export type BodyTypeCatalog = (typeof BODY_TYPES)[number];

export type VehicleBrand = {
  name: string;
  slug: string;
  popularModels: string[];
  vehicleTypes: VehicleTypeCatalog[];
};

export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    name: "Audi",
    slug: "audi",
    popularModels: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "BMW",
    slug: "bmw",
    popularModels: ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "X1", "X3", "X5"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Mercedes-Benz",
    slug: "mercedes-benz",
    popularModels: ["Classe A", "Classe B", "Classe C", "Classe E", "GLA", "GLC", "Vito", "Sprinter"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Volkswagen",
    slug: "volkswagen",
    popularModels: ["Polo", "Golf", "Passat", "Tiguan", "Touran", "Caddy", "Transporter", "Crafter"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Peugeot",
    slug: "peugeot",
    popularModels: ["108", "208", "308", "408", "2008", "3008", "5008", "Partner", "Expert", "Boxer"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Renault",
    slug: "renault",
    popularModels: ["Twingo", "Clio", "Mégane", "Captur", "Austral", "Kangoo", "Trafic", "Master"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Citroën",
    slug: "citroen",
    popularModels: ["C1", "C3", "C4", "C5 X", "Berlingo", "Jumpy", "Jumper"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Opel",
    slug: "opel",
    popularModels: ["Corsa", "Astra", "Mokka", "Crossland", "Combo", "Vivaro", "Movano"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Ford",
    slug: "ford",
    popularModels: ["Fiesta", "Focus", "Puma", "Kuga", "Transit Connect", "Transit Custom", "Transit"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Toyota",
    slug: "toyota",
    popularModels: ["Aygo", "Yaris", "Corolla", "C-HR", "RAV4", "Hilux", "Proace", "Proace City"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Nissan",
    slug: "nissan",
    popularModels: ["Micra", "Juke", "Qashqai", "X-Trail", "Navara", "Townstar", "Primastar", "Interstar"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Fiat",
    slug: "fiat",
    popularModels: ["500", "Panda", "Tipo", "Doblo", "Scudo", "Ducato", "Fullback"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Iveco",
    slug: "iveco",
    popularModels: ["Daily"],
    vehicleTypes: ["Utilitaire"],
  },
  {
    name: "MAN",
    slug: "man",
    popularModels: ["TGE"],
    vehicleTypes: ["Utilitaire"],
  },
  {
    name: "Volkswagen Utilitaires",
    slug: "volkswagen-utilitaires",
    popularModels: ["Caddy", "Transporter", "Crafter", "Amarok"],
    vehicleTypes: ["Utilitaire"],
  },
  {
    name: "Dacia",
    slug: "dacia",
    popularModels: ["Sandero", "Duster", "Jogger", "Dokker", "Lodgy"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Skoda",
    slug: "skoda",
    popularModels: ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Seat",
    slug: "seat",
    popularModels: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Cupra",
    slug: "cupra",
    popularModels: ["Leon", "Formentor", "Born"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Volvo",
    slug: "volvo",
    popularModels: ["XC40", "XC60", "XC90", "V60", "V90", "S60"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Hyundai",
    slug: "hyundai",
    popularModels: ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Kia",
    slug: "kia",
    popularModels: ["Picanto", "Rio", "Ceed", "Niro", "Sportage", "Sorento"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Mazda",
    slug: "mazda",
    popularModels: ["Mazda2", "Mazda3", "CX-3", "CX-30", "CX-5", "MX-5"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Honda",
    slug: "honda",
    popularModels: ["Jazz", "Civic", "HR-V", "CR-V"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Land Rover",
    slug: "land-rover",
    popularModels: ["Defender", "Discovery Sport", "Range Rover Evoque", "Range Rover Sport"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Jeep",
    slug: "jeep",
    popularModels: ["Renegade", "Compass", "Wrangler"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Porsche",
    slug: "porsche",
    popularModels: ["Macan", "Cayenne", "Panamera", "911", "Taycan"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Mini",
    slug: "mini",
    popularModels: ["Mini 3 portes", "Mini 5 portes", "Clubman", "Countryman"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Tesla",
    slug: "tesla",
    popularModels: ["Model 3", "Model Y", "Model S", "Model X"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Suzuki",
    slug: "suzuki",
    popularModels: ["Swift", "Vitara", "S-Cross", "Jimny"],
    vehicleTypes: ["Tourisme", "Société"],
  },
  {
    name: "Mitsubishi",
    slug: "mitsubishi",
    popularModels: ["ASX", "Eclipse Cross", "L200"],
    vehicleTypes: ["Tourisme", "Utilitaire", "Société"],
  },
  {
    name: "Isuzu",
    slug: "isuzu",
    popularModels: ["D-Max"],
    vehicleTypes: ["Utilitaire"],
  },
];

export const ALL_BRAND_NAMES = VEHICLE_BRANDS.map((brand) => brand.name);

export const ALL_MODELS = VEHICLE_BRANDS.flatMap((brand) =>
  brand.popularModels.map((model) => ({
    brand: brand.name,
    model,
    label: `${brand.name} ${model}`,
    slug: `${brand.slug}-${slugify(model)}`,
    vehicleTypes: brand.vehicleTypes,
  }))
);

export const POPULAR_SEARCH_SUGGESTIONS = [
  "Audi A3",
  "Audi A4",
  "BMW Série 3",
  "Mercedes Classe C",
  "Volkswagen Golf",
  "Peugeot 308",
  "Renault Clio",
  "Renault Master",
  "Peugeot Partner",
  "Citroën Berlingo",
  "Ford Transit",
  "Mercedes Vito",
  "Iveco Daily",
  "Volkswagen Transporter",
  "Renault Trafic",
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findBrandByName(value: string) {
  const normalized = slugify(value);
  return VEHICLE_BRANDS.find(
    (brand) =>
      slugify(brand.name) === normalized ||
      slugify(brand.name).includes(normalized) ||
      normalized.includes(slugify(brand.name))
  );
}

export function findMatchingModels(query: string, limit = 8) {
  const normalized = slugify(query);

  if (!normalized) return [];

  return ALL_MODELS.filter((entry) => {
    const label = slugify(entry.label);
    const model = slugify(entry.model);
    const brand = slugify(entry.brand);

    return (
      label.includes(normalized) ||
      model.includes(normalized) ||
      brand.includes(normalized)
    );
  }).slice(0, limit);
}

export function buildSearchSuggestions(query: string, limit = 8) {
  const normalized = slugify(query);

  if (!normalized) {
    return POPULAR_SEARCH_SUGGESTIONS.slice(0, limit).map((label) => ({
      label,
      type: "model" as const,
    }));
  }

  const modelSuggestions = findMatchingModels(query, limit).map((entry) => ({
    label: entry.label,
    type: "model" as const,
  }));

  const brandSuggestions = VEHICLE_BRANDS.filter((brand) => {
    const brandName = slugify(brand.name);
    return brandName.includes(normalized);
  })
    .slice(0, limit)
    .map((brand) => ({
      label: brand.name,
      type: "brand" as const,
    }));

  const typeSuggestions = VEHICLE_TYPES.filter((type) =>
    slugify(type).includes(normalized)
  ).map((type) => ({
    label: type,
    type: "vehicleType" as const,
  }));

  const merged = [...modelSuggestions, ...brandSuggestions, ...typeSuggestions];

  const unique: { label: string; type: "model" | "brand" | "vehicleType" }[] = [];
  const seen = new Set<string>();

  for (const item of merged) {
    const key = `${item.type}:${slugify(item.label)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique.slice(0, limit);
}