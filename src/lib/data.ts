export type Listing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  type: "Utilitaire" | "Tourisme" | "2 roues";
  fuel: "Diesel" | "Essence" | "Hybride" | "Électrique";
  vatRecoverable: boolean;
  city: string;
  department: string;
  photos: string[];
  description?: string;
};

export const listings: Listing[] = [
  {
    id: "1",
    title: "Volkswagen Golf 6",
    brand: "Volkswagen",
    model: "Golf 6",
    year: 2012,
    mileage: 168000,
    price: 6990,
    type: "Tourisme",
    fuel: "Diesel",
    vatRecoverable: false,
    city: "Le Havre",
    department: "76",
    photos: [],
    description: "Entretien à jour, bon état général.",
  },
  {
    id: "2",
    title: "Renault Master L2H2",
    brand: "Renault",
    model: "Master",
    year: 2020,
    mileage: 98000,
    price: 18990,
    type: "Utilitaire",
    fuel: "Diesel",
    vatRecoverable: true,
    city: "Rouen",
    department: "76",
    photos: [],
    description: "TVA récupérable, utilitaire prêt à travailler.",
  },
  {
    id: "3",
    title: "Peugeot Partner",
    brand: "Peugeot",
    model: "Partner",
    year: 2019,
    mileage: 74000,
    price: 12990,
    type: "Utilitaire",
    fuel: "Diesel",
    vatRecoverable: false,
    city: "Caen",
    department: "14",
    photos: [],
    description: "Idéal artisan, propre, révisions faites.",
  },
];