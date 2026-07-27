import type { StatExplain } from '../../engine'
import { ModifierBreakdownList } from './ModifierBreakdownList'

interface StatExplainPanelProps {
  explain: StatExplain
}

export function StatExplainPanel({ explain }: StatExplainPanelProps) {
  return <ModifierBreakdownList modifiers={explain.modifiers} total={explain.total} totalLabel={explain.label} />
}
