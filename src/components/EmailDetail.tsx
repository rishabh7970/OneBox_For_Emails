import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CategoryBadge } from "./CategoryBadge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, RefreshCw, Copy, Check, Mail, MailOpen, Star, Trash2, Archive } from "lucide-react";
import { suggestReply, categorizeEmail, updateEmail, deleteEmail } from "../utils/api";
import { toast } from "sonner@2.0.3";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  category?: string;
  folder: string;
  accountId: string;
}

interface EmailDetailProps {
  email: Email;
  onEmailUpdate: () => void;
}

export function EmailDetail({ email, onEmailUpdate }: EmailDetailProps) {
  const [suggestedReply, setSuggestedReply] = useState<string>("");
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleSuggestReply = async () => {
    setIsLoadingReply(true);
    try {
      const result = await suggestReply(email.id);
      setSuggestedReply(result.suggestedReply);
      toast.success("Reply suggestion generated!");
    } catch (error) {
      console.error("Failed to generate reply:", error);
      toast.error("Failed to generate reply. Please check your OpenAI API key.");
    } finally {
      setIsLoadingReply(false);
    }
  };

  const handleRecategorize = async () => {
    setIsCategorizing(true);
    try {
      await categorizeEmail(email.id);
      toast.success("Email recategorized successfully!");
      onEmailUpdate();
    } catch (error) {
      console.error("Failed to categorize email:", error);
      toast.error("Failed to categorize email. Please check your OpenAI API key.");
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(suggestedReply);
    setCopied(true);
    toast.success("Reply copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleRead = async () => {
    try {
      await updateEmail(email.id, { isRead: !email.isRead });
      toast.success(email.isRead ? "Marked as unread" : "Marked as read");
      onEmailUpdate();
    } catch (error) {
      console.error("Failed to toggle read status:", error);
      toast.error("Failed to update email");
    }
  };

  const handleToggleStar = async () => {
    try {
      await updateEmail(email.id, { isStarred: !email.isStarred });
      toast.success(email.isStarred ? "Removed star" : "Starred");
      onEmailUpdate();
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast.error("Failed to update email");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this email?")) return;
    
    try {
      await deleteEmail(email.id);
      toast.success("Email deleted");
      onEmailUpdate();
    } catch (error) {
      console.error("Failed to delete email:", error);
      toast.error("Failed to delete email");
    }
  };

  const handleUseReply = () => {
    setReplyText(suggestedReply);
    setShowReplyBox(true);
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Email Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl">{email.subject}</h2>
              <div className="flex gap-2">
                <CategoryBadge category={email.category} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleRead}
              >
                {email.isRead ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <MailOpen className="w-4 h-4 mr-2" />
                    Mark Read
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStar}
              >
                <Star className={`w-4 h-4 mr-2 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {email.isStarred ? 'Starred' : 'Star'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecategorize}
                disabled={isCategorizing}
              >
                {isCategorizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Categorizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recategorize
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">From:</span>
                <span>{email.from}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">To:</span>
                <span>{email.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">Date:</span>
                <span>{formatDate(email.date)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">Folder:</span>
                <span>{email.folder}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Email Body */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{email.body}</div>
          </div>

          <Separator />

          {/* AI Suggested Reply Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Suggested Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!suggestedReply && !isLoadingReply && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 opacity-20" />
                  <p className="text-gray-500 mb-4">
                    Get an AI-powered reply suggestion based on your training data
                  </p>
                  <Button onClick={handleSuggestReply}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Reply Suggestion
                  </Button>
                </div>
              )}

              {isLoadingReply && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              )}

              {suggestedReply && !isLoadingReply && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="whitespace-pre-wrap">{suggestedReply}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUseReply}>
                      Use This Reply
                    </Button>
                    <Button onClick={handleCopyReply} variant="outline">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Reply
                        </>
                      )}
                    </Button>
                    <Button onClick={handleSuggestReply} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Box */}
          {showReplyBox && (
            <Card>
              <CardHeader>
                <CardTitle>Compose Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    <strong>To:</strong> {email.from}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Subject:</strong> Re: {email.subject}
                  </div>
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={10}
                  placeholder="Write your reply..."
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => {
                    toast.success("Reply sent! (Demo mode - no actual email sent)");
                    setShowReplyBox(false);
                    setReplyText("");
                  }}>
                    Send Reply
                  </Button>
                  <Button variant="outline" onClick={() => setShowReplyBox(false)}>
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  Note: This is a demo. In production, this would send an actual email via SMTP.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
