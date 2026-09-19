import { SearchResults } from "@/components/store/search-results"

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <SearchResults params={await searchParams} />
}
