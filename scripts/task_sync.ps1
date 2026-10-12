param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("create", "close", "list", "get")]
    [string]$Action,

    [Parameter(Mandatory=$false)]
    [string]$Title = "",

    [Parameter(Mandatory=$false)]
    [string]$Body = "",

    [Parameter(Mandatory=$false)]
    [string[]]$Labels = @(),

    [Parameter(Mandatory=$false)]
    [int]$IssueNumber = 0,

    [Parameter(Mandatory=$false)]
    [string]$Comment = ""
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Get Token from env or git credential
$token = $env:GH_TOKEN
if (-not $token) {
    $cred = "protocol=https`nhost=github.com" | git credential fill
    $tokenLine = ($cred -split "`n" | Where-Object { $_ -match "^password=(.*)$" })
    if ($tokenLine -match "^password=(.*)$") {
        $token = $matches[1].Trim()
    }
}

if (-not $token) {
    Write-Error "GitHub token could not be resolved from GH_TOKEN or git credential manager."
    exit 1
}

$repo = "ikeda-haruka/protein"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/vnd.github+json"
    "User-Agent"    = "Antigravity-Agent"
}

switch ($Action) {
    "create" {
        if (-not $Title) {
            Write-Error "-Title is required for create action."
            exit 1
        }
        $postData = @{
            title  = $Title
            body   = $Body
            labels = $Labels
        } | ConvertTo-Json -Depth 5

        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($postData)) -ContentType "application/json; charset=utf-8"
        Write-Output "SUCCESS: Created Issue #$($res.number)"
        Write-Output "URL: $($res.html_url)"
        Write-Output "ISSUE_NUMBER=$($res.number)"
    }

    "close" {
        if ($IssueNumber -le 0) {
            Write-Error "-IssueNumber is required for close action."
            exit 1
        }
        if ($Comment) {
            $commentData = @{ body = $Comment } | ConvertTo-Json
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$IssueNumber/comments" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($commentData)) -ContentType "application/json; charset=utf-8" | Out-Null
        }
        $patchData = @{ state = "closed" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$IssueNumber" -Method Patch -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($patchData)) -ContentType "application/json; charset=utf-8"
        Write-Output "SUCCESS: Closed Issue #$($res.number)"
        Write-Output "URL: $($res.html_url)"
    }

    "list" {
        $issues = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues?state=all&per_page=20" -Method Get -Headers $headers
        $issues | Select-Object number, title, state, html_url | Format-Table -AutoSize
    }

    "get" {
        if ($IssueNumber -le 0) {
            Write-Error "-IssueNumber is required for get action."
            exit 1
        }
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$IssueNumber" -Method Get -Headers $headers
        Write-Output "Issue #$($res.number): $($res.title) [$($res.state)]"
        Write-Output "URL: $($res.html_url)"
        Write-Output "Body:"
        Write-Output $res.body
    }
}
