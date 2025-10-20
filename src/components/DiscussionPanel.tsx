import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Clock, User } from "lucide-react"
import { commentSchema } from "@/lib/validation"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'feedback' | 'question' | 'approval' | 'revision_request'
  phase?: string
}

interface DiscussionPanelProps {
  assetId: string
  comments: Comment[]
  currentPhase: string
  onAddComment: (assetId: string, message: string, phase?: string) => void
}

export function DiscussionPanel({ assetId, comments, currentPhase, onAddComment }: DiscussionPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [validationError, setValidationError] = useState<string>('')
  const { toast } = useToast()

  const handleAddComment = () => {
    try {
      commentSchema.parse({ message: newComment })
      setValidationError('')
      onAddComment(assetId, newComment, currentPhase)
      setNewComment('')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message
        setValidationError(errorMessage)
        toast({
          variant: "destructive",
          title: "Invalid comment",
          description: errorMessage,
        })
      }
    }
  }

  const filteredComments = filterPhase === 'all' 
    ? comments 
    : comments.filter(c => c.phase === filterPhase)

  const commentsByPhase = {
    schema: comments.filter(c => c.phase === 'schema').length,
    compliance: comments.filter(c => c.phase === 'compliance').length,
    technical: comments.filter(c => c.phase === 'technical').length
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion
            </span>
            <Badge variant="secondary">{comments.length} comments</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phase Filter */}
          <Tabs value={filterPhase} onValueChange={setFilterPhase}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="schema">
                Schema ({commentsByPhase.schema})
              </TabsTrigger>
              <TabsTrigger value="compliance">
                Compliance ({commentsByPhase.compliance})
              </TabsTrigger>
              <TabsTrigger value="technical">
                Technical ({commentsByPhase.technical})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Comments List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <Card key={comment.id} className="bg-muted/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{comment.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.phase && (
                            <Badge variant="outline" className="text-xs">
                              {comment.phase}
                            </Badge>
                          )}
                          <Badge 
                            variant={
                              comment.type === 'approval' ? 'default' :
                              comment.type === 'revision_request' ? 'destructive' :
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {comment.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.message}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.timestamp).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Add Comment */}
          <div className="space-y-2 pt-4 border-t">
            <Textarea
              placeholder={`Add comment for ${currentPhase} phase...`}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                setValidationError('')
              }}
              className={`min-h-[80px] ${validationError ? 'border-destructive' : ''}`}
              maxLength={2000}
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full"
            >
              Add Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
