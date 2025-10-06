import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, AlertTriangle } from "lucide-react"

interface PendingItem {
  approver: string
  count: number
  oldestPendingDays: number
}

interface PendingApprovalsSummaryProps {
  items: PendingItem[]
  className?: string
}

export function PendingApprovalsSummary({ items, className }: PendingApprovalsSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Pending Approvals by Reviewer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track which reviewers have pending items and for how long
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pending approvals
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.approver}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.count} pending
                      </Badge>
                      {item.oldestPendingDays > 3 && (
                        <Badge className="bg-warning-light text-warning border-warning/20 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.oldestPendingDays}d oldest
                        </Badge>
                      )}
                      {item.oldestPendingDays > 7 && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
