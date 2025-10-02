# Auth0 + Amazon Bedrock + LangChain.js チャットボットサンプル

Auth0 認証と Amazon Bedrock (ChatBedrockConverse) を使用した AI チャットボットのサンプルアプリケーションです。

## 機能

- ✅ Auth0 による認証
- ✅ Amazon Bedrock (ChatBedrockConverse) を使用した AI チャット
- ✅ LangGraph によるエージェント管理
- ✅ PostgreSQL + pgvector によるベクトル検索
- ✅ AWS Bearer Token 認証のサポート
- ✅ Reasoning model の推論過程フィルタリング
- ✅ 日本語対応

## 前提条件

- Node.js 18 以上
- Docker Desktop (PostgreSQL 用)
- AWS アカウント（Amazon Bedrock へのアクセス権限）
- Auth0 アカウント

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/authenticate-users/langchain-next-js
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成します：

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下の値を設定します：

#### Amazon Bedrock 設定

```bash
AWS_BEARER_TOKEN_BEDROCK="<your-bedrock-bearer-token>"
BEDROCK_REGION="us-east-1"
BEDROCK_CHAT_MODEL_ID="openai.gpt-oss-20b-1:0"
BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
```

**利用可能なモデル ID:**
- `openai.gpt-oss-20b-1:0` - OpenAI reasoning model（推奨）
- `anthropic.claude-3-haiku-20240307-v1:0` - Claude 3 Haiku
- `meta.llama3-70b-instruct-v1:0` - Llama 3

**注意:**
- `ChatBedrockConverse` を使用するため、モデル ID にはバージョンサフィックス（`:0` など）が必要です
- 使用するモデルへのアクセス権限が IAM ユーザーに付与されている必要があります

#### Auth0 設定

```bash
APP_BASE_URL="http://localhost:3000"
AUTH0_SECRET="<32文字以上のランダムな文字列>"
AUTH0_DOMAIN="https://<your-tenant>.auth0.com"
AUTH0_CLIENT_ID="<your-client-id>"
AUTH0_CLIENT_SECRET="<your-client-secret>"
```

