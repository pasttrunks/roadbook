@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Run setup_windows.bat first.
  pause
  exit /b 1
)

call ".venv\Scripts\activate.bat"
python -m pip install -r requirements.txt

pyinstaller --noconfirm --clean --onefile --windowed --name Roadbook --icon "roadbook.ico" ^
  --add-data "index.html;." ^
  --add-data "styles.css;." ^
  --add-data "app.js;." ^
  --add-data "roadbook.png;." ^
  desktop_app.py

if errorlevel 1 (
  echo.
  echo Build failed. Review the messages above.
  pause
  exit /b 1
)

echo.
echo Build complete: dist\Roadbook.exe
pause
