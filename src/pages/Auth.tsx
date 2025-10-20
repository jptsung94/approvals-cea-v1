import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import logo from "@/assets/logo-greyscale.png"

const emailSchema = z.string().email("Invalid email address").max(255, "Email too long")
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long")
const nameSchema = z.string().trim().min(1, "Name required").max(100, "Name too long")

export default function Auth() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({})

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/")
      }
    })
  }, [navigate])

  const validateSignIn = () => {
    const newErrors: typeof errors = {}
    
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message
    }
    
    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSignUp = () => {
    const newErrors: typeof errors = {}
    
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message
    }
    
    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message
    }
    
    const nameResult = nameSchema.safeParse(fullName)
    if (!nameResult.success) {
      newErrors.fullName = nameResult.error.errors[0].message
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignIn()) return
    
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password" 
          : error.message,
      })
    } else {
      navigate("/")
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignUp()) return
    
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message === "User already registered" 
          ? "An account with this email already exists" 
          : error.message,
      })
    } else {
      toast({
        title: "Account created successfully",
        description: "You can now sign in with your credentials",
      })
      // Switch to sign in tab
      const signInTab = document.querySelector('[value="signin"]') as HTMLElement
      signInTab?.click()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain opacity-70" />
          </div>
          <CardTitle className="text-2xl text-center">MyApprovals Dashboard</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your data asset approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({ ...errors, email: undefined })
                    }}
                    disabled={loading}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: undefined })
                    }}
                    disabled={loading}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setErrors({ ...errors, fullName: undefined })
                    }}
                    disabled={loading}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({ ...errors, email: undefined })
                    }}
                    disabled={loading}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: undefined })
                    }}
                    disabled={loading}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}