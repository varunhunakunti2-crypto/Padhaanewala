import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { ScholarshipForm } from "@/components/admin/scholarship-form"

export default function AdminNewScholarshipPage() {
  return (
    <AdminLayout>
      <AdminDataTableHeader title="Add Scholarship" description="Create a new scholarship scheme in the database." />
      <ScholarshipForm />
    </AdminLayout>
  )
}