# Node.jsイメージ
FROM node:22

# 作業ディレクトリ作成
WORKDIR /app

# ソースコードコピー
COPY . /app

RUN cd /app \
    && npm install \
    && npm run build


# React開発サーバー起動
CMD ["npm", "run", "dev"]

EXPOSE 5173
