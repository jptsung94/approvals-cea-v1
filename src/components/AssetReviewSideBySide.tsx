import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  FileType
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataAsset {
  id: string
  name: string
  type: 'dataset' | 'api' | 'stream' | 'model'
  producer: string
  submittedAt: string
  status: AssetStatus
  description: string
  category: string
  format?: string
  size?: string
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'feedback' | 'question' | 'approval'
}

interface AssetReviewSideBySideProps {
  asset: DataAsset
  onApprove: (assetId: string) => void
  onReject: (assetId: string) => void
  onAddComment: (assetId: string, message: string) => void
  onBack: () => void
}

const typeIcons = {
  dataset: Database,
  api: BarChart3,
  stream: Clock,
  model: FileText
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
  const IconComponent = typeIcons[asset.type]

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
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">{asset.name}</h1>
                  <p className="text-sm text-muted-foreground">Asset Review</p>
                </div>
              </div>
            </div>
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Asset Details */}
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

                {(asset.format || asset.size) && (
                  <div className="grid grid-cols-2 gap-4">
                    {asset.format && (
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Format</p>
                          <p className="text-sm font-medium">{asset.format}</p>
                        </div>
                      </div>
                    )}
                    
                    {asset.size && (
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="text-sm font-medium">{asset.size}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional metadata sections could go here */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Data Quality Score</span>
                    <Badge variant="outline" className="bg-success/10 text-success">95%</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Completeness</span>
                    <Badge variant="outline" className="bg-success/10 text-success">98%</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Update Frequency</span>
                    <span className="text-sm">Daily</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">Compliance Status</span>
                    <Badge variant="outline" className="bg-success/10 text-success">GDPR Compliant</Badge>
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
      </div>
    </div>
  )
}
