import { getPublishedListings } from "@/lib/server/listings-search";
import AnnoncesClient from "./annoncesclient";

export default async function AnnoncesPage() {
  const listings = await getPublishedListings();

  return <AnnoncesClient listings={listings} />;
}