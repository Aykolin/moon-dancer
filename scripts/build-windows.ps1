$ErrorActionPreference = "Stop"

if ($env:OS -ne "Windows_NT") {
  throw "Este comando deve ser executado no Windows."
}

$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
if ((Test-Path -LiteralPath $cargoBin) -and ($env:Path -notlike "*$cargoBin*")) {
  $env:Path = "$cargoBin;$env:Path"
}

foreach ($command in @("pnpm", "rustc", "cargo")) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Ferramenta ausente: $command. Instale os pre-requisitos do Tauri e abra um novo terminal."
  }
}

$vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
if (-not (Test-Path -LiteralPath $vswhere)) {
  throw "Visual Studio Build Tools nao foi encontrado. Instale o workload Desktop development with C++."
}

$visualStudio = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (-not $visualStudio) {
  throw "O componente MSVC C++ nao foi encontrado no Visual Studio Build Tools."
}

pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm tauri build --bundles nsis,msi --no-sign

$bundleDirectory = Join-Path $PSScriptRoot "..\src-tauri\target\release\bundle"
$tauriConfig = Get-Content (Join-Path $PSScriptRoot "..\src-tauri\tauri.conf.json") | ConvertFrom-Json
$versionMarker = "_$($tauriConfig.version)_"
$installers = Get-ChildItem -Path $bundleDirectory -Recurse -File |
  Where-Object { $_.Extension -in @(".exe", ".msi") -and $_.Name.Contains($versionMarker) }

if (-not $installers) {
  throw "A compilacao terminou sem encontrar instaladores Windows."
}

Write-Host "Instaladores gerados:"
$installers | ForEach-Object { Write-Host $_.FullName }
