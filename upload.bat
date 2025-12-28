@echo off
echo ==========================================
echo       UPDATING BLOCKLICK TO GITHUB
echo ==========================================
echo.

:: 1. שמירת הקוד בגיטהאב
echo [1/3] Saving code changes...
git add .
set /p commit_msg="Enter description for update: "
git commit -m "%commit_msg%"
git push -u origin main

:: 2. בניית האתר
echo.
echo [2/3] Building website...
call npm run build

:: 3. העלאה לאוויר
echo.
echo [3/3] Deploying to GitHub Pages...
call npm run deploy

echo.
echo ==========================================
echo      SITE IS LIVE: https://Noam13-w.github.io/blocklick/
echo ==========================================
echo.
pause