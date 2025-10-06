import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, MessageSquare, Clock, User, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  type: 'submitted' | 'review_started' | 'comment' | 'approved' | 'rejected' | 'escalated' | 'reassigned'
  actor: string
  message: string
  timestamp: string
}

interface ApprovalTimelineProps {
  events: TimelineEvent[]
  currentStatus: string
  className?: string
}

export function ApprovalTimeline({ events, currentStatus, className }: ApprovalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'submitted':
        return Clock
      case 'review_started':
        return User
      case 'comment':
        return MessageSquare
      case 'approved':
        return CheckCircle
      case 'rejected':
        return XCircle
      case 'escalated':
        return AlertCircle
      case 'reassigned':
        return User
      default:
        return Clock
    }
  }
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'approved':
        return 'text-success'
      case 'rejected':
        return 'text-destructive'
      case 'escalated':
        return 'text-warning'
      case 'comment':
        return 'text-primary'
      default:
        return 'text-muted-foreground'
    }
  }
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval History & Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type)
            const colorClass = getEventColor(event.type)
            
            return (
              <div key={event.id} className="relative flex gap-4 pl-10">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                  colorClass
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Event content */}
                <div className="flex-1 space-y-1 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground">by {event.actor}</p>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Current status indicator */}
          {currentStatus === 'pending' && (
            <div className="relative flex gap-4 pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed bg-background text-muted-foreground animate-pulse">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-muted-foreground">Awaiting review...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
