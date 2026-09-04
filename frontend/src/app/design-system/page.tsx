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

export default function DesignSystemPage() {
  const [page, setPage] = React.useState(1)

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
      
      <section className="space-y-4">
        <MonoEyebrow>Typography</MonoEyebrow>
        <div className="space-y-6 border border-hairline p-8 rounded-md bg-canvas-elevated">
          <DisplayXL>Display XL - Hero Headline</DisplayXL>
          <HeadingLG>Heading LG - Section Headings</HeadingLG>
          <HeadingMD>Heading MD - Subsections</HeadingMD>
          <BodyLG>Body LG - Lead paragraphs and large text blocks.</BodyLG>
          <BodyMD>Body MD - Default body text, navigation links, and standard paragraph copy.</BodyMD>
          <BodySM>Body SM - Captions, footnotes, metadata.</BodySM>
          <CodeText>CodeText - monospace for terminal or inline code</CodeText>
        </div>
      </section>

      <section className="space-y-4">
        <MonoEyebrow>Buttons</MonoEyebrow>
        <div className="flex flex-wrap gap-4 border border-hairline p-8 rounded-md bg-canvas-elevated">
          <Button variant="primary">Start Deploying</Button>
          <Button variant="secondary">Get a Demo</Button>
          <Button variant="primary-sm">Sign Up</Button>
          <Button variant="ghost-sm">Log In</Button>
          <Button variant="category-pill">AI Apps</Button>
          <Button variant="icon-circular">↑</Button>
        </div>
      </section>

      <section className="space-y-4">
        <MonoEyebrow>Forms & Badges</MonoEyebrow>
        <div className="flex flex-col gap-4 border border-hairline p-8 rounded-md bg-canvas-elevated max-w-md">
          <Input placeholder="Enter your email address" />
          <div className="flex gap-2">
            <Badge variant="default">New</Badge>
            <Badge variant="secondary">In Progress</Badge>
            <Badge variant="outline">Deprecated</Badge>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <MonoEyebrow>Navigation</MonoEyebrow>
        <div className="space-y-8 border border-hairline p-8 rounded-md bg-canvas-elevated">
          <Breadcrumbs>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
            <BreadcrumbItem isLast>Components</BreadcrumbItem>
          </Breadcrumbs>

          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Settings</TabsTrigger>
              <TabsTrigger value="tab3">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1"><BodyMD>Overview content goes here.</BodyMD></TabsContent>
            <TabsContent value="tab2"><BodyMD>Settings content goes here.</BodyMD></TabsContent>
            <TabsContent value="tab3"><BodyMD>Billing content goes here.</BodyMD></TabsContent>
          </Tabs>

          <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
        </div>
      </section>

      <section className="space-y-4">
        <MonoEyebrow>Cards & Skeleton</MonoEyebrow>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Card</CardTitle>
              <CardDescription>A standard flat card for grids.</CardDescription>
            </CardHeader>
            <CardContent>
              <BodyMD>Content inside the card.</BodyMD>
            </CardContent>
          </Card>

          <div className="border border-hairline p-4 rounded-md space-y-4 bg-canvas-elevated">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </section>

    </div>
  )
}
