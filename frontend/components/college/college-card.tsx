import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CollegeCardProps {
  name: string
  location: string
  ranking?: number
  placementRate?: string
}

export function CollegeCard({ name, location, ranking, placementRate }: CollegeCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{location}</Badge>
          {ranking && <span className="text-[12px] font-geist-mono font-medium text-mute">#{ranking}</span>}
        </div>
        <CardTitle className="text-heading-md leading-tight">{name}</CardTitle>
        <CardDescription className="mt-1">
          {placementRate ? `Placement Rate: ${placementRate}` : "Data not available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-4">
        <Button variant="ghost-sm" className="w-full justify-center">View Details</Button>
      </CardContent>
    </Card>
  )
}
