@echo off
echo Adding remote origin...
git remote add origin https://github.com/kabistarvn/key-auto-extension-https-tokencursor.io.vn-app.git

echo Checking remote...
git remote -v

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Deploy key auto extension project"

echo Pushing to GitHub...
git push -u origin main

echo Deployment completed!
pause
