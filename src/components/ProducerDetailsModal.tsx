import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Database,
  FileText,
  MessageSquare,
  Save,
  X,
  Edit2,
  Clock,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DiscussionPanel } from "./DiscussionPanel"

interface ProducerAsset {
  id: string
  name: string
  type: string
  submittedAt: string
  status: string
  lastUpdated: string
  description?: string
  category?: string
  metadata: Record<string, any>
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'feedback' | 'question' | 'approval' | 'revision_request'
  phase?: string
}

interface ProducerDetailsModalProps {
  asset: ProducerAsset | null
  open: boolean
  onClose: () => void
  onUpdate: (assetId: string, updates: Partial<ProducerAsset>) => void
  onAddComment: (assetId: string, message: string, phase?: string) => void
}

export function ProducerDetailsModal({
  asset,
  open,
  onClose,
  onUpdate,
  onAddComment
}: ProducerDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<ProducerAsset>>({})
  const { toast } = useToast()

  if (!asset) return null

  const handleStartEdit = () => {
    setEditedData({
      name: asset.name,
      description: asset.description,
      category: asset.category,
      metadata: { ...asset.metadata }
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedData({})
  }

  const handleSaveChanges = () => {
    onUpdate(asset.id, editedData)
    setIsEditing(false)
    setEditedData({})
    toast({
      title: "Changes Saved",
      description: "Your asset details have been updated successfully."
    })
  }

  const updateField = (field: keyof ProducerAsset, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const updateMetadata = (key: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || asset.metadata), [key]: value }
    }))
  }

  const currentData = isEditing ? { ...asset, ...editedData } : asset

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-3">
                {asset.type === 'dataset' ? <Database className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                {currentData.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted {new Date(asset.submittedAt).toLocaleDateString()} • Last updated {new Date(asset.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={handleStartEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              ) : (
                <>
                  <Button onClick={handleSaveChanges} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="details" className="h-[calc(95vh-150px)] flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" />
                Details & Metadata
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion ({asset.comments.length})
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 py-4 pointer-events-auto">
              <TabsContent value="details" className="mt-0 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Asset Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={currentData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{currentData.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={currentData.description || ''}
                          onChange={(e) => updateField('description', e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{currentData.description || 'No description provided'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        {isEditing ? (
                          <Input
                            id="category"
                            value={currentData.category || ''}
                            onChange={(e) => updateField('category', e.target.value)}
                          />
                        ) : (
                          <p className="text-sm p-2 bg-muted rounded">{currentData.category || 'N/A'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Type</Label>
                        <p className="text-sm p-2 bg-muted rounded capitalize">{currentData.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata & Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(currentData.metadata || {}).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/_/g, ' ')}
                        </Label>
                        {isEditing ? (
                          typeof value === 'object' ? (
                            <Textarea
                              id={key}
                              value={JSON.stringify(value, null, 2)}
                              onChange={(e) => {
                                try {
                                  updateMetadata(key, JSON.parse(e.target.value))
                                } catch {
                                  // Invalid JSON, keep as string
                                }
                              }}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={key}
                              value={value?.toString() || ''}
                              onChange={(e) => updateMetadata(key, e.target.value)}
                            />
                          )
                        ) : (
                          <p className="text-sm p-2 bg-muted rounded break-all">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString() || 'N/A'}
                          </p>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const key = prompt('Enter metadata key:')
                          if (key) updateMetadata(key, '')
                        }}
                      >
                        Add Metadata Field
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Approval Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge className="mt-2" variant={
                          asset.status === 'approved' ? 'default' :
                          asset.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {asset.status}
                        </Badge>
                      </div>
                      {asset.metadata.currentStep && (
                        <div>
                          <Label className="text-muted-foreground">Current Step</Label>
                          <p className="text-sm mt-2">{asset.metadata.currentStep}</p>
                        </div>
                      )}
                    </div>

                    {asset.metadata.approvers && (
                      <div>
                        <Label className="text-muted-foreground">Approvers</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {asset.metadata.approvers.map((approver: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {approver}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="mt-0">
                <DiscussionPanel
                  assetId={asset.id}
                  comments={asset.comments}
                  currentPhase="general"
                  onAddComment={onAddComment}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3 border-l-2 border-primary pl-4 pb-4">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Asset Submitted</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(asset.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {asset.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 border-l-2 pl-4 pb-4">
                          <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{comment.author} added a comment</p>
                            <p className="text-sm mt-1">{comment.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(comment.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-3 pl-4">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(asset.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
