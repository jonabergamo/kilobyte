import { allBrands, categoryTree, searchProducts, type Sort } from "@/lib/catalog"
import { ProductCard } from "./product-card"
import { Filters, SortSelect, ResultsHeading, Pager } from "./search-controls"

const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Math.round(Number(v) * 100) : undefined)

export async function SearchResults({ params, heading }: { params: Record<string, string | undefined>; heading?: string }) {
  const sort = (params.sort as Sort) ?? "relevance"
  const [res, tree, brandList] = await Promise.all([
    searchProducts({ q: params.q, category: params.category, brand: params.brand, min: num(params.min), max: num(params.max), inStock: params.inStock === "1", sort, page: Number(params.page) || 1 }),
    categoryTree(),
    allBrands(),
  ])
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <Filters tree={tree} brands={brandList} params={params} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <ResultsHeading heading={heading} q={params.q} total={res.total} />
          <SortSelect value={sort} />
        </div>
        {res.items.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm"><NoResults /></p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {res.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <Pager page={res.page} perPage={res.perPage} total={res.total} />
      </div>
    </div>
  )
}

function NoResults() {
  return <T k="search.none" />
}
import { T } from "./t"
