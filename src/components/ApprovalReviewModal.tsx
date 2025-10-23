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
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-3">
                {asset.type === 'Dataset' ? <Database className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                {asset.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted {new Date(asset.submittedAt).toLocaleDateString()} • Last updated {new Date(asset.metadata.lastUpdated || asset.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={asset.priority === 'high' ? 'destructive' : asset.priority === 'medium' ? 'default' : 'secondary'}>
                {asset.priority} priority
              </Badge>
              <Badge variant="outline">{asset.category}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Instructions Banner */}
        <div className="px-6 py-3 bg-primary/5 border-b flex-shrink-0">
          <p className="text-sm font-medium text-primary">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Review all required sections in the checklist before making a decision. Use the discussion panel to communicate with the producer.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[300px_1fr] min-h-full">
            {/* Left Sidebar - Checklist & Navigation */}
            <div className="border-r bg-muted/30">
              <div className="p-4 space-y-4">
                {/* Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Review Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={checklistProgress} className="mb-2" />
                    <p className="text-xs text-muted-foreground">{checklistProgress}% Complete</p>
                  </CardContent>
                </Card>

                {/* Phase Navigation */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Review Phases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phases.map((phase) => {
                      const Icon = phase.icon
                      return (
                        <Button
                          key={phase.id}
                          variant={activePhase === phase.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                          onClick={() => setActivePhase(phase.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {phase.label}
                        </Button>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Approval Checklist */}
                <ApprovalChecklist 
                  assetId={asset.id}
                  onProgressChange={setChecklistProgress}
                />

                {/* Key Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
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
                    <div>
                      <p className="text-muted-foreground">Data Classification</p>
                      <p className="font-medium">{asset.metadata.sensitivity || 'Internal'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col min-h-full">
              <Tabs value={activePhase} onValueChange={setActivePhase} className="flex-1 flex flex-col">
                <TabsList className="mx-6 mt-4 flex-shrink-0">
                  <TabsTrigger value="schema">
                    <Database className="h-4 w-4 mr-2" />
                    Schema
                  </TabsTrigger>
                  <TabsTrigger value="compliance">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Compliance
                  </TabsTrigger>
                  <TabsTrigger value="technical">
                    <FileText className="h-4 w-4 mr-2" />
                    Technical Specs
                  </TabsTrigger>
                  <TabsTrigger value="discussion">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discussion ({asset.comments.length})
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 px-6 py-4">
                  <TabsContent value="schema" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitCompare className="h-5 w-5" />
                          Schema Changes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SchemaDiffViewer assetId={asset.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Compliance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm">Data classification verified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm">Ownership documentation complete</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <span className="text-sm">PII fields need review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">Security compliance pending</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="technical" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>YAML Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
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
              <div className="border-t bg-card px-6 py-4 flex-shrink-0">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add your review comments or feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleApprove}
                      className="flex-1"
                      disabled={!comment.trim()}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button
                      onClick={handleRequestRevision}
                      variant="outline"
                      className="flex-1"
                      disabled={!comment.trim()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Revision
                    </Button>
                    
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                      disabled={!comment.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
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
