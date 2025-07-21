import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Plus, Trash2, Edit, Zap, Database, BarChart3, Clock, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AutoApprovalRule {
  id: string
  name: string
  enabled: boolean
  assetType: 'dataset' | 'api' | 'stream' | 'model' | 'all'
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdBy: string
  createdAt: string
}

interface RuleCondition {
  field: string
  operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than'
  value: string
}

interface RuleAction {
  type: 'auto_approve' | 'assign_reviewer' | 'add_tag' | 'set_priority'
  value: string
}

const assetTypeIcons = {
  all: Settings,
  dataset: Database,
  api: BarChart3,
  stream: Clock,
  model: FileText
}

const mockRules: AutoApprovalRule[] = [
  {
    id: '1',
    name: 'Public Dataset Auto-Approval',
    enabled: true,
    assetType: 'dataset',
    conditions: [
      { field: 'dataClassification', operator: 'equals', value: 'public' },
      { field: 'size', operator: 'less_than', value: '1GB' }
    ],
    actions: [
      { type: 'auto_approve', value: 'true' }
    ],
    createdBy: 'Sarah Mitchell',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Trusted Producer Fast Track',
    enabled: true,
    assetType: 'all',
    conditions: [
      { field: 'producer', operator: 'equals', value: 'DataCorp Analytics' }
    ],
    actions: [
      { type: 'assign_reviewer', value: 'senior-steward' },
      { type: 'set_priority', value: 'high' }
    ],
    createdBy: 'Data Admin',
    createdAt: '2024-01-10T14:20:00Z'
  }
]

const conditionFields = [
  { value: 'producer', label: 'Producer/Organization' },
  { value: 'category', label: 'Category' },
  { value: 'dataClassification', label: 'Data Classification' },
  { value: 'size', label: 'Size' },
  { value: 'format', label: 'Format' },
  { value: 'hasPersonalData', label: 'Has Personal Data' }
]

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' }
]

const actionTypes = [
  { value: 'auto_approve', label: 'Auto Approve' },
  { value: 'assign_reviewer', label: 'Assign Reviewer' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'set_priority', label: 'Set Priority' }
]

export function AutoApprovalRules() {
  const [rules, setRules] = useState<AutoApprovalRule[]>(mockRules)
  const [selectedRule, setSelectedRule] = useState<AutoApprovalRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
    toast({
      title: "Rule Updated",
      description: "Auto-approval rule status has been changed.",
    })
  }

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
    toast({
      title: "Rule Deleted",
      description: "Auto-approval rule has been removed.",
    })
  }

  const createNewRule = () => {
    const newRule: AutoApprovalRule = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Rule',
      enabled: true,
      assetType: 'all',
      conditions: [],
      actions: [],
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    }
    setRules(prev => [...prev, newRule])
    setSelectedRule(newRule)
    setIsCreating(true)
  }

  const enabledRules = rules.filter(r => r.enabled).length
  const totalAutoApprovals = 47 // Mock data

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{enabledRules}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{totalAutoApprovals}</p>
                <p className="text-sm text-muted-foreground">Auto-Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">73%</p>
                <p className="text-sm text-muted-foreground">Automation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Auto-Approval Rules</CardTitle>
            <Button onClick={createNewRule}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => {
              const IconComponent = assetTypeIcons[rule.assetType]
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <IconComponent className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        {!rule.enabled && <Badge variant="secondary">Disabled</Badge>}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Asset Type: {rule.assetType}</span>
                        <span>•</span>
                        <span>{rule.conditions.length} conditions</span>
                        <span>•</span>
                        <span>{rule.actions.length} actions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRule(rule)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {isCreating ? 'Create New Rule' : 'Edit Auto-Approval Rule'}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedRule && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="ruleName">Rule Name</Label>
                              <Input
                                id="ruleName"
                                value={selectedRule.name}
                                onChange={(e) => setSelectedRule({
                                  ...selectedRule,
                                  name: e.target.value
                                })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="assetType">Asset Type</Label>
                              <Select 
                                value={selectedRule.assetType} 
                                onValueChange={(value) => setSelectedRule({
                                  ...selectedRule,
                                  assetType: value as any
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Asset Types</SelectItem>
                                  <SelectItem value="dataset">Dataset</SelectItem>
                                  <SelectItem value="api">API</SelectItem>
                                  <SelectItem value="stream">Data Stream</SelectItem>
                                  <SelectItem value="model">ML Model</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium mb-2">Conditions</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                All conditions must be met for the rule to trigger
                              </p>
                              
                              {selectedRule.conditions.map((condition, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                                  <Select value={condition.field}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {conditionFields.map(field => (
                                        <SelectItem key={field.value} value={field.value}>
                                          {field.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <Select value={condition.operator}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {operators.map(op => (
                                        <SelectItem key={op.value} value={op.value}>
                                          {op.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input value={condition.value} placeholder="Value" />
                                </div>
                              ))}
                              
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Condition
                              </Button>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium mb-2">Actions</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Actions to perform when conditions are met
                              </p>
                              
                              {selectedRule.actions.map((action, index) => (
                                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                                  <Select value={action.type}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {actionTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input value={action.value} placeholder="Value" />
                                </div>
                              ))}
                              
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Action
                              </Button>
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                              <Button
                                variant="destructive"
                                onClick={() => deleteRule(selectedRule.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Rule
                              </Button>
                              
                              <div className="space-x-2">
                                <Button variant="outline" onClick={() => setIsCreating(false)}>
                                  Cancel
                                </Button>
                                <Button>
                                  Save Rule
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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