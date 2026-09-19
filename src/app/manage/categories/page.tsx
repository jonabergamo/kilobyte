import { categoryOptions } from "@/lib/manage"
import { CategoriesEditor } from "@/components/manage/categories-editor"

export default async function Categories() {
  return <CategoriesEditor rows={await categoryOptions()} />
}
