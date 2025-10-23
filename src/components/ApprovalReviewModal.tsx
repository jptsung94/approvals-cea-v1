import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  FileText,
  Database,
  Clock,
  User,
  Tag,
  RefreshCw,
  GitCompare
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SchemaDiffViewer } from "./SchemaDiffViewer"
import { ApprovalChecklist } from "./ApprovalChecklist"
import { YAMLViewer } from "./YAMLViewer"
import { DiscussionPanel } from "./DiscussionPanel"
import { type AssetStatus } from "./StatusBadge"

interface AssetSubmission {
  id: string
  name: string
  type: string
  producer: string
  submittedAt: string
  status: AssetStatus
  description: string
  category: string
  metadata: Record<string, any>
  comments: Comment[]
  priority: 'low' | 'medium' | 'high'
  riskScore: number
  autoApprovalEligible: boolean
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'feedback' | 'question' | 'approval' | 'revision_request'
  phase?: string
}

interface ApprovalReviewModalProps {
  asset: AssetSubmission | null
  open: boolean
  onClose: () => void
  onApprove: (assetId: string, comment: string) => void
  onReject: (assetId: string, comment: string) => void
  onRequestRevision: (assetId: string, comment: string, referTo: string) => void
  onAddComment: (assetId: string, message: string, phase?: string) => void
}

