import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, X, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Delegate {
  id: string
  name: string
  email: string
  assignedDate: string
  expiryDate?: string
}

export function DelegateManagement() {
  const [delegates, setDelegates] = useState<Delegate[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      assignedDate: '2024-01-15',
      expiryDate: '2024-02-15'
    }
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [newDelegate, setNewDelegate] = useState({ name: '', email: '', expiryDate: '' })
  const { toast } = useToast()

  const addDelegate = () => {
    if (!newDelegate.name || !newDelegate.email) {
      toast({
        title: "Incomplete Information",
        description: "Please provide delegate name and email",
        variant: "destructive"
      })
      return
    }

    const delegate: Delegate = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDelegate.name,
      email: newDelegate.email,
      assignedDate: new Date().toISOString().split('T')[0],
      expiryDate: newDelegate.expiryDate || undefined
    }

    setDelegates([...delegates, delegate])
    setNewDelegate({ name: '', email: '', expiryDate: '' })
    setIsOpen(false)
    toast({
      title: "Delegate Added",
      description: `${delegate.name} can now approve on your behalf`
    })
  }

  const removeDelegate = (id: string) => {
    setDelegates(delegates.filter(d => d.id !== id))
    toast({
      title: "Delegate Removed",
      description: "Delegate access has been revoked"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Manage Delegates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delegate Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add New Delegate */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delegate-name">Delegate Name</Label>
                    <Input
                      id="delegate-name"
                      placeholder="Enter name"
                      value={newDelegate.name}
                      onChange={(e) => setNewDelegate({ ...newDelegate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delegate-email">Email</Label>
                    <Input
                      id="delegate-email"
                      type="email"
                      placeholder="email@company.com"
                      value={newDelegate.email}
                      onChange={(e) => setNewDelegate({ ...newDelegate, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={newDelegate.expiryDate}
                    onChange={(e) => setNewDelegate({ ...newDelegate, expiryDate: e.target.value })}
                  />
                </div>
                <Button onClick={addDelegate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Delegate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Delegates */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Current Delegates</h3>
            {delegates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No delegates assigned. Add a delegate to enable approval on your behalf.
              </p>
            ) : (
              delegates.map((delegate) => (
                <Card key={delegate.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{delegate.name}</p>
                          {delegate.expiryDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expires {new Date(delegate.expiryDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{delegate.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned since {new Date(delegate.assignedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDelegate(delegate.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}