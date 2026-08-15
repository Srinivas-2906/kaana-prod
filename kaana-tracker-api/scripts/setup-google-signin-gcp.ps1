# Configure Google Sign-In for Kaana Tracker on GCP (kaana-prod).
# Usage:
#   .\setup-google-signin-gcp.ps1 -ClientId "123456789-abc.apps.googleusercontent.com"
# Or create the OAuth client in Console first, then run with the Client ID.
param(
  [Parameter(Mandatory = $true)]
  [string]$ClientId,
  [string]$Project = "kaana-prod",
  [string]$Region = "asia-south1"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Kaana Tracker Google Sign-In (GCP) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "Client ID: $ClientId"

# 1. Secret Manager
$secretName = "kaana-tracker-google-client-id"
$existing = gcloud secrets describe $secretName --project=$Project 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating secret $secretName ..."
  gcloud secrets create $secretName --project=$Project --replication-policy=automatic
} else {
  Write-Host "Updating secret $secretName ..."
}
$ClientId | gcloud secrets versions add $secretName --project=$Project --data-file=-

# 2. Grant secret access to Cloud Build + Cloud Run
$projectNumber = gcloud projects describe $Project --format="value(projectNumber)"
$runSa = "$projectNumber-compute@developer.gserviceaccount.com"
$cloudBuildSa = "kaana-cloudbuild-deployer@$Project.iam.gserviceaccount.com"
foreach ($sa in @($runSa, $cloudBuildSa)) {
  gcloud secrets add-iam-policy-binding $secretName `
    --project=$Project `
    --member="serviceAccount:$sa" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet 2>$null | Out-Null
}

# 3. Patch Identity Platform authorized domains (tracker.kaana.in)
Write-Host "Ensuring tracker.kaana.in is an authorized domain in Identity Platform ..."
$domainsJson = @"
{
  "authorizedDomains": [
    "localhost",
    "kaana-prod.firebaseapp.com",
    "kaana-prod.web.app",
    "reminders-bills-pwa-wtba53dhka-el.a.run.app",
    "reminders-bills-pwa-851239127958.asia-south1.run.app",
    "tracker.kaana.in"
  ]
}
"@
$tmpDomains = Join-Path $PSScriptRoot "tmp-auth-domains.json"
Set-Content -Path $tmpDomains -Value $domainsJson -Encoding UTF8
$token = gcloud auth print-access-token
curl.exe -s -X PATCH `
  -H "Authorization: Bearer $token" `
  -H "x-goog-user-project: $Project" `
  -H "Content-Type: application/json" `
  "https://identitytoolkit.googleapis.com/v2/projects/$projectNumber/config?updateMask=authorizedDomains" `
  --data-binary "@$tmpDomains" | Out-Null

# 4. Update running Cloud Run API with GOOGLE_CLIENT_ID
Write-Host "Updating kaana-tracker-api Cloud Run service ..."
gcloud run services update kaana-tracker-api `
  --project=$Project `
  --region=$Region `
  --update-secrets="GOOGLE_CLIENT_ID=${secretName}:latest" `
  --quiet

Write-Host ""
Write-Host "Done. Deploy to bake the Client ID into the frontend:" -ForegroundColor Green
Write-Host "  gcloud builds submit --config cloudbuild.tracker.yaml --project $Project ." -ForegroundColor Yellow
