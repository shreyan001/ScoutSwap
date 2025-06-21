@echo off
echo.
echo ================================
echo Jupiter Social Trader Extension
echo ================================
echo.

echo 🔍 Checking extension files...

if not exist manifest.json (
    echo ❌ manifest.json not found
    goto :error
)

if not exist background.js (
    echo ❌ background.js not found
    goto :error
)

if not exist content.js (
    echo ❌ content.js not found
    goto :error
)

if not exist popup.html (
    echo ❌ popup.html not found
    goto :error
)

if not exist icons\ (
    echo ❌ icons folder not found
    goto :error
)

echo ✅ All core files present

echo.
echo 📋 Extension Structure:
echo ├── manifest.json (Main configuration)
echo ├── background.js (Service worker)
echo ├── content.js (Content script)
echo ├── content.css (Content styles)
echo ├── popup.html (Extension popup)
echo ├── popup.js (Popup logic)
echo ├── popup.css (Popup styles)
echo ├── ocr-worker.js (OCR worker)
echo ├── test-page.html (Testing page)
echo └── icons/ (Extension icons)

echo.
echo 🚀 Ready to load in Chrome!
echo.
echo 📝 Loading Instructions:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" (top right toggle)
echo 3. Click "Load unpacked" button
echo 4. Select this folder: %cd%
echo 5. Extension will appear in toolbar
echo.
echo 🎯 Testing:
echo 1. Open test-page.html in Chrome
echo 2. Try right-clicking on crypto text
echo 3. Press Ctrl+Shift+L for lens mode
echo 4. Click extension icon for popup
echo.
echo ✅ Jupiter Social Trader is ready!
echo    Universal DeFi trading assistant
echo    Works on all social platforms
echo.
goto :end

:error
echo.
echo ❌ Extension setup incomplete
echo Please ensure all files are present
echo.

:end
pause
