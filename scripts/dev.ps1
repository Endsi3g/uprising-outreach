param (
    [switch]$InstallDeps = $false
)

Write-Host "Initializing ProspectOS Local Dev Environment..." -ForegroundColor Cyan

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

    Write-Host "Installing backend dependencies (using pip in venv or pipx)..." -ForegroundColor Yellow
    # Here you'd run pip install or any backend dependency resolution if local rather than Docker-based
}

Write-Host "Starting Docker containers in the background..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for database to initialize (5s)..."
Start-Sleep -Seconds 5

Write-Host "Running backend migrations..." -ForegroundColor Yellow
# Run migrations using the compose run command
# docker-compose run backend alembic upgrade head
Write-Host "(Migrations step skipped, uncomment above to run if alembic setup is fully complete)" -ForegroundColor DarkGray

# Ensure frontend dependencies are installed
if (-Not (Test-Path "frontend\node_modules")) {
    Write-Host "Frontend dependencies missing. Installing now..." -ForegroundColor Cyan
    Set-Location -Path "frontend"
    npm install
    Set-Location -Path ".."
}

Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process "powershell" -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Write-Host "Local dev environment is up!" -ForegroundColor Green
Write-Host "Opening dashboards and docs..." -ForegroundColor Yellow

# Auto-open browser tabs
Start-Process "http://localhost:3000"                       # Frontend
Start-Process "http://localhost:8000/api/docs"                # Backend Docs
Start-Process "http://localhost:8025"                       # Mailhog
Start-Process "http://localhost:3001/d/fastapi-obs/fastapi-observability?orgId=1&refresh=5s" # Grafana
Start-Process "http://localhost:9090"                       # Prometheus

Write-Host "Frontend running at: http://localhost:3000"
Write-Host "Backend API running at: http://localhost:8000"
Write-Host "Grafana running at: http://localhost:3001"
Write-Host "Services running via Docker."

exit 0
