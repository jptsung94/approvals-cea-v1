import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Database, BarChart3, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApproverSuggestions } from "./ApproverSuggestions"
import { ApproverFavorites } from "./ApproverFavorites"
import { assetSubmissionSchema } from "@/lib/validation"
import { z } from "zod"

type AssetType = 'dataset' | 'api' | 'stream' | 'model'

interface SubmissionData {
  name: string
  type: AssetType
  description: string
  category: string
  producer: string
  email: string
  format?: string
  size?: string
  endpoint?: string
  documentation?: string
  dataGovernance: {
    hasPersonalData: boolean
    dataClassification: 'public' | 'internal' | 'confidential'
    retentionPeriod: string
  }
  technicalSpecs: {
    updateFrequency?: string
    availability?: string
    authentication?: string
  }
}

const assetTypeConfig = {
  dataset: {
    label: 'Dataset',
    icon: Database,
    description: 'Static or batch data files',
    fields: ['format', 'size']
  },
  api: {
    label: 'API',
    icon: BarChart3,
    description: 'RESTful or GraphQL APIs',
    fields: ['endpoint', 'authentication']
  },
  stream: {
    label: 'Data Stream',
    icon: Clock,
    description: 'Real-time streaming data',
    fields: ['updateFrequency', 'availability']
  },
  model: {
    label: 'ML Model',
    icon: FileText,
    description: 'Machine learning models',
    fields: ['format', 'endpoint']
  }
}

const categories = [
  'Analytics', 'Environmental', 'Financial', 'Healthcare', 
  'Marketing', 'Operations', 'Sales', 'Supply Chain', 'Other'
]

