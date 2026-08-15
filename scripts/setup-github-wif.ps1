# GitHub Actions → GCP via Workload Identity Federation (no SA keys)
# Bypasses org policy: iam.managed.disableServiceAccountKeyCreation
#
# Usage: .\scripts\setup-github-wif.ps1
# Requires: gcloud authenticated as project Owner

param(
    [string]$ProjectId = "crucial-accord-505607-g9",
    [string]$GitHubOwner = "Srinivas-2906",
    [string]$GitHubRepo = "kaana-prod",
    [string]$DeployerSaName = "kaana-cloudbuild-deployer"
)

$ErrorActionPreference = "Stop"

$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$deployerEmail = "${DeployerSaName}@${ProjectId}.iam.gserviceaccount.com"
$repoFull = "${GitHubOwner}/${GitHubRepo}"

Write-Host "==> WIF for GitHub repo: $repoFull"
Write-Host "==> Project: $ProjectId ($projectNumber)"

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project=$ProjectId | Out-Null

$poolExists = gcloud iam workload-identity-pools describe github --location=global --project=$ProjectId 2>$null
if (-not $poolExists) {
    gcloud iam workload-identity-pools create github `
        --project=$ProjectId `
        --location=global `
        --display-name="GitHub Actions" | Out-Null
}

$providerExists = gcloud iam workload-identity-pools providers describe github-provider `
    --workload-identity-pool=github --location=global --project=$ProjectId 2>$null
if (-not $providerExists) {
    gcloud iam workload-identity-pools providers create-oidc github-provider `
        --project=$ProjectId `
        --location=global `
        --workload-identity-pool=github `
        --display-name="GitHub OIDC" `
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" `
        --attribute-condition="assertion.repository_owner=='$GitHubOwner'" `
        --issuer-uri="https://token.actions.githubusercontent.com" | Out-Null
}

$member = "principalSet://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/github/attribute.repository/${repoFull}"
gcloud iam service-accounts add-iam-policy-binding $deployerEmail `
    --project=$ProjectId `
    --role="roles/iam.workloadIdentityUser" `
    --member=$member | Out-Null

$provider = "projects/${projectNumber}/locations/global/workloadIdentityPools/github/providers/github-provider"

Write-Host ""
Write-Host "Done. Add to GitHub workflow:"
Write-Host "  permissions:"
Write-Host "    contents: read"
Write-Host "    id-token: write"
Write-Host ""
Write-Host "  env:"
Write-Host "    GCP_PROJECT_ID: $ProjectId"
Write-Host "    GCP_WIF_PROVIDER: $provider"
Write-Host "    GCP_DEPLOYER_SA: $deployerEmail"
