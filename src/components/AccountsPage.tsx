import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { createAccount, deleteAccount, syncAccount } from "../utils/api";
import { toast } from "sonner@2.0.3";

interface AccountsPageProps {
  accounts: any[];
  onAccountsChange: () => void;
}

export function AccountsPage({ accounts, onAccountsChange }: AccountsPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    host: "",
    port: "993",
    username: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createAccount(formData);
      toast.success("Account added successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        host: "",
        port: "993",
        username: "",
        password: ""
      });
      onAccountsChange();
    } catch (error) {
      console.error("Failed to add account:", error);
      toast.error("Failed to add account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      await deleteAccount(accountId);
      toast.success("Account deleted successfully!");
      onAccountsChange();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      await syncAccount(accountId);
      toast.success("Sync started! In production, this would establish IMAP IDLE connection.");
      onAccountsChange();
    } catch (error) {
      console.error("Failed to sync account:", error);
      toast.error("Failed to sync account");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Email Accounts</h1>
          <p className="text-gray-500">Manage your IMAP email accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add IMAP Account</DialogTitle>
              <DialogDescription>
                Connect a new email account using IMAP credentials
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="My Gmail Account"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">IMAP Host</Label>
                <Input
                  id="host"
                  placeholder="imap.gmail.com"
                  required
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">IMAP Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="993"
                  required
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="you@example.com"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No accounts connected yet</p>
              <p className="text-sm">Add an IMAP account to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {account.host}:{account.port}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {account.lastSync ? new Date(account.lastSync).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(account.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IMAP Configuration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="text-gray-600">
              <strong>Gmail:</strong> Use imap.gmail.com:993. You'll need to enable "Less secure app access" or use an App Password.
            </p>
            <p className="text-gray-600">
              <strong>Outlook/Office365:</strong> Use outlook.office365.com:993
            </p>
            <p className="text-gray-600">
              <strong>Yahoo:</strong> Use imap.mail.yahoo.com:993
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Production Note:</strong> In a production system, IMAP credentials should be encrypted and the IMAP IDLE connection should be maintained persistently for real-time email synchronization. This prototype simulates the functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
