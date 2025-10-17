import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Save, TestTube } from "lucide-react";
import { getSettings, updateSlackWebhook, updateWebhook, updateTrainingData, getTrainingData } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function SettingsPage() {
  const [slackWebhook, setSlackWebhook] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [outreachAgenda, setOutreachAgenda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      setSlackWebhook(settings.slackWebhook || "");
      setWebhookUrl(settings.webhook || "");

      const trainingDataResult = await getTrainingData();
      
      // Set default example data if nothing is saved
      const defaultProductInfo = "I am a Full Stack Developer with 5 years of experience in React, Node.js, TypeScript, and cloud platforms (AWS, Azure). I specialize in building scalable web applications, microservices architecture, and have strong experience with AI/ML integration.";
      const defaultOutreachAgenda = "I am actively seeking software engineering opportunities. If a recruiter or hiring manager is interested, I should share my calendar booking link: https://cal.com/johndoe and mention my immediate availability for technical interviews. I'm particularly interested in senior engineering roles at innovative tech companies.";
      
      setProductInfo(trainingDataResult.data?.productInfo || defaultProductInfo);
      setOutreachAgenda(trainingDataResult.data?.outreachAgenda || defaultOutreachAgenda);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhooks = async () => {
    setIsSaving(true);
    try {
      await updateSlackWebhook(slackWebhook);
      await updateWebhook(webhookUrl);
      toast.success("Webhook settings saved!");
    } catch (error) {
      console.error("Failed to save webhooks:", error);
      toast.error("Failed to save webhook settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrainingData = async () => {
    setIsSaving(true);
    try {
      await updateTrainingData(productInfo, outreachAgenda);
      toast.success("Training data saved!");
    } catch (error) {
      console.error("Failed to save training data:", error);
      toast.error("Failed to save training data");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Settings</h1>
        <p className="text-gray-500">Configure integrations and AI training data</p>
      </div>

      {/* Webhook Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Webhooks</CardTitle>
          <CardDescription>
            Configure Slack and external webhook URLs for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
            <Input
              id="slack-webhook"
              type="url"
              placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Notifications will be sent to Slack when emails are categorized as "Interested"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">External Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://webhook.site/YOUR-UNIQUE-URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Use <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">webhook.site</a> to test external automation triggers
            </p>
          </div>

          <Button onClick={handleSaveWebhooks} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Webhook Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Training Data */}
      <Card>
        <CardHeader>
          <CardTitle>AI Training Data (RAG)</CardTitle>
          <CardDescription>
            Provide context for AI-powered reply suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-info">Product/Service Information</Label>
            <Textarea
              id="product-info"
              placeholder="Describe your product, service, or what you're offering..."
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-gray-500">
              This information will be used to generate contextual email replies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outreach-agenda">Outreach Agenda & Goals</Label>
            <Textarea
              id="outreach-agenda"
              placeholder="Example: I am applying for job positions. If the lead is interested, share the meeting booking link: https://cal.com/example"
              value={outreachAgenda}
              onChange={(e) => setOutreachAgenda(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-gray-500">
              Include specific actions, links, or next steps to include in replies
            </p>
          </div>

          <Button onClick={handleSaveTrainingData} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Training Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Example Training Data */}
      <Card>
        <CardHeader>
          <CardTitle>Example Training Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div>
              <p className="text-sm">
                <strong>Product Info:</strong>
              </p>
              <p className="text-sm text-gray-700">
                "I am a Full Stack Developer with 5 years of experience in React, Node.js, and cloud platforms. I specialize in building scalable web applications."
              </p>
            </div>
            <div>
              <p className="text-sm">
                <strong>Outreach Agenda:</strong>
              </p>
              <p className="text-sm text-gray-700">
                "I am applying for software engineering positions. If the recruiter is interested, I should share my calendar booking link: https://cal.com/johndoe and mention my availability for technical interviews."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI API Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This application uses OpenAI's GPT-4o-mini model for:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Email categorization (Interested, Meeting Booked, Not Interested, Spam, Out of Office)</li>
              <li>AI-powered reply suggestions using RAG (Retrieval-Augmented Generation)</li>
            </ul>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                ✓ OpenAI API key is configured and ready to use
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elasticsearch Info */}
      <Card>
        <CardHeader>
          <CardTitle>Elasticsearch Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Production Note:</strong> In a production environment, emails would be indexed in a locally hosted Elasticsearch instance (via Docker) for advanced search capabilities. This prototype uses in-memory search with the KV store.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
