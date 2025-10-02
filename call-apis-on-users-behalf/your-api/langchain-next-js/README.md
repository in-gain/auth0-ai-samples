## ユーザーに代わってAPIを呼ぶ: Your API サンプル

このサンプルは、**認証されたユーザーのアクセストークンを使用して、自分のAPI（Auth0の/userinfoエンドポイント）を呼び出す**方法を示します。

### このサンプルが行うこと

このプロジェクトは、「ユーザーに代わってAPIを呼ぶ」の最も基本的な形を示します：

- ✅ Auth0でユーザー認証
- ✅ ユーザーのアクセストークンを使用してAuth0の`/userinfo`エンドポイントを呼び出し
- ✅ ユーザーの認証情報を保存せずに安全なAPI呼び出しを実現

### 主な機能

1. **ユーザー情報取得ツール**: AIアシスタントがログイン中のユーザーのAuth0プロファイル（名前、メールなど）から情報を取得できます
2. **計算機**: デモンストレーション用の基本的な計算機能

### authenticate-usersとの違い

- **authenticate-users**: 認証のみ - ユーザーに代わってAPIを呼び出さない
- **your-api**（このプロジェクト）: 認証 + ユーザーのトークンでAuth0 APIを呼び出す ✅

## 🚀 セットアップ手順

### 前提条件

- Node.js 18以上
- Auth0アカウント
- Amazon Bedrockへのアクセス権を持つAWSアカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-assistant0.git
cd auth0-assistant0/call-apis-on-users-behalf/your-api/langchain-next-js
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
AUTH0_SECRET="<ランダムな32文字の文字列>"  # 生成: openssl rand -hex 32
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_DOMAIN="https://YOUR_DOMAIN.auth0.com"
AUTH0_CLIENT_ID="<your-client-id>"
AUTH0_CLIENT_SECRET="<your-client-secret>"
```

**Auth0セットアップ手順:**
1. [Auth0ダッシュボード](https://manage.auth0.com/)にアクセス
2. 新しいApplicationを作成 → 「Regular Web Applications」を選択
3. Settings内で設定:
   - **Allowed Callback URLs**に`http://localhost:3000/api/auth/callback`を追加
   - **Allowed Logout URLs**に`http://localhost:3000`を追加
   - **Allowed Web Origins**に`http://localhost:3000`を追加

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

# オプション - PostgreSQLデータベースを起動
docker compose up -d

# オプション - データベーススキーマを作成
npm run db:migrate
```

またはセットアップスクリプトを使用：

```bash
npm run setup
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

Auth0でログイン後、AIに以下のように質問してみてください：

- "私の情報を教えて"
- "私のメールアドレスは？"
- "ログインしているユーザー名は？"

AIは`getUserInfoTool`を使用して、あなたのアクセストークンでAuth0の`/userinfo`エンドポイントを呼び出し、プロファイル情報を取得します。

## 動作の仕組み

### ユーザー情報ツールの実装

このツール（`src/lib/tools/user-info.ts`）は以下を行います：

1. エージェント設定からユーザーのアクセストークンを受け取る
2. `https://{AUTH0_DOMAIN}/userinfo`に認証済みリクエストを送信
3. ユーザーのプロファイル情報を返す

```typescript
const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

これが、ユーザーに代わって任意のAPIを呼び出すための基礎となります！

## 詳細情報

- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)
- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)

## 技術スタック

- エージェントワークフロー構築のための[LangChain.js](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
- 安全な認証のための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- Next.js 15 + React 19
- LLMとしてAmazon Bedrock

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
