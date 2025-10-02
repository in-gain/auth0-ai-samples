# Assistant0: Auth0で保護されたAIパーソナルアシスタント

Assistant0は、複数のツールに動的にアクセスすることで、あなたのデジタルライフを統合し、整理された効率的な生活をサポートするAIパーソナルアシスタントです。以下のような機能を実装できます：

1. **Gmail統合:** 受信トレイをスキャンして簡潔なサマリーを生成します。緊急のメールをハイライトし、重要度別に会話を分類し、迅速な返信のための下書きを提案することもできます。
2. **カレンダー管理:** カレンダーと連携して、今後のミーティングをリマインドし、スケジュールの競合をチェックし、空き状況に基づいて新しいアポイントメントに最適な時間帯を提案します。
3. **ユーザー情報取得:** 認証プロファイルからユーザーの名前、メール、その他関連情報を取得できます。
4. **Human-in-the-Loop認証付きオンラインショッピング:** デモ用のフェイクAPIを使用して、ユーザーに代わって購入を行います。取引を確定する前に人間の確認を求める機能があります。
5. **ドキュメントのアップロードと取得:** PDFやテキストドキュメントをデータベースにアップロードし、チャット中のコンテキストとして取得できます。ドキュメントは他のユーザーと共有することもできます。

ツール呼び出し機能により、可能性は無限大です。このコンセプトシナリオでは、AIエージェントはデジタルパーソナルセクレタリーとして機能し、情報を処理するだけでなく、接続されたサービスからデータを積極的に収集して包括的なタスク管理を提供します。このレベルの統合は効率を向上させるだけでなく、デジタルアシスタントが個人的および専門的なニーズに合わせて自己調整する信頼性の高いオールインワンソリューションとして機能する、インテリジェントオートメーションの新時代を切り開きます。

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-assistant0.git
cd auth0-assistant0/call-apis-on-users-behalf/others-api/langchain-next-js
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env.local`にコピーします：

```bash
cp .env.example .env.local
```

### 3. 必要な設定の取得

#### 3.1 Amazon Bedrock設定

- **AWS認証情報**: 選択したリージョンでAmazon Bedrockを呼び出す権限が必要
- **BEDROCK_REGION**: 使用するAWSリージョン（例: `us-east-1`）
- **BEDROCK_CHAT_MODEL_ID**: チャットモデルID（例: `anthropic.claude-3-5-sonnet-20241022-v1:0`）
- **BEDROCK_EMBEDDING_MODEL_ID**: 埋め込みモデルID（例: `amazon.titan-embed-text-v2:0`）

#### 3.2 Auth0設定

[Prerequisites手順](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)に従って、以下を設定します：

**Auth0テナントのセットアップ:**
1. [Auth0ダッシュボード](https://manage.auth0.com/)でアカウントを作成
2. 新しいテナントを作成

**Webアプリケーションの作成:**
1. Applications → Create Application
2. 「Regular Web Applications」を選択
3. 設定：
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

4. `.env.local`に以下を設定：
   ```
   AUTH0_SECRET="ランダムな32文字の文字列"  # openssl rand -hex 32 で生成
   AUTH0_BASE_URL="http://localhost:3000"
   AUTH0_DOMAIN="https://YOUR_DOMAIN.auth0.com"
   AUTH0_CLIENT_ID="YOUR_CLIENT_ID"
   AUTH0_CLIENT_SECRET="YOUR_CLIENT_SECRET"
   ```

**Token Vault設定（Gmail/Calendar統合用）:**

Token Vaultを使用して、外部API（Gmail、Google Calendarなど）へのアクセストークンを安全に管理します。

1. Auth0ダッシュボードで「Actions」→「Flows」→「Login」
2. Token Vault設定を追加して、Google OAuthトークンを保存
3. 必要なスコープ（`https://www.googleapis.com/auth/gmail.readonly`など）を設定

