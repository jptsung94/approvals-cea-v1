import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { Clock, FileText, Database, BarChart3, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react"
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

const mockAssets: DataAsset[] = [
  {
    id: '1',
    name: 'Customer Analytics Dataset',
    type: 'dataset',
    producer: 'DataCorp Analytics',
    submittedAt: '2024-01-20T10:30:00Z',
    status: 'pending',
    description: 'Comprehensive customer behavior analysis dataset with demographics and purchase patterns.',
    category: 'Analytics',
    format: 'Parquet',
    size: '2.4 GB',
    comments: []
  },
  {
    id: '2', 
    name: 'Real-time Weather API',
    type: 'api',
    producer: 'Weather Systems Inc',
    submittedAt: '2024-01-19T15:45:00Z',
    status: 'under_review',
    description: 'High-frequency weather data API with global coverage and forecasting capabilities.',
    category: 'Environmental',
    comments: [
      {
        id: 'c1',
        author: 'Sarah Mitchell',
        message: 'Please provide more details about the API rate limits and authentication method.',
        timestamp: '2024-01-20T09:15:00Z',
        type: 'feedback'
      }
    ]
  },
  {
    id: '3',
    name: 'Financial Market Stream',
    type: 'stream',
    producer: 'FinTech Solutions',
    submittedAt: '2024-01-18T08:20:00Z',
    status: 'approved',
    description: 'Real-time financial market data stream including stocks, commodities, and forex.',
    category: 'Financial',
    comments: []
  }
]

const typeIcons = {
  dataset: Database,
  api: BarChart3,
  stream: Clock,
  model: FileText
}

export function ApprovalDashboard() {
  const [assets, setAssets] = useState<DataAsset[]>(mockAssets)
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [comment, setComment] = useState('')
  const { toast } = useToast()

  const handleApprove = (assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId ? { ...asset, status: 'approved' as AssetStatus } : asset
    ))
    toast({
      title: "Asset Approved",
      description: "The data asset has been successfully approved.",
    })
  }

  const handleReject = (assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId ? { ...asset, status: 'rejected' as AssetStatus } : asset
    ))
    toast({
      title: "Asset Rejected",
      description: "The data asset has been rejected.",
      variant: "destructive"
    })
  }

  const addComment = (assetId: string, message: string) => {
    if (!message.trim()) return

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Data Steward',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'feedback'
    }

    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, comments: [...asset.comments, newComment] }
        : asset
    ))
    setComment('')
    toast({
      title: "Comment Added",
      description: "Your feedback has been sent to the producer.",
    })
  }

  const pendingCount = assets.filter(a => a.status === 'pending').length
  const reviewingCount = assets.filter(a => a.status === 'under_review').length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{reviewingCount}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => {
              const IconComponent = typeIcons[asset.type]
              return (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <IconComponent className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{asset.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{asset.producer}</span>
                        <span>•</span>
                        <Badge variant="outline">{asset.category}</Badge>
                        {asset.format && (
                          <>
                            <span>•</span>
                            <span>{asset.format}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={asset.status} />
                    
                    {asset.comments.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {asset.comments.length}
                      </Badge>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            {asset.name}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{asset.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">Producer</h4>
                              <p className="text-sm text-muted-foreground">{asset.producer}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Type</h4>
                              <Badge variant="outline">{asset.type}</Badge>
                            </div>
                          </div>

                          {asset.comments.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Comments</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {asset.comments.map(comment => (
                                  <div key={comment.id} className="p-2 bg-muted rounded text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium">{comment.author}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p>{comment.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-2">Add Feedback</h4>
                            <Textarea
                              placeholder="Provide feedback to the producer..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="mb-2"
                            />
                            <Button
                              onClick={() => addComment(asset.id, comment)}
                              disabled={!comment.trim()}
                              size="sm"
                            >
                              Send Feedback
                            </Button>
                          </div>

                          <div className="flex space-x-2 pt-4 border-t">
                            <Button
                              onClick={() => handleApprove(asset.id)}
                              className="flex-1"
                              disabled={asset.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(asset.id)}
                              className="flex-1"
                              disabled={asset.status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}