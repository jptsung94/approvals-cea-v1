import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SLAIndicatorProps {
  submittedAt: string
  slaTarget: string
  status: string
  className?: string
}

export function SLAIndicator({ submittedAt, slaTarget, status, className }: SLAIndicatorProps) {
  const getTimeElapsed = (submittedDate: string) => {
    const now = new Date()
    const submitted = new Date(submittedDate)
    const diffMs = now.getTime() - submitted.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`
    }
    return `${diffHours}h`
  }
  
  const getUrgencyLevel = (submittedDate: string, slaTarget: string) => {
    const now = new Date()
    const submitted = new Date(submittedDate)
    const diffMs = now.getTime() - submitted.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    // Parse SLA target (e.g., "5 business days" -> 5)
    const targetDays = parseInt(slaTarget)
    
    if (diffDays >= targetDays) return 'overdue'
    if (diffDays >= targetDays * 0.75) return 'urgent'
    if (diffDays >= targetDays * 0.5) return 'warning'
    return 'normal'
  }
  
  // Don't show SLA for completed items
  if (status === 'approved' || status === 'rejected') {
    return null
  }
  
  const timeElapsed = getTimeElapsed(submittedAt)
  const urgency = getUrgencyLevel(submittedAt, slaTarget)
  
  const urgencyConfig = {
    overdue: {
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertTriangle,
      label: 'OVERDUE'
    },
    urgent: {
      color: 'bg-warning-light text-warning border-warning/20',
      icon: Clock,
      label: 'URGENT'
    },
    warning: {
      color: 'bg-warning-light/50 text-warning border-warning/10',
      icon: Clock,
      label: 'DUE SOON'
    },
    normal: {
      color: 'bg-muted text-muted-foreground border-border',
      icon: Clock,
      label: 'ON TRACK'
    }
  }
  
  const config = urgencyConfig[urgency]
  const Icon = config.icon
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{timeElapsed}</span>
      </Badge>
      {urgency !== 'normal' && (
        <span className="text-xs font-medium" style={{ color: urgency === 'overdue' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' }}>
          {config.label}
        </span>
      )}
    </div>
  )
}
