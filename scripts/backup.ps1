param([string]$Dest = "$env:USERPROFILE\wedora-backup")
# Mirrors source (not node_modules/.next) to a folder OUTSIDE OneDrive/git so work can't be lost.
$src = Split-Path -Parent $PSScriptRoot
robocopy $src $Dest /MIR /XD node_modules .next .next-build .git coverage /XF *.tsbuildinfo /NFL /NDL /NJH /NJS /NP | Out-Null
"Backed up to $Dest at $(Get-Date -Format s)"