**Auth0 セットアップ:**
1. [Auth0 Dashboard](https://manage.auth0.com/) でアプリケーションを作成
2. Application Type: **Regular Web Application** を選択
3. Settings → Allowed Callback URLs: `http://localhost:3000/api/auth/callback` を追加
4. Settings → Allowed Logout URLs: `http://localhost:3000` を追加

#### データベース設定

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_documents_db"
```

#### LangGraph 設定

```bash
LANGGRAPH_API_URL="http://localhost:54367"
LANGCHAIN_CALLBACKS_BACKGROUND=false
```

### 3. AWS IAM 権限の設定

Bearer Token 認証を使用するため、IAM ユーザーに以下の権限が必要です：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:CallWithBearerToken"
      ],
      "Resource": "*"
    }
  ]
}
```

詳細は [docs/aws-bedrock-setup.md](../../docs/aws-bedrock-setup.md) を参照してください。

### 4. PostgreSQL のセットアップ

Docker で pgvector 拡張を含む PostgreSQL を起動します：

```bash
npm run setup:docker
```

または手動で：

```bash
docker run --name auth0-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_documents_db \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

### 5. 依存関係のインストールとマイグレーション

```bash
npm run setup
```

または手動で：

```bash
npm install
npm run db:migrate
```

### 6. アプリケーションの起動

```bash
npm run all:dev
```

これで以下が起動します：
- Next.js 開発サーバー: http://localhost:3000
- LangGraph サーバー: http://localhost:54367

## 利用可能なコマンド

### 開発

```bash
npm run dev              # Next.js のみ起動
npm run langgraph:dev    # LangGraph のみ起動
npm run all:dev          # 両方を同時起動（推奨）
```

### セットアップ

```bash
npm run setup            # 依存関係インストール + DB マイグレーション
npm run setup:docker     # PostgreSQL (pgvector) を Docker で起動
```

### データベース

```bash
npm run db:migrate       # マイグレーション実行
npm run db:studio        # Drizzle Studio 起動
npm run db:generate      # マイグレーションファイル生成
npm run db:push          # スキーマを DB に直接適用
```

### ビルド・デプロイ

```bash
npm run build            # プロダクションビルド
npm run start            # プロダクションサーバー起動
npm run all:start        # LangGraph + Next.js をプロダクションモードで起動
```

### その他

```bash
npm run lint             # ESLint 実行
npm run format           # Prettier でフォーマット
```

## ディレクトリ構造

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   │   └── chat/       # LangGraph パススルー API
│   └── page.tsx        # メインページ
├── components/         # React コンポーネント
│   ├── chat-window.tsx           # チャット UI
│   ├── chat-message-bubble.tsx   # メッセージ表示（reasoning フィルタリング含む）
│   └── memoized-markdown.tsx     # Markdown レンダラー
└── lib/
    ├── agent.ts        # LangGraph エージェント定義
    └── db/            # データベース設定・マイグレーション
```

## トラブルシューティング

### 1. `bedrock:CallWithBearerToken` 権限エラー

```
AccessDeniedException: User is not authorized to perform: bedrock:CallWithBearerToken
```

**解決方法:** IAM ユーザーに `bedrock:CallWithBearerToken` 権限を追加してください。

### 2. モデル ID が無効

```
ValidationException: The provided model identifier is invalid
```

**解決方法:**
- モデル ID が正しいか確認してください
- バージョンサフィックス（`:0` など）が付いているか確認してください
- 例: `openai.gpt-oss-20b-1:0`

### 3. モデルへのアクセス権限がない

```
AccessDeniedException: You don't have access to the model with the specified model ID
```

**解決方法:**
- AWS コンソールで Bedrock のモデルアクセスをリクエストしてください
- Bearer Token に使用するモデルへのアクセス権限が付与されているか確認してください

### 4. PostgreSQL 接続エラー

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方法:**
- Docker Desktop が起動しているか確認
- PostgreSQL コンテナが起動しているか確認: `docker ps`
- 必要に応じて再起動: `docker start auth0-postgres`

### 5. Reasoning model の推論過程が表示される

デフォルトで推論過程（`reasoning_content`）はフィルタリングされます。もし表示される場合は、`src/components/chat-message-bubble.tsx` の `getContentAsString` 関数を確認してください。

## 技術スタック

- **フレームワーク:** Next.js 15.2.4
- **AI/LLM:**
  - Amazon Bedrock (ChatBedrockConverse)
  - LangChain.js 0.3.30
  - LangGraph 0.3.8
- **認証:** Auth0 (nextjs-auth0 4.4.2)
- **データベース:**
  - PostgreSQL with pgvector
  - Drizzle ORM 0.43.1
- **UI:**
  - React 19
  - Tailwind CSS
  - shadcn/ui コンポーネント

## セキュリティ

このサンプルでは以下のセキュリティ機能を実装しています：

- ✅ Auth0 による認証・認可
- ✅ AWS Bearer Token を使用した安全な Bedrock アクセス
- ✅ 環境変数によるシークレット管理
- ✅ API Routes でのサーバーサイド処理

## 参考リンク

- [Auth0 AI ドキュメント](https://auth0.com/ai/docs)
- [Amazon Bedrock ドキュメント](https://docs.aws.amazon.com/bedrock/)
- [LangChain.js ドキュメント](https://js.langchain.com/)
- [LangGraph ドキュメント](https://langchain-ai.github.io/langgraphjs/)
- [AWS Bedrock セットアップガイド](../../docs/aws-bedrock-setup.md)

## ライセンス

MIT License

## 作者

This project is built by [Deepu K Sasidharan](https://github.com/deepu105).

Modified to use Amazon Bedrock with Japanese language support.
