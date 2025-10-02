# Assistant0: Auth0で保護されたAIパーソナルアシスタント

Assistant0は、複数のツールに動的にアクセスすることで、あなたのデジタルライフを統合し、整理された効率的な生活をサポートするAIパーソナルアシスタントです。以下のような機能を実装できます：

1. **Gmail統合:** 受信トレイをスキャンして簡潔なサマリーを生成します。緊急のメールをハイライトし、重要度別に会話を分類し、迅速な返信のための下書きを提案することもできます。
2. **カレンダー管理:** カレンダーと連携して、今後のミーティングをリマインドし、スケジュールの競合をチェックし、空き状況に基づいて新しいアポイントメントに最適な時間帯を提案します。
3. **ユーザー情報取得:** 認証プロファイルからユーザーの名前、メール、その他関連情報を取得できます。
4. **Human-in-the-Loop認証付きオンラインショッピング:** デモ用のフェイクAPIを使用して、ユーザーに代わって購入を行います。取引を確定する前に人間の確認を求める機能があります。
5. **ドキュメントのアップロードと取得:** PDFやテキストドキュメントをデータベースにアップロードし、チャット中のコンテキストとして取得できます。ドキュメントは他のユーザーと共有することもできます。

ツール呼び出し機能により、可能性は無限大です。このコンセプトシナリオでは、AIエージェントはデジタルパーソナルセクレタリーとして機能し、情報を処理するだけでなく、接続されたサービスからデータを積極的に収集して包括的なタスク管理を提供します。

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-assistant0.git
cd auth0-assistant0/call-apis-on-users-behalf/your-api/langchain-next-js
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env.local`にコピーします：

```bash
cp .env.example .env.local
```

### 3. 必要な設定の取得

基本的な例を始めるには、Amazon Bedrock設定（リージョン、チャットモデルID、埋め込みモデルID）とAuth0認証情報を追加します。

- 選択したリージョンでAmazon Bedrockを呼び出す権限を持つAWS認証情報が必要です
- WebアプリとMachine to Machine AppのAuth0認証情報が必要です
  - [Prerequisites手順](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)に従って、Auth0 WebアプリとToken Vaultを設定できます
  - [Auth0 FGAアカウント](https://dashboard.fga.dev)を作成し、FGAストアID、クライアントID、クライアントシークレット、API URLを`.env.local`ファイルに追加します

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

これにより、ポート54367でインメモリLangGraphサーバーが、ポート3000でNext.jsサーバーが起動します。ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください！ボットに質問すると、ストリーミングされたレスポンスが表示されます：

![ユーザーとAIのストリーミング会話](./public/images/home-page.png)

`app/page.tsx`を変更してページの編集を開始できます。ファイルを編集すると、ページは自動的に更新されます。

エージェントの設定は`src/lib/agent.ts`にあります。ここから、プロンプトとモデルを変更したり、他のツールやロジックを追加したりできます。

## ツール呼び出しAIエージェントのセキュリティ課題

このようなアシスタントを構築することは、それほど難しくありません。[LangChain](https://www.langchain.com/)、[LlamaIndex](https://www.llamaindex.ai/)、[Vercel AI](https://vercel.com/ai)などのフレームワークのおかげで、すぐに始められます。難しいのは、ユーザーのデータと認証情報を保護しながら、安全に実装することです。

現在の多くのソリューションでは、AIエージェントアプリケーションの環境に認証情報とシークレットを保存したり、エージェントにユーザーのなりすましを許可したりしています。これは、セキュリティの脆弱性やAIエージェントの過剰なスコープとアクセスにつながる可能性があるため、良いアイデアではありません。

## Auth0によるツール呼び出し

ここでAuth0が役立ちます。最新のアプリケーション向けの主要なアイデンティティプロバイダー（IdP）として、私たちの新製品[Auth for GenAI](https://a0.to/ai-content)は、OAuthとOpenID Connectの上に構築された標準化された方法を提供し、AIエージェントからエンドユーザーに代わってツールのAPIを呼び出すことができます。

Auth0の[Token Vault](https://auth0.com/docs/secure/tokens/token-vault)機能は、AIエージェントとあなたに代わってエージェントがやり取りしたいサービスとの間の安全で制御されたハンドシェイクを、スコープ付きアクセストークンの形式で仲介します。これにより、エージェントとLLMは認証情報にアクセスできず、Auth0で定義した権限でのみツールを呼び出すことができます。また、AIエージェントは認証のためにAuth0とのみ通信すればよく、ツールと直接通信する必要がないため、統合が容易になります。

![Federated APIトークン交換によるツール呼び出し](https://images.ctfassets.net/23aumh6u8s0i/1gY1jvDgZHSfRloc4qVumu/d44bb7102c1e858e5ac64dea324478fe/tool-calling-with-federated-api-token-exchange.jpg)

## 詳細情報

- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)
- [Build an AI Assistant with LangGraph, Vercel, and Next.js: Use Gmail as a Tool Securely](https://auth0.com/blog/genai-tool-calling-build-agent-that-calls-gmail-securely-with-langgraph-vercelai-nextjs/)
- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)

## テンプレートについて

このテンプレートは、Auth0 + LangChain.js + Next.jsスターターアプリの土台を提供します。主に以下のライブラリを使用しています：

- エージェントワークフローを構築するための[LangChainのJavaScriptフレームワーク](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
- アプリケーションを保護し、サードパーティAPIを呼び出すための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)

Vercelの無料枠にも対応しています！[バンドルサイズの統計](#-バンドルサイズ)をチェックしてください。

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/oktadev/auth0-assistant0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Foktadev%2Fauth0-assistant0)

## 📦 バンドルサイズ

このパッケージには[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)がデフォルトで設定されています。以下を実行して、バンドルサイズをインタラクティブに調べることができます：

```bash
ANALYZE=true npm run build  # または bun run build
```

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
