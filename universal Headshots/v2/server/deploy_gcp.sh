#!/bin/bash

# Configuration - Replace these with your actual IDs
PROJECT_ID="universalheadshot-a776a"
REGION="us-central1"
SERVICE_NAME="universal-headshots-api"

echo "🚀 Starting Deployment for $SERVICE_NAME to $REGION..."

# 1. Build the container image using Cloud Build
echo "📦 Building container image on Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# 2. Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=universalheadshot-a776a,GCS_BUCKET_NAME=universalheadshot,GOOGLE_APPLICATION_CREDENTIALS=src/config/vertex-key.json,FIREBASE_SERVICE_ACCOUNT=src/config/service-account.json" \
  --max-instances 10 \
  --min-instances 0 \
  --memory 1Gi \
  --cpu 1

echo "✅ Deployment Complete!"
echo "📍 Your API is now live at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
