# HTTPS load balancer + Cloud DNS for kaana.in on new GCP project
param(
    [string]$ProjectId = "crucial-accord-505607-g9",
    [string]$Region = "asia-south1",
    [string]$Domain = "kaana.in",
    [string]$DnsZoneName = "kaana-in",
    [string]$StaticIpName = "kaana-web-ip"
)

$ErrorActionPreference = "Stop"

function Test-GcloudResource {
    param([string]$DescribeArgs)
    $ErrorActionPreference = "Continue"
    gcloud @DescribeArgs 2>$null | Out-Null
    $ErrorActionPreference = "Stop"
    return $LASTEXITCODE -eq 0
}

function Ensure-NegBackend {
    param([string]$Service, [string]$Neg, [string]$Backend)
    if (-not (Test-GcloudResource @("compute","network-endpoint-groups","describe",$Neg,"--region=$Region"))) {
        gcloud compute network-endpoint-groups create $Neg `
            --region=$Region `
            --network-endpoint-type=serverless `
            --cloud-run-service=$Service | Out-Null
    }
    if (-not (Test-GcloudResource @("compute","backend-services","describe",$Backend,"--global"))) {
        gcloud compute backend-services create $Backend `
            --global `
            --load-balancing-scheme=EXTERNAL_MANAGED | Out-Null
    }
    $ErrorActionPreference = "Continue"
    gcloud compute backend-services remove-backend $Backend `
        --global --network-endpoint-group=$Neg --network-endpoint-group-region=$Region 2>$null | Out-Null
    $ErrorActionPreference = "Stop"
    gcloud compute backend-services add-backend $Backend `
        --global --network-endpoint-group=$Neg --network-endpoint-group-region=$Region | Out-Null
    Write-Host "  backend $Backend <- $Service"
}

Write-Host "==> Reserve global static IP: $StaticIpName"
gcloud config set project $ProjectId | Out-Null
if (-not (Test-GcloudResource @("compute","addresses","describe",$StaticIpName,"--global"))) {
    gcloud compute addresses create $StaticIpName --global | Out-Null
}
$lbIp = gcloud compute addresses describe $StaticIpName --global --format="value(address)"
Write-Host "  LB IP: $lbIp"

Write-Host "==> Serverless NEGs + backends"
$map = @(
    @{ Service = "kaana-web"; Neg = "kaana-web-neg"; Backend = "kaana-web-backend-classic" },
    @{ Service = "kaana-platform"; Neg = "kaana-platform-neg"; Backend = "kaana-platform-backend" },
    @{ Service = "kaana-crm"; Neg = "kaana-crm-neg"; Backend = "kaana-crm-backend" },
    @{ Service = "kaana-clinic"; Neg = "kaana-clinic-neg"; Backend = "kaana-clinic-backend" },
    @{ Service = "clinic-api"; Neg = "clinic-api-neg"; Backend = "clinic-api-backend" },
    @{ Service = "kaana-tracker"; Neg = "kaana-tracker-neg"; Backend = "kaana-tracker-backend" },
    @{ Service = "aquafarm-web"; Neg = "aquafarm-web-neg"; Backend = "aquafarm-web-backend" },
    @{ Service = "aquafarm-api"; Neg = "aquafarm-api-neg"; Backend = "aquafarm-api-backend" }
)
foreach ($item in $map) {
    Ensure-NegBackend @item
}

Write-Host "==> Cloud Run invoker IAM (org policy blocks allUsers; LB needs no-invoker-iam-check)"
$lbServices = $map | ForEach-Object { $_.Service } | Select-Object -Unique
foreach ($svc in $lbServices) {
    gcloud run services update $svc --region=$Region --no-invoker-iam-check --quiet | Out-Null
    Write-Host "  $svc"
}

# API + inbox — must point at real Cloud Run services (not kaana-web placeholder)
Ensure-NegBackend -Service "kaana-api" -Neg "kaana-api-neg" -Backend "kaana-api-backend"
Ensure-NegBackend -Service "kaana-inbox" -Neg "kaana-inbox-neg" -Backend "kaana-inbox-backend"
Ensure-NegBackend -Service "kaana-web" -Neg "ajitdentalclinic-neg" -Backend "ajitdentalclinic-backend"

Write-Host "==> URL maps"
gcloud compute url-maps import kaana-web-map-multi `
    --source="$PSScriptRoot\url-map-multi.yaml" --global --quiet | Out-Null
if (-not (Test-GcloudResource @("compute","url-maps","describe","kaana-web-map-redirect","--global"))) {
    gcloud compute url-maps import kaana-web-map-redirect `
        --source="$PSScriptRoot\url-map-redirect.yaml" --global --quiet | Out-Null
}

Write-Host "==> Managed SSL certificates"
$certDomains = @(
    "kaana.in", "www.kaana.in",
    "botiq.kaana.in", "app.botiq.kaana.in", "inbox.botiq.kaana.in", "api.botiq.kaana.in", "crm.botiq.kaana.in",
    "app.kaana.in", "inbox.kaana.in", "crm.kaana.in", "api.kaana.in",
    "clinic.kaana.in", "clinic-api.kaana.in",
    "aquafarm.kaana.in", "api.aquafarm.kaana.in",
    "dentacare.kaana.in", "crm.dentacare.kaana.in"
)
if (-not (Test-GcloudResource @("compute","ssl-certificates","describe","kaana-all-cert","--global"))) {
    gcloud compute ssl-certificates create kaana-all-cert `
        --domains=$($certDomains -join ",") `
        --global | Out-Null
}

Write-Host "==> HTTPS / HTTP proxies + forwarding rules"
if (-not (Test-GcloudResource @("compute","target-https-proxies","describe","kaana-web-https-proxy-classic","--global"))) {
    gcloud compute target-https-proxies create kaana-web-https-proxy-classic `
        --url-map=kaana-web-map-multi `
        --ssl-certificates=kaana-all-cert `
        --global | Out-Null
}
if (-not (Test-GcloudResource @("compute","target-http-proxies","describe","kaana-web-http-proxy-classic","--global"))) {
    gcloud compute target-http-proxies create kaana-web-http-proxy-classic `
        --url-map=kaana-web-map-redirect --global | Out-Null
}
if (-not (Test-GcloudResource @("compute","forwarding-rules","describe","kaana-web-https-forwarding","--global"))) {
    gcloud compute forwarding-rules create kaana-web-https-forwarding `
        --global --target-https-proxy=kaana-web-https-proxy-classic --ports=443 `
        --address=$StaticIpName | Out-Null
}
if (-not (Test-GcloudResource @("compute","forwarding-rules","describe","kaana-web-http-forwarding","--global"))) {
    gcloud compute forwarding-rules create kaana-web-http-forwarding `
        --global --target-http-proxy=kaana-web-http-proxy-classic --ports=80 `
        --address=$StaticIpName | Out-Null
}

Write-Host "==> Cloud DNS zone: $Domain"
if (-not (Test-GcloudResource @("dns","managed-zones","describe",$DnsZoneName))) {
    gcloud dns managed-zones create $DnsZoneName `
        --dns-name="$Domain." `
        --description="Kaana production DNS (Cloud DNS)" | Out-Null
}
$nameservers = gcloud dns managed-zones describe $DnsZoneName --format="value(nameServers)" 
$nameservers = $nameservers -split ";"

function Upsert-Dns {
    param([string]$Name, [string]$Type, [string[]]$Values, [int]$Ttl = 300)
    $exists = Test-GcloudResource @("dns","record-sets","list","--zone=$DnsZoneName","--name=$Name","--type=$Type")
    if ($exists) {
        gcloud dns record-sets update $Name --zone=$DnsZoneName --type=$Type --ttl=$Ttl --rrdatas=$Values | Out-Null
    } else {
        gcloud dns record-sets create $Name --zone=$DnsZoneName --type=$Type --ttl=$Ttl --rrdatas=$Values | Out-Null
    }
}

function Remove-Dns {
    param([string]$Name, [string]$Type)
    if (Test-GcloudResource @("dns","record-sets","list","--zone=$DnsZoneName","--name=$Name","--type=$Type")) {
        gcloud dns record-sets delete $Name --zone=$DnsZoneName --type=$Type --quiet | Out-Null
        Write-Host "  removed $Name ($Type)"
    }
}

# Explicit A records only — no *.kaana.in catch-all (keeps faralin.kaana.in free for reuse).
$dnsHosts = @(
    "www",
    "botiq", "app.botiq", "inbox.botiq", "api.botiq", "crm.botiq",
    "app", "inbox", "crm", "clinic", "api", "clinic-api",
    "aquafarm", "api.aquafarm",
    "dentacare", "ajithdentacare",
    "crm.dentacare", "crm.ajithdentacare",
    "dentacare.crm",
    "*.crm", "*.clinic"
)

Write-Host "==> DNS records (A, MX, TXT)"
Upsert-Dns -Name "$Domain." -Type "A" -Values @($lbIp)
foreach ($host in $dnsHosts) {
    Upsert-Dns -Name "$host.$Domain." -Type "A" -Values @($lbIp)
}
Remove-Dns -Name "*.$Domain." -Type "A"
Upsert-Dns -Name "$Domain." -Type "MX" -Values @("5 mx1.hostinger.com.", "10 mx2.hostinger.com.") -Ttl 14400
Upsert-Dns -Name "$Domain." -Type "TXT" -Values @(
    '"v=spf1 include:_spf.mail.hostinger.com ~all"',
    '"google-site-verification=g0TdWVENVM4oRTNEo_GeShfhg08r9zdJIf40sQYbyBw"'
) -Ttl 14400

Write-Host ""
Write-Host "Done."
Write-Host "  Load balancer IP: $lbIp"
Write-Host "  Cloud DNS zone:   $DnsZoneName"
Write-Host ""
Write-Host "Switch nameservers at Hostinger to:"
foreach ($ns in $nameservers) { Write-Host "  - $ns" }
Write-Host ""
Write-Host "After NS propagation (up to 48h), SSL certs will become ACTIVE."
Write-Host "Verify: gcloud compute ssl-certificates list --global"
