# Add Bot IQ hostnames (app|inbox|api|crm).botiq.kaana.in to Cloud DNS + managed SSL + URL map.
# Run after pulling url-map-multi.yaml changes. Does not remove legacy app.kaana.in records.
param(
    [string]$ProjectId = "crucial-accord-505607-g9",
    [string]$Region = "asia-south1",
    [string]$Domain = "kaana.in",
    [string]$DnsZoneName = "kaana-in",
    [string]$StaticIpName = "kaana-web-ip",
    [string]$CertName = "kaana-all-cert"
)

$ErrorActionPreference = "Stop"
gcloud config set project $ProjectId | Out-Null

$lbIp = gcloud compute addresses describe $StaticIpName --global --format="value(address)"
if (-not $lbIp) { throw "Static IP $StaticIpName not found" }

Write-Host "==> Import URL map (Bot IQ + legacy hosts)"
gcloud compute url-maps import kaana-web-map-multi `
    --source="$PSScriptRoot\url-map-multi.yaml" --global --quiet

$botiqDnsLabels = @(
    "botiq",
    "app.botiq",
    "inbox.botiq",
    "api.botiq",
    "crm.botiq"
)

function Upsert-Dns {
    param([string]$Name, [string]$Type, [string[]]$Values, [int]$Ttl = 300)
    $exists = $false
    $ErrorActionPreference = "Continue"
    gcloud dns record-sets list --zone=$DnsZoneName --name=$Name --type=$Type 2>$null | Out-Null
    $exists = $LASTEXITCODE -eq 0
    $ErrorActionPreference = "Stop"
    if ($exists) {
        gcloud dns record-sets update $Name --zone=$DnsZoneName --type=$Type --ttl=$Ttl --rrdatas=$Values | Out-Null
    } else {
        gcloud dns record-sets create $Name --zone=$DnsZoneName --type=$Type --ttl=$Ttl --rrdatas=$Values | Out-Null
    }
    Write-Host "  DNS $Name -> $($Values -join ', ')"
}

Write-Host "==> Bot IQ A records -> LB $lbIp"
foreach ($label in $botiqDnsLabels) {
    Upsert-Dns -Name "$label.$Domain." -Type "A" -Values @($lbIp)
}

$newCertDomains = @(
    "botiq.kaana.in",
    "app.botiq.kaana.in",
    "inbox.botiq.kaana.in",
    "api.botiq.kaana.in",
    "crm.botiq.kaana.in"
)

Write-Host ""
Write-Host "==> Managed SSL certificate"
Write-Host "Add these domains to cert '$CertName' (GCP max ~100 domains per cert):"
foreach ($d in $newCertDomains) { Write-Host "  - $d" }
Write-Host ""
Write-Host "Example (creates NEW cert if you hit update limits — then attach to HTTPS proxy):"
Write-Host "  gcloud compute ssl-certificates create kaana-botiq-cert --domains=$($newCertDomains -join ',') --global"
Write-Host ""
Write-Host "After DNS + cert ACTIVE, redeploy platform/inbox/api with config/botiq-domains.json URLs."
Write-Host "Update Meta App Basic Settings (privacy, terms, webhook) to api.botiq.kaana.in when switching."
