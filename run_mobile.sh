#!/usr/bin/env bash
# ==============================================================================
# スマホ接続用ローカルサーバー起動スクリプト (QRコード表示機能付き)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=8080
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

# Wi-Fi / ローカルIPアドレスの取得
LOCAL_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | grep -v '^172\.' | head -n 1)

if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="localhost"
fi

MOBILE_URL="http://${LOCAL_IP}:${PORT}"

echo "======================================================================"
echo "  ゲームBGMスクリプトコンポーザー (スマホ接続モード)"
echo "======================================================================"
echo ""
echo "  [1] スマホをPCと同じWi-Fiに接続してください。"
echo "  [2] スマホのカメラで以下のQRコードをスキャンするか、"
echo "      ブラウザで以下のURLを開いてください:"
echo ""
echo "      URL: ${MOBILE_URL}"
echo ""
echo "----------------------------------------------------------------------"

# PythonでターミナルにQRコードをASCII表示
python3 -c "
import qrcode
qr = qrcode.QRCode(border=1)
qr.add_data('${MOBILE_URL}')
qr.make(fit=True)
qr.print_ascii(invert=True)
" || true

echo "----------------------------------------------------------------------"
echo "  サーバーを停止するには [Ctrl + C] を押してください。"
echo "======================================================================"
echo ""

# 全ネットワークインターフェース (0.0.0.0) でリッスン
python3 -m http.server "$PORT" --bind 0.0.0.0
