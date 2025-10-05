import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { 
  Clock, 
  FileText, 
  Database, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Calendar,
  User,
  Tag,
  HardDrive,
  FileType,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  type: 'feedback' | 'question' | 'approval'
}

interface AssetReviewSideBySideProps {
  asset: AssetSubmission
  onApprove: (assetId: string) => void
  onReject: (assetId: string) => void
  onAddComment: (assetId: string, message: string) => void
  onBack: () => void
}

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    dataset: Database,
    api: BarChart3,
    stream: Clock,
    model: FileText,
    file: FileText,
    service: BarChart3
  }
  return iconMap[type.toLowerCase()] || FileText
}

export function AssetReviewSideBySide({
  asset,
  onApprove,
  onReject,
  onAddComment,
  onBack
}: AssetReviewSideBySideProps) {
  const [comment, setComment] = useState('')
  const { toast } = useToast()
  const IconComponent = getTypeIcon(asset.type)

  const handleAddComment = () => {
    if (!comment.trim()) return
    onAddComment(asset.id, comment)
    setComment('')
  }

  const handleApprove = () => {
    onApprove(asset.id)
  }

  const handleReject = () => {
    onReject(asset.id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Queue
              </Button>
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">{asset.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} Submission Review
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`capitalize ${
                asset.priority === 'high' ? 'border-destructive text-destructive' :
                asset.priority === 'medium' ? 'border-warning text-warning' :
                'border-muted-foreground text-muted-foreground'
              }`}>
                {asset.priority} Priority
              </Badge>
              {asset.autoApprovalEligible && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Auto-Eligible
                </Badge>
              )}
              <StatusBadge status={asset.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList>
            <TabsTrigger value="review">Review Summary</TabsTrigger>
            <TabsTrigger value="full">Full Asset Details</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
              {/* Left Side - Key Items to Review */}
              <div className="space-y-6 overflow-y-auto">
                <Card className="border-warning">
                  <CardHeader className="bg-warning/10">
                    <CardTitle className="flex items-center gap-2 text-warning-foreground">
                      <AlertCircle className="h-5 w-5" />
                      Items Requiring Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-warning/5 border-l-4 border-warning rounded">
                        <h4 className="font-semibold text-sm mb-1">Governance Checks</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {asset.metadata.governanceChecks || "2 of 5 checks passed"}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span>Data classification verified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span>Ownership documentation complete</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-destructive" />
                            <span className="font-medium">PII fields need review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-destructive" />
                            <span className="font-medium">Security compliance pending</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-destructive" />
                            <span className="font-medium">Data retention policy missing</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-warning/5 border-l-4 border-warning rounded">
                        <h4 className="font-semibold text-sm mb-1">Risk Assessment</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Overall Risk Score</span>
                          <Badge variant={asset.riskScore > 20 ? "destructive" : asset.riskScore > 10 ? "secondary" : "outline"}>
                            {asset.riskScore}% Risk
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {asset.riskScore > 50 
                            ? "High risk - requires detailed review and additional documentation"
                            : "Medium risk - standard review process applies"}
                        </p>
                      </div>

                      {asset.priority === 'high' && (
                        <div className="p-3 bg-destructive/5 border-l-4 border-destructive rounded">
                          <h4 className="font-semibold text-sm mb-1 text-destructive">High Priority</h4>
                          <p className="text-xs text-muted-foreground">
                            This submission requires expedited review due to business criticality
                          </p>
                        </div>
                      )}

                      {!asset.autoApprovalEligible && (
                        <div className="p-3 bg-muted border-l-4 border-muted-foreground rounded">
                          <h4 className="font-semibold text-sm mb-1">Manual Review Required</h4>
                          <p className="text-xs text-muted-foreground">
                            This asset does not meet auto-approval criteria and requires manual steward review
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Asset Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {asset.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Producer</p>
                          <p className="text-sm font-medium">{asset.producer}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <Badge variant="outline">{asset.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Review Interface */}
              <div className="space-y-6">
                {/* Comments Section */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Review & Comments
                      <Badge variant="secondary">
                        {asset.comments.length} comments
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing Comments */}
                    {asset.comments.length > 0 && (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {asset.comments.map(comment => (
                          <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.message}</p>
                            <Badge 
                              variant="outline" 
                              className="mt-2 text-xs"
                            >
                              {comment.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium text-sm">Add Feedback</h4>
                      <Textarea
                        placeholder="Provide feedback to the producer..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-20"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        size="sm"
                        className="w-full"
                      >
                        Send Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Review Decision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleApprove}
                        disabled={asset.status === 'approved'}
                        className="flex items-center gap-2"
                        size="lg"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={asset.status === 'rejected'}
                        className="flex items-center gap-2"
                        size="lg"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                    
                    {asset.status !== 'pending' && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        This asset has already been {asset.status.replace('_', ' ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="full" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
              {/* Left Side - Full Asset Details */}
              <div className="space-y-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Producer</p>
                      <p className="text-sm font-medium">{asset.producer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <Badge variant="outline">{asset.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">
                        {new Date(asset.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge variant="secondary">{asset.type}</Badge>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Metadata Details */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(asset.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="text-right">
                        {typeof value === 'boolean' ? (
                          <Badge variant={value ? "outline" : "secondary"} className={value ? "bg-success/10 text-success" : ""}>
                            {value ? 'Yes' : 'No'}
                          </Badge>
                        ) : typeof value === 'number' ? (
                          <span className="text-sm font-medium">{value}%</span>
                        ) : Array.isArray(value) ? (
                          <span className="text-sm">{value.join(', ')}</span>
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Risk Score</span>
                    <Badge variant={asset.riskScore > 20 ? "destructive" : asset.riskScore > 10 ? "secondary" : "outline"}>
                      {asset.riskScore}% Risk
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Auto-Approval Eligible</span>
                      <Badge variant={asset.autoApprovalEligible ? "outline" : "secondary"} 
                             className={asset.autoApprovalEligible ? "bg-success/10 text-success" : ""}>
                        {asset.autoApprovalEligible ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priority Level</span>
                      <Badge variant="outline" className={`capitalize ${
                        asset.priority === 'high' ? 'border-destructive text-destructive' :
                        asset.priority === 'medium' ? 'border-warning text-warning' :
                        'border-muted-foreground text-muted-foreground'
                      }`}>
                        {asset.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Review Interface */}
          <div className="space-y-6">
            {/* Comments Section */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Review & Comments
                  <Badge variant="secondary">
                    {asset.comments.length} comments
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Comments */}
                {asset.comments.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {asset.comments.map(comment => (
                      <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs"
                        >
                          {comment.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm">Add Feedback</h4>
                  <Textarea
                    placeholder="Provide feedback to the producer..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-20"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    size="sm"
                    className="w-full"
                  >
                    Send Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Review Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={asset.status === 'approved'}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={asset.status === 'rejected'}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
                
                {asset.status !== 'pending' && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    This asset has already been {asset.status.replace('_', ' ')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
