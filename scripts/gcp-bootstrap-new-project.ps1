# One-time bootstrap for new kaana-prod GCP project (migration target)
# Usage: .\scripts\gcp-bootstrap-new-project.ps1
# Requires: gcloud authenticated as project Owner

param(
    [string]$ProjectId = "crucial-accord-505607-g9",
    [string]$Region = "asia-south1",
    [string]$ArtifactRepo = "kaana"
)

$ErrorActionPreference = "Stop"

Write-Host "==> Bootstrap kaana-prod on project: $ProjectId (region: $Region)"

gcloud config set project $ProjectId | Out-Null

$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
    "sql-component.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "pubsub.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firestore.googleapis.com"
)

Write-Host "==> Enabling APIs..."
foreach ($api in $apis) {
    gcloud services enable $api --project=$ProjectId | Out-Null
}

Write-Host "==> Creating Artifact Registry repo..."
$repoExists = gcloud artifacts repositories describe $ArtifactRepo `
    --location=$Region --project=$ProjectId 2>$null
if (-not $repoExists) {
    gcloud artifacts repositories create $ArtifactRepo `
        --repository-format=docker `
        --location=$Region `
        --description="Kaana container images" `
        --project=$ProjectId | Out-Null
}

Write-Host "==> Creating Cloud Build deployer service account..."
$deployerEmail = "kaana-cloudbuild-deployer@${ProjectId}.iam.gserviceaccount.com"
$saExists = gcloud iam service-accounts describe $deployerEmail --project=$ProjectId 2>$null
if (-not $saExists) {
    gcloud iam service-accounts create kaana-cloudbuild-deployer `
        --display-name="Kaana Cloud Build Deployer" `
        --project=$ProjectId | Out-Null
}

$deployerRoles = @(
    "roles/artifactregistry.writer",
    "roles/cloudbuild.builds.builder",
    "roles/cloudbuild.builds.editor",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/storage.admin",
    "roles/storage.objectAdmin"
)

Write-Host "==> Granting deployer IAM roles..."
foreach ($role in $deployerRoles) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$deployerEmail" `
        --role=$role `
        --condition=None `
        --quiet | Out-Null
}

$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$cloudBuildSa = "${projectNumber}@cloudbuild.gserviceaccount.com"

Write-Host "==> Granting default Cloud Build SA permissions..."
foreach ($role in @("roles/run.admin", "roles/iam.serviceAccountUser")) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$cloudBuildSa" `
        --role=$role `
        --condition=None `
        --quiet | Out-Null
}

Write-Host ""
Write-Host "Done. Next steps:"
Write-Host "  1. Run scripts/setup-github-wif.ps1 (GitHub Actions auth — no SA keys)"
Write-Host "  2. Merge updated .github/workflows/* (WIF + new project ID)"
Write-Host "  3. Copy secrets from old kaana-prod (kaana-old config)"
Write-Host "  4. Deploy: gcloud builds submit --config cloudbuild.yaml --service-account=projects/$ProjectId/serviceAccounts/$deployerEmail ."
Write-Host ""
Write-Host "Deployer: $deployerEmail"
Write-Host "Artifact: ${Region}-docker.pkg.dev/${ProjectId}/${ArtifactRepo}"