export function ApprovalReviewModal({
  asset,
  open,
  onClose,
  onApprove,
  onReject,
  onRequestRevision,
  onAddComment
}: ApprovalReviewModalProps) {
  const [comment, setComment] = useState('')
  const [activePhase, setActivePhase] = useState('schema')
  const [revisionTeam, setRevisionTeam] = useState('Cyber')
  const [checklistProgress, setChecklistProgress] = useState(0)
  const { toast } = useToast()

  if (!asset) return null

  const phases = [
    { id: 'schema', label: 'Schema Review', icon: Database },
    { id: 'compliance', label: 'Compliance Check', icon: CheckCircle },
    { id: 'technical', label: 'Technical Review', icon: FileText }
  ]

  const handleApprove = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment for your approval decision",
        variant: "destructive"
      })
      return
    }
    onApprove(asset.id, comment)
    setComment('')
    onClose()
  }

  const handleReject = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required", 
        description: "Please provide a reason for rejection",
        variant: "destructive"
      })
      return
    }
    onReject(asset.id, comment)
    setComment('')
    onClose()
  }

  const handleRequestRevision = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please explain what revisions are needed",
        variant: "destructive"
      })
      return
    }
    onRequestRevision(asset.id, comment, revisionTeam)
    setComment('')
    onClose()
  }

  const handleAddComment = () => {
    if (!comment.trim()) return
    onAddComment(asset.id, comment, activePhase)
    setComment('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg md:text-2xl flex items-center gap-2 md:gap-3">
                {asset.type === 'Dataset' ? <Database className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" /> : <FileText className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />}
                <span className="truncate">{asset.name}</span>
              </DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                Submitted {new Date(asset.submittedAt).toLocaleDateString()} • Last updated {new Date(asset.metadata.lastUpdated || asset.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 ml-2">
              <Badge variant={asset.priority === 'high' ? 'destructive' : asset.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                {asset.priority}
              </Badge>
              <Badge variant="outline" className="text-xs hidden md:inline-flex">{asset.category}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Instructions Banner - Hidden on mobile */}
        <div className="px-4 md:px-6 py-2 md:py-3 bg-primary/5 border-b flex-shrink-0 hidden md:block">
          <p className="text-sm font-medium text-primary">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Review all required sections in the checklist before making a decision. Use the discussion panel to communicate with the producer.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] min-h-full">
            {/* Left Sidebar - Hidden on mobile, shown as collapsible on tablet+ */}
            <div className="border-r bg-muted/30 hidden md:block">
              <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
                {/* Progress */}
                <Card>
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="text-xs lg:text-sm">Review Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={checklistProgress} className="mb-1 lg:mb-2" />
                    <p className="text-xs text-muted-foreground">{checklistProgress}% Complete</p>
                  </CardContent>
                </Card>

                {/* Key Details - Condensed for tablet */}
                <Card>
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="text-xs lg:text-sm">Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 lg:space-y-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Producer</p>
                      <p className="font-medium">{asset.producer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Score</p>
                      <Badge variant={asset.riskScore > 50 ? "destructive" : "secondary"}>
                        {asset.riskScore}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Checklist - Hidden on tablet, shown on desktop */}
                <div className="hidden lg:block">
                  <ApprovalChecklist 
                    assetId={asset.id}
                    onProgressChange={setChecklistProgress}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col min-h-full">
              <Tabs value={activePhase} onValueChange={setActivePhase} className="flex-1 flex flex-col">
                <TabsList className="mx-3 md:mx-6 mt-3 md:mt-4 flex-shrink-0 grid grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger value="schema" className="text-xs md:text-sm py-2">
                    <Database className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Schema</span>
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="text-xs md:text-sm py-2">
                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Compliance</span>
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="text-xs md:text-sm py-2">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Technical</span>
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="text-xs md:text-sm py-2">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Discussion</span>
                    <span className="ml-1">({asset.comments.length})</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 px-3 md:px-6 py-3 md:py-4">
                  {/* Mobile-only quick info */}
                  <div className="md:hidden mb-3 p-3 bg-muted/50 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Producer:</span>
                      <span className="font-medium">{asset.producer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Risk:</span>
                      <Badge variant={asset.riskScore > 50 ? "destructive" : "secondary"} className="text-xs">
                        {asset.riskScore}%
                      </Badge>
                    </div>
                    <Progress value={checklistProgress} className="h-1" />
                  </div>

                  <TabsContent value="schema" className="mt-0 space-y-3 md:space-y-4">
                    <Card>
                      <CardHeader className="p-3 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          <GitCompare className="h-4 w-4 md:h-5 md:w-5" />
                          Schema Changes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-6 pt-0">
                        <SchemaDiffViewer assetId={asset.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-0 space-y-3 md:space-y-4">
                    <Card>
                      <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">Privacy & Compliance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-xs md:text-sm">Data classification verified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-xs md:text-sm">Ownership documentation complete</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                            <span className="text-xs md:text-sm">PII fields need review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            <span className="text-xs md:text-sm">Security compliance pending</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="technical" className="mt-0 space-y-3 md:space-y-4">
                    <Card>
                      <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">YAML Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-6 pt-0">
                        <YAMLViewer assetId={asset.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="discussion" className="mt-0">
                    <DiscussionPanel 
                      assetId={asset.id}
                      comments={asset.comments}
                      currentPhase={activePhase}
                      onAddComment={onAddComment}
                    />
                  </TabsContent>
                </div>
              </Tabs>

              {/* Action Footer */}
              <div className="border-t bg-card px-3 md:px-6 py-3 md:py-4 flex-shrink-0">
                <div className="space-y-2 md:space-y-3">
                  <Textarea
                    placeholder="Add your review comments or feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[60px] md:min-h-[80px] text-sm"
                  />
                  
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <Button
                      onClick={handleApprove}
                      className="w-full md:flex-1"
                      disabled={!comment.trim()}
                      size="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <div className="flex w-full md:flex-1 gap-2">
                      <Button
                        onClick={handleRequestRevision}
                        variant="outline"
                        className="flex-1"
                        disabled={!comment.trim()}
                        size="default"
                      >
                        <RefreshCw className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">Request Revision</span>
                        <span className="md:hidden">Revise</span>
                      </Button>
                      
                      <Button
                        onClick={handleReject}
                        variant="destructive"
                        className="flex-1"
                        disabled={!comment.trim()}
                        size="default"
                      >
                        <XCircle className="h-4 w-4 mr-1 md:mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
