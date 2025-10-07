import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export interface FilterState {
  search: string
  status: string
  assetType: string
  subType: string
  reviewer: string
  phase: string
  action: string
  classification: string
}

interface ApprovalFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  resultCount: number
}

export function ApprovalFilters({ filters, onFilterChange, resultCount }: ApprovalFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      assetType: 'all',
      subType: 'all',
      reviewer: 'all',
      phase: 'all',
      action: 'all',
      classification: 'all'
    })
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all'
  ).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID, name, producer, or asset type..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Needs Review</SelectItem>
            <SelectItem value="under_review">In Progress</SelectItem>
            <SelectItem value="approved">Completed</SelectItem>
            <SelectItem value="rejected">Needs Escalation</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.assetType} onValueChange={(v) => updateFilter('assetType', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Asset Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Dataset">Dataset</SelectItem>
            <SelectItem value="API">API</SelectItem>
            <SelectItem value="Data Share">Data Share</SelectItem>
            <SelectItem value="Report">Report</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.subType} onValueChange={(v) => updateFilter('subType', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sub-Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sub-Types</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="new_minor_version">New Minor Version</SelectItem>
            <SelectItem value="new_major_version">New Major Version</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.reviewer} onValueChange={(v) => updateFilter('reviewer', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Reviewer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviewers</SelectItem>
            <SelectItem value="Kelly Schwartz">Kelly Schwartz</SelectItem>
            <SelectItem value="API Coach">API Coach</SelectItem>
            <SelectItem value="Alex Thompson">Alex Thompson</SelectItem>
            <SelectItem value="David Rodriguez">David Rodriguez</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.phase} onValueChange={(v) => updateFilter('phase', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="peer_review">Peer Review</SelectItem>
            <SelectItem value="governance_committee">Governance Committee</SelectItem>
            <SelectItem value="security_review">Security Review</SelectItem>
            <SelectItem value="compliance_review">Compliance Review</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.action} onValueChange={(v) => updateFilter('action', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="view">View</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.classification} onValueChange={(v) => updateFilter('classification', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            <SelectItem value="protected">Protected</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}

        <div className="ml-auto">
          <Badge variant="outline" className="text-sm">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </Badge>
        </div>
      </div>
    </div>
  )
}