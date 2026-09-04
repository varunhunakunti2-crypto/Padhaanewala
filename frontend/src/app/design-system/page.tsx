"use client"

import * as React from "react"
import { DisplayXL, HeadingLG, HeadingMD, MonoEyebrow, BodyLG, BodyMD, BodySM, CodeText } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs"
import { Pagination } from "@/components/ui/pagination"
import { Alert } from "@/components/ui/alert"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Table } from "@/components/ui/table"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { Dropdown, DropdownTrigger } from "@/components/ui/dropdown"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CollegeCard } from "@/components/college/college-card"
import { CourseCard } from "@/components/course/course-card"

const DEMO_COLLEGE = {
  id: "1",
  slug: "kmc-manipal",
  name: "Kasturba Medical College, Manipal",
  location: "Manipal",
  state: "Karnataka",
  type: "private" as const,
  rating: 4.6,
  reviewCount: 283,
  courses: ["MBBS", "BHMS", "BDS"],
  feeRange: "₹8L – ₹12L/yr",
  isVerified: true,
}

const DEMO_COURSE = {
  id: "1",
  slug: "bhms",
  name: "Bachelor of Homeopathic Medicine and Surgery",
  degree: "BHMS",
  duration: "5.5 Years",
  eligibility: "10+2 with PCB, NEET qualified",
  collegesCount: 198,
  stream: "AYUSH",
}

const TABLE_DATA = [
  { name: "KMC Manipal", state: "Karnataka", type: "Private", status: "Published" },
  { name: "AIIMS Delhi", state: "Delhi", type: "Government", status: "Published" },
  { name: "SDM Dharwad", state: "Karnataka", type: "Private", status: "Draft" },
]

