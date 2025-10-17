import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getAnalytics } from "../utils/api";
import { Mail, MailOpen, Sparkles, CheckCircle, XCircle, Ban, Clock } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await getAnalytics();
      setStats(result.stats);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const categoryCards = [
    {
      title: "Interested",
      count: stats?.byCategory?.interested || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Meeting Booked",
      count: stats?.byCategory?.meetingBooked || 0,
      icon: Sparkles,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Not Interested",
      count: stats?.byCategory?.notInterested || 0,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    },
    {
      title: "Spam",
      count: stats?.byCategory?.spam || 0,
      icon: Ban,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Out of Office",
      count: stats?.byCategory?.outOfOffice || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="text-gray-500">Overview of your email analytics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Unread Emails</CardTitle>
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.unread || 0}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Categorized</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.categorized || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Uncategorized</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.uncategorized || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending AI review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>AI Category Breakdown</CardTitle>
          <CardDescription>
            Email distribution by AI categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryCards.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className={`p-4 rounded-lg border ${category.bgColor} ${category.borderColor}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                    <span className="text-sm">{category.title}</span>
                  </div>
                  <div className={`text-2xl ${category.color}`}>
                    {category.count}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* By Account */}
      <Card>
        <CardHeader>
          <CardTitle>Emails by Account</CardTitle>
          <CardDescription>
            Distribution across connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.byAccount && Object.keys(stats.byAccount).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byAccount).map(([email, count]) => (
                <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{email}</span>
                  </div>
                  <span className="text-sm">{count as number} emails</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No accounts connected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
