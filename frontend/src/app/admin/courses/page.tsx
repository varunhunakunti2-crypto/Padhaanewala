"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LoaderCircle, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Course = {
  id: string;
  name: string;
  level: string;
  is_published: boolean;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: { items: Course[] } }>("/admin/courses");
      setCourses(res.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const archiveCourse = async (id: string) => {
    if (!confirm("Are you sure you want to archive this course?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (e) {
      console.error(e);
      alert("Failed to archive course");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-ink">Manage Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Link>
        </Button>
      </div>

      <div className="border border-hairline rounded-lg bg-canvas-elevated">
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoaderCircle className="animate-spin h-6 w-6 text-mute" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-mute">No courses found.</div>
        ) : (
          <table className="w-full text-left text-sm text-ink">
            <thead className="bg-hairline-soft text-mute uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-hairline-soft transition-colors">
                  <td className="px-6 py-4 font-medium">{course.name}</td>
                  <td className="px-6 py-4">{course.level || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={course.is_published ? "success" : "secondary"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button variant="ghost-sm" size="sm" asChild>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost-sm" size="sm" onClick={() => archiveCourse(course.id)}>
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
