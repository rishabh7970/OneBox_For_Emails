import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client with service role key
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Health check endpoint
app.get("/make-server-14c7be83/health", (c) => {
  return c.json({ status: "ok" });
});

// ============== IMAP Account Management ==============

// Add IMAP account
app.post("/make-server-14c7be83/accounts", async (c) => {
  try {
    const body = await c.req.json();
    const { email, host, port, username, password, name } = body;

    if (!email || !host || !username || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const accountId = crypto.randomUUID();
    const account = {
      id: accountId,
      email,
      host,
      port: port || 993,
      username,
      password, // In production, encrypt this!
      name: name || email,
      status: 'active',
      lastSync: null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`account:${accountId}`, account);
    
    // Store account ID in list
    const accounts = await kv.get('account_ids') || [];
    accounts.push(accountId);
    await kv.set('account_ids', accounts);

    console.log(`Account created: ${accountId} for ${email}`);
    return c.json({ success: true, account: { ...account, password: undefined } });
  } catch (error) {
    console.error(`Error creating account: ${error}`);
    return c.json({ error: `Failed to create account: ${error.message}` }, 500);
  }
});

// Get all accounts
app.get("/make-server-14c7be83/accounts", async (c) => {
  try {
    const accountIds = await kv.get('account_ids') || [];
    const accounts = [];
    
    for (const id of accountIds) {
      const account = await kv.get(`account:${id}`);
      if (account) {
        accounts.push({ ...account, password: undefined });
      }
    }

    return c.json({ accounts });
  } catch (error) {
    console.error(`Error fetching accounts: ${error}`);
    return c.json({ error: `Failed to fetch accounts: ${error.message}` }, 500);
  }
});

// Delete account
app.delete("/make-server-14c7be83/accounts/:id", async (c) => {
  try {
    const accountId = c.req.param('id');
    
    await kv.del(`account:${accountId}`);
    
    const accountIds = await kv.get('account_ids') || [];
    const updatedIds = accountIds.filter(id => id !== accountId);
    await kv.set('account_ids', updatedIds);

    console.log(`Account deleted: ${accountId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting account: ${error}`);
    return c.json({ error: `Failed to delete account: ${error.message}` }, 500);
  }
});

// ============== Email Fetching & Sync ==============

// Trigger email sync for account (simulated IMAP fetch)
app.post("/make-server-14c7be83/sync/:accountId", async (c) => {
  try {
    const accountId = c.req.param('accountId');
    const account = await kv.get(`account:${accountId}`);
    
    if (!account) {
      return c.json({ error: "Account not found" }, 404);
    }

    // In a real implementation, this would:
    // 1. Connect to IMAP server using account credentials
    // 2. Use IMAP IDLE for real-time updates
    // 3. Fetch last 30 days of emails
    // 4. Index emails in Elasticsearch
    // 5. Run AI categorization
    
    console.log(`Sync triggered for account: ${accountId}`);
    
    // Update last sync time
    account.lastSync = new Date().toISOString();
    await kv.set(`account:${accountId}`, account);

    return c.json({ 
      success: true, 
      message: "Sync started. In production, this would establish IMAP IDLE connection.",
      accountId 
    });
  } catch (error) {
    console.error(`Error syncing account: ${error}`);
    return c.json({ error: `Failed to sync account: ${error.message}` }, 500);
  }
});

// Get emails (with filters)
app.get("/make-server-14c7be83/emails", async (c) => {
  try {
    const accountId = c.req.query('accountId');
    const folder = c.req.query('folder');
    const category = c.req.query('category');
    const search = c.req.query('search');

    let emailKeys = await kv.getByPrefix('email:');
    let emails = emailKeys.map(item => item.value);

    // Apply filters
    if (accountId) {
      emails = emails.filter(e => e.accountId === accountId);
    }
    if (folder) {
      emails = emails.filter(e => e.folder === folder);
    }
    if (category) {
      emails = emails.filter(e => e.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      emails = emails.filter(e => 
        e.subject?.toLowerCase().includes(searchLower) ||
        e.from?.toLowerCase().includes(searchLower) ||
        e.body?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ emails, count: emails.length });
  } catch (error) {
    console.error(`Error fetching emails: ${error}`);
    return c.json({ error: `Failed to fetch emails: ${error.message}` }, 500);
  }
});

// Get single email
app.get("/make-server-14c7be83/emails/:id", async (c) => {
  try {
    const emailId = c.req.param('id');
    const email = await kv.get(`email:${emailId}`);
    
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    return c.json({ email });
  } catch (error) {
    console.error(`Error fetching email: ${error}`);
    return c.json({ error: `Failed to fetch email: ${error.message}` }, 500);
  }
});

// Update email (mark as read, starred, etc.)
app.patch("/make-server-14c7be83/emails/:id", async (c) => {
  try {
    const emailId = c.req.param('id');
    const email = await kv.get(`email:${emailId}`);
    
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    const updates = await c.req.json();
    const updatedEmail = { ...email, ...updates };
    await kv.set(`email:${emailId}`, updatedEmail);

    return c.json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error(`Error updating email: ${error}`);
    return c.json({ error: `Failed to update email: ${error.message}` }, 500);
  }
});

// Delete email
app.delete("/make-server-14c7be83/emails/:id", async (c) => {
  try {
    const emailId = c.req.param('id');
    await kv.del(`email:${emailId}`);
    
    console.log(`Email deleted: ${emailId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting email: ${error}`);
    return c.json({ error: `Failed to delete email: ${error.message}` }, 500);
  }
});

// Get analytics/stats
app.get("/make-server-14c7be83/analytics", async (c) => {
  try {
    const emailKeys = await kv.getByPrefix('email:');
    const emails = emailKeys.map(item => item.value);

    const stats = {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      categorized: emails.filter(e => e.category).length,
      uncategorized: emails.filter(e => !e.category).length,
      byCategory: {
        interested: emails.filter(e => e.category === 'Interested').length,
        meetingBooked: emails.filter(e => e.category === 'Meeting Booked').length,
        notInterested: emails.filter(e => e.category === 'Not Interested').length,
        spam: emails.filter(e => e.category === 'Spam').length,
        outOfOffice: emails.filter(e => e.category === 'Out of Office').length,
      },
      byAccount: {}
    };

    // Count by account
    const accountIds = await kv.get('account_ids') || [];
    for (const accountId of accountIds) {
      const account = await kv.get(`account:${accountId}`);
      if (account) {
        stats.byAccount[account.email] = emails.filter(e => e.accountId === accountId).length;
      }
    }

    return c.json({ stats });
  } catch (error) {
    console.error(`Error fetching analytics: ${error}`);
    return c.json({ error: `Failed to fetch analytics: ${error.message}` }, 500);
  }
});

// ============== AI Categorization ==============

// Categorize email using AI
app.post("/make-server-14c7be83/categorize/:emailId", async (c) => {
  try {
    const emailId = c.req.param('emailId');
    const email = await kv.get(`email:${emailId}`);
    
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    // Call OpenAI API for categorization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an email categorization assistant. Categorize emails into exactly one of these categories: "Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office". Respond with only the category name.`
          },
          {
            role: 'user',
            content: `Subject: ${email.subject}\n\nFrom: ${email.from}\n\nBody: ${email.body?.substring(0, 1000)}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${errorText}`);
      return c.json({ error: `AI categorization failed: ${errorText}` }, 500);
    }

    const data = await response.json();
    const category = data.choices[0].message.content.trim();

    // Update email with category
    email.category = category;
    email.categorizedAt = new Date().toISOString();
    await kv.set(`email:${emailId}`, email);

    // If categorized as "Interested", trigger notifications
    if (category === "Interested") {
      // Trigger Slack notification
      const slackWebhook = await kv.get('slack_webhook_url');
      if (slackWebhook) {
        try {
          await fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🎯 New Interested Email`,
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: "🎯 New Interested Email"
                  }
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*From:*\n${email.from}`
                    },
                    {
                      type: "mrkdwn",
                      text: `*Subject:*\n${email.subject}`
                    }
                  ]
                },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `*Preview:*\n${email.body?.substring(0, 200)}...`
                  }
                }
              ]
            })
          });
          console.log(`Slack notification sent for email: ${emailId}`);
        } catch (slackError) {
          console.error(`Slack notification failed: ${slackError}`);
        }
      }

      // Trigger webhook
      const webhookUrl = await kv.get('webhook_url');
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'email_interested',
              emailId: email.id,
              from: email.from,
              subject: email.subject,
              date: email.date,
              category: category
            })
          });
          console.log(`Webhook triggered for email: ${emailId}`);
        } catch (webhookError) {
          console.error(`Webhook trigger failed: ${webhookError}`);
        }
      }
    }

    console.log(`Email ${emailId} categorized as: ${category}`);
    return c.json({ success: true, category, email });
  } catch (error) {
    console.error(`Error categorizing email: ${error}`);
    return c.json({ error: `Failed to categorize email: ${error.message}` }, 500);
  }
});

