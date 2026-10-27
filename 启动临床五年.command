#!/bin/bash
# 双击本文件即可在本地启动《临床五年》，不需要 GitHub。
# 启动后：Ctrl+R = 停止并重启本地服务器；Ctrl+C = 停止并退出。
set -u

cd "$(dirname "$0")" || exit 1

# 双击 .command 时的 PATH 可能比终端里短，补充常见 Node 安装位置。
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
URL="http://127.0.0.1:5173/"
PORT="5173"
LOG_FILE="/tmp/clinical-five-years-local.log"
SERVER_PID=""
TTY_STATE=""

pause_and_exit() {
  echo
  echo "$1"
  echo
  read -r -n 1 -s -p "按任意键关闭这个窗口……"
  echo
  exit 1
}

cleanup() {
  if [ -n "${TTY_STATE:-}" ]; then
    stty "$TTY_STATE" 2>/dev/null || true
    TTY_STATE=""
  fi
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    # Vite may spawn a child in some Node versions; make sure both stop.
    pkill -P "$SERVER_PID" >/dev/null 2>&1 || true
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  SERVER_PID=""
}

trap 'cleanup; exit 0' INT TERM HUP
trap cleanup EXIT

read_control_key() {
  KEY=""
  local saved
  saved=$(stty -g 2>/dev/null) || {
    # Non-interactive fallback; normal double-click always has a TTY.
    read -r -n 1 -s -t 1 KEY
    return $?
  }
  TTY_STATE="$saved"
  stty -icanon -echo min 1 time 0 2>/dev/null || {
    stty "$saved" 2>/dev/null || true
    TTY_STATE=""
    return 1
  }
  if read -r -n 1 -t 1 KEY; then
    stty "$saved" 2>/dev/null || true
    TTY_STATE=""
    return 0
  fi
  stty "$saved" 2>/dev/null || true
  TTY_STATE=""
  return 1
}

start_server() {
  : >"$LOG_FILE"
  ./node_modules/.bin/vite --host 127.0.0.1 --port "$PORT" >"$LOG_FILE" 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 100); do
    if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      return 1
    fi
    if curl -fsS "$URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.2
  done
  return 1
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

echo "正在启动《临床五年》本地服务器……"
if ! start_server; then
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
echo " 按 Ctrl+R（或直接按 R）停止并重新启动服务器"
echo " 按 Ctrl+C 停止服务器并退出"
echo "=============================================="
echo
echo "等待操作中……"

# Keep the server in the background so the terminal can listen for Ctrl+R.
while :; do
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo
    echo "本地服务器已经停止。"
    echo "最近日志："
    tail -20 "$LOG_FILE" 2>/dev/null || true
    pause_and_exit "按任意键关闭这个窗口。"
  fi

  if read_control_key; then
    case "$KEY" in
      $'\022'|r|R)
        echo
        echo "正在停止本地服务器……"
        cleanup
        sleep 0.2
        echo "正在重新启动本地服务器……"
        if start_server; then
          echo "服务器已重新启动：$URL"
          echo "浏览器没有自动恢复的话，刷新一下页面即可。"
          echo
          echo "等待操作中……"
        else
          echo
          echo "重新启动失败，下面是日志："
          cat "$LOG_FILE" 2>/dev/null || true
          pause_and_exit "请查看上面的错误信息。"
        fi
        ;;
      $'\003')
        echo
        echo "正在停止本地服务器……"
        cleanup
        exit 0
        ;;
    esac
  fi
done
