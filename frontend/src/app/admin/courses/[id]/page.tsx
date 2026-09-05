"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCourseFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    level: "",
    degree: "",
    duration_months: "",
    eligibility: "",
    entrance_exam: "",
    admission_procedure: "",
    career_info: "",
    description: "",
    fee_info: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
  });

  const fetchCourse = async () => {
    try {
      const res = await api.get<{ data: any }>(`/admin/courses/${id}`);
      const c = res.data;
      setFormData({
        name: c.name || "",
        slug: c.slug || "",
        level: c.level || "",
        degree: c.degree || "",
        duration_months: c.duration_months ? String(c.duration_months) : "",
        eligibility: c.eligibility || "",
        entrance_exam: c.entrance_exam || "",
        admission_procedure: c.admission_procedure || "",
        career_info: c.career_info || "",
        description: c.description || "",
        fee_info: c.fee_info || "",
        meta_title: c.meta_title || "",
        meta_description: c.meta_description || "",
        is_published: !!c.is_published,
      });
    } catch (e) {
      console.error(e);
      alert("Failed to load course");
      router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNew) {
      fetchCourse();
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload: any = { ...formData };
    if (payload.duration_months) {
      payload.duration_months = parseInt(payload.duration_months, 10);
    } else {
      payload.duration_months = null;
    }

    try {
      if (isNew) {
        await api.post("/admin/courses", payload);
      } else {
        await api.put(`/admin/courses/${id}`, payload);
      }
      router.push("/admin/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-mute" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-8">
        {isNew ? "Add Course" : "Edit Course"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Name *</label>
            <Input required name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Slug</label>
            <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated if empty" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Level</label>
            <Input name="level" value={formData.level} onChange={handleChange} placeholder="e.g. Undergraduate" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Degree</label>
            <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.Tech" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Duration (Months)</label>
            <Input type="number" name="duration_months" value={formData.duration_months} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm placeholder:text-mute focus:outline-none focus:ring-1 focus:ring-link"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Eligibility</label>
          <textarea
            name="eligibility"
            value={formData.eligibility}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm focus:ring-link"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Entrance Exam</label>
            <Input name="entrance_exam" value={formData.entrance_exam} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Fee Information</label>
            <Input name="fee_info" value={formData.fee_info} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Admission Procedure</label>
          <textarea
            name="admission_procedure"
            value={formData.admission_procedure}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm focus:ring-link"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Career Information</label>
          <textarea
            name="career_info"
            value={formData.career_info}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm focus:ring-link"
          />
        </div>

        <div className="border-t border-hairline pt-6">
          <h3 className="font-semibold text-ink mb-4">SEO Fields</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Meta Title</label>
              <Input name="meta_title" value={formData.meta_title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Meta Description</label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                className="flex w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm focus:ring-link"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-hairline pt-6 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 rounded border-hairline"
            />
            Publish Course
          </label>
          
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
