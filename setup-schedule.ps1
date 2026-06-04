# setup-schedule.ps1
# ONE-TIME setup. Registers a Windows Task Scheduler job that runs the JPC suite
# (all regions) every day at 7:00 AM by invoking run-daily.ps1.
#
# Usage: open an *Administrator* PowerShell, cd into the project folder, then:
#     .\setup-schedule.ps1
# Re-running is safe — it overwrites the existing task (-Force).

# Register-ScheduledTask requires elevation. Fail fast with a clear message if not admin.
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Run this as Administrator: right-click PowerShell > 'Run as administrator', then re-run .\setup-schedule.ps1"
    exit 1
}

# Resolve run-daily.ps1 sitting next to this script (works on any machine, no path editing).
$here       = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }
$scriptPath = Join-Path $here 'run-daily.ps1'
if (-not (Test-Path $scriptPath)) {
    Write-Error "Cannot find run-daily.ps1 at '$scriptPath'. Keep setup-schedule.ps1 in the same folder as run-daily.ps1."
    exit 1
}

$action  = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 6:00PM
Register-ScheduledTask -TaskName 'PureVantage Execution' `
  -Action $action -Trigger $trigger `
  -Description 'Runs PureVantage Playwright suite daily' -Force

Write-Host "Scheduled task 'Playwright' created - runs daily at 6:00 PM." -ForegroundColor Green
Write-Host "Target: $scriptPath"
