import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export interface FilterState {
  search: string
  status: string
  requestType: string
  approvalMethod: string
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
      requestType: 'all',
      approvalMethod: 'all'
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.requestType} onValueChange={(v) => updateFilter('requestType', v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Request Types</SelectItem>
            <SelectItem value="registration">Registration</SelectItem>
            <SelectItem value="metadata_change">Metadata Change</SelectItem>
            <SelectItem value="schema_update">Schema Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.approvalMethod} onValueChange={(v) => updateFilter('approvalMethod', v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Approval Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="auto_eligible">Auto-Approval Eligible</SelectItem>
            <SelectItem value="policy_based">Policy-Based</SelectItem>
            <SelectItem value="manual">Manual Review</SelectItem>
            <SelectItem value="bulk_candidates">Bulk Candidates</SelectItem>
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