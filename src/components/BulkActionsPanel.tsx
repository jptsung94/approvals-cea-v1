import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, MessageSquare, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulkActionsPanelProps {
  selectedCount: number
  onApproveAll: (comment: string) => void
  onRejectAll: (comment: string) => void
  onClearSelection: () => void
}

export function BulkActionsPanel({ 
  selectedCount, 
  onApproveAll, 
  onRejectAll, 
  onClearSelection 
}: BulkActionsPanelProps) {
  const [comment, setComment] = useState('')
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const { toast } = useToast()

  const handleBulkApprove = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please add a comment explaining the bulk approval",
        variant: "destructive"
      })
      return
    }
    onApproveAll(comment)
    setComment('')
    setShowApproveDialog(false)
  }

  const handleBulkReject = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide clear feedback for rejection",
        variant: "destructive"
      })
      return
    }
    onRejectAll(comment)
    setComment('')
    setShowRejectDialog(false)
  }

  if (selectedCount === 0) return null

  return (
    <>
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-base px-3 py-1">
                {selectedCount} Selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Bulk actions will apply to all selected items
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApproveDialog(true)}
                className="border-success text-success hover:bg-success/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject All
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Approve {selectedCount} Items</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve {selectedCount} approval requests. Please provide a comment
              explaining the bulk approval decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Approval Comment (Required)</span>
            </div>
            <Textarea
              placeholder="E.g., 'Bulk approved - all items meet standard governance terms and quality criteria'"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setComment('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove} className="bg-success hover:bg-success/90">
              Approve All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Reject {selectedCount} Items</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject {selectedCount} approval requests. Please provide clear,
              actionable feedback for the producers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Rejection Feedback (Required)</span>
            </div>
            <Textarea
              placeholder="Provide specific reasons and next steps for correction..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setComment('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkReject}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reject All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}