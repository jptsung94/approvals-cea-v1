import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { AssetReviewSideBySide } from "./AssetReviewSideBySide"
import { Clock, FileText, Database, BarChart3, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react"
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

const mockSubmissions: AssetSubmission[] = [
  {
    id: '1',
    name: 'Customer Analytics Dataset',
    type: 'dataset',
    producer: 'DataCorp Analytics',
    submittedAt: '2024-01-20T10:30:00Z',
    status: 'pending',
    description: 'Comprehensive customer behavior analysis dataset with demographics and purchase patterns.',
    category: 'Analytics',
    metadata: {
      format: 'Parquet',
      size: '2.4 GB',
      updateFrequency: 'Daily',
      dataRetention: '5 years',
      gdprCompliant: true,
      qualityScore: 95
    },
    comments: [],
    priority: 'high',
    riskScore: 15,
    autoApprovalEligible: false
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
    metadata: {
      endpoint: 'https://api.weather.com/v1',
      rateLimit: '1000 req/min',
      authentication: 'API Key',
      uptime: '99.9%',
      regions: 'Global'
    },
    comments: [
      {
        id: 'c1',
        author: 'Sarah Mitchell',
        message: 'Please provide more details about the API rate limits and authentication method.',
        timestamp: '2024-01-20T09:15:00Z',
        type: 'feedback'
      }
    ],
    priority: 'medium',
    riskScore: 8,
    autoApprovalEligible: true
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
    metadata: {
      latency: '<100ms',
      throughput: '10k events/sec',
      protocol: 'WebSocket',
      encryption: 'TLS 1.3',
      marketData: ['NYSE', 'NASDAQ', 'LSE']
    },
    comments: [],
    priority: 'high',
    riskScore: 25,
    autoApprovalEligible: false
  }
]

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

export function ApprovalDashboard() {
  const [submissions, setSubmissions] = useState<AssetSubmission[]>(mockSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<AssetSubmission | null>(null)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [comment, setComment] = useState('')
  const { toast } = useToast()

  const handleApprove = (submissionId: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { ...submission, status: 'approved' as AssetStatus } : submission
    ))
    toast({
      title: "Submission Approved",
      description: "The asset submission has been successfully approved.",
    })
  }

  const handleReject = (submissionId: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { ...submission, status: 'rejected' as AssetStatus } : submission
    ))
    toast({
      title: "Submission Rejected",
      description: "The asset submission has been rejected.",
      variant: "destructive"
    })
  }

  const addComment = (submissionId: string, message: string) => {
    if (!message.trim()) return

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Data Steward',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'feedback'
    }

    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { ...submission, comments: [...submission.comments, newComment] }
        : submission
    ))
    setComment('')
    toast({
      title: "Comment Added",
      description: "Your feedback has been sent to the producer.",
    })
  }

  const handleStartReview = (submission: AssetSubmission) => {
    setSelectedSubmission(submission)
    setIsReviewMode(true)
  }

  const handleBackToDashboard = () => {
    setIsReviewMode(false)
    setSelectedSubmission(null)
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const reviewingCount = submissions.filter(s => s.status === 'under_review').length
  const highPriorityCount = submissions.filter(s => s.priority === 'high' && s.status === 'pending').length
  const autoApprovalEligibleCount = submissions.filter(s => s.autoApprovalEligible && s.status === 'pending').length

  // Show side-by-side review if in review mode
  if (isReviewMode && selectedSubmission) {
    return (
      <AssetReviewSideBySide
        asset={selectedSubmission}
        onApprove={handleApprove}
        onReject={handleReject}
        onAddComment={addComment}
        onBack={handleBackToDashboard}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Approver Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Asset Approval Management</h1>
        <p className="text-muted-foreground">Review and approve asset submissions from data producers</p>
      </div>

      {/* Priority Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-warning/20 bg-warning/5">
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
        
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
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

        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{autoApprovalEligibleCount}</p>
                <p className="text-sm text-muted-foreground">Auto-Eligible</p>
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

      {/* Submission Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Asset Submission Queue</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {submissions.length} Total Submissions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submissions
              .sort((a, b) => {
                // Priority sorting: high > medium > low, then by submission date
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                  return priorityOrder[b.priority] - priorityOrder[a.priority]
                }
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              })
              .map((submission) => {
                const IconComponent = getTypeIcon(submission.type)
                const priorityColors = {
                  high: 'border-destructive/50 bg-destructive/5',
                  medium: 'border-warning/50 bg-warning/5', 
                  low: 'border-muted'
                }
                
                return (
                  <div
                    key={submission.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow ${priorityColors[submission.priority]}`}
                  >
                    <div className="flex items-center space-x-4">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{submission.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {submission.priority}
                          </Badge>
                          {submission.autoApprovalEligible && (
                            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                              Auto-Eligible
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{submission.producer}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{submission.category}</Badge>
                          <span>•</span>
                          <span className="capitalize">{submission.type}</span>
                          <span>•</span>
                          <span>Risk: {submission.riskScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={submission.status} />
                      
                      {submission.comments.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {submission.comments.length}
                        </Badge>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStartReview(submission)}
                      >
                        Review
                      </Button>
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