詳細は[Token Vaultドキュメント](https://auth0.com/docs/secure/tokens/token-vault)を参照してください。

#### 3.3 Auth0 FGA (Fine-Grained Authorization)設定

1. [FGAダッシュボード](https://dashboard.fga.dev)でアカウント作成
2. 新しいStoreを作成
3. `.env.local`に追加：
   ```
   FGA_STORE_ID="YOUR_STORE_ID"
   FGA_CLIENT_ID="YOUR_FGA_CLIENT_ID"
   FGA_CLIENT_SECRET="YOUR_FGA_CLIENT_SECRET"
   FGA_API_URL="https://api.us1.fga.dev"  # リージョンに応じて変更
   ```

4. FGAモデルを初期化：
   ```bash
   npm run fga:init
   ```

### 4. パッケージのインストールとデータベース初期化

```bash
npm install

# オプション: PostgreSQLデータベースを起動
docker compose up -d

# オプション: データベーススキーマを作成
npm run db:migrate
```

または、セットアップスクリプトを使用：

```bash
npm run setup
```

### 5. 開発サーバーの起動

```bash
npm run all:dev
```

これにより以下が起動します：
- **LangGraphサーバー**: http://localhost:54367（インメモリ）
- **Next.jsサーバー**: http://localhost:3000

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを使用できます。

![ユーザーとAIのストリーミング会話](./public/images/home-page.png)

## 🛠️ カスタマイズ

### エージェント設定

`src/lib/agent.ts`でエージェントの設定を変更できます：
- プロンプトの変更
- モデルの変更
- ツールの追加
- ロジックの追加

### ツールの実装例

このプロジェクトでは以下のツールが実装可能です：

1. **Gmail統合** (`src/lib/tools/gmail.ts`)
   - 受信トレイの読み取り
   - メールの検索
   - 返信の下書き作成

2. **Googleカレンダー統合** (`src/lib/tools/calendar.ts`)
   - イベントの取得
   - スケジュールの確認
   - 新しいイベントの作成

3. **オンラインショッピング** (`src/lib/tools/shop-online.ts`)
   - 商品の検索
   - カートへの追加
   - 購入（Human-in-the-Loop確認付き）

## 🔐 セキュリティ上の課題とAuth0による解決

### ツール呼び出しAIエージェントのセキュリティ課題

LangChain、LlamaIndex、Vercel AIなどのフレームワークを使えば、AIアシスタントの構築自体は難しくありません。難しいのは、**ユーザーのデータと認証情報を保護しながら安全に実装すること**です。

現在の多くのソリューションでは以下の問題があります：
- ❌ 認証情報をAIエージェントの環境変数に保存
- ❌ エージェントがユーザーになりすます
- ❌ AIエージェントに過剰なスコープとアクセス権限を与える

### Auth0によるツール呼び出し

Auth0の[Token Vault](https://auth0.com/docs/secure/tokens/token-vault)機能は、AIエージェントとサービス間の安全で制御されたハンドシェイクを、スコープ付きアクセストークンの形式で仲介します。

**メリット：**
- ✅ エージェントとLLMは認証情報にアクセスできない
- ✅ Auth0で定義した権限でのみツールを呼び出せる
- ✅ AIエージェントはAuth0のみと通信すればよく、統合が簡単

![Federated APIトークン交換によるツール呼び出し](https://images.ctfassets.net/23aumh6u8s0i/1gY1jvDgZHSfRloc4qVumu/d44bb7102c1e858e5ac64dea324478fe/tool-calling-with-federated-api-token-exchange.jpg)

## 📚 詳細情報

- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)
- [Build an AI Assistant with LangGraph, Vercel, and Next.js: Use Gmail as a Tool Securely](https://auth0.com/blog/genai-tool-calling-build-agent-that-calls-gmail-securely-with-langgraph-vercelai-nextjs/)
- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)

## 🧩 使用技術

このテンプレートは以下のライブラリを使用しています：

- [LangChain JavaScript framework](https://js.langchain.com/docs/introduction/) および [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) - エージェントワークフローの構築
- [Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js) および [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0) - アプリケーションの保護とサードパーティAPI呼び出し

Vercelの無料枠にも対応しています！

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/oktadev/auth0-assistant0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Foktadev%2Fauth0-assistant0)

## 📦 バンドルサイズ

[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)が設定されています。インタラクティブにバンドルサイズを確認できます：

```bash
ANALYZE=true npm run build
```

## トラブルシューティング

### LangGraph APIへの接続エラー

`.env.local`の`LANGGRAPH_API_URL`が正しいポート番号（`54367`）になっているか確認してください：

```
LANGGRAPH_API_URL=http://localhost:54367
```

### Auth0認証エラー

1. Auth0ダッシュボードでCallback URLsとLogout URLsが正しく設定されているか確認
2. `.env.local`の`AUTH0_DOMAIN`、`AUTH0_CLIENT_ID`、`AUTH0_CLIENT_SECRET`が正しいか確認

### データベース接続エラー

PostgreSQLが起動しているか確認：

```bash
docker compose up -d
```

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
