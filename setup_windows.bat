@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Creating a lightweight local Python environment...
  py -m venv .venv
  if errorlevel 1 python -m venv .venv
)

call ".venv\Scripts\activate.bat"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
  echo.
  echo Setup failed. Make sure Python 3.11 or newer is installed.
  pause
  exit /b 1
)

python desktop_app.py
