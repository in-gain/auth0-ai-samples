## Assistant0: Auth0で保護されたAIパーソナルアシスタント

Assistant0は、複数のツールへ動的にアクセスすることでデジタルライフをまとめて支援するAIパーソナルアシスタントです。以下のような機能を実装できます。

1. **Gmail連携:** 受信トレイを走査して重要メールのハイライトや会話の分類、返信ドラフトの提案などを行います。
2. **カレンダー管理:** カレンダーと連携して予定のリマインド、スケジュール調整、空き時間の提案を行います。
3. **ユーザー情報の取得:** 認証プロファイルからユーザーの氏名・メールアドレスなどの情報を取得します。
4. **人間による承認を挟んだオンラインショッピング:** （デモ用のフェイクAPIを用いて）代理購入を行い、最終確認前に人間の承認を求めることができます。
5. **ドキュメントのアップロードと検索:** PDFやテキストをデータベースへ保存し、会話の文脈として再利用できます。文書は他ユーザーと共有できます。

ツール呼び出し機能を活用すれば可能性は無限に広がります。このシナリオではAIエージェントがデジタル秘書として機能し、接続されたサービスからデータを収集・整理して包括的なタスク管理を提供します。これにより効率が向上するだけでなく、個人やビジネスのニーズに合わせて柔軟に対応できる新しいインテリジェントオートメーションの時代が到来します。

## 🚀 はじめに

まずはこのリポジトリをクローンしてローカルに取得します。

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/call-apis-on-users-behalf/others-api/langchain-next-js
```

次に、リポジトリ直下の`.env.local`に環境変数を設定します。`.env.example`をコピーして利用してください。

基本的なサンプルを動かすには、Amazon Bedrockの設定（リージョン、チャットモデルID、埋め込みモデルID）とAuth0の認証情報を追加します。
- 指定したリージョンでAmazon Bedrockを呼び出す権限を持つAWS認証情報、およびWebアプリとMachine to Machineアプリ用のAuth0認証情報が必要です。
  - Auth0テナントとWebアプリ、Token Vaultのセットアップ手順は[こちら](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)の前提条件をご確認ください。
  - Auth0 FGAアカウントは[こちら](https://dashboard.fga.dev)で作成できます。FGAのストアID、クライアントID、クライアントシークレット、API URLを`.env.local`に追加してください。

続いて、お好みのパッケージマネージャーで依存関係をインストールし、データベースを初期化します。

```bash
bun install # もしくは npm install
# 任意: PostgreSQLデータベースを起動
docker compose up -d
# 任意: データベーススキーマを作成
bun db:migrate # もしくは npm run db:migrate
```

準備ができたら開発サーバーを起動します。

```bash
bun all:dev # もしくは npm run all:dev
```

これでポート54367でインメモリのLangGraphサーバー、ポート3000でNext.jsサーバーが起動します。ブラウザで[http://localhost:3000](http://localhost:3000)を開き、ボットに質問するとストリーミングレスポンスを確認できます。

![ユーザーとAIのストリーミング会話](./public/images/home-page.png)

`app/page.tsx`を編集するとページ内容を即座に更新できます。

エージェントの設定は`src/lib/agent.ts`にあります。ここでプロンプトやモデルの変更、ツールやロジックの追加が可能です。

### ツール呼び出しAIエージェントにおけるセキュリティの課題

LangChain、[LlamaIndex](https://www.llamaindex.ai/)、[Vercel AI](https://vercel.com/ai)といったフレームワークのおかげでAIアシスタント自体を構築することは容易になりました。難しいのは、ユーザーのデータや認証情報を保護しつつ安全に運用することです。

多くの現行ソリューションはAIエージェントの環境変数に認証情報を保存したり、エージェントにユーザーをなりすませたりします。これはセキュリティリスクや過剰な権限付与につながるため推奨できません。

### Auth0を活用した安全なツール呼び出し

そこでAuth0の出番です。モダンアプリケーション向けの主要なIDプロバイダーであるAuth0の新製品[Auth for GenAI](https://a0.to/ai-content)は、OAuthとOpenID Connectを基盤に、エンドユーザーに代わってAIエージェントからツールのAPIを呼び出すための標準化された仕組みを提供します。

Auth0の[Token Vault](https://auth0.com/docs/secure/tokens/token-vault)機能は、AIエージェントとツール間のやり取りをスコープ付きアクセス トークンとして安全に仲介します。これによりエージェントやLLMは認証情報に直接アクセスせず、Auth0で定義した権限内でのみツールを呼び出せます。エージェント側はAuth0とだけ通信すればよいため、統合も容易になります。

![Federated APIトークンエクスチェンジによるツール呼び出しの概要図](https://images.ctfassets.net/23aumh6u8s0i/1gY1jvDgZHSfRloc4qVumu/d44bb7102c1e858e5ac64dea324478fe/tool-calling-with-federated-api-token-exchange.jpg)

## さらに学ぶ

- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)
- [Build an AI Assistant with LangGraph, Vercel, and Next.js: Use Gmail as a Tool Securely](https://auth0.com/blog/genai-tool-calling-build-agent-that-calls-gmail-securely-with-langgraph-vercelai-nextjs/)
- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)

## テンプレートについて

このテンプレートはAuth0 + LangChain.js + Next.jsのスターターアプリをスキャフォールドします。主に以下のライブラリを使用しています。

- [LangChain JavaScriptフレームワーク](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)によるエージェントワークフロー
- アプリケーションを保護しサードパーティAPIを呼び出すための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)

[Vercelの無料枠](https://vercel.com/pricing)でも動作します。下記の[バンドルサイズ統計](#-バンドルサイズ)もご覧ください。

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/oktadev/auth0-assistant0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Foktadev%2Fauth0-assistant0)

## 📦 バンドルサイズ

このパッケージには[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)が標準で含まれています。以下のコマンドでインタラクティブにバンドルサイズを確認できます。

```bash
ANALYZE=true bun run build
```

## ライセンス

このプロジェクトはMITライセンスで公開されています。詳細は[LICENSE](LICENSE)をご覧ください。

## 作者

このプロジェクトは[Deepu K Sasidharan](https://github.com/deepu105)によって作成されました。
