@echo off
echo ==========================================
echo       UPDATING BLOCKLICKAPP TO GITHUB
echo ==========================================
echo.

:: 1. הוספת כל השינויים ושמירה בגיט
echo [1/3] Saving changes to Git...
git add .
set /p commit_msg="Enter description for update: "
git commit -m "%commit_msg%"
git push origin main

:: 2. בניית האתר מחדש (Vite Build)
echo.
echo [2/3] Building website...
call npm run build

:: 3. העלאה ל-GitHub Pages
echo.
echo [3/3] Deploying to the web...
call npm run deploy

echo.
echo ==========================================
echo      SITE IS LIVE: https://Noam13-w.github.io/Blocklickapp/
echo ==========================================
echo.
pause