import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ApprovalDashboard } from "@/components/ApprovalDashboard"
import { AssetSubmissionForm } from "@/components/AssetSubmissionForm"
import { AutoApprovalRules } from "@/components/AutoApprovalRules"
import { ProducerDashboard } from "@/components/ProducerDashboard"
import { Shield, Database, Zap, Users, BarChart3, CheckCircle, Clock, Settings } from "lucide-react"
import heroImage from "@/assets/data-marketplace-hero.jpg"

const Index = () => {
  const [userRole, setUserRole] = useState<'steward' | 'producer'>('steward')

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DataMarket Pro</h1>
                <p className="text-sm text-muted-foreground">Data Asset Approval System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant={userRole === 'steward' ? 'default' : 'secondary'}>
                  <Shield className="h-3 w-3 mr-1" />
                  Data Steward
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Data Marketplace Platform" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-6 py-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Unified Data Asset Approval Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Streamline your data marketplace with intelligent approval workflows, automated governance, 
            and seamless collaboration between producers and stewards.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {userRole === 'steward' ? (
          <div className="space-y-8">
            {/* Steward Welcome */}
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">Data Steward Dashboard</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Manage data asset approvals, configure automation rules, and ensure quality standards 
                across your organization's data marketplace.
              </p>
            </div>

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
            {/* Producer Welcome */}
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">Data Producer Portal</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Submit your data assets for approval, track submission status, and collaborate 
                with data stewards to bring your data to the marketplace.
              </p>
            </div>

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

      {/* Features Section */}
      <section className="bg-card border-t">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold mb-2">Platform Features</h4>
            <p className="text-muted-foreground">Comprehensive approval workflow for all data asset types</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Smart Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure intelligent auto-approval rules based on asset type, producer trust level, 
                  and data classification to streamline your workflow.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Collaborative Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in commenting system enables seamless communication between data stewards 
                  and producers throughout the approval process.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Governance Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive data governance framework with classification levels, 
                  retention policies, and compliance tracking built-in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
};

export default Index;
