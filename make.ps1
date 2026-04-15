<#
.SYNOPSIS
    A lightweight PowerShell wrapper for the ProspectOS Makefile commands.
    Usage: ./make.ps1 <command>
#>

param (
    [Parameter(Mandatory=$false, Position=0)]
    [string]$Command
)

switch ($Command) {
    "dev" {
        & "./scripts/dev.ps1"
    }
    "test" {
        Write-Host "Running all tests..." -ForegroundColor Yellow
        docker-compose run --rm backend pytest
    }
    "migrate" {
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        docker-compose run --rm backend alembic upgrade head
    }
    "lint" {
        Write-Host "Running linters..." -ForegroundColor Yellow
        # Basic check for now, can be expanded
        Write-Host "Checking backend..."
        docker-compose run --rm backend ruff check .
        Write-Host "Checking frontend..."
        Set-Location frontend
        npm run lint
        Set-Location ..
    }
    "shell-backend" {
        docker-compose exec backend bash
    }
    "shell-db" {
        docker-compose exec postgres psql -U outreach
    }
    default {
        if ($Command) {
            Write-Host "Unknown command: $Command" -ForegroundColor Red
        }
        Write-Host "Available commands:" -ForegroundColor Cyan
        Write-Host "  dev            - Start full dev environment"
        Write-Host "  test           - Run all tests"
        Write-Host "  migrate        - Run database migrations"
        Write-Host "  lint           - Run linters (ruff + eslint)"
        Write-Host "  shell-backend  - Bash inside backend container"
        Write-Host "  shell-db       - Psql into postgres"
    }
}
