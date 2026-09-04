import * as React from "react"
import { cn } from "@/lib/utils"

interface InjectedTabProps {
  activeTab?: string
  setActiveTab?: (value: string) => void
}

export function Tabs({ defaultValue, children, className }: { defaultValue: string, children: React.ReactNode, className?: string }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Partial<InjectedTabProps>>, { activeTab, setActiveTab })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps {
  children?: React.ReactNode
  className?: string
  activeTab?: string
  setActiveTab?: (value: string) => void
}

export function TabsList({ children, className, activeTab, setActiveTab }: TabsListProps) {
  return (
    <div className={cn("flex items-center gap-2 mb-4 border-b border-hairline pb-2", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Partial<InjectedTabProps>>, { activeTab, setActiveTab })
        }
        return child
      })}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children?: React.ReactNode
  className?: string
  activeTab?: string
  setActiveTab?: (value: string) => void
}

export function TabsTrigger({ value, children, className, activeTab, setActiveTab }: TabsTriggerProps) {
  const isActive = activeTab === value
  return (
    <button
      onClick={() => setActiveTab && setActiveTab(value)}
      className={cn(
        "px-3 py-1.5 text-[14px] font-medium transition-colors rounded-sm",
        isActive ? "text-ink bg-canvas-elevated hairline-border shadow-sm" : "text-body hover:text-ink hover:bg-hairline-soft",
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children?: React.ReactNode
  className?: string
  activeTab?: string
}

export function TabsContent({ value, children, className, activeTab }: TabsContentProps) {
  if (activeTab !== value) return null
  return <div className={cn("w-full focus:outline-none", className)}>{children}</div>
}