// Batch categorize all uncategorized emails
app.post("/make-server-14c7be83/categorize-all", async (c) => {
  try {
    const emailKeys = await kv.getByPrefix('email:');
    const uncategorized = emailKeys.filter(item => !item.value.category);

    let categorized = 0;
    for (const item of uncategorized) {
      try {
        // Call the categorize endpoint for each email
        const emailId = item.value.id;
        // We'll just update directly here to avoid recursion
        const email = item.value;
        
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiKey) continue;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an email categorization assistant. Categorize emails into exactly one of these categories: "Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office". Respond with only the category name.`
              },
              {
                role: 'user',
                content: `Subject: ${email.subject}\n\nFrom: ${email.from}\n\nBody: ${email.body?.substring(0, 1000)}`
              }
            ],
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const category = data.choices[0].message.content.trim();
          email.category = category;
          email.categorizedAt = new Date().toISOString();
          await kv.set(`email:${emailId}`, email);
          categorized++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to categorize email ${item.value.id}: ${error}`);
      }
    }

    return c.json({ success: true, categorized, total: uncategorized.length });
  } catch (error) {
    console.error(`Error in batch categorization: ${error}`);
    return c.json({ error: `Failed to categorize emails: ${error.message}` }, 500);
  }
});

// ============== AI Suggested Replies (RAG) ==============

