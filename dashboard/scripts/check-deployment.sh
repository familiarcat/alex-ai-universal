#!/bin/bash
# Check deployment status

echo "🔍 Checking Alex AI Dashboard deployment status..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured"
    exit 1
fi

# Check Amplify app status
APP_NAME="alex-ai-dashboard"
if aws amplify get-app --app-id ${APP_NAME} >/dev/null 2>&1; then
    echo "✅ Amplify app exists"
    
    # Get app status
    aws amplify get-app --app-id ${APP_NAME} --query 'app.{Name:name,Status:status,DefaultDomain:defaultDomain}' --output table
    
    # Get latest deployment
    aws amplify list-jobs --app-id ${APP_NAME} --branch-name main --max-results 1 --query 'jobSummaries[0].{Status:status,StartTime:startTime,EndTime:endTime}' --output table
else
    echo "❌ Amplify app not found"
fi
