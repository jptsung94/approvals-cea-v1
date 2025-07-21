import { cn } from "@/lib/utils"

export type AssetStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'auto_approved'

interface StatusBadgeProps {
  status: AssetStatus
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Pending Review',
    variant: 'warning' as const,
    className: 'bg-warning-light text-warning border-warning/20'
  },
  under_review: {
    label: 'Under Review',
    variant: 'primary' as const,
    className: 'bg-accent text-accent-foreground border-primary/20'
  },
  approved: {
    label: 'Approved',
    variant: 'success' as const,
    className: 'bg-success-light text-success border-success/20'
  },
  auto_approved: {
    label: 'Auto-Approved',
    variant: 'success' as const,
    className: 'bg-success-light text-success border-success/20'
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive' as const,
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}