@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.18 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist dist\index.html (
  echo The build is missing. Run npm.cmd ci and npm.cmd run build first.
  pause
  exit /b 1
)
echo.
echo PAPER ATELIER: http://127.0.0.1:4173/?sample=noodle
echo Keep this window open while previewing. Press Ctrl+C to stop.
echo.
node tools\preview.cjs
pause
