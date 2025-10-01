# 非同期承認フロー: Vercel AI SDK + Next.js

このサンプルは、Auth0 のトークン ボールトと Vercel AI SDK を組み合わせて、ユーザーからの追加承認が必要なタスクを安全に実行する方法を示します。AI エージェントはバックグラウンドで処理を進め、必要なタイミングで Auth0 Guardian によるプッシュ通知を送信します。

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/asynchronous-authorization/vercel-ai-next-js
```

### 2. 環境変数の準備

`.env.example` を `.env.local` にコピーし、以下の値を設定します。`.env` が存在する場合は `.env` → `.env.local` の順に読み込まれ、`.env.local` の値で上書きされます。

- Auth0 ドメイン、CIBA 用アプリケーションのクライアント情報
- サンプル API (`Sample Stock API`) のオーディエンスやエンドポイント
- Amazon Bedrock を利用する場合の AWS 資格情報とモデル ID

```bash
AWS_ACCESS_KEY_ID=xxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxx
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

既定では OpenAI を利用する `OPENAI_API_KEY` を参照します。Bedrock の Claude モデルに切り替える場合は、Vercel AI SDK のモデル指定を Bedrock 用に構成してください。

### 3. 依存関係のインストール

```bash
bun install
```

または `npm install` でも実行できます。

### 4. 開発サーバーの起動

```bash
bun dev
```

または `npm run dev` を使用してください。サーバーは既定で `http://localhost:3000` をリッスンします。

## 補足

- `drizzle.config.ts` や FGA クライアント初期化コードは `.env.local` を優先して読み込みます。共有用の `.env` とローカルの秘密情報を分けられます。
- Auth0 Guardian のプッシュ通知を受け取るため、テストユーザーを MFA に登録しておいてください。

## ライセンス

Apache-2.0 ライセンスです。詳細は [LICENSE](LICENSE) を参照してください。
