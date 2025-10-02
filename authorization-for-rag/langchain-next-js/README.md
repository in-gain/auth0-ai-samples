## RAGにおける認可: ドキュメントへの細かいアクセス制御

このサンプルは、**Retrieval-Augmented Generation (RAG)における認可**を、Auth0 FGA（Fine-Grained Authorization）を使用してドキュメントレベルで細かくアクセス制御する方法を示します。

### このサンプルが行うこと

このプロジェクトは、ユーザーが権限を持つドキュメントのみにアクセスできるようにすることで、RAGシステムを安全にする方法を示します：

- ✅ Auth0でユーザー認証
- ✅ ベクトル埋め込みとともにPostgreSQLにドキュメントを保存
- ✅ **Auth0 FGAを使用してドキュメントレベルの権限を強制**
- ✅ AIは認可されたドキュメントのみをコンテキストとして取得

### このサンプルが解決する問題

一般的なRAG実装では、AIがデータベースから**あらゆる**ドキュメントを取得して使用する可能性があり、権限のないユーザーに機密情報を公開してしまう恐れがあります。このサンプルは以下によってそれを防ぎます：

1. ドキュメント取得前にユーザー権限をチェック
2. FGA認可ルールに基づいて検索結果をフィルタリング
3. AIがユーザーがアクセスできるドキュメントのみを見られるようにする

### 主な機能

1. **認可付きコンテキストドキュメントツール**: データベースからドキュメントを取得しますが、ユーザーが権限を持つものだけ
2. **Auth0 FGA統合**: ドキュメントアクセス制御のための細かい認可モデル
3. **ドキュメントアップロードと管理**: ユーザーはドキュメントをアップロードし、誰がアクセスできるかを制御できます
4. **pgvectorによるベクトル検索**: 認可されたドキュメントのみを対象としたセマンティック検索

## 🚀 セットアップ手順

### 前提条件

- Node.js 18以上
- Auth0アカウント
- Auth0 FGAアカウント（[dashboard.fga.dev](https://dashboard.fga.dev)で作成）
- Amazon Bedrockへのアクセス権を持つAWSアカウント
- pgvector拡張機能付きPostgreSQL

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-assistant0.git
cd auth0-assistant0/authorization-for-rag/langchain-next-js
```

### 2. 環境変数の設定

`.env.example`を`.env.local`にコピー：

```bash
cp .env.example .env.local
```

`.env.local`を編集して以下を追加：

#### Amazon Bedrock設定

```bash
AWS_BEARER_TOKEN_BEDROCK="<your-bedrock-bearer-token>"
BEDROCK_REGION="us-east-1"
BEDROCK_CHAT_MODEL_ID="anthropic.claude-3-5-sonnet-20241022-v1:0"
BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
```

#### Auth0設定

```bash
AUTH0_SECRET="<ランダムな32文字の文字列>"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="https://YOUR_DOMAIN.auth0.com"
AUTH0_CLIENT_ID="<your-client-id>"
AUTH0_CLIENT_SECRET="<your-client-secret>"
```

#### Auth0 FGA設定

```bash
FGA_STORE_ID="<your-fga-store-id>"
FGA_CLIENT_ID="<your-fga-client-id>"
FGA_CLIENT_SECRET="<your-fga-client-secret>"
FGA_API_URL="https://api.us1.fga.dev"  # またはリージョンに応じたURL
```

**FGAセットアップ手順:**
1. [FGAダッシュボード](https://dashboard.fga.dev)にアクセス
2. 新しいStoreを作成
3. Store ID、Client ID、Client Secret、API URLをコピー
4. FGAモデルを初期化: `npm run fga:init`

#### データベース設定

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_documents_db"
```

#### LangGraph設定

```bash
LANGGRAPH_API_URL="http://localhost:54367"
```

### 3. 依存関係のインストールとデータベース初期化

```bash
npm install

# pgvector付きPostgreSQLを起動
docker compose up -d

# データベーススキーマを作成
npm run db:migrate

# FGA認可モデルを初期化
npm run fga:init
```

またはセットアップスクリプトを使用：

```bash
npm run setup
npm run fga:init
```

### 4. 開発サーバーの起動

```bash
npm run all:dev
```

以下が起動します：
- **LangGraphサーバー**: http://localhost:54367
- **Next.jsサーバー**: http://localhost:3000

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください！

### 5. 試してみる

1. **Auth0でログイン**
2. **ドキュメントをアップロード**: Documentsページに移動してPDFまたはテキストファイルをアップロード
3. **権限を設定**: 各ドキュメントに誰がアクセスできるかを制御（オーナーのみまたは共有）
4. **質問をする**: チャットでドキュメントについて質問

AIは、回答生成時にあなたが権限を持つドキュメントのみを使用します！

#### 質問例:

- "アップロードしたドキュメントの内容を教えて"
- "プロジェクトの概要は？"

## 動作の仕組み

### 認可フロー

1. ユーザーが質問をする
2. AIがドキュメントコンテキストが必要だと判断
3. `getContextDocumentsTool`が呼び出される
4. **FGAが各ドキュメントに対するユーザーの権限をチェック**
5. 認可されたドキュメントのみが取得・埋め込まれる
6. 認可されたドキュメントのみを対象にベクトル類似度検索
7. 関連するコンテキストがAIに提供される
8. AIは認可された情報のみに基づいて回答を生成

### FGA認可モデル

FGAモデルは以下のような関係を定義します：

```
user:alice can view document:project-plan
user:bob can edit document:budget-2024
```

これにより、誰が何にアクセスできるかの細かい制御が可能になります。

## 詳細情報

- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)
- [Auth0 FGAドキュメント](https://docs.fga.dev/)
- [Authorization for RAG](https://auth0.com/blog/authorization-for-rag)

## 技術スタック

- エージェントワークフロー構築のための[LangChain.js](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
- 安全な認証のための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- 細かい認可のための[Auth0 FGA](https://fga.dev/)
- ベクトル保存と検索のためのPostgreSQL + pgvector
- Next.js 15 + React 19
- LLMとしてAmazon Bedrock

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
