#!/bin/bash

# ==============================================================================
# Script de Déploiement Google Cloud Run — UPLIFT 2.0
# ==============================================================================

# 1. PARAMÈTRES (À MODIFIER SI BESOIN)
# ------------------------------------------------------------------------------
# Remplacer par l'ID de votre projet Google Cloud (ex: my-project-id)
PROJECT_ID="ayibuzz"
REGION="us-east1"
SERVICE_NAME="uplift-web"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# 2. VÉRIFICATION DE GCLOUD
# ------------------------------------------------------------------------------
if ! command -v gcloud &> /dev/null
then
    echo "❌ Erreur: 'gcloud' n'est pas installé. Installez-le à partir d'ici : https://cloud.google.com/sdk"
    exit 1
fi

# 3. BUILD & PUSH VIA GOOGLE CLOUD BUILD
# ------------------------------------------------------------------------------
echo "🚀 [1/2] Construction et envoi de l'image Docker via Cloud Build..."
gcloud builds submit --tag "$IMAGE_NAME" --project "$PROJECT_ID"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Vérifiez votre configuration Google Cloud."
    exit 1
fi

# 4. DÉPLOIEMENT SUR CLOUD RUN
# ------------------------------------------------------------------------------
echo "🌍 [2/2] Déploiement sur Cloud Run en cours..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --project "$PROJECT_ID" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5

# 5. RÉSULTAT
# ------------------------------------------------------------------------------
if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo "👉 Votre application est disponible sur Cloud Run."
    echo ""
    echo "⚠️  INFO IMPORTANTE : N'oubliez pas de configurer vos variables d'environnement (.env) "
    echo "   directement dans la console Cloud Run pour que Supabase et Resend fonctionnent."
else
    echo "❌ Échec du déploiement sur Cloud Run."
fi
