import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { Clock, CheckCircle, XCircle, MessageSquare, Upload, TrendingUp, Database, BarChart3, FileText } from "lucide-react"

interface ProducerAsset {
  id: string
  name: string
  type: 'dataset' | 'api' | 'stream' | 'model'
  submittedAt: string
  status: AssetStatus
  lastUpdated: string
  commentsCount: number
  estimatedApprovalTime?: string
}

const mockProducerAssets: ProducerAsset[] = [
  {
    id: '1',
    name: 'Customer Analytics Dataset',
    type: 'dataset',
    submittedAt: '2024-01-20T10:30:00Z',
    status: 'pending',
    lastUpdated: '2024-01-20T10:30:00Z',
    commentsCount: 0,
    estimatedApprovalTime: '2-3 business days'
  },
  {
    id: '2',
    name: 'Sales Performance API',
    type: 'api',
    submittedAt: '2024-01-19T14:20:00Z',
    status: 'under_review',
    lastUpdated: '2024-01-20T09:15:00Z',
    commentsCount: 2
  },
  {
    id: '3',
    name: 'Marketing Campaign Data',
    type: 'dataset',
    submittedAt: '2024-01-18T16:45:00Z',
    status: 'approved',
    lastUpdated: '2024-01-19T11:30:00Z',
    commentsCount: 1
  },
  {
    id: '4',
    name: 'ML Recommendation Model',
    type: 'model',
    submittedAt: '2024-01-17T13:10:00Z',
    status: 'rejected',
    lastUpdated: '2024-01-18T10:20:00Z',
    commentsCount: 3
  }
]

const typeIcons = {
  dataset: Database,
  api: BarChart3,
  stream: Clock,
  model: FileText
}

export function ProducerDashboard() {
  const [assets] = useState<ProducerAsset[]>(mockProducerAssets)

  const pendingAssets = assets.filter(a => a.status === 'pending' || a.status === 'under_review')
  const approvedAssets = assets.filter(a => a.status === 'approved' || a.status === 'auto_approved')
  const rejectedAssets = assets.filter(a => a.status === 'rejected')
  const approvalRate = Math.round((approvedAssets.length / assets.length) * 100)

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
                <p className="text-2xl font-bold">{pendingAssets.length}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
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

      {/* My Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assets.map((asset) => {
              const IconComponent = typeIcons[asset.type]
              const progressValue = getProgressValue(asset.status)
              
              return (
                <div key={asset.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{asset.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {asset.type.toUpperCase()}
                          </Badge>
                          <span>•</span>
                          <span>Submitted {new Date(asset.submittedAt).toLocaleDateString()}</span>
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

                  {asset.status === 'rejected' && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Resubmit
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
    </div>
  )
}