export default function DesignSystemPage() {
  const [page, setPage] = React.useState(1)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [switchOn, setSwitchOn] = React.useState(false)

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">

      {/* Header */}
      <div>
        <MonoEyebrow>Padhaanewala</MonoEyebrow>
        <DisplayXL className="mt-2">Design System</DisplayXL>
        <BodyLG className="mt-3 text-[var(--color-mute)]">
          All UI primitives for the Padhaanewala premium EdTech platform.
        </BodyLG>
      </div>

      {/* Typography */}
      <section className="space-y-4">
        <MonoEyebrow>Typography</MonoEyebrow>
        <div className="space-y-6 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <DisplayXL>Display XL — Hero Headline</DisplayXL>
          <HeadingLG>Heading LG — Section Headings</HeadingLG>
          <HeadingMD>Heading MD — Subsections</HeadingMD>
          <BodyLG>Body LG — Lead paragraphs and large text blocks.</BodyLG>
          <BodyMD>Body MD — Default body text, navigation links, and standard paragraph copy.</BodyMD>
          <BodySM>Body SM — Captions, footnotes, metadata.</BodySM>
          <CodeText>CodeText — monospace for terminal or inline code</CodeText>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <MonoEyebrow>Buttons</MonoEyebrow>
        <div className="flex flex-wrap gap-4 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Button variant="primary">Start Deploying</Button>
          <Button variant="secondary">Get a Demo</Button>
          <Button variant="primary-sm">Sign Up</Button>
          <Button variant="ghost-sm">Log In</Button>
          <Button variant="category-pill">AYUSH</Button>
          <Button variant="icon-circular">↑</Button>
          <Button variant="ghost-sm" disabled>Disabled</Button>
        </div>
      </section>

      {/* Forms */}
      <section className="space-y-4">
        <MonoEyebrow>Form Controls</MonoEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Input placeholder="Enter your email address" />
          <Select>
            <option value="">Select a course</option>
            <option value="bhms">BHMS</option>
            <option value="bams">BAMS</option>
            <option value="mbbs">MBBS</option>
          </Select>
          <Textarea placeholder="Your message…" className="col-span-full" />
          <div className="flex gap-6 items-center">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} label="Enable notifications" />
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <MonoEyebrow>Badges</MonoEyebrow>
        <div className="flex flex-wrap gap-3 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Rejected</Badge>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <MonoEyebrow>Alerts</MonoEyebrow>
        <div className="space-y-3 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Alert variant="info" title="Information">Your data will be verified within 24 hours.</Alert>
          <Alert variant="success" title="Success">College profile published successfully.</Alert>
          <Alert variant="warning" title="Warning" dismissible>Some fields are missing verified sources.</Alert>
          <Alert variant="error" title="Error">Failed to save. Please try again.</Alert>
        </div>
      </section>

      {/* Dropdown */}
      <section className="space-y-4">
        <MonoEyebrow>Dropdown</MonoEyebrow>
        <div className="hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Dropdown
            trigger={<DropdownTrigger label="Actions" />}
            items={[
              { label: "Edit College" },
              { label: "Preview Page" },
              { type: "separator" },
              { label: "Archive", danger: true },
            ]}
          />
        </div>
      </section>

      {/* Navigation */}
      <section className="space-y-4">
        <MonoEyebrow>Navigation</MonoEyebrow>
        <div className="space-y-8 hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Breadcrumbs>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/colleges">Colleges</BreadcrumbItem>
            <BreadcrumbItem isLast>KMC Manipal</BreadcrumbItem>
          </Breadcrumbs>

          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Courses & Fees</TabsTrigger>
              <TabsTrigger value="tab3">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1"><BodyMD className="mt-4">Overview content goes here.</BodyMD></TabsContent>
            <TabsContent value="tab2"><BodyMD className="mt-4">Courses & Fees content here.</BodyMD></TabsContent>
            <TabsContent value="tab3"><BodyMD className="mt-4">Reviews content here.</BodyMD></TabsContent>
          </Tabs>

          <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
        </div>
      </section>

      {/* Table */}
      <section className="space-y-4">
        <MonoEyebrow>Table</MonoEyebrow>
        <Table
          columns={[
            { key: "name", header: "College Name" },
            { key: "state", header: "State" },
            { key: "type", header: "Type" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={row.status === "Published" ? "success" : "warning"}>
                  {row.status}
                </Badge>
              ),
            },
          ]}
          data={TABLE_DATA}
          keyExtractor={(_, i) => String(i)}
        />
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <MonoEyebrow>Cards & Skeleton</MonoEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Card</CardTitle>
              <CardDescription>A standard flat card for grids.</CardDescription>
            </CardHeader>
            <CardContent>
              <BodyMD>Content inside the card.</BodyMD>
            </CardContent>
          </Card>
          <div className="hairline-border p-4 rounded-md space-y-4 bg-[var(--color-canvas-elevated)]">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </section>

      {/* Domain Components */}
      <section className="space-y-4">
        <MonoEyebrow>College Card</MonoEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CollegeCard college={DEMO_COLLEGE} />
          <CollegeCard college={{ ...DEMO_COLLEGE, id: "2", name: "AIIMS New Delhi", type: "government", location: "New Delhi", state: "Delhi", rating: 4.9 }} />
        </div>
      </section>

      <section className="space-y-4">
        <MonoEyebrow>Course Card</MonoEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CourseCard course={DEMO_COURSE} />
          <CourseCard course={{ ...DEMO_COURSE, id: "2", slug: "bams", name: "Bachelor of Ayurvedic Medicine and Surgery", degree: "BAMS", stream: "AYUSH", collegesCount: 315 }} />
        </div>
      </section>

      {/* States */}
      <section className="space-y-4">
        <MonoEyebrow>Empty & Error States</MonoEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="hairline-border rounded-lg">
            <EmptyState
              variant="search"
              title="No colleges found"
              description="Try adjusting your filters or searching for something else."
              action={{ label: "Clear Filters", onClick: () => {} }}
            />
          </div>
          <div className="hairline-border rounded-lg">
            <ErrorState
              title="Failed to load colleges"
              description="Something went wrong. Please try again."
              onRetry={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <MonoEyebrow>Modal</MonoEyebrow>
        <div className="hairline-border p-8 rounded-md bg-[var(--color-canvas-elevated)]">
          <Button variant="primary-sm" onClick={() => setModalOpen(true)}>Open Modal</Button>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Get Admission Assistance"
          description="Fill in your details and a counsellor will contact you."
        >
          <div className="space-y-4">
            <Input placeholder="Your name" />
            <Input placeholder="Mobile number" type="tel" />
            <Input placeholder="Preferred course" />
          </div>
          <ModalFooter>
            <Button variant="ghost-sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary-sm">Submit Enquiry</Button>
          </ModalFooter>
        </Modal>
      </section>

    </div>
  )
}