// Store training data for RAG
app.post("/make-server-14c7be83/training-data", async (c) => {
  try {
    const body = await c.req.json();
    const { productInfo, outreachAgenda } = body;

    await kv.set('training_data', {
      productInfo,
      outreachAgenda,
      updatedAt: new Date().toISOString()
    });

    console.log(`Training data updated`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error updating training data: ${error}`);
    return c.json({ error: `Failed to update training data: ${error.message}` }, 500);
  }
});

// Get training data
app.get("/make-server-14c7be83/training-data", async (c) => {
  try {
    const data = await kv.get('training_data') || {};
    return c.json({ data });
  } catch (error) {
    console.error(`Error fetching training data: ${error}`);
    return c.json({ error: `Failed to fetch training data: ${error.message}` }, 500);
  }
});

// Generate suggested reply using RAG
app.post("/make-server-14c7be83/suggest-reply/:emailId", async (c) => {
  try {
    const emailId = c.req.param('emailId');
    const email = await kv.get(`email:${emailId}`);
    
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    const trainingData = await kv.get('training_data') || {};
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    // Use RAG approach with training data as context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI email assistant. Generate professional, contextual email replies based on the training data provided.

Training Context:
Product/Service Info: ${trainingData.productInfo || 'Not provided'}
Outreach Agenda: ${trainingData.outreachAgenda || 'Not provided'}

Generate a concise, professional reply that:
1. Addresses the sender's message appropriately
2. Uses information from the training context when relevant
3. Maintains a friendly but professional tone
4. Is clear and actionable`
          },
          {
            role: 'user',
            content: `Generate a reply to this email:

From: ${email.from}
Subject: ${email.subject}

Email Body:
${email.body}

Please provide a suggested reply.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${errorText}`);
      return c.json({ error: `Failed to generate reply: ${errorText}` }, 500);
    }

    const data = await response.json();
    const suggestedReply = data.choices[0].message.content.trim();

    console.log(`Generated reply suggestion for email: ${emailId}`);
    return c.json({ success: true, suggestedReply, emailId });
  } catch (error) {
    console.error(`Error generating reply: ${error}`);
    return c.json({ error: `Failed to generate reply: ${error.message}` }, 500);
  }
});

