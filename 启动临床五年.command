#!/bin/bash
# 双击本文件即可在本地启动《临床五年》，不需要 GitHub。
set -u

cd "$(dirname "$0")" || exit 1

# 双击 .command 时的 PATH 可能比终端里短，补充常见 Node 安装位置。
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
URL="http://127.0.0.1:5173/"
PORT="5173"

pause_and_exit() {
  echo
  echo "$1"
  echo
  read -r -n 1 -s -p "按任意键关闭这个窗口……"
  echo
  exit 1
}

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  pause_and_exit "没有找到 Node.js/npm。请先安装 Node.js，然后再双击本文件。"
fi

if [ ! -x "./node_modules/.bin/vite" ]; then
  echo "首次运行：正在安装游戏依赖，请稍候……"
  npm install || pause_and_exit "依赖安装失败。请检查网络后重试。"
fi

# 如果游戏服务器已经在运行，直接打开浏览器，不再启动第二个。
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "检测到本地游戏服务器已经在运行，正在打开浏览器……"
  open "$URL"
  echo
  echo "游戏地址：$URL"
  echo "这个窗口可以直接关闭，已有服务器会继续运行。"
  exit 0
fi

LOG_FILE="/tmp/clinical-five-years-local.log"
echo "正在启动《临床五年》本地服务器……"
./node_modules/.bin/vite --host 127.0.0.1 --port "$PORT" >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

cleanup() {
  # Vite may spawn a child in some Node versions; make sure both stop.
  pkill -P "$SERVER_PID" >/dev/null 2>&1 || true
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup INT TERM HUP EXIT

READY=0
for _ in $(seq 1 80); do
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    break
  fi
  if curl -fsS "$URL" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.25
done

if [ "$READY" -ne 1 ]; then
  echo
  echo "启动失败，下面是日志："
  cat "$LOG_FILE" 2>/dev/null || true
  pause_and_exit "请查看上面的错误信息。"
fi

open "$URL"

echo
echo "=============================================="
echo " 《临床五年》已经启动"
echo " 游戏地址：$URL"
echo " 浏览器没有自动打开的话，手动复制上面的地址。"
echo
echo " 关闭这个终端窗口或按 Ctrl+C 即可停止本地服务器。"
echo "=============================================="
echo

wait "$SERVER_PID"
