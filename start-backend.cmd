@echo off
SET PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "C:\Users\aksha\OneDrive\Documents\UI builder\apps\backend"
node_modules\.bin\tsx.CMD src/index.ts
