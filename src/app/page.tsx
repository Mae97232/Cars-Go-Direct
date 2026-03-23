import { createClient } from "@/lib/supabase/server";
import HomePageClient from "./HomePageClient";

type AuthStatus = "guest" | "user" | "pro";

export type HomeRawListing = {
  id: string;
  title: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  price: number | null;
  city: string | null;
  department: string | null;
  type: string | null;
  fuel: string | null;
  vat_recoverable: boolean | null;
  photos: string[] | null;
  description: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authStatus: AuthStatus = "guest";

  if (user) {
    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (proError) {
      console.error("Erreur récupération compte pro :", proError.message);
    }

    authStatus = proAccount ? "pro" : "user";
  }

  const { data: listingsData, error: listingsError } = await supabase
    .from("listings")
    .select(
      `
      id,
      title,
      brand,
      model,
      year,
      mileage,
      price,
      city,
      department,
      type,
      fuel,
      vat_recoverable,
      photos,
      description
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  if (listingsError) {
    console.error("Erreur récupération annonces homepage :", listingsError.message);
  }

  const listings = (listingsData ?? []) as HomeRawListing[];

  return <HomePageClient initialAuthStatus={authStatus} listings={listings} />;
}