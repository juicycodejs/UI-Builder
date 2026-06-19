@echo off
SET PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "C:\Users\aksha\OneDrive\Documents\UI builder\apps\frontend"
node node_modules\vite\bin\vite.js --port 3000
