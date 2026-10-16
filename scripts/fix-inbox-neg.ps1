# Point kaana-inbox-neg at Cloud Run kaana-inbox (not kaana-web marketing).
# Run after first deploy of kaana-inbox via cloudbuild.inbox.yaml.
param(
    [string]$ProjectId = "crucial-accord-505607-g9",
    [string]$Region = "asia-south1",
    [string]$Service = "kaana-inbox",
    [string]$Neg = "kaana-inbox-neg",
    [string]$Backend = "kaana-inbox-backend"
)

$ErrorActionPreference = "Stop"
gcloud config set project $ProjectId | Out-Null

Write-Host "==> Ensure Cloud Run service exists: $Service"
gcloud run services describe $Service --region=$Region --format="value(status.url)" | Out-Null

Write-Host "==> Recreate serverless NEG $Neg -> $Service"
$ErrorActionPreference = "Continue"
gcloud compute backend-services remove-backend $Backend `
    --global --network-endpoint-group=$Neg --network-endpoint-group-region=$Region 2>$null | Out-Null
gcloud compute network-endpoint-groups delete $Neg --region=$Region --quiet 2>$null | Out-Null
$ErrorActionPreference = "Stop"

gcloud compute network-endpoint-groups create $Neg `
    --region=$Region `
    --network-endpoint-type=serverless `
    --cloud-run-service=$Service

gcloud compute backend-services add-backend $Backend `
    --global `
    --network-endpoint-group=$Neg `
    --network-endpoint-group-region=$Region

gcloud run services update $Service --region=$Region --no-invoker-iam-check --quiet | Out-Null

Write-Host "Done. inbox.kaana.in host rule -> $Backend -> $Neg -> $Service"
