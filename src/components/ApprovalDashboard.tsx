import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StatusBadge, type AssetStatus } from "./StatusBadge"
import { ApprovalReviewModal } from "./ApprovalReviewModal"
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
import { Clock, FileText, Database, BarChart3, MessageSquare, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeAssets } from "@/hooks/useRealtimeAssets"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface AssetSubmission {
  id: string
  name: string
  type: string
  subType: 'new' | 'new_minor_version' | 'new_major_version' | 'deprecated'
  producer: string
  submittedAt: string
  lastUpdated: string
  status: AssetStatus
  description: string
  category: string
  classification: 'protected' | 'common' | 'private'
  reviewerName: string
  phase: 'peer_review' | 'governance_committee' | 'security_review' | 'compliance_review'
  action: 'review' | 'view'
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
    subType: 'new',
    producer: 'David Stevens',
    submittedAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T14:20:00Z',
    status: 'pending',
    classification: 'protected',
    reviewerName: 'Rajan Ayakkad',
    phase: 'governance_committee',
    action: 'review',
    description: 'Daily customer transaction data for analytics - Q4 2024',
    category: 'Financial Data',
    metadata: {
      format: 'Parquet',
      size: '2.5 GB',
      sensitivity: 'Confidential',
      recordCount: 1250000,
      approvers: ['Rajan Ayakkad (COE)', 'Steve Wong (PDS)', 'Vivek Saroagi (AE)'],
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
    subType: 'new_minor_version',
    producer: 'Alexander Ekubo',
    submittedAt: '2024-01-14T15:45:00Z',
    lastUpdated: '2024-01-15T09:10:00Z',
    status: 'under_review',
    classification: 'common',
    reviewerName: 'Steve Wong',
    phase: 'peer_review',
    action: 'review',
    description: 'RESTful API for product information with enhanced filtering capabilities',
    category: 'Product Data',
    metadata: {
      endpoints: 12,
      version: 'v2.1',
      sensitivity: 'Internal',
      approvers: ['Rajan Ayakkad (COE)', 'Steve Wong (LOB)'],
      sla: '3 business days',
      currentStep: 'LOB API Coach Review',
      governanceChecks: '4 of 5 passed',
      authentication: 'OAuth 2.0'
    },
    comments: [
      {
        id: 'c1',
        author: 'Rajan Ayakkad',
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
    subType: 'new',
    producer: 'Mike Chen',
    submittedAt: '2024-01-13T08:20:00Z',
    lastUpdated: '2024-01-13T10:15:00Z',
    status: 'approved',
    classification: 'common',
    reviewerName: 'Dan Mattson',
    phase: 'governance_committee',
    action: 'view',
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
        author: 'Dan Mattson',
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
    subType: 'new_major_version',
    producer: 'Lisa Wang',
    submittedAt: '2024-01-12T08:20:00Z',
    lastUpdated: '2024-01-12T14:20:00Z',
    status: 'rejected',
    classification: 'private',
    reviewerName: 'Granger',
    phase: 'security_review',
    action: 'review',
    description: 'Security event monitoring logs with PII data',
    category: 'Security Data',
    metadata: {
      format: 'JSON',
      size: '15.2 GB',
      sensitivity: 'Highly Confidential',
      recordCount: 5000000,
      approvers: ['Granger (COE)', 'Security PDS', 'DDRO', 'AE'],
      sla: '7 business days',
      currentStep: 'Rejected - PII Remediation Required',
      governanceChecks: '1 of 5 passed'
    },
    comments: [
      {
        id: 'c3',
        author: 'Granger',
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
    subType: 'new',
    producer: 'Tom Wilson',
    submittedAt: '2024-01-16T10:00:00Z',
    lastUpdated: '2024-01-16T10:00:00Z',
    status: 'pending',
    classification: 'common',
    reviewerName: 'Ryan',
    phase: 'compliance_review',
    action: 'review',
    description: 'API for user behavior analytics dashboard - auto-generated from dataset',
    category: 'Analytics Data',
    metadata: {
      endpoints: 8,
      version: 'v1.0',
      sensitivity: 'Internal',
      approvers: ['Ryan (COE)'],
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [failedAutoApprovals, setFailedAutoApprovals] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<'name' | 'submittedAt' | 'lastUpdated' | 'priority' | 'type' | 'reviewerName' | 'phase'>('lastUpdated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    assetType: 'all',
    subType: 'all',
    reviewer: 'all',
    phase: 'all',
    action: 'all',
    classification: 'all'
  })
  const [isTeamSummaryOpen, setIsTeamSummaryOpen] = useState(() => {
    const saved = localStorage.getItem('teamSummaryOpen')
    return saved ? JSON.parse(saved) : false
  })
  const { toast } = useToast()
  const ITEMS_PER_PAGE = 10

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

  const handleApprove = (submissionId: string, comment: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { 
        ...submission, 
        status: 'approved' as AssetStatus,
        comments: [...submission.comments, {
          id: Date.now().toString(),
          author: 'Data Steward',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'approval' as const
        }]
      } : submission
    ))
    toast({
      title: "Submission Approved",
      description: "The asset submission has been successfully approved.",
    })
  }

  const handleReject = (submissionId: string, comment: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { 
        ...submission, 
        status: 'rejected' as AssetStatus,
        comments: [...submission.comments, {
          id: Date.now().toString(),
          author: 'Data Steward',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'feedback' as const
        }]
      } : submission
    ))
    toast({
      title: "Submission Rejected",
      description: "The asset submission has been rejected.",
      variant: "destructive"
    })
  }

  const handleRequestRevision = (submissionId: string, comment: string, referTo: string) => {
    setSubmissions(prev => prev.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            status: 'pending' as AssetStatus,
            metadata: {
              ...submission.metadata,
              currentStep: `Pending ${referTo} Review`
            },
            comments: [
              ...submission.comments,
              {
                id: Date.now().toString(),
                author: 'Data Steward',
                message: `Revision requested: ${comment}`,
                timestamp: new Date().toISOString(),
                type: 'revision_request' as const
              }
            ]
          }
        : submission
    ))
    toast({
      title: "Revision Requested",
      description: `Request has been referred to ${referTo} team`,
    })
  }

  const addComment = (submissionId: string, message: string, phase?: string) => {
    if (!message.trim()) return

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Data Steward',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'feedback',
      phase
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
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
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

  // Sorting logic
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // Filter and search logic
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
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

      // Asset type filter
      if (filters.assetType !== 'all' && submission.type !== filters.assetType) {
        return false
      }

      // Sub-type filter
      if (filters.subType !== 'all' && submission.subType !== filters.subType) {
        return false
      }

      // Reviewer filter
      if (filters.reviewer !== 'all' && submission.reviewerName !== filters.reviewer) {
        return false
      }

      // Phase filter
      if (filters.phase !== 'all' && submission.phase !== filters.phase) {
        return false
      }

      // Action filter
      if (filters.action !== 'all' && submission.action !== filters.action) {
        return false
      }

      // Classification filter
      if (filters.classification !== 'all' && submission.classification !== filters.classification) {
        return false
      }

      return true
    })

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0
      
      if (sortColumn === 'name') {
        compareValue = a.name.localeCompare(b.name)
      } else if (sortColumn === 'submittedAt') {
        compareValue = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      } else if (sortColumn === 'lastUpdated') {
        compareValue = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      } else if (sortColumn === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortColumn === 'type') {
        compareValue = a.type.localeCompare(b.type)
      } else if (sortColumn === 'reviewerName') {
        compareValue = a.reviewerName.localeCompare(b.reviewerName)
      } else if (sortColumn === 'phase') {
        compareValue = a.phase.localeCompare(b.phase)
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue
    })

    return sorted
  }, [submissions, filters, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Calculate metrics from FILTERED submissions to match what user sees
  const pendingCount = filteredSubmissions.filter(s => s.status === 'pending').length
  const reviewingCount = filteredSubmissions.filter(s => s.status === 'under_review').length
  const highPriorityCount = filteredSubmissions.filter(s => s.priority === 'high' && s.status === 'pending').length
  const autoApprovalEligibleCount = filteredSubmissions.filter(s => s.autoApprovalEligible && s.status === 'pending').length
  
  // Check if filters are active (any filter is not at default)
  const hasActiveFilters = filters.search !== '' || filters.status !== 'all' || 
    filters.assetType !== 'all' || filters.subType !== 'all' || 
    filters.reviewer !== 'all' || filters.phase !== 'all' || 
    filters.action !== 'all' || filters.classification !== 'all'

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

      {/* Filters, Metrics, and Settings - All Consolidated */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <ApprovalFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  resultCount={filteredSubmissions.length}
                />
              </div>
            </div>

            {/* Metrics Grid - Reflects filtered results */}
            <div>
              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground mb-3">
                  Showing metrics for filtered results ({filteredSubmissions.length} of {submissions.length} total)
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <Card 
                  className="border-warning/20 bg-warning/5 cursor-pointer hover:bg-warning/10 transition-colors"
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <div>
                        <p className="text-xl font-bold">{pendingCount}</p>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-xl font-bold">{highPriorityCount}</p>
                        <p className="text-xs text-muted-foreground">High Priority</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setFilters({ ...filters, status: 'under_review' })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xl font-bold">{reviewingCount}</p>
                        <p className="text-xs text-muted-foreground">Under Review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="border-success/20 bg-success/5 cursor-pointer hover:bg-success/10 transition-colors"
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-xl font-bold">{autoApprovalEligibleCount}</p>
                        <p className="text-xs text-muted-foreground">Auto-Eligible</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-muted/20">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xl font-bold">87%</p>
                        <p className="text-xs text-muted-foreground">Approval Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Settings */}
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

      {/* Team Workload Summary - Collapsible */}
      <Collapsible
        open={isTeamSummaryOpen}
        onOpenChange={(open) => {
          setIsTeamSummaryOpen(open)
          localStorage.setItem('teamSummaryOpen', JSON.stringify(open))
        }}
        className="space-y-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between p-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Team Workload Summary</h3>
                  <Badge variant="secondary" className="text-xs">
                    {pendingApprovalsSummary.length} reviewers
                  </Badge>
                </div>
                {isTeamSummaryOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <PendingApprovalsSummary items={pendingApprovalsSummary} className="shadow-none border-0" />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prioritized Review Queue - SLA Tracked</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort by:</span>
                <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="gap-1">
                  Name {sortColumn === 'name' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSort('type')} className="gap-1">
                  Type {sortColumn === 'type' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSort('reviewerName')} className="gap-1">
                  Reviewer {sortColumn === 'reviewerName' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSort('phase')} className="gap-1">
                  Phase {sortColumn === 'phase' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSort('lastUpdated')} className="gap-1">
                  Last Updated {sortColumn === 'lastUpdated' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSort('priority')} className="gap-1">
                  Priority {sortColumn === 'priority' && <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </div>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approvals match your filters</p>
              </div>
            ) : (
              paginatedSubmissions.map((submission) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <ApprovalReviewModal
        asset={selectedSubmission}
        open={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestRevision={handleRequestRevision}
        onAddComment={addComment}
      />
    </div>
  )
}