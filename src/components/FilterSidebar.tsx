import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface FilterSidebarProps {
  accounts: any[];
  selectedAccountId?: string;
  selectedFolder?: string;
  selectedCategory?: string;
  onAccountChange: (accountId: string | undefined) => void;
  onFolderChange: (folder: string | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onClearFilters: () => void;
}

const FOLDERS = ["INBOX", "Sent", "Drafts", "Spam", "Trash"];
const CATEGORIES = ["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"];

export function FilterSidebar({
  accounts,
  selectedAccountId,
  selectedFolder,
  selectedCategory,
  onAccountChange,
  onFolderChange,
  onCategoryChange,
  onClearFilters
}: FilterSidebarProps) {
  const hasActiveFilters = selectedAccountId || selectedFolder || selectedCategory;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Filter */}
        <div className="space-y-2">
          <Label>Account</Label>
          <Select
            value={selectedAccountId || "all"}
            onValueChange={(value) => onAccountChange(value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Folder Filter */}
        <div className="space-y-2">
          <Label>Folder</Label>
          <Select
            value={selectedFolder || "all"}
            onValueChange={(value) => onFolderChange(value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              {FOLDERS.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) => onCategoryChange(value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account Summary */}
        {accounts.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <Label className="text-xs text-gray-500">Connected Accounts</Label>
            <div className="space-y-1">
              {accounts.map((account) => (
                <div key={account.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="truncate">{account.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
