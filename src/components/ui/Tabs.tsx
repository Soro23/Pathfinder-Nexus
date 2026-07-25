import { createContext, KeyboardEvent, ReactNode, useContext, useId, useRef } from 'react'
import { LucideIcon } from 'lucide-react'
import styles from './Tabs.module.css'

type TabsVariant = 'chip' | 'underline'
type TabsSize = 'sm' | 'md'

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
  variant: TabsVariant
  size: TabsSize
  instanceId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error(`${component} debe usarse dentro de <Tabs>`)
  return ctx
}

interface TabsProps {
  value: string
  onChange: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
  children: ReactNode
  className?: string
}

export function Tabs({ value, onChange, variant = 'chip', size = 'md', children, className }: TabsProps) {
  const instanceId = useId()
  return (
    <TabsContext.Provider value={{ value, onChange, variant, size, instanceId }}>
      <div className={`${styles.root} ${className || ''}`}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabListProps {
  children: ReactNode
  'aria-label': string
  className?: string
}

export function TabList({ children, className, ...ariaProps }: TabListProps) {
  const { size } = useTabsContext('TabList')
  const listRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []
    )
    if (tabs.length === 0) return
    const currentIndex = tabs.findIndex((t) => t === document.activeElement)
    let nextIndex = currentIndex
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = tabs.length - 1
    e.preventDefault()
    tabs[nextIndex]?.focus()
    tabs[nextIndex]?.click()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`${styles.tabList} ${styles[size]} ${className || ''}`}
      onKeyDown={handleKeyDown}
      {...ariaProps}
    >
      {children}
    </div>
  )
}

interface TabProps {
  value: string
  icon?: LucideIcon
  disabled?: boolean
  children: ReactNode
}

export function Tab({ value, icon: Icon, disabled = false, children }: TabProps) {
  const ctx = useTabsContext('Tab')
  const isActive = ctx.value === value
  const tabId = `${ctx.instanceId}tab-${value}`
  const panelId = `${ctx.instanceId}panel-${value}`

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`${styles.tab} ${styles[ctx.variant]} ${isActive ? styles.tabActive : ''}`}
      onClick={() => ctx.onChange(value)}
    >
      {Icon && <Icon size={ctx.size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
    </button>
  )
}

interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const ctx = useTabsContext('TabPanel')
  const isActive = ctx.value === value
  const tabId = `${ctx.instanceId}tab-${value}`
  const panelId = `${ctx.instanceId}panel-${value}`

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={`${styles.tabPanel} ${className || ''}`}
    >
      {children}
    </div>
  )
}