export function AssetSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    type: 'dataset',
    description: '',
    category: '',
    producer: '',
    email: '',
    dataGovernance: {
      hasPersonalData: false,
      dataClassification: 'public',
      retentionPeriod: ''
    },
    technicalSpecs: {}
  })
  const { toast } = useToast()

  const updateFormData = (updates: Partial<SubmissionData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateDataGovernance = (updates: Partial<SubmissionData['dataGovernance']>) => {
    setFormData(prev => ({
      ...prev,
      dataGovernance: { ...prev.dataGovernance, ...updates }
    }))
  }

  const updateTechnicalSpecs = (updates: Partial<SubmissionData['technicalSpecs']>) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecs: { ...prev.technicalSpecs, ...updates }
    }))
  }

  const handleSubmit = () => {
    // Validate form data
    try {
      assetSubmissionSchema.parse(formData)
      setValidationErrors({})
      
      toast({
        title: "Submission Successful",
        description: "Your data asset has been submitted for review. You'll receive updates via email.",
        duration: 5000,
      })
      
      // Reset form
      setCurrentStep(1)
      setFormData({
        name: '',
        type: 'dataset',
        description: '',
        category: '',
        producer: '',
        email: '',
        dataGovernance: {
          hasPersonalData: false,
          dataClassification: 'public',
          retentionPeriod: ''
        },
        technicalSpecs: {}
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        setValidationErrors(errors)
        
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix the errors in the form before submitting.",
        })
      }
    }
  }

  const steps = [
    { title: 'Basic Info', icon: FileText },
    { title: 'Technical Details', icon: Database },
    { title: 'Data Governance', icon: CheckCircle },
    { title: 'Review & Submit', icon: Upload }
  ]

  const currentStepConfig = assetTypeConfig[formData.type]
  const IconComponent = currentStepConfig.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const stepNumber = index + 1
              const isActive = currentStep === stepNumber
              const isCompleted = currentStep > stepNumber
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isCompleted ? 'bg-success border-success text-success-foreground' : 
                      isActive ? 'bg-primary border-primary text-primary-foreground' : 
                      'border-border bg-background text-muted-foreground'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <Separator className="w-20 mx-6" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Submit Data Asset for Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="asset-type">Asset Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => updateFormData({ type: value as AssetType })}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {Object.entries(assetTypeConfig).map(([key, config]) => {
                    const ConfigIcon = config.icon
                    return (
                      <div key={key}>
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent peer-checked:bg-accent peer-checked:border-primary"
                        >
                          <ConfigIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      updateFormData({ name: e.target.value })
                      setValidationErrors({ ...validationErrors, name: '' })
                    }}
                    placeholder="e.g., Customer Analytics Dataset"
                    maxLength={100}
                    className={validationErrors.name ? "border-destructive" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    updateFormData({ description: e.target.value })
                    setValidationErrors({ ...validationErrors, description: '' })
                  }}
                  placeholder="Provide a detailed description of your data asset..."
                  rows={4}
                  maxLength={1000}
                  className={validationErrors.description ? "border-destructive" : ""}
                />
                {validationErrors.description && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="producer">Producer/Organization</Label>
                  <Input
                    id="producer"
                    value={formData.producer}
                    onChange={(e) => {
                      updateFormData({ producer: e.target.value })
                      setValidationErrors({ ...validationErrors, producer: '' })
                    }}
                    placeholder="Your organization name"
                    maxLength={100}
                    className={validationErrors.producer ? "border-destructive" : ""}
                  />
                  {validationErrors.producer && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.producer}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      updateFormData({ email: e.target.value })
                      setValidationErrors({ ...validationErrors, email: '' })
                    }}
                    placeholder="contact@yourorganization.com"
                    maxLength={255}
                    className={validationErrors.email ? "border-destructive" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="h-5 w-5" />
                <h3 className="text-lg font-medium">Technical Specifications</h3>
                <Badge variant="outline">{currentStepConfig.label}</Badge>
              </div>

              {currentStepConfig.fields.includes('format') && (
                <div>
                  <Label htmlFor="format">Data Format</Label>
                  <Select value={formData.format} onValueChange={(value) => updateFormData({ format: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="parquet">Parquet</SelectItem>
                      <SelectItem value="avro">Avro</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStepConfig.fields.includes('size') && (
                <div>
                  <Label htmlFor="size">Estimated Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => updateFormData({ size: e.target.value })}
                    placeholder="e.g., 2.4 GB, 500 MB"
                  />
                </div>
              )}

              {currentStepConfig.fields.includes('endpoint') && (
                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => updateFormData({ endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1/"
                  />
                </div>
              )}

              {currentStepConfig.fields.includes('updateFrequency') && (
                <div>
                  <Label htmlFor="updateFrequency">Update Frequency</Label>
                  <Select value={formData.technicalSpecs.updateFrequency} onValueChange={(value) => updateTechnicalSpecs({ updateFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="documentation">Documentation URL (Optional)</Label>
                <Input
                  id="documentation"
                  value={formData.documentation}
                  onChange={(e) => updateFormData({ documentation: e.target.value })}
                  placeholder="Link to technical documentation"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5" />
                <h3 className="text-lg font-medium">Data Governance</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personalData"
                    checked={formData.dataGovernance.hasPersonalData}
                    onCheckedChange={(checked) => updateDataGovernance({ hasPersonalData: !!checked })}
                  />
                  <Label htmlFor="personalData">This asset contains personal or sensitive data</Label>
                </div>

                <div>
                  <Label>Data Classification</Label>
                  <RadioGroup
                    value={formData.dataGovernance.dataClassification}
                    onValueChange={(value) => updateDataGovernance({ dataClassification: value as any })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public - Can be freely shared</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="internal" />
                      <Label htmlFor="internal">Internal - Restricted to organization</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="confidential" id="confidential" />
                      <Label htmlFor="confidential">Confidential - Highly restricted</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="retention">Data Retention Period</Label>
                  <Select 
                    value={formData.dataGovernance.retentionPeriod} 
                    onValueChange={(value) => updateDataGovernance({ retentionPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="3-years">3 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="7-years">7 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5" />
                <h3 className="text-lg font-medium">Review & Submit</h3>
              </div>

              {/* Smart Approver Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Select Approvers</h4>
                  <ApproverFavorites
                    onSelectApprover={(approver) => {
                      if (!selectedApprovers.includes(approver.name)) {
                        setSelectedApprovers([...selectedApprovers, approver.name])
                      }
                    }}
                  />
                </div>
                <ApproverSuggestions
                  assetType={formData.type}
                  category={formData.category}
                  classification={formData.dataGovernance.dataClassification}
                  onSelectApprover={(approver) => {
                    if (!selectedApprovers.includes(approver.name)) {
                      setSelectedApprovers([...selectedApprovers, approver.name])
                    }
                  }}
                  selectedApprovers={selectedApprovers}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Asset Name:</span>
                    <p>{formData.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p>{currentStepConfig.label}</p>
                  </div>
                  <div>
                    <span className="font-medium">Producer:</span>
                    <p>{formData.producer}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p>{formData.category}</p>
                  </div>
                  {selectedApprovers.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium">Selected Approvers:</span>
                      <p className="text-muted-foreground">{selectedApprovers.join(', ')}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-sm mt-1">{formData.description}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-4 bg-accent rounded-lg">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">What happens next?</p>
                  <p className="text-muted-foreground mt-1">
                    Your submission will be reviewed by the selected approvers. You'll receive email updates with a direct link to the approval page about the status and any feedback from reviewers. Average approval time is 60% faster when using recommended approvers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={currentStep === 1 && (!formData.name || !formData.type || !formData.description)}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit for Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}