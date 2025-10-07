import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  checked: boolean
}

interface ApprovalChecklistProps {
  assetId: string
  onProgressChange: (progress: number) => void
}

export function ApprovalChecklist({ assetId, onProgressChange }: ApprovalChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Schema changes reviewed', required: true, checked: false },
    { id: '2', label: 'Data classification verified', required: true, checked: false },
    { id: '3', label: 'PII fields identified', required: true, checked: false },
    { id: '4', label: 'Security compliance checked', required: true, checked: false },
    { id: '5', label: 'Technical documentation reviewed', required: false, checked: false },
    { id: '6', label: 'YAML configuration validated', required: false, checked: false }
  ])

  useEffect(() => {
    const total = items.length
    const checked = items.filter(item => item.checked).length
    const progress = Math.round((checked / total) * 100)
    onProgressChange(progress)
  }, [items, onProgressChange])

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const requiredItems = items.filter(item => item.required)
  const optionalItems = items.filter(item => !item.required)
  const requiredComplete = requiredItems.every(item => item.checked)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Approval Checklist
          {requiredComplete && (
            <CheckCircle2 className="h-4 w-4 text-success" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Required Items */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Required</p>
          {requiredItems.map(item => (
            <div key={item.id} className="flex items-start gap-2">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <label
                htmlFor={item.id}
                className="text-xs leading-tight cursor-pointer flex-1"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>

        {/* Optional Items */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground">Optional</p>
          {optionalItems.map(item => (
            <div key={item.id} className="flex items-start gap-2">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <label
                htmlFor={item.id}
                className="text-xs leading-tight cursor-pointer flex-1 text-muted-foreground"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
