@echo off
chcp 65001 >nul
cd /d "%~dp0..\engine"
echo 二宗卡片：安装出图引擎（只需要装一次）
where node >nul 2>nul
if errorlevel 1 (
  echo 没有找到 Node.js。请先到 https://nodejs.org 下载安装 LTS 版本，装好后再双击本文件。
  pause
  exit /b 1
)
call npm install --registry=https://registry.npmmirror.com
if errorlevel 1 (
  echo 安装失败，请把上面的报错截图发给我们。
  pause
  exit /b 1
)
echo.
echo 安装好了。出图会用 Windows 自带的 Edge 浏览器，不需要另外下载。
pause
