import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, MessageSquare, Clock, Database, Zap, Link2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AccessRequestReviewModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  isConsumerView?: boolean;
}

interface Comment {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
  comment_type: string;
}

export function AccessRequestReviewModal({ request, isOpen, onClose, isConsumerView = false }: AccessRequestReviewModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      loadComments();
    }
  }, [isOpen, request]);

  const loadComments = async () => {
    try {
      const { data, error } = (await supabase
        .from("access_request_comments" as any)
        .select("*")
        .eq("access_request_id", request.id)
        .order("created_at", { ascending: true })) as any;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const { error } = await (supabase.from("access_request_comments" as any).insert({
        access_request_id: request.id,
        author_id: user.id,
        author_name: profile?.full_name || user.email || "Unknown",
        message: newComment,
        comment_type: "feedback",
      }) as any);

      if (error) throw error;

      setNewComment("");
      loadComments();
      toast.success("Comment added");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { error } = await (supabase
        .from("access_requests" as any)
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", request.id) as any);

      if (error) throw error;

      toast.success("Access request approved");
      onClose();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsApproving(true);
    try {
      const { error } = await (supabase
        .from("access_requests" as any)
        .update({ 
          status: "rejected",
          rejected_at: new Date().toISOString(),
        })
        .eq("id", request.id) as any);

      if (error) throw error;

      toast.success("Access request rejected");
      onClose();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg md:text-xl truncate">
                Access Request: {request.assets?.name || "Dataset"}
              </DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Submitted {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
              </p>
            </div>
            {getStatusBadge(request.status)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="space-y-4 md:space-y-6">
            {/* Key Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dataset</p>
                      <p className="font-medium">{request.assets?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Access Level</p>
                      <Badge variant="outline">{request.requested_access_level}</Badge>
                    </div>
                  </div>
                  {request.expected_tps && (
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Expected TPS</p>
                        <p className="font-medium">{request.expected_tps}</p>
                      </div>
                    </div>
                  )}
                  {request.connected_app && (
                    <div className="flex items-start gap-2">
                      <Link2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Connected App</p>
                        <p className="font-medium">{request.connected_app}</p>
                      </div>
                    </div>
                  )}
                  {request.data_retention_period && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Retention Period</p>
                        <p className="font-medium">{request.data_retention_period}</p>
                      </div>
                    </div>
                  )}
                  {request.api_endpoint && (
                    <div className="flex items-start gap-2">
                      <Link2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">API Endpoint</p>
                        <p className="font-medium">{request.api_endpoint}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Justification */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Business Justification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{request.business_justification}</p>
              </CardContent>
            </Card>

            {/* Use Case */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Use Case</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{request.use_case}</p>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussion ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-muted pl-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    size="sm"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!isConsumerView && request.status === "pending" && (
          <div className="border-t px-4 md:px-6 py-3 md:py-4 shrink-0 bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Request
              </Button>
              <Button
                onClick={handleReject}
                disabled={isApproving}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Request
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
