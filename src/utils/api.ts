import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-14c7be83`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Accounts
export async function getAccounts() {
  const response = await fetch(`${API_BASE}/accounts`, { headers });
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
}

export async function createAccount(account: any) {
  const response = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(account)
  });
  if (!response.ok) throw new Error('Failed to create account');
  return response.json();
}

export async function deleteAccount(accountId: string) {
  const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) throw new Error('Failed to delete account');
  return response.json();
}

export async function syncAccount(accountId: string) {
  const response = await fetch(`${API_BASE}/sync/${accountId}`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to sync account');
  return response.json();
}

// Emails
export async function getEmails(filters?: {
  accountId?: string;
  folder?: string;
  category?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.accountId) params.set('accountId', filters.accountId);
  if (filters?.folder) params.set('folder', filters.folder);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  
  const response = await fetch(`${API_BASE}/emails?${params}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
}

export async function getEmail(emailId: string) {
  const response = await fetch(`${API_BASE}/emails/${emailId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch email');
  return response.json();
}

export async function updateEmail(emailId: string, updates: any) {
  const response = await fetch(`${API_BASE}/emails/${emailId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update email');
  return response.json();
}

export async function deleteEmail(emailId: string) {
  const response = await fetch(`${API_BASE}/emails/${emailId}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) throw new Error('Failed to delete email');
  return response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`, { headers });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function categorizeEmail(emailId: string) {
  const response = await fetch(`${API_BASE}/categorize/${emailId}`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to categorize email');
  return response.json();
}

export async function categorizeAllEmails() {
  const response = await fetch(`${API_BASE}/categorize-all`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to categorize emails');
  return response.json();
}

export async function suggestReply(emailId: string) {
  const response = await fetch(`${API_BASE}/suggest-reply/${emailId}`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to generate reply');
  return response.json();
}

// Settings
export async function updateSlackWebhook(webhookUrl: string) {
  const response = await fetch(`${API_BASE}/settings/slack`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ webhookUrl })
  });
  if (!response.ok) throw new Error('Failed to update Slack webhook');
  return response.json();
}

export async function updateWebhook(webhookUrl: string) {
  const response = await fetch(`${API_BASE}/settings/webhook`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ webhookUrl })
  });
  if (!response.ok) throw new Error('Failed to update webhook');
  return response.json();
}

export async function getSettings() {
  const response = await fetch(`${API_BASE}/settings`, { headers });
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}

export async function updateTrainingData(productInfo: string, outreachAgenda: string) {
  const response = await fetch(`${API_BASE}/training-data`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ productInfo, outreachAgenda })
  });
  if (!response.ok) throw new Error('Failed to update training data');
  return response.json();
}

export async function getTrainingData() {
  const response = await fetch(`${API_BASE}/training-data`, { headers });
  if (!response.ok) throw new Error('Failed to fetch training data');
  return response.json();
}

// Demo
export async function populateDemoData() {
  const response = await fetch(`${API_BASE}/demo/populate`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to populate demo data');
  return response.json();
}

export async function clearAllData() {
  const response = await fetch(`${API_BASE}/demo/clear`, {
    method: 'POST',
    headers
  });
  if (!response.ok) throw new Error('Failed to clear data');
  return response.json();
}
