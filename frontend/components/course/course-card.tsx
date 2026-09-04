import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  title: string
  instructor: string
  duration: string
  level: string
}

export function CourseCard({ title, instructor, duration, level }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Badge variant="outline" className="mb-2 w-fit">{level}</Badge>
        <CardTitle className="text-heading-md">{title}</CardTitle>
        <CardDescription>Instructor: {instructor}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-4 flex items-center justify-between">
        <span className="text-[14px] text-mute">{duration}</span>
        <Button variant="primary-sm">Enroll</Button>
      </CardContent>
    </Card>
  )
}
