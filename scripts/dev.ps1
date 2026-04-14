param (
    [switch]$InstallDeps = $false,
    [switch]$Docker = $false
)

# Ensure the script runs from the project root (parent of 'scripts' folder)
$RootPath = Join-Path $PSScriptRoot ".."
Set-Location -Path $RootPath

function Stop-ProcessOnPort($port) {
    Write-Host "Checking for existing processes on port $port..." -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            if ($p -eq 0 -or $p -eq 4) {
                Write-Warning "System process (PID: ${p}) holds port ${port}. Skipping..."
                continue
            }
            try {
                $process = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($process) {
                    if ($process.Name -match "docker" -or $process.Name -eq "wslrelay") {
                        Write-Warning "System or Docker Process ($($process.Name), PID: ${p}) holds port ${port}. Skipping..."
                        continue
                    }
                    Write-Host "Stopping process $($process.Name) (PID: ${p}) on port ${port}..." -ForegroundColor Yellow
                    Stop-Process -Id $p -Force
                }
            } catch {
                Write-Warning "Could not stop process with PID ${p}: $($_.Exception.Message)"
            }
        }
    }
}

Write-Host "Initializing ProspectOS Local Dev Environment..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file is missing. Please create it from .env.example before running this script." -ForegroundColor Red
    exit
}

# Cleanup existing ports to prevent conflicts
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 8000

# Check if Docker is running
$dockerStatus = (docker info 2>&1) | Out-String
if ($dockerStatus -match "error during connect" -or $dockerStatus -match "Le fichier(.)*introuvable") {
    Write-Host "Docker Desktop is not running. Attempting to start it..." -ForegroundColor Yellow
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "Waiting for Docker to initialize (this may take up to 2 minutes)..." -ForegroundColor Gray
        $timeout = 120
        while ($timeout -gt 0) {
            $check = (docker info 2>&1) | Out-String
            if ($check -notmatch "error during connect" -and $check -notmatch "introuvable") {
                Write-Host "Docker is now ready!" -ForegroundColor Green
                break
            }
            Write-Host "." -NoNewline -ForegroundColor Gray
            Start-Sleep -Seconds 5
            $timeout -= 5
        }
        if ($timeout -le 0) {
            Write-Host "`nError: Docker timed out. Please check Docker Desktop manually." -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "Error: Docker Desktop is not running and could not be found at $dockerPath." -ForegroundColor Red
        exit
    }
}

if ($InstallDeps) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location -Path "frontend"
    npm install
    Set-Location -Path ".."
}

# Decide which services to start via Docker
if ($Docker) {
    Write-Host "Starting all services in Docker (including Frontend)..." -ForegroundColor Yellow
    docker-compose up -d
} else {
    Write-Host "Starting core services in Docker (Postgres, Redis, Backend, Worker, Mailhog)..." -ForegroundColor Yellow
    # Explicitly exclude frontend if running locally
    docker-compose up -d postgres redis backend worker mailhog
}

Write-Host "Waiting for database to initialize (5s)..."
Start-Sleep -Seconds 5

Write-Host "Running backend migrations..." -ForegroundColor Yellow
# Run migrations using the compose run command
# docker-compose run backend alembic upgrade head
Write-Host "(Migrations step skipped, uncomment above to run if alembic setup is fully complete)" -ForegroundColor DarkGray

if (-not $Docker) {
    Write-Host "Starting Frontend Locally (Next.js)..." -ForegroundColor Yellow
    Start-Process "powershell" -ArgumentList "-NoExit -Command cd frontend; npm run dev"
    Write-Host "Frontend running at: http://localhost:3000"
} else {
    Write-Host "Frontend running in Docker at: http://localhost:3000"
}

Write-Host "Local dev environment is up!" -ForegroundColor Green
Write-Host "Backend API running at: http://localhost:8000"
Write-Host "Services running via Docker."

exit 0
