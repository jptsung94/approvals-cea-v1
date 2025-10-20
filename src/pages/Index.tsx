import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ApprovalDashboard } from "@/components/ApprovalDashboard"
import { AssetSubmissionForm } from "@/components/AssetSubmissionForm"
import { AutoApprovalRules } from "@/components/AutoApprovalRules"
import { ProducerDashboard } from "@/components/ProducerDashboard"
import { NotificationCenter } from "@/components/NotificationCenter"
import { Shield, Database, Zap, Users, BarChart3, CheckCircle, Clock, Settings, HelpCircle, LayoutDashboard, User } from "lucide-react"
import logo from "@/assets/logo-greyscale.png"

const Index = () => {
  const [userRole, setUserRole] = useState<'steward' | 'producer'>('steward')

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
              <Button variant="ghost" size="sm">
                Help
              </Button>
              <NotificationCenter />
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm">
                Profile
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
              {userRole === 'steward' ? 'Approver Dashboard' : 'Producer Dashboard'}
            </h1>
            <div className="flex items-center space-x-2">
              <Badge variant={userRole === 'steward' ? 'default' : 'secondary'}>
                <Shield className="h-3 w-3 mr-1" />
                {userRole === 'steward' ? 'Asset Approver' : 'Data Producer'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserRole(userRole === 'steward' ? 'producer' : 'steward')}
              >
                Switch Role
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {userRole === 'steward' ? (
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
                  <Users className="h-4 w-4" />
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
