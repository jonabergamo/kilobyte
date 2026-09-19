import { listCustomers } from "@/lib/manage"
import { CustomersTable } from "@/components/manage/customers-table"

export default async function Customers() {
  return <CustomersTable rows={await listCustomers()} />
}
