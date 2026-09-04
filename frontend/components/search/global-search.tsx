import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GlobalSearch() {
  return (
    <div className="flex w-full max-w-2xl items-center space-x-2">
      <Input 
        type="search" 
        placeholder="Search for colleges, courses, or exams..." 
        className="flex-1 text-[16px] py-3"
      />
      <Button variant="primary">Search</Button>
    </div>
  )
}
