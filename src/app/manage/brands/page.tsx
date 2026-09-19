import { allBrands } from "@/lib/catalog"
import { BrandsEditor } from "@/components/manage/brands-editor"

export default async function Brands() {
  return <BrandsEditor rows={await allBrands()} />
}
