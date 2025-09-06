@echo off
echo ========================================
echo   DEPLOY KEY AUTO EXTENSION TO GITHUB
echo ========================================

echo [1/6] Cau hinh Git...
git config --global user.name "kabistarvn"
git config --global user.email "kabistarvn@gmail.com"

echo [2/6] Them remote origin...
git remote add origin https://github.com/kabistarvn/key-auto-extension-https-tokencursor.io.vn-app.git

echo [3/6] Them tat ca file...
git add .

echo [4/6] Commit changes...
git commit -m "Deploy key auto extension project"

echo [5/6] Push len GitHub...
git push origin main --force

echo [6/6] Hoan thanh!
echo Repository: https://github.com/kabistarvn/key-auto-extension-https-tokencursor.io.vn-app

echo.
echo ========================================
echo    DEPLOYMENT THANH CONG!
echo ========================================
pause