// ============== Settings ==============

// Update Slack webhook URL
app.post("/make-server-14c7be83/settings/slack", async (c) => {
  try {
    const body = await c.req.json();
    const { webhookUrl } = body;

    await kv.set('slack_webhook_url', webhookUrl);
    console.log(`Slack webhook URL updated`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error updating Slack webhook: ${error}`);
    return c.json({ error: `Failed to update Slack webhook: ${error.message}` }, 500);
  }
});

// Update generic webhook URL
app.post("/make-server-14c7be83/settings/webhook", async (c) => {
  try {
    const body = await c.req.json();
    const { webhookUrl } = body;

    await kv.set('webhook_url', webhookUrl);
    console.log(`Webhook URL updated`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error updating webhook: ${error}`);
    return c.json({ error: `Failed to update webhook: ${error.message}` }, 500);
  }
});

// Get all settings
app.get("/make-server-14c7be83/settings", async (c) => {
  try {
    const slackWebhook = await kv.get('slack_webhook_url');
    const webhook = await kv.get('webhook_url');
    const trainingData = await kv.get('training_data');

    return c.json({
      slackWebhook: slackWebhook || '',
      webhook: webhook || '',
      trainingData: trainingData || {}
    });
  } catch (error) {
    console.error(`Error fetching settings: ${error}`);
    return c.json({ error: `Failed to fetch settings: ${error.message}` }, 500);
  }
});

// ============== Demo Data Population ==============

