param (
    [switch]$InstallDeps = $false,
    [switch]$Docker = $false
)

function Stop-ProcessOnPort($port) {
    Write-Host "Checking for existing processes on port $port..." -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            try {
                $process = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($process) {
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
$dockerStatus = (docker info 2>&1)
if ($dockerStatus -match "error during connect") {
    Write-Host "Error: Docker Desktop is not running. Please start Docker and run this script again." -ForegroundColor Red
    exit
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
