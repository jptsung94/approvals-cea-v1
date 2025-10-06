import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { AssetReviewSideBySide } from "./AssetReviewSideBySide"
import { ApprovalFilters, type FilterState } from "./ApprovalFilters"
import { BulkActionsPanel } from "./BulkActionsPanel"
import { DelegateManagement } from "./DelegateManagement"
import { RulesConfiguration } from "./RulesConfiguration"
import { SLAIndicator } from "./SLAIndicator"
import { EscalationButton } from "./EscalationButton"
import { ApprovalTimeline } from "./ApprovalTimeline"
import { PendingApprovalsSummary } from "./PendingApprovalsSummary"
import { NotificationCenter } from "./NotificationCenter"
import { ErrorRecovery } from "./ErrorRecovery"
import { Clock, FileText, Database, BarChart3, MessageSquare, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeAssets } from "@/hooks/useRealtimeAssets"

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

interface TimelineEvent {
  id: string
  type: 'submitted' | 'review_started' | 'comment' | 'approved' | 'rejected' | 'escalated' | 'reassigned'
  actor: string
  message: string
  timestamp: string
}

const mockSubmissions: AssetSubmission[] = [
  {
    id: '1',
    name: 'Customer Transaction Dataset',
    type: 'Dataset',
    producer: 'David Stevens',
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    description: 'Daily customer transaction data for analytics - Q4 2024',
    category: 'Financial Data',
    metadata: {
      format: 'Parquet',
      size: '2.5 GB',
      sensitivity: 'Confidential',
      recordCount: 1250000,
      approvers: ['Kelly Schwartz (COE)', 'Rakesh Sharma (PDS)', 'Samar Sharma (AE)'],
      sla: '5 business days',
      currentStep: 'COE Review',
      governanceChecks: '2 of 5 passed',
      qualityScore: 92
    },
    comments: [],
    priority: 'high',
    riskScore: 75,
    autoApprovalEligible: false
  },
  {
    id: '2', 
    name: 'Product Catalog API v2.1',
    type: 'API',
    producer: 'Alexander Ekubo',
    submittedAt: '2024-01-14T15:45:00Z',
    status: 'under_review',
    description: 'RESTful API for product information with enhanced filtering capabilities',
    category: 'Product Data',
    metadata: {
      endpoints: 12,
      version: 'v2.1',
      sensitivity: 'Internal',
      approvers: ['Kelly Schwartz (COE)', 'API Coach (LOB)'],
      sla: '3 business days',
      currentStep: 'LOB API Coach Review',
      governanceChecks: '4 of 5 passed',
      authentication: 'OAuth 2.0'
    },
    comments: [
      {
        id: 'c1',
        author: 'Kelly Schwartz',
        message: 'COE Review Complete: Authentication documentation approved. Automated standardization check passed for 95% of endpoints.',
        timestamp: '2024-01-14T15:30:00Z',
        type: 'approval'
      }
    ],
    priority: 'medium',
    riskScore: 42,
    autoApprovalEligible: true
  },
  {
    id: '3',
    name: 'Marketing Campaign Data Share',
    type: 'Data Share',
    producer: 'Mike Chen',
    submittedAt: '2024-01-13T08:20:00Z',
    status: 'approved',
    description: 'Campaign performance metrics for Q4 2024 cross-LOB sharing',
    category: 'Marketing Data',
    metadata: {
      sensitivity: 'Internal',
      recipients: ['Marketing Team', 'Analytics Team'],
      expiryDate: '2024-12-31',
      approvers: ['Data Guardian (Marketing)', 'DDRO'],
      sla: '2 business days',
      currentStep: 'Complete',
      governanceChecks: '5 of 5 passed',
      bulkApproved: true
    },
    comments: [
      {
        id: 'c2',
        author: 'Alex Thompson',
        message: 'Bulk approved with 12 other similar marketing data shares. Standard governance terms applied automatically.',
        timestamp: '2024-01-13T10:15:00Z',
        type: 'approval'
      }
    ],
    priority: 'low',
    riskScore: 21,
    autoApprovalEligible: true
  },
  {
    id: '4',
    name: 'Security Event Logs Dataset',
    type: 'Dataset',
    producer: 'Lisa Wang',
    submittedAt: '2024-01-12T08:20:00Z',
    status: 'rejected',
    description: 'Security event monitoring logs with PII data',
    category: 'Security Data',
    metadata: {
      format: 'JSON',
      size: '15.2 GB',
      sensitivity: 'Highly Confidential',
      recordCount: 5000000,
      approvers: ['Kelly Schwartz (COE)', 'Security PDS', 'DDRO', 'AE'],
      sla: '7 business days',
      currentStep: 'Rejected - PII Remediation Required',
      governanceChecks: '1 of 5 passed'
    },
    comments: [
      {
        id: 'c3',
        author: 'David Rodriguez',
        message: 'Governance Engine flagged: PII masking required for fields [user_id, email, phone]. Use CEA Governance Engine for real-time validation before resubmission.',
        timestamp: '2024-01-12T14:20:00Z',
        type: 'feedback'
      }
    ],
    priority: 'high',
    riskScore: 92,
    autoApprovalEligible: false
  },
  {
    id: '5',
    name: 'User Analytics Dashboard API',
    type: 'API',
    producer: 'Tom Wilson',
    submittedAt: '2024-01-16T10:00:00Z',
    status: 'pending',
    description: 'API for user behavior analytics dashboard - auto-generated from dataset',
    category: 'Analytics Data',
    metadata: {
      endpoints: 8,
      version: 'v1.0',
      sensitivity: 'Internal',
      approvers: ['Kelly Schwartz (COE)'],
      sla: '3 business days',
      currentStep: 'Governance Engine Validation',
      governanceChecks: 'Auto-validation in progress',
      autoGenerated: true
    },
    comments: [],
    priority: 'medium',
    riskScore: 55,
    autoApprovalEligible: true
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [failedAutoApprovals, setFailedAutoApprovals] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    requestType: 'all',
    approvalMethod: 'all'
  })
  const { toast } = useToast()

  // Real-time updates
  useRealtimeAssets({
    onAssetUpdate: (payload) => {
      setSubmissions(prev => prev.map(s =>
        s.id === payload.new.id ? { ...s, status: payload.new.status } : s
      ))
    },
    onCommentAdded: (payload) => {
      setSubmissions(prev => prev.map(s =>
        s.id === payload.new.asset_id
          ? {
              ...s,
              comments: [
                ...s.comments,
                {
                  id: payload.new.id,
                  author: payload.new.author_name,
                  message: payload.new.message,
                  timestamp: payload.new.created_at,
                  type: payload.new.comment_type
                }
              ]
            }
          : s
      ))
    }
  })
  
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

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
  
  const handleEscalate = (submissionId: string, reason: string, escalateTo: string) => {
    setSubmissions(prev => prev.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            comments: [
              ...submission.comments,
              {
                id: Math.random().toString(36).substr(2, 9),
                author: 'System',
                message: `Escalated to ${escalateTo}: ${reason}`,
                timestamp: new Date().toISOString(),
                type: 'feedback' as const
              }
            ]
          }
        : submission
    ))
  }

  const handleRetryAutoApproval = (submissionId: string) => {
    // Simulate retry logic
    const success = Math.random() > 0.3 // 70% success rate
    
    if (success) {
      setSubmissions(prev => prev.map(s =>
        s.id === submissionId ? { ...s, status: 'approved' as AssetStatus } : s
      ))
      setFailedAutoApprovals(prev => {
        const next = new Set(prev)
        next.delete(submissionId)
        return next
      })
      toast({
        title: "Auto-Approval Successful",
        description: "The asset has been automatically approved"
      })
    } else {
      toast({
        title: "Retry Failed",
        description: "Auto-approval failed again. Consider manual review.",
        variant: "destructive"
      })
    }
  }
  
  // Generate timeline events for selected submission
  const getTimelineEvents = (submission: AssetSubmission): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        type: 'submitted',
        actor: submission.producer,
        message: `Submitted ${submission.type} for approval`,
        timestamp: submission.submittedAt
      }
    ]
    
    if (submission.status === 'under_review') {
      events.push({
        id: '2',
        type: 'review_started',
        actor: submission.metadata.approvers?.[0] || 'Approver',
        message: 'Started review process',
        timestamp: new Date(new Date(submission.submittedAt).getTime() + 3600000).toISOString()
      })
    }
    
    submission.comments.forEach((comment, index) => {
      events.push({
        id: `comment-${index}`,
        type: comment.type === 'approval' ? 'approved' : 'comment',
        actor: comment.author,
        message: comment.message,
        timestamp: comment.timestamp
      })
    })
    
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }
  
  // Calculate pending approvals summary
  const pendingApprovalsSummary = useMemo(() => {
    const approverMap = new Map<string, { count: number, oldestDays: number }>()
    
    submissions
      .filter(s => s.status === 'pending' || s.status === 'under_review')
      .forEach(submission => {
        const approvers = submission.metadata.approvers || []
        approvers.forEach((approver: string) => {
          const existing = approverMap.get(approver) || { count: 0, oldestDays: 0 }
          const daysSinceSubmit = Math.floor(
            (new Date().getTime() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          approverMap.set(approver, {
            count: existing.count + 1,
            oldestDays: Math.max(existing.oldestDays, daysSinceSubmit)
          })
        })
      })
    
    return Array.from(approverMap.entries())
      .map(([approver, data]) => ({
        approver,
        count: data.count,
        oldestPendingDays: data.oldestDays
      }))
      .sort((a, b) => b.oldestPendingDays - a.oldestPendingDays)
  }, [submissions])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubmissions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredSubmissions.map(s => s.id)))
    }
  }

  const handleBulkApprove = (comment: string) => {
    const idsToApprove = Array.from(selectedIds)
    setSubmissions(prev => prev.map(submission =>
      idsToApprove.includes(submission.id)
        ? { ...submission, status: 'approved' as AssetStatus }
        : submission
    ))
    setSelectedIds(new Set())
    toast({
      title: "Bulk Approval Complete",
      description: `${idsToApprove.length} submissions approved with comment: "${comment}"`
    })
  }

  const handleBulkReject = (comment: string) => {
    const idsToReject = Array.from(selectedIds)
    setSubmissions(prev => prev.map(submission =>
      idsToReject.includes(submission.id)
        ? { ...submission, status: 'rejected' as AssetStatus }
        : submission
    ))
    setSelectedIds(new Set())
    toast({
      title: "Bulk Rejection Complete",
      description: `${idsToReject.length} submissions rejected with feedback: "${comment}"`,
      variant: "destructive"
    })
  }

  // Filter and search logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          submission.name.toLowerCase().includes(searchLower) ||
          submission.producer.toLowerCase().includes(searchLower) ||
          submission.id.toLowerCase().includes(searchLower) ||
          submission.type.toLowerCase().includes(searchLower) ||
          submission.category.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'open' && !['pending', 'under_review'].includes(submission.status)) {
          return false
        } else if (filters.status !== 'open' && submission.status !== filters.status) {
          return false
        }
      }

      // Request type filter (simplified for demo)
      if (filters.requestType !== 'all') {
        // In real implementation, this would check actual request type
        return true
      }

      // Approval method filter
      if (filters.approvalMethod !== 'all') {
        if (filters.approvalMethod === 'auto_eligible' && !submission.autoApprovalEligible) {
          return false
        }
        if (filters.approvalMethod === 'bulk_candidates' && submission.priority !== 'low') {
          return false
        }
      }

      return true
    })
  }, [submissions, filters])

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
      {/* CEA Approver Dashboard Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Approvals Core Experience - Asset Review Queue</h1>
          <p className="text-muted-foreground">Unified, asset-agnostic approval interface with automated governance and bulk remediation</p>
        </div>
        <NotificationCenter />
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

      {/* Filters and Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <ApprovalFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  resultCount={filteredSubmissions.length}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <DelegateManagement />
              <RulesConfiguration />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Panel */}
      <BulkActionsPanel
        selectedCount={selectedIds.size}
        onApproveAll={handleBulkApprove}
        onRejectAll={handleBulkReject}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Pending Approvals Summary */}
      <PendingApprovalsSummary items={pendingApprovalsSummary} />

      {/* Failed Auto-Approvals - Error Recovery */}
      {submissions.filter(s => failedAutoApprovals.has(s.id)).map(submission => (
        <ErrorRecovery
          key={submission.id}
          assetId={submission.id}
          assetName={submission.name}
          errorType="auto_approval_failed"
          errorMessage="The automated approval process encountered an issue due to incomplete governance checks."
          suggestedActions={[
            "Review governance check results in detail",
            "Verify all required metadata is present",
            "Check if similar assets were recently approved",
            "Consider manual review if retry fails"
          ]}
          onRetry={() => handleRetryAutoApproval(submission.id)}
          onManualReview={() => handleStartReview(submission)}
        />
      ))}

      {/* Submission Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prioritized Review Queue - SLA Tracked</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Select All
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approvals match your filters</p>
              </div>
            ) : (
              filteredSubmissions
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
                const isExpanded = expandedItems.has(submission.id)
                
                return (
                  <Collapsible
                    key={submission.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(submission.id)}
                  >
                    <div className={`border rounded-lg hover:shadow-md transition-shadow ${priorityColors[submission.priority]}`}>
                      {/* First Row - Main Info */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <Checkbox
                            checked={selectedIds.has(submission.id)}
                            onCheckedChange={() => toggleSelection(submission.id)}
                          />
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
                            <p className="text-sm text-muted-foreground">{submission.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <SLAIndicator 
                            submittedAt={submission.submittedAt}
                            slaTarget={submission.metadata.sla || '5 business days'}
                            status={submission.status}
                          />
                          <StatusBadge status={submission.status} />
                          {submission.comments.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {submission.comments.length}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Second Row - Metadata and Actions */}
                      <div className="flex items-center justify-between px-4 pb-4 ml-14">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{submission.producer}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{submission.category}</Badge>
                          <span>•</span>
                          <span className="capitalize">{submission.type}</span>
                          <span>•</span>
                          <span>Risk: {submission.riskScore}%</span>
                          <span>•</span>
                          <span>SLA: {submission.metadata.sla}</span>
                          <span>•</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{submission.metadata.currentStep}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {(submission.status === 'pending' || submission.status === 'under_review') && (
                            <EscalationButton
                              submissionId={submission.id}
                              submissionName={submission.name}
                              currentApprover={submission.metadata.approvers?.[0] || 'Unknown'}
                              onEscalate={(reason, escalateTo) => handleEscalate(submission.id, reason, escalateTo)}
                              variant="ghost"
                            />
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartReview(submission)}
                          >
                            Review
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      {/* Expandable Details - Business Justification and Timeline */}
                      <CollapsibleContent>
                        <div className="px-4 pb-4 ml-14 pt-2 border-t mx-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Business Justification */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold">Business Justification</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {submission.metadata?.businessJustification || 
                                  "This asset is critical for improving data quality and enabling cross-functional analytics. It will support key business initiatives and provide standardized access to critical data points for decision-making across multiple departments."}
                              </p>
                              {submission.metadata && (
                                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                                  {submission.metadata.format && (
                                    <div>
                                      <span className="font-medium">Format: </span>
                                      <span className="text-muted-foreground">{submission.metadata.format}</span>
                                    </div>
                                  )}
                                  {submission.metadata.size && (
                                    <div>
                                      <span className="font-medium">Size: </span>
                                      <span className="text-muted-foreground">{submission.metadata.size}</span>
                                    </div>
                                  )}
                                  {submission.metadata.sensitivity && (
                                    <div>
                                      <span className="font-medium">Sensitivity: </span>
                                      <span className="text-muted-foreground">{submission.metadata.sensitivity}</span>
                                    </div>
                                  )}
                                  {submission.metadata.governanceChecks && (
                                    <div>
                                      <span className="font-medium">Governance: </span>
                                      <span className="text-muted-foreground">{submission.metadata.governanceChecks}</span>
                                    </div>
                                  )}
                                  {submission.metadata.qualityScore && (
                                    <div>
                                      <span className="font-medium">Quality Score: </span>
                                      <span className="text-muted-foreground">{submission.metadata.qualityScore}%</span>
                                    </div>
                                  )}
                                  {submission.metadata.approvers && (
                                    <div className="col-span-2">
                                      <span className="font-medium">Approvers: </span>
                                      <span className="text-muted-foreground">{submission.metadata.approvers.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Approval Timeline */}
                            <div>
                              <ApprovalTimeline 
                                events={getTimelineEvents(submission)}
                                currentStatus={submission.status}
                                className="border-0 shadow-none"
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}