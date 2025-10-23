import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { ProducerDetailsModal } from "./ProducerDetailsModal"
import { Clock, CheckCircle, XCircle, MessageSquare, Upload, TrendingUp, Database, BarChart3, FileText, Search, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProducerAsset {
  id: string
  name: string
  type: 'dataset' | 'api' | 'stream' | 'model'
  submittedAt: string
  status: AssetStatus
  lastUpdated: string
  commentsCount: number
  estimatedApprovalTime?: string
  approvers?: string[]
  currentStep?: string
  sla?: string
  waitingOn?: string
  description?: string
  category?: string
  metadata: Record<string, any>
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'feedback' | 'question' | 'approval' | 'revision_request'
  phase?: string
}

const mockProducerAssets: ProducerAsset[] = [
  {
    id: 'PA-1001',
    name: 'Customer Analytics Dataset',
    type: 'dataset',
    submittedAt: '2024-01-20T10:30:00Z',
    status: 'pending',
    lastUpdated: '2024-01-20T10:30:00Z',
    commentsCount: 0,
    estimatedApprovalTime: '2-3 business days',
    approvers: ['Kelly Schwartz (COE)', 'Rakesh Sharma (PDS)', 'Samar Sharma (AE)'],
    currentStep: 'COE Review',
    sla: '5 business days',
    waitingOn: 'Kelly Schwartz',
    description: 'Comprehensive customer analytics dataset including transaction history and behavioral patterns',
    category: 'Analytics',
    metadata: {
      format: 'Parquet',
      size: '2.5 GB',
      sensitivity: 'Confidential',
      recordCount: 1250000
    },
    comments: []
  },
  {
    id: 'PA-1002',
    name: 'Sales Performance API',
    type: 'api',
    submittedAt: '2024-01-19T14:20:00Z',
    status: 'under_review',
    lastUpdated: '2024-01-20T09:15:00Z',
    commentsCount: 2,
    approvers: ['Kelly Schwartz (COE)', 'API Coach (LOB)'],
    currentStep: 'LOB API Coach Review',
    sla: '3 business days',
    waitingOn: 'API Coach',
    description: 'RESTful API for real-time sales performance metrics and KPI tracking',
    category: 'Sales',
    metadata: {
      endpoints: 8,
      version: 'v1.2',
      authentication: 'OAuth 2.0'
    },
    comments: [
      {
        id: 'c1',
        author: 'Kelly Schwartz',
        message: 'Please add rate limiting documentation',
        timestamp: '2024-01-19T15:30:00Z',
        type: 'feedback'
      }
    ]
  },
  {
    id: 'PA-1003',
    name: 'Marketing Campaign Data',
    type: 'dataset',
    submittedAt: '2024-01-18T16:45:00Z',
    status: 'approved',
    lastUpdated: '2024-01-19T11:30:00Z',
    commentsCount: 1,
    approvers: ['Data Guardian (Marketing)', 'DDRO'],
    currentStep: 'Complete',
    sla: '2 business days',
    description: 'Q4 marketing campaign performance data',
    category: 'Marketing',
    metadata: {
      format: 'CSV',
      size: '500 MB',
      campaigns: 45
    },
    comments: [
      {
        id: 'c2',
        author: 'Data Guardian',
        message: 'Approved - meets all compliance requirements',
        timestamp: '2024-01-19T11:30:00Z',
        type: 'approval'
      }
    ]
  },
  {
    id: 'PA-1004',
    name: 'ML Recommendation Model',
    type: 'model',
    submittedAt: '2024-01-17T13:10:00Z',
    status: 'rejected',
    lastUpdated: '2024-01-18T10:20:00Z',
    commentsCount: 3,
    approvers: ['Kelly Schwartz (COE)', 'Model Governance'],
    currentStep: 'Rejected - Action Required',
    sla: '5 business days',
    description: 'Machine learning model for product recommendations',
    category: 'AI/ML',
    metadata: {
      modelType: 'Collaborative Filtering',
      accuracy: '87%',
      trainingData: 'Customer purchase history'
    },
    comments: [
      {
        id: 'c3',
        author: 'Model Governance',
        message: 'Missing bias testing documentation. Please provide fairness metrics.',
        timestamp: '2024-01-18T10:20:00Z',
        type: 'revision_request'
      }
    ]
  },
  {
    id: 'PA-1005',
    name: 'Real-time Transaction Stream',
    type: 'stream',
    submittedAt: '2024-01-21T08:00:00Z',
    status: 'pending',
    lastUpdated: '2024-01-21T08:00:00Z',
    commentsCount: 0,
    estimatedApprovalTime: '3-5 business days',
    approvers: ['Kelly Schwartz (COE)', 'Stream Coach'],
    currentStep: 'Governance Engine Validation',
    sla: '4 business days',
    waitingOn: 'Auto-validation in progress',
    description: 'Real-time stream of transaction events for fraud detection',
    category: 'Streaming',
    metadata: {
      throughput: '10k events/sec',
      retention: '7 days',
      format: 'Avro'
    },
    comments: []
  }
]

const typeIcons = {
  dataset: Database,
  api: BarChart3,
  stream: Clock,
  model: FileText
}

export function ProducerDashboard() {
  const [assets, setAssets] = useState<ProducerAsset[]>(mockProducerAssets)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  const [selectedAsset, setSelectedAsset] = useState<ProducerAsset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      // Tab filter
      const isOpen = ['pending', 'under_review'].includes(asset.status)
      if (activeTab === 'open' && !isOpen) return false
      if (activeTab === 'closed' && isOpen) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          asset.name.toLowerCase().includes(query) ||
          asset.id.toLowerCase().includes(query) ||
          asset.type.toLowerCase().includes(query)
        )
      }
      return true
    })

    return filtered
  }, [assets, searchQuery, activeTab])

  const openAssets = assets.filter(a => ['pending', 'under_review'].includes(a.status))
  const pendingAssets = assets.filter(a => a.status === 'pending' || a.status === 'under_review')
  const approvedAssets = assets.filter(a => a.status === 'approved' || a.status === 'auto_approved')
  const rejectedAssets = assets.filter(a => a.status === 'rejected')
  const approvalRate = Math.round((approvedAssets.length / assets.length) * 100)

  const handleSendReminder = (assetId: string, waitingOn: string) => {
    toast({
      title: "Reminder Sent",
      description: `Reminder sent to ${waitingOn} for approval request ${assetId}`
    })
  }

  const handleViewDetails = (asset: ProducerAsset) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const handleUpdateAsset = (assetId: string, updates: Partial<ProducerAsset>) => {
    setAssets(prev => prev.map(asset =>
      asset.id === assetId ? { ...asset, ...updates, lastUpdated: new Date().toISOString() } : asset
    ))
  }

  const handleAddComment = (assetId: string, message: string, phase?: string) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Producer',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'question',
      phase
    }

    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? {
            ...asset,
            comments: [...asset.comments, newComment],
            commentsCount: asset.commentsCount + 1
          }
        : asset
    ))

    toast({
      title: "Comment Added",
      description: "Your message has been sent to the reviewers."
    })
  }

  const getProgressValue = (status: AssetStatus) => {
    switch (status) {
      case 'pending': return 25
      case 'under_review': return 75
      case 'approved': return 100
      case 'auto_approved': return 100
      case 'rejected': return 0
      default: return 0
    }
  }

  const getStatusDescription = (asset: ProducerAsset) => {
    switch (asset.status) {
      case 'pending':
        return `Submitted ${new Date(asset.submittedAt).toLocaleDateString()}. ${asset.estimatedApprovalTime ? `Estimated approval: ${asset.estimatedApprovalTime}` : ''}`
      case 'under_review':
        return `Currently being reviewed. Last updated ${new Date(asset.lastUpdated).toLocaleDateString()}.`
      case 'approved':
        return `Approved on ${new Date(asset.lastUpdated).toLocaleDateString()}. Your asset is now live in the marketplace.`
      case 'auto_approved':
        return `Auto-approved on ${new Date(asset.lastUpdated).toLocaleDateString()}. Your asset is now live in the marketplace.`
      case 'rejected':
        return `Rejected on ${new Date(asset.lastUpdated).toLocaleDateString()}. Please review feedback and resubmit.`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Producer Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Approvals - Producer Dashboard</h1>
        <p className="text-muted-foreground">Track all your asset submissions with real-time status updates and clear approval workflows</p>
      </div>

      {/* Producer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-sm text-muted-foreground">Total Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{openAssets.length}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{approvedAssets.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{approvalRate}%</p>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Submissions with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Submissions</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'open' | 'closed')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="open">
                Open ({openAssets.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({assets.length - openAssets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No submissions match your search' : `No ${activeTab} submissions`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
            {filteredAssets.map((asset) => {
              const IconComponent = typeIcons[asset.type]
              const progressValue = getProgressValue(asset.status)
              
              return (
                <div key={asset.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{asset.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {asset.id}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {asset.type.toUpperCase()}
                          </Badge>
                          <span>•</span>
                          <span>Submitted {new Date(asset.submittedAt).toLocaleDateString()}</span>
                          {asset.sla && (
                            <>
                              <span>•</span>
                              <span>SLA: {asset.sla}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {asset.commentsCount > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {asset.commentsCount} comment{asset.commentsCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      <StatusBadge status={asset.status} />
                    </div>
                  </div>

                  {/* Current Step and Waiting On */}
                  {asset.currentStep && (
                    <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-md">
                      <div>
                        <span className="text-muted-foreground">Current Step: </span>
                        <span className="font-medium">{asset.currentStep}</span>
                      </div>
                      {asset.waitingOn && (
                        <div>
                          <span className="text-muted-foreground">Waiting on: </span>
                          <span className="font-medium">{asset.waitingOn}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approvers List */}
                  {asset.approvers && asset.approvers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Approval Chain:</p>
                      <div className="flex flex-wrap gap-2">
                        {asset.approvers.map((approver, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {approver}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Approval Progress</span>
                      <span className="font-medium">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{getStatusDescription(asset)}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    {asset.status === 'rejected' && (
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Resubmit
                      </Button>
                    )}
                    {asset.waitingOn && ['pending', 'under_review'].includes(asset.status) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendReminder(asset.id, asset.waitingOn!)}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(asset)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-auto p-4 flex-col space-y-2" variant="outline">
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Submit New Asset</p>
                <p className="text-sm text-muted-foreground">Add a new data asset for review</p>
              </div>
            </Button>
            
            <Button className="h-auto p-4 flex-col space-y-2" variant="outline">
              <MessageSquare className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">View All Comments</p>
                <p className="text-sm text-muted-foreground">See feedback on your submissions</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Producer Details Modal */}
      <ProducerDetailsModal
        asset={selectedAsset}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAsset(null)
        }}
        onUpdate={handleUpdateAsset}
        onAddComment={handleAddComment}
      />
    </div>
  )
}