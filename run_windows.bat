@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Roadbook has not been set up yet.
  echo Run setup_windows.bat first.
  pause
  exit /b 1
)

call ".venv\Scripts\activate.bat"
python desktop_app.py
