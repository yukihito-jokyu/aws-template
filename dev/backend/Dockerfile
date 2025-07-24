FROM python:3.11-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 作業ディレクトリ作成
WORKDIR /app

# ファイルをコピー
COPY ./ ./

# Pythonの依存関係をインストール
RUN uv sync --locked

# アプリケーションを起動
CMD ["uv", "run", "main.py"]

# 必要なポートを開放
EXPOSE 8080
