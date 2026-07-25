import { Wand2 } from 'lucide-react'
import { Badge } from './Badge'

export function HomebrewBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" size="sm" icon={Wand2} className={className} title="Contenido homebrew">
      Homebrew
    </Badge>
  )
}
