# Setting WEBHOOK_URL in n8n UI (November 2025)

## Overview
This guide shows how to set the WEBHOOK_URL globally in n8n version 1.120.4 using the modern UI.

## Method 1: Environment Variables (Recommended)

### Step-by-Step Instructions

1. **Navigate to Settings**
   - Click the **Settings** icon (gear icon) in the top-right corner
   - Or go to: `https://n8n.pbradygeorgen.com/settings`

2. **Go to Environments**
   - In the left sidebar, click **"Environments"**
   - This is where environment variables are managed

3. **Create or Edit Environment**
   - If you see a list of environments, select the default/production environment
   - Or click **"Create environment"** if none exists
   - Name it: `production` or `default`

4. **Add WEBHOOK_URL Variable**
   - In the environment editor, look for **"Variables"** or **"Environment Variables"** section
   - Click **"Add variable"** or **"+"** button
   - Enter:
     - **Key:** `WEBHOOK_URL`
     - **Value:** `https://n8n.pbradygeorgen.com`
   - Click **"Save"** or **"Apply"**

5. **Save Environment**
   - Click **"Save"** at the bottom of the environment editor
   - n8n may prompt you to restart - if so, restart n8n

## Method 2: General Settings (If Available)

1. **Navigate to Settings**
   - Click the **Settings** icon (gear icon) in the top-right corner

2. **Go to General Settings**
   - In the left sidebar, look for **"General"** or **"Configuration"**
   - Click on it

3. **Find Webhook URL Setting**
   - Look for a field labeled:
     - **"Webhook URL"**
     - **"Public Webhook URL"**
     - **"Base URL"**
   - Enter: `https://n8n.pbradygeorgen.com`

4. **Save**
   - Click **"Save"** at the bottom
   - Restart n8n if prompted

## Method 3: Via n8n API Settings

1. **Navigate to Settings**
   - Click the **Settings** icon

2. **Go to n8n API**
   - In the left sidebar, click **"n8n API"**

3. **Check for Webhook URL Field**
   - Some versions have a webhook URL field here
   - If present, set it to: `https://n8n.pbradygeorgen.com`
   - Save

## Verification

After setting WEBHOOK_URL:

1. **Restart n8n** (if not auto-restarted)
   ```bash
   # On EC2
   sudo docker restart n8n
   ```

2. **Verify in Settings API**
   ```bash
   curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
     -H "X-N8N-API-KEY: YOUR_API_KEY" | jq '.webhookUrl'
   ```
   Should return: `"https://n8n.pbradygeorgen.com"`

3. **Test Webhook Registration**
   - Activate a workflow with a webhook trigger
   - Wait 30 seconds
   - Test the webhook endpoint
   - Should return 200 (not 404)

## Troubleshooting

### If "Environments" option is not visible:
- You may need to enable it in Settings → Personal → Features
- Or it might be under a different name in your version

### If settings don't persist:
- Make sure you're saving the environment/configuration
- Restart n8n after making changes
- Check n8n logs for errors

### If webhooks still don't register:
- Verify the workflow has a webhook trigger node
- Check that the workflow is active
- Wait 30-60 seconds after activation
- Check n8n execution logs for webhook registration errors

## Notes

- **Community Edition:** Some advanced settings may be limited in Community Edition
- **Version:** This guide is for n8n 1.120.4 (November 2025)
- **UI Changes:** n8n UI changes frequently - if these steps don't match, look for similar options

