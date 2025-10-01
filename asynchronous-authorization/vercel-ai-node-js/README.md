# 非同期承認フロー: Vercel AI SDK + Node.js

この CLI サンプルでは、Auth0 の非同期承認 (CIBA) を利用して、AI エージェントがバックグラウンドでタスクを進めつつ必要な時にユーザー承認を取得する方法を示します。

## 事前準備

- **Amazon Bedrock** の利用権限 (Claude 3 系モデルを推奨)。
- **Auth0** テナントと以下の設定:
  - CIBA 対応の Web アプリケーション (Grant Type: `CIBA` または `urn:openid:params:grant-type:ciba`)
  - `sample-stock-api` という識別子を持つ API (`stock:trade` パーミッションを追加)
  - Auth0 Guardian を用いたプッシュ通知 MFA と、登録済みのテストユーザー

## 環境変数の設定

`.env.example` を `.env.local` にコピーし、必要な値を入力します。ランタイムでは `.env` → `.env.local` の順に読み込まれ、後者で上書きされます。

```bash
# Auth0
AUTH0_DOMAIN="<auth0-domain>"
AUTH0_CLIENT_ID="<auth0-client-id>"
AUTH0_CLIENT_SECRET="<auth0-client-secret>"

# API
STOCK_API_URL=http://an-api-url
STOCK_API_AUDIENCE=sample-stock-api

# Amazon Bedrock
AWS_ACCESS_KEY_ID=xxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxx
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

既定の `.env.example` には OpenAI 用の変数が含まれています。Bedrock を利用する場合は `OPENAI_API_KEY` を削除し、Vercel AI SDK のモデル指定を Bedrock 用に更新してください。

## 実行手順

1. 依存関係をインストールします。

   ```bash
   npm install
   ```

2. サンプルを実行します。

   ```bash
   npm start
   ```

   実行すると Auth0 Guardian へ通知が送信されます。モバイル端末で承認し、コンソールに表示される実行結果を確認してください。

## ライセンス

Apache-2.0 ライセンスです。
