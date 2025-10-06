import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface ApproverFavorite {
  id: string
  approver_id: string
  approver_name: string
  approver_email: string
  approver_role: string | null
  times_used: number
  last_used_at: string
}

interface ApproverFavoritesProps {
  onSelectApprover: (approver: { id: string; name: string; email: string; role?: string }) => void
}

export function ApproverFavorites({ onSelectApprover }: ApproverFavoritesProps) {
  const [favorites, setFavorites] = useState<ApproverFavorite[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadFavorites()
    }
  }, [isOpen])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('approver_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('times_used', { ascending: false })

      if (error) throw error
      setFavorites(data || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast({
        title: "Error",
        description: "Failed to load favorite approvers",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectFavorite = async (favorite: ApproverFavorite) => {
    // Update usage count
    try {
      await supabase
        .from('approver_favorites')
        .update({
          times_used: favorite.times_used + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', favorite.id)
    } catch (error) {
      console.error('Error updating favorite usage:', error)
    }

    onSelectApprover({
      id: favorite.approver_id,
      name: favorite.approver_name,
      email: favorite.approver_email,
      role: favorite.approver_role || undefined
    })

    setIsOpen(false)
    toast({
      title: "Approver Added",
      description: `${favorite.approver_name} added to approvers`
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Favorite Approvers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Favorite Approvers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No favorite approvers yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add approvers to submissions to build your favorites list
              </p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{favorite.approver_name}</p>
                        {favorite.approver_role && (
                          <Badge variant="outline" className="text-xs">
                            {favorite.approver_role}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Used {favorite.times_used}x
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{favorite.approver_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last used {new Date(favorite.last_used_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectFavorite(favorite)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
