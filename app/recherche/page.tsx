import AnnoncesClient from "@/app/annonces/annoncesclient";
import { getPublishedListings } from "@/lib/server/listings-search";

export default async function RecherchePage() {
  const listings = await getPublishedListings();

  return <AnnoncesClient listings={listings} />;
}