import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EscalationButtonProps {
  submissionId: string
  submissionName: string
  currentApprover: string
  onEscalate: (reason: string, escalateTo: string) => void
  variant?: "default" | "outline" | "ghost"
}

export function EscalationButton({ 
  submissionId, 
  submissionName, 
  currentApprover,
  onEscalate,
  variant = "outline" 
}: EscalationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [escalateTo, setEscalateTo] = useState("")
  const { toast } = useToast()
  
  const escalationLevels = [
    { value: "senior-reviewer", label: "Senior Data Steward" },
    { value: "manager", label: "Approval Manager" },
    { value: "director", label: "Data Governance Director" },
    { value: "vp", label: "VP Data Governance" }
  ]
  
  const handleEscalate = () => {
    if (!reason.trim() || !escalateTo) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason and select who to escalate to.",
        variant: "destructive"
      })
      return
    }
    
    onEscalate(reason, escalateTo)
    toast({
      title: "Escalation Submitted",
      description: `Request escalated to ${escalationLevels.find(l => l.value === escalateTo)?.label}. They will be notified immediately.`,
    })
    
    setIsOpen(false)
    setReason("")
    setEscalateTo("")
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Escalate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Escalate Approval Request
          </DialogTitle>
          <DialogDescription>
            Escalate this approval to a higher authority. This will notify them immediately and add urgency tracking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Submission</Label>
            <p className="text-sm text-muted-foreground">{submissionName}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Approver</Label>
            <p className="text-sm text-muted-foreground">{currentApprover}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="escalate-to">Escalate To</Label>
            <Select value={escalateTo} onValueChange={setEscalateTo}>
              <SelectTrigger id="escalate-to">
                <SelectValue placeholder="Select escalation level" />
              </SelectTrigger>
              <SelectContent>
                {escalationLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Escalation Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this needs to be escalated (e.g., blocking critical project, unresponsive approver, urgent business need)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be visible to all approvers in the escalation chain.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEscalate}>
            Submit Escalation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