// Populate demo emails
app.post("/make-server-14c7be83/demo/populate", async (c) => {
  try {
    // Create demo accounts
    const demoAccounts = [
      {
        id: 'demo-account-1',
        email: 'john@example.com',
        host: 'imap.gmail.com',
        port: 993,
        username: 'john@example.com',
        password: '***',
        name: 'John Doe - Gmail',
        status: 'active',
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-account-2',
        email: 'sarah@company.com',
        host: 'imap.office365.com',
        port: 993,
        username: 'sarah@company.com',
        password: '***',
        name: 'Sarah Smith - Outlook',
        status: 'active',
        lastSync: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    for (const account of demoAccounts) {
      await kv.set(`account:${account.id}`, account);
    }
    await kv.set('account_ids', demoAccounts.map(a => a.id));

    // Create demo emails
    const demoEmails = [
      {
        id: 'email-1',
        accountId: 'demo-account-1',
        from: 'recruiter@techcorp.com',
        to: 'john@example.com',
        subject: 'Your Resume Has Been Shortlisted!',
        body: 'Hi John,\n\nGreat news! Your resume has been shortlisted for the Senior Software Engineer position. When would be a good time for you to attend the technical interview?\n\nBest regards,\nTech Corp Recruiting',
        folder: 'INBOX',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'Interested',
        isRead: false,
        isStarred: true,
        hasAttachments: false
      },
      {
        id: 'email-2',
        accountId: 'demo-account-1',
        from: 'hr@startup.io',
        to: 'john@example.com',
        subject: 'Meeting Confirmed - Technical Interview',
        body: 'Hi John,\n\nThis email confirms your technical interview scheduled for tomorrow at 2 PM EST. The Zoom link is: https://zoom.us/j/123456789\n\nLooking forward to speaking with you!\n\nBest,\nStartup.io HR Team',
        folder: 'INBOX',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: 'Meeting Booked',
        isRead: true,
        isStarred: true,
        hasAttachments: false
      },
      {
        id: 'email-3',
        accountId: 'demo-account-2',
        from: 'noreply@jobboard.com',
        to: 'sarah@company.com',
        subject: 'Thank you for your application',
        body: 'Dear Applicant,\n\nThank you for your interest in our company. Unfortunately, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe wish you the best in your job search.\n\nSincerely,\nJob Board Team',
        folder: 'INBOX',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: 'Not Interested',
        isRead: true,
        isStarred: false,
        hasAttachments: false
      },
      {
        id: 'email-4',
        accountId: 'demo-account-2',
        from: 'marketing@spam.com',
        to: 'sarah@company.com',
        subject: '💰 You Won $1,000,000! Claim Now!',
        body: 'CONGRATULATIONS!!! You are the lucky winner of our grand prize draw. Click here to claim your million dollars now! Limited time offer!!!',
        folder: 'INBOX',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        category: 'Spam',
        isRead: false,
        isStarred: false,
        hasAttachments: false
      },
      {
        id: 'email-5',
        accountId: 'demo-account-1',
        from: 'manager@bigcorp.com',
        to: 'john@example.com',
        subject: 'Out of Office: Re: Your Application',
        body: 'Thank you for your email. I am currently out of the office and will return on Monday, January 20th. I will respond to your message upon my return.\n\nFor urgent matters, please contact hr@bigcorp.com.\n\nBest regards',
        folder: 'INBOX',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        category: 'Out of Office',
        isRead: true,
        isStarred: false,
        hasAttachments: false
      },
      {
        id: 'email-6',
        accountId: 'demo-account-1',
        from: 'talent@innovate.com',
        to: 'john@example.com',
        subject: 'Exciting Opportunity - Full Stack Developer',
        body: 'Hi John,\n\nI came across your profile and was impressed by your experience. We have an exciting opportunity for a Full Stack Developer role that I think would be perfect for you.\n\nAre you available for a quick call this week to discuss?\n\nRegards,\nInnovate Talent Team',
        folder: 'INBOX',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'Interested',
        isRead: false,
        isStarred: true,
        hasAttachments: true
      },
      {
        id: 'email-7',
        accountId: 'demo-account-2',
        from: 'ceo@fastgrowth.com',
        to: 'sarah@company.com',
        subject: 'Interview Invitation - Senior Engineer Role',
        body: 'Dear Sarah,\n\nWe were very impressed with your application for the Senior Engineer position. We would like to invite you for an interview next week.\n\nCould you please confirm your availability for Tuesday or Wednesday?\n\nBest regards,\nFastGrowth CEO',
        folder: 'INBOX',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: 'Interested',
        isRead: false,
        isStarred: true,
        hasAttachments: false
      },
      {
        id: 'email-8',
        accountId: 'demo-account-1',
        from: 'notifications@linkedin.com',
        to: 'john@example.com',
        subject: 'You have 5 new profile views',
        body: 'Hi John,\n\nYour profile is getting noticed! You have 5 new profile views this week.\n\nSee who viewed your profile and connect with them.\n\nLinkedIn Team',
        folder: 'INBOX',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: null,
        isRead: true,
        isStarred: false,
        hasAttachments: false
      }
    ];

    for (const email of demoEmails) {
      await kv.set(`email:${email.id}`, email);
    }

    console.log(`Demo data populated: ${demoAccounts.length} accounts, ${demoEmails.length} emails`);
    return c.json({ 
      success: true, 
      accounts: demoAccounts.length, 
      emails: demoEmails.length 
    });
  } catch (error) {
    console.error(`Error populating demo data: ${error}`);
    return c.json({ error: `Failed to populate demo data: ${error.message}` }, 500);
  }
});

// Clear all data
app.post("/make-server-14c7be83/demo/clear", async (c) => {
  try {
    // Get all keys and delete them
    const accountIds = await kv.get('account_ids') || [];
    for (const id of accountIds) {
      await kv.del(`account:${id}`);
    }
    await kv.del('account_ids');

    const emailKeys = await kv.getByPrefix('email:');
    for (const item of emailKeys) {
      await kv.del(item.key);
    }

    console.log(`All data cleared`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error clearing data: ${error}`);
    return c.json({ error: `Failed to clear data: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
