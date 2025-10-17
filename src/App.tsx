import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { EmailList } from "./components/EmailList";
import { EmailDetail } from "./components/EmailDetail";
import { FilterSidebar } from "./components/FilterSidebar";
import { AccountsPage } from "./components/AccountsPage";
import { SettingsPage } from "./components/SettingsPage";
import { DashboardPage } from "./components/DashboardPage";
import { FeaturesPage } from "./components/FeaturesPage";
import { Toaster } from "./components/ui/sonner";
import { Search, Sparkles, RefreshCw, Database } from "lucide-react";
import { getAccounts, getEmails, categorizeAllEmails, populateDemoData, clearAllData } from "./utils/api";
import { toast } from "sonner@2.0.3";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "inbox") {
      loadEmails();
    }
  }, [activeTab, selectedAccountId, selectedFolder, selectedCategory, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await loadAccounts();
      await loadEmails();
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const result = await getAccounts();
      setAccounts(result.accounts || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const loadEmails = async () => {
    try {
      const result = await getEmails({
        accountId: selectedAccountId,
        folder: selectedFolder,
        category: selectedCategory,
        search: searchQuery || undefined
      });
      setEmails(result.emails || []);
    } catch (error) {
      console.error("Failed to load emails:", error);
    }
  };

  const handleEmailSelect = (email: any) => {
    setSelectedEmail(email);
  };

  const handleEmailUpdate = () => {
    loadEmails();
    if (selectedEmail) {
      // Reload the selected email to get updated data
      const updated = emails.find(e => e.id === selectedEmail.id);
      if (updated) {
        setSelectedEmail(updated);
      }
    }
  };

  const handleCategorizeAll = async () => {
    setIsCategorizing(true);
    try {
      const result = await categorizeAllEmails();
      toast.success(`Categorized ${result.categorized} emails!`);
      loadEmails();
    } catch (error) {
      console.error("Failed to categorize emails:", error);
      toast.error("Failed to categorize emails. Please check your OpenAI API key.");
    } finally {
      setIsCategorizing(false);
    }
  };

  const handlePopulateDemo = async () => {
    try {
      const result = await populateDemoData();
      toast.success(`Demo data loaded: ${result.accounts} accounts, ${result.emails} emails`);
      loadData();
    } catch (error) {
      console.error("Failed to populate demo data:", error);
      toast.error("Failed to populate demo data");
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all data?")) return;
    
    try {
      await clearAllData();
      toast.success("All data cleared");
      setEmails([]);
      setAccounts([]);
      setSelectedEmail(null);
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast.error("Failed to clear data");
    }
  };

  const handleClearFilters = () => {
    setSelectedAccountId(undefined);
    setSelectedFolder(undefined);
    setSelectedCategory(undefined);
    setSearchQuery("");
  };

  const filteredEmails = emails;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">OneBox Email Aggregator</h1>
              <p className="text-sm text-blue-100">
                Real-time IMAP sync • AI categorization • Smart replies • Searchable inbox
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handlePopulateDemo}>
              <Database className="w-4 h-4 mr-2" />
              Load Demo Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData} className="border-white/30 text-white hover:bg-white/20">
              Clear All Data
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="flex-1 m-0 overflow-y-auto">
          <DashboardPage />
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="flex-1 m-0 overflow-hidden">
          <div className="h-full flex">
            {/* Sidebar - Filters */}
            <div className="w-64 border-r bg-white p-4 overflow-y-auto">
              <FilterSidebar
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                selectedFolder={selectedFolder}
                selectedCategory={selectedCategory}
                onAccountChange={setSelectedAccountId}
                onFolderChange={setSelectedFolder}
                onCategoryChange={setSelectedCategory}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Email List */}
            <div className="w-96 border-r bg-white flex flex-col">
              <div className="p-4 border-b space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadEmails()}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCategorizeAll}
                    disabled={isCategorizing}
                    className="flex-1"
                  >
                    {isCategorizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Categorizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Categorize All
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <EmailList
                    emails={filteredEmails}
                    selectedEmailId={selectedEmail?.id}
                    onEmailSelect={handleEmailSelect}
                  />
                )}
              </div>
            </div>

            {/* Email Detail */}
            <div className="flex-1 bg-white">
              {selectedEmail ? (
                <EmailDetail email={selectedEmail} onEmailUpdate={handleEmailUpdate} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Select an email to view details</p>
                    <p className="text-sm">and get AI-powered reply suggestions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="flex-1 m-0 overflow-y-auto">
          <AccountsPage accounts={accounts} onAccountsChange={loadAccounts} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 m-0 overflow-y-auto">
          <SettingsPage />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="flex-1 m-0 overflow-y-auto">
          <FeaturesPage />
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      {accounts.length === 0 && emails.length === 0 && activeTab === "inbox" && !isLoading && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg text-blue-900">
                  <strong>Welcome to OneBox Email Aggregator!</strong>
                </p>
                <p className="text-sm text-blue-800 mt-2 mb-4">
                  A professional email management system with real-time IMAP sync, AI-powered categorization, 
                  intelligent reply suggestions, and seamless integrations.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePopulateDemo}>
                    <Database className="w-4 h-4 mr-2" />
                    Load Demo Data
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("accounts")}>
                    Add IMAP Accounts
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("features")}>
                    View Features
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
