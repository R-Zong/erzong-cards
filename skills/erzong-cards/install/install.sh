#!/usr/bin/env bash
# 二宗卡片：安装出图引擎（Mac / Linux，只需要装一次）
set -e
cd "$(dirname "$0")/../engine"
if ! command -v node >/dev/null 2>&1; then
  echo "没有找到 Node.js。请先到 https://nodejs.org 下载安装 LTS 版本。"; exit 1
fi
REG=""
if [ "${ERZONG_CN_MIRROR:-}" = "1" ]; then REG="--registry=https://registry.npmmirror.com"; fi
npm install $REG
echo "安装好了。出图会用本机的 Chrome（Mac）或 Chromium；没有的话运行：npx playwright install chromium"
