@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.18 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist dist\index.html (
  echo Run npm.cmd ci and npm.cmd run build first.
  pause
  exit /b 1
)
echo STORYBOOK STREET: http://127.0.0.1:4173/?sample=street
echo Keep this window open. Press Ctrl+C to stop.
node tools\preview.cjs
pause
