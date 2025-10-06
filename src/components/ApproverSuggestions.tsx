import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, CheckCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApproverSuggestion {
  name: string
  role: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
  required: boolean
}

interface ApproverSuggestionsProps {
  assetType: string
  category: string
  classification: string
  onSelectApprover: (approver: ApproverSuggestion) => void
  selectedApprovers?: string[]
  className?: string
}

export function ApproverSuggestions({ 
  assetType, 
  category, 
  classification,
  onSelectApprover,
  selectedApprovers = [],
  className 
}: ApproverSuggestionsProps) {
  
  // Smart approver suggestions based on context
  const getSuggestions = (): ApproverSuggestion[] => {
    const suggestions: ApproverSuggestion[] = []
    
    // COE is always required for APIs
    if (assetType === 'api') {
      suggestions.push({
        name: 'Kelly Schwartz (COE)',
        role: 'Chief of Excellence',
        reason: 'Required for all API approvals - handles standardization and documentation checks',
        confidence: 'high',
        required: true
      })
      
      suggestions.push({
        name: 'Engineering Lead',
        role: 'Technical Lead',
        reason: 'Engineering Lead has technical context and can approve faster than VPs',
        confidence: 'high',
        required: false
      })
    }
    
    // High sensitivity data requires multiple approvals
    if (classification === 'confidential') {
      suggestions.push({
        name: 'DDRO',
        role: 'Data & Digital Risk Office',
        reason: 'Required for confidential data - handles compliance and risk assessment',
        confidence: 'high',
        required: true
      })
      
      suggestions.push({
        name: 'Security PDS',
        role: 'Product Data Steward',
        reason: 'Required for security review of highly sensitive data',
        confidence: 'high',
        required: true
      })
    }
    
    // Category-specific approvers
    if (category === 'Financial Data' || category === 'Financial') {
      suggestions.push({
        name: 'Finance Data Guardian',
        role: 'Domain Data Steward',
        reason: 'Domain expert for financial data governance',
        confidence: 'high',
        required: false
      })
    }
    
    if (category === 'Marketing Data' || category === 'Marketing') {
      suggestions.push({
        name: 'Marketing Data Guardian',
        role: 'Domain Data Steward',
        reason: 'Domain expert for marketing data',
        confidence: 'medium',
        required: false
      })
    }
    
    // Default PDS for most assets
    if (suggestions.length < 2) {
      suggestions.push({
        name: 'Rakesh Sharma (PDS)',
        role: 'Product Data Steward',
        reason: 'Standard data governance approval',
        confidence: 'medium',
        required: false
      })
    }
    
    // AE-C delegates can approve in many cases
    suggestions.push({
      name: 'AE-C Delegate',
      role: 'Associate Executive Delegate',
      reason: 'Can approve routine requests, faster than VP-level approval',
      confidence: 'medium',
      required: false
    })
    
    return suggestions
  }
  
  const suggestions = getSuggestions()
  
  const confidenceColors = {
    high: 'bg-success-light text-success border-success/20',
    medium: 'bg-warning-light text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border'
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Smart Approver Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your asset type, category, and data classification
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const isSelected = selectedApprovers.includes(suggestion.name)
          
          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 border rounded-lg transition-colors",
                isSelected ? "bg-accent border-primary" : "bg-background hover:bg-accent/50"
              )}
            >
              <div className="flex-shrink-0 mt-1">
                {isSelected ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{suggestion.name}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {suggestion.required && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Required
                      </Badge>
                    )}
                    <Badge className={confidenceColors[suggestion.confidence]}>
                      {suggestion.confidence} match
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {suggestion.reason}
                </p>
                
                {!isSelected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectApprover(suggestion)}
                    className="text-xs"
                  >
                    Add to Approvers
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        
        <div className="mt-4 p-3 bg-accent/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Using recommended approvers can speed up approval by 60%. 
            Required approvers must review before approval can be granted.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
