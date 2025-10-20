import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import type { User, Session } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ApprovalDashboard } from "@/components/ApprovalDashboard"
import { AssetSubmissionForm } from "@/components/AssetSubmissionForm"
import { AutoApprovalRules } from "@/components/AutoApprovalRules"
import { ProducerDashboard } from "@/components/ProducerDashboard"
import { NotificationCenter } from "@/components/NotificationCenter"
import { Shield, Database, Zap, BarChart3, CheckCircle, Clock, Settings, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import logo from "@/assets/logo-greyscale.png"

type UserRole = 'admin' | 'steward' | 'producer'

const Index = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (!session) {
          navigate("/auth")
        } else {
          // Fetch user roles after authentication
          setTimeout(() => {
            fetchUserRoles(session.user.id)
          }, 0)
        }
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (!session) {
        navigate("/auth")
      } else {
        fetchUserRoles(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user roles:', error)
      toast({
        variant: "destructive",
        title: "Error loading roles",
        description: "Could not load user roles. Please contact support.",
      })
      return
    }

    if (data && data.length > 0) {
      setUserRoles(data.map(r => r.role as UserRole))
    } else {
      // No roles assigned - default to producer
      setUserRoles(['producer'])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user || !session) {
    return null
  }

  // Determine primary role for display
  const primaryRole: 'steward' | 'producer' = userRoles.includes('admin') || userRoles.includes('steward') 
    ? 'steward' 
    : 'producer'

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Exchange Logo" className="h-10 w-10 object-contain opacity-70" />
              <h1 className="text-xl font-bold">MyApprovals Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {primaryRole === 'steward' ? 'Approver Dashboard' : 'Producer Dashboard'}
            </h1>
            <div className="flex items-center space-x-2">
              <Badge variant={primaryRole === 'steward' ? 'default' : 'secondary'}>
                <Shield className="h-3 w-3 mr-1" />
                {userRoles.join(', ')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {primaryRole === 'steward' ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">7</p>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold">47</p>
                      <p className="text-sm text-muted-foreground">Auto-Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Active Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-accent-foreground" />
                    <div>
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Efficiency Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Steward Tabs */}
            <Tabs defaultValue="approvals" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-fit">
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pending Approvals
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Automation Rules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="approvals">
                <ApprovalDashboard />
              </TabsContent>

              <TabsContent value="automation">
                <AutoApprovalRules />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Producer Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-fit">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  My Submissions
                </TabsTrigger>
                <TabsTrigger value="submit" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Submit New Asset
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <ProducerDashboard />
              </TabsContent>

              <TabsContent value="submit">
                <AssetSubmissionForm />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
};

export default Index;