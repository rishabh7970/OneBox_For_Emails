import { ScrollArea } from "./ui/scroll-area";
import { CategoryBadge } from "./CategoryBadge";
import { Mail, MailOpen, Paperclip, Star } from "lucide-react";
import { cn } from "./ui/utils";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  category?: string;
  isRead: boolean;
  hasAttachments: boolean;
  accountId: string;
  folder: string;
  isStarred?: boolean;
}

interface EmailListProps {
  emails: Email[];
  selectedEmailId?: string;
  onEmailSelect: (email: Email) => void;
}

export function EmailList({ emails, selectedEmailId, onEmailSelect }: EmailListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No emails found</p>
          <p className="text-sm">Try adjusting your filters or add an account</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => onEmailSelect(email)}
            className={cn(
              "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
              selectedEmailId === email.id && "bg-blue-50 hover:bg-blue-50",
              !email.isRead && "bg-blue-50/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {email.isRead ? (
                  <MailOpen className="w-5 h-5 text-gray-400" />
                ) : (
                  <Mail className="w-5 h-5 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={cn(
                    "truncate",
                    !email.isRead && "font-semibold"
                  )}>
                    {email.from}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(email.date)}
                  </span>
                </div>
                
                <div className={cn(
                  "text-sm mb-1",
                  !email.isRead && "font-semibold"
                )}>
                  {truncateText(email.subject, 60)}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {truncateText(email.body.replace(/\n/g, ' '), 80)}
                </div>
                
                <div className="flex items-center gap-2">
                  <CategoryBadge category={email.category} />
                  {email.hasAttachments && (
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  )}
                  {email.isStarred && (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
