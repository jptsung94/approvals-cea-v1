import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Minus, Edit, Info } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface SchemaChange {
  field: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  oldValue?: string
  newValue?: string
  dataType?: string
  description?: string
}

interface SchemaDiffViewerProps {
  assetId: string
}

// Mock schema changes - in production, fetch from backend
const mockSchemaChanges: SchemaChange[] = [
  {
    field: 'customer_id',
    type: 'unchanged',
    dataType: 'UUID',
    description: 'Unique customer identifier'
  },
  {
    field: 'email_address',
    type: 'modified',
    oldValue: 'VARCHAR(100)',
    newValue: 'VARCHAR(255)',
    dataType: 'VARCHAR(255)',
    description: 'Customer email - length increased for longer domains'
  },
  {
    field: 'phone_number',
    type: 'added',
    newValue: 'VARCHAR(20)',
    dataType: 'VARCHAR(20)',
    description: 'Customer contact number with country code'
  },
  {
    field: 'legacy_ref_id',
    type: 'removed',
    oldValue: 'VARCHAR(50)',
    description: 'Deprecated reference ID from old system'
  },
  {
    field: 'created_at',
    type: 'unchanged',
    dataType: 'TIMESTAMP',
    description: 'Record creation timestamp'
  },
  {
    field: 'transaction_amount',
    type: 'modified',
    oldValue: 'DECIMAL(10,2)',
    newValue: 'DECIMAL(15,4)',
    dataType: 'DECIMAL(15,4)',
    description: 'Transaction amount - increased precision for fractional currency'
  },
  {
    field: 'encrypted_ssn',
    type: 'added',
    newValue: 'BYTEA',
    dataType: 'BYTEA',
    description: 'Encrypted social security number (PII)'
  }
]

export function SchemaDiffViewer({ assetId }: SchemaDiffViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())

  const filteredChanges = mockSchemaChanges.filter(change =>
    change.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    change.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleField = (field: string) => {
    const newExpanded = new Set(expandedFields)
    if (newExpanded.has(field)) {
      newExpanded.delete(field)
    } else {
      newExpanded.add(field)
    }
    setExpandedFields(newExpanded)
  }

  const getChangeIcon = (type: SchemaChange['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-success" />
      case 'removed':
        return <Minus className="h-4 w-4 text-destructive" />
      case 'modified':
        return <Edit className="h-4 w-4 text-warning" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getChangeBadge = (type: SchemaChange['type']) => {
    switch (type) {
      case 'added':
        return <Badge className="bg-success/10 text-success border-success">Added</Badge>
      case 'removed':
        return <Badge className="bg-destructive/10 text-destructive border-destructive">Removed</Badge>
      case 'modified':
        return <Badge className="bg-warning/10 text-warning border-warning">Modified</Badge>
      default:
        return <Badge variant="outline">Unchanged</Badge>
    }
  }

  const stats = {
    added: mockSchemaChanges.filter(c => c.type === 'added').length,
    removed: mockSchemaChanges.filter(c => c.type === 'removed').length,
    modified: mockSchemaChanges.filter(c => c.type === 'modified').length
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">{stats.added} Added</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">{stats.removed} Removed</span>
        </div>
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">{stats.modified} Modified</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields or attributes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Schema Changes Table */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Field Name</TableHead>
              <TableHead>Change Type</TableHead>
              <TableHead>Data Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChanges.map((change) => (
              <Collapsible
                key={change.field}
                open={expandedFields.has(change.field)}
                onOpenChange={() => toggleField(change.field)}
                asChild
              >
                <>
                  <TableRow className={
                    change.type === 'added' ? 'bg-success/5' :
                    change.type === 'removed' ? 'bg-destructive/5' :
                    change.type === 'modified' ? 'bg-warning/5' : ''
                  }>
                    <TableCell>
                      {getChangeIcon(change.type)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{change.field}</TableCell>
                    <TableCell>{getChangeBadge(change.type)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {change.dataType}
                      </code>
                    </TableCell>
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                          Details
                          <ChevronDown className={`h-3 w-3 transition-transform ${
                            expandedFields.has(change.field) ? 'rotate-180' : ''
                          }`} />
                        </button>
                      </CollapsibleTrigger>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-3 space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {change.description}
                          </p>
                          {change.type === 'modified' && (
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Previous</p>
                                <code className="text-xs bg-destructive/10 px-2 py-1 rounded block">
                                  {change.oldValue}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">New</p>
                                <code className="text-xs bg-success/10 px-2 py-1 rounded block">
                                  {change.newValue}
                                </code>
                              </div>
                            </div>
                          )}
                          {change.type === 'added' && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Added Value</p>
                              <code className="text-xs bg-success/10 px-2 py-1 rounded block">
                                {change.newValue}
                              </code>
                            </div>
                          )}
                          {change.type === 'removed' && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Removed Value</p>
                              <code className="text-xs bg-destructive/10 px-2 py-1 rounded block">
                                {change.oldValue}
                              </code>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
