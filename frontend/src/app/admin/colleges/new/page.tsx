import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { CollegeForm } from "@/components/admin/college-form"

export default function AdminNewCollegePage() {
  return (
    <AdminLayout>
      <AdminDataTableHeader title="Add College" description="Create a new college in the database." />
      <CollegeForm />
    </AdminLayout>
  )
}