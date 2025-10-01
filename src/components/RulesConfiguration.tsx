import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Rule {
  id: string
  name: string
  description: string
  type: 'auto_approval' | 'policy' | 'quality' | 'security'
  status: 'active' | 'inactive'
  appliesTo: string[]
  criteria: string
}

const mockRules: Rule[] = [
  {
    id: '1',
    name: 'Standard Dataset Auto-Approval',
    description: 'Auto-approve datasets with quality score > 90% and no PII',
    type: 'auto_approval',
    status: 'active',
    appliesTo: ['Dataset'],
    criteria: 'Quality Score > 90% AND No PII Detected AND Standard Format'
  },
  {
    id: '2',
    name: 'API Authentication Policy',
    description: 'All APIs must use OAuth 2.0 authentication',
    type: 'policy',
    status: 'active',
    appliesTo: ['API'],
    criteria: 'Authentication Method = OAuth 2.0'
  },
  {
    id: '3',
    name: 'PII Masking Required',
    description: 'Datasets with PII must have masking applied',
    type: 'security',
    status: 'active',
    appliesTo: ['Dataset', 'Data Share'],
    criteria: 'PII Detected = True REQUIRES Masking = Applied'
  },
  {
    id: '4',
    name: 'Bulk Approval - Marketing Data',
    description: 'Marketing data shares with standard governance terms',
    type: 'policy',
    status: 'active',
    appliesTo: ['Data Share'],
    criteria: 'Category = Marketing AND Sensitivity = Internal'
  }
]

export function RulesConfiguration() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredRules = selectedType === 'all' 
    ? mockRules 
    : mockRules.filter(rule => rule.type === selectedType)

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'auto_approval': return 'bg-success/10 text-success border-success/20'
      case 'policy': return 'bg-primary/10 text-primary border-primary/20'
      case 'quality': return 'bg-warning/10 text-warning border-warning/20'
      case 'security': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Rules Configuration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approval Rules Configuration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" onValueChange={setSelectedType}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="auto_approval">Auto-Approval</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="space-y-4 mt-4">
            {filteredRules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No rules found for this category
              </p>
            ) : (
              filteredRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{rule.name}</h3>
                            <Badge className={getRuleTypeColor(rule.type)}>
                              {rule.type.replace('_', ' ')}
                            </Badge>
                            {rule.status === 'active' ? (
                              <Badge variant="outline" className="text-success border-success/20 bg-success/5">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Applies to:</span>
                          {rule.appliesTo.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-mono">{rule.criteria}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Exchange Configuration UI to Edit Rules
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}