# Assistant0: Auth0で保護されたAIパーソナルアシスタント（非同期認可機能付き）

Assistant0は、複数のツールに動的にアクセスすることで、あなたのデジタルライフを統合し、整理された効率的な生活をサポートするAIパーソナルアシスタントです。このサンプルでは、特に**非同期認可（Asynchronous Authorization）**に焦点を当てています。

## 主な機能

1. **Gmail統合:** 受信トレイをスキャンして簡潔なサマリーを生成します。緊急のメールをハイライトし、重要度別に会話を分類し、迅速な返信のための下書きを提案することもできます。
2. **カレンダー管理:** カレンダーと連携して、今後のミーティングをリマインドし、スケジュールの競合をチェックし、空き状況に基づいて新しいアポイントメントに最適な時間帯を提案します。
3. **ユーザー情報取得:** 認証プロファイルからユーザーの名前、メール、その他関連情報を取得できます。
4. **Human-in-the-Loop認証付きオンラインショッピング（非同期認可）:** デモ用のフェイクAPIを使用して、ユーザーに代わって購入を行います。**重要なアクション実行前に、リアルタイムで人間の確認を求め**、ユーザーの承認を待ってから処理を続行します。
5. **ドキュメントのアップロードと取得:** PDFやテキストドキュメントをデータベースにアップロードし、チャット中のコンテキストとして取得できます。ドキュメントは他のユーザーと共有することもできます。

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/asynchronous-authorization/langchain-next-js
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env.local`にコピーします：

```bash
cp .env.example .env.local
```

`.env.local` に以下の値を設定します。

#### Amazon Bedrock（Bearer Token 認証）

```bash
AWS_BEARER_TOKEN_BEDROCK="<your-bedrock-bearer-token>"
BEDROCK_REGION="us-east-1"
BEDROCK_CHAT_MODEL_ID="anthropic.claude-3-5-sonnet-20241022-v1:0"
BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
```

- Bearer Token の取得方法と IAM ポリシーの詳細は [docs/aws-bedrock-setup.md](../../docs/aws-bedrock-setup.md) を参照してください
- `ChatBedrockConverse` を利用するため、モデル ID にはバージョン（`:0` など）が必要です

#### Auth0

```bash
APP_BASE_URL="http://localhost:3000"
AUTH0_SECRET="<32文字以上のランダムな文字列>"
AUTH0_DOMAIN="https://<your-tenant>.auth0.com"
AUTH0_CLIENT_ID="<your-client-id>"
AUTH0_CLIENT_SECRET="<your-client-secret>"
```

- [Auth0 Dashboard](https://manage.auth0.com/) で Regular Web Application を作成します
- Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
- Allowed Logout URLs / Allowed Web Origins: `http://localhost:3000`

### 4. パッケージのインストールとデータベース初期化

```bash
npm install  # または bun install

# オプション - PostgreSQLデータベースを起動
docker compose up -d

# オプション - データベーススキーマを作成
npm run db:migrate  # または bun db:migrate
```

### 5. 開発サーバーの起動

```bash
npm run all:dev  # または bun all:dev
```

これにより、ポート54367でインメモリLangGraphサーバーが、ポート3000でNext.jsサーバーが起動します。ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください！

![ユーザーとAIのストリーミング会話](./public/images/home-page.png)

`app/page.tsx`を変更してページの編集を開始できます。ファイルを編集すると、ページは自動的に更新されます。

エージェントの設定は`src/lib/agent.ts`にあります。ここから、プロンプトとモデルを変更したり、他のツールやロジックを追加したりできます。

## 非同期認可（Human-in-the-Loop）とは

### 概要

AIエージェントが重要なアクション（購入、メール送信、データ削除など）を実行する前に、**ユーザーの明示的な承認を待つ**仕組みです。

### 実装方法

このサンプルでは、LangGraphの**interrupt機能**を使用して実装しています：

1. AIエージェントが購入などの重要なアクションを実行しようとする
2. LangGraphがエージェントの実行を一時停止（interrupt）
3. ユーザーに確認ダイアログを表示
4. ユーザーが承認または拒否を選択
5. 承認された場合のみ、エージェントが処理を続行

### メリット

- ✅ AIの誤動作や誤判断による重大な影響を防止
- ✅ ユーザーがAIの動作を完全にコントロール
- ✅ 透明性の高いAI動作
- ✅ セキュリティとユーザー体験の両立

## ツール呼び出しAIエージェントのセキュリティ課題

このようなアシスタントを構築することは、それほど難しくありません。[LangChain](https://www.langchain.com/)、[LlamaIndex](https://www.llamaindex.ai/)、[Vercel AI](https://vercel.com/ai)などのフレームワークのおかげで、すぐに始められます。難しいのは、ユーザーのデータと認証情報を保護しながら、安全に実装することです。

現在の多くのソリューションでは、AIエージェントアプリケーションの環境に認証情報とシークレットを保存したり、エージェントにユーザーのなりすましを許可したりしています。これは、セキュリティの脆弱性やAIエージェントの過剰なスコープとアクセスにつながる可能性があるため、良いアイデアではありません。

## Auth0によるツール呼び出し

ここでAuth0が役立ちます。最新のアプリケーション向けの主要なアイデンティティプロバイダー（IdP）として、私たちの新製品[Auth for GenAI](https://a0.to/ai-content)は、OAuthとOpenID Connectの上に構築された標準化された方法を提供し、AIエージェントからエンドユーザーに代わってツールのAPIを呼び出すことができます。

Auth0の[Token Vault](https://auth0.com/docs/secure/tokens/token-vault)機能は、AIエージェントとあなたに代わってエージェントがやり取りしたいサービスとの間の安全で制御されたハンドシェイクを、スコープ付きアクセストークンの形式で仲介します。

![Federated APIトークン交換によるツール呼び出し](https://images.ctfassets.net/23aumh6u8s0i/1gY1jvDgZHSfRloc4qVumu/d44bb7102c1e858e5ac64dea324478fe/tool-calling-with-federated-api-token-exchange.jpg)

## 詳細情報

- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)
- [Build an AI Assistant with LangGraph, Vercel, and Next.js: Use Gmail as a Tool Securely](https://auth0.com/blog/genai-tool-calling-build-agent-that-calls-gmail-securely-with-langgraph-vercelai-nextjs/)
- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)

## テンプレートについて

このテンプレートは、Auth0 + LangChain.js + Next.jsスターターアプリの土台を提供します。主に以下のライブラリを使用しています：

- エージェントワークフローを構築するための[LangChainのJavaScriptフレームワーク](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
- アプリケーションを保護し、サードパーティAPIを呼び出すための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)

Vercelの無料枠にも対応しています！

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/auth0-samples/auth0-ai-samples)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fauth0-samples%2Fauth0-ai-samples)

## 📦 バンドルサイズ

このパッケージには[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)がデフォルトで設定されています。以下を実行して、バンドルサイズをインタラクティブに調べることができます：

```bash
ANALYZE=true npm run build  # または bun run build
```

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
