## 非同期認可: AIアクションのためのHuman-in-the-Loop

このサンプルは、**非同期認可（Human-in-the-Loop）**を示します。AIが購入などの重要なアクションを実行する前に、ユーザーの確認を求めます。

### このサンプルが行うこと

このプロジェクトは、AIエージェントが明示的なユーザー承認なしに重要なアクションを取らないようにするHuman-in-the-Loop認可の実装方法を示します：

- ✅ Auth0でユーザー認証
- ✅ AIがアクション（例：オンラインショッピング）を提案
- ✅ **実行を一時停止してユーザーの確認を求める**
- ✅ ユーザーが承認した場合のみ続行

### このサンプルが解決する問題

AIエージェントは間違いを犯したり、ユーザーの意図を誤解したりする可能性があります。人間の監視がなければ、以下のようなことが起こり得ます：

- 間違った商品を購入
- 間違った宛先にメールを送信
- 重要なデータを削除
- 金融取引を誤って実行

非同期認可（Human-in-the-Loop）は、重要な操作を実行する前に明示的なユーザー承認を要求することで、これらの問題を防ぎます。

### 主な機能

1. **非同期認可付きオンラインショッピングツール**: AIは商品を検索してカートに追加できますが、購入前にユーザーの承認が必要
2. **LangGraph Interrupts**: LangGraphの中断メカニズムを使用して実行を一時停止し、ユーザー入力を待つ
3. **ユーザー承認フロー**: AIが何をしようとしているかを明確に示し、確認を求めるUI
4. **安全なAIアクション**: AIの動作の透明性とユーザーコントロールを保証

## 🚀 セットアップ手順

### 前提条件

- Node.js 18以上
- Auth0アカウント
- Amazon Bedrockへのアクセス権を持つAWSアカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-assistant0.git
cd auth0-assistant0/asynchronous-authorization/langchain-next-js
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

Auth0でログイン後、AIに購入を依頼してみてください：

- "ノートパソコンを買って"
- "コーヒーメーカーを購入してください"
- "$1000以下のスマートフォンを探して買って"

**何が起こるか:**
1. AIが商品を検索
2. AIが購入を提案
3. **確認ダイアログが表示**され、承認または拒否を求められる
4. 承認した場合のみ、購入が実行される
5. 拒否した場合、AIは確認して停止

## 動作の仕組み

### 非同期認可フロー

1. ユーザー: "ノートパソコンを買って"
2. AIが商品と Action で`shopOnlineTool`を呼び出す
3. `withAsyncAuthorization`ラッパーが**エージェントの実行を中断**
4. 確認リクエストがユーザーインターフェースに送信される
5. エージェントはユーザーの応答を**待つ**
6. ユーザーが「承認」または「拒否」をクリック
7. 承認された場合: エージェントが再開し、購入を実行
8. 拒否された場合: エージェントが停止し、ユーザーに通知

### 実装

重要なのは`withAsyncAuthorization`ラッパーです：

```typescript
const tools = [
  new Calculator(),
  withAsyncAuthorization(shopOnlineTool)
];
```

このラッパーは：
- ツール呼び出しを傍受
- LangGraphの中断をトリガー
- ユーザー承認を待つ
- 承認された場合のみ続行

### メリット

- ✅ **安全性**: 意図しないまたは有害なAIアクションを防止
- ✅ **透明性**: ユーザーはAIが何をしようとしているかを正確に把握
- ✅ **コントロール**: ユーザーが重要なアクションに対して最終決定権を持つ
- ✅ **信頼**: AIアシスタントへの信頼を構築
- ✅ **コンプライアンス**: AI監視の規制要件を満たすのに役立つ

## Human-in-the-Loopのユースケース

このパターンは以下の場合に不可欠です：

- **金融取引**: 購入、送金、支払い
- **コミュニケーション**: メール、メッセージ、通知の送信
- **データ変更**: 重要なデータの削除、更新、移動
- **外部アクション**: 予約、アポイントメント
- **アクセス制御**: 権限の付与やリソースの共有

## 詳細情報

- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)
- [Tool Calling in AI Agents: Empowering Intelligent Automation Securely](https://auth0.com/blog/genai-tool-calling-intro/)
- [LangGraph Interrupts Documentation](https://langchain-ai.github.io/langgraphjs/how-tos/human-in-the-loop/)

## 技術スタック

- エージェントワークフロー構築のための[LangChain.js](https://js.langchain.com/docs/introduction/)と[LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
- 安全な認証のための[Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)と[Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- Human-in-the-LoopのためのLangGraph Interrupts
- Next.js 15 + React 19
- LLMとしてAmazon Bedrock

## ライセンス

このプロジェクトはMITライセンスの下でオープンソース化されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作成者

このプロジェクトは [Deepu K Sasidharan](https://github.com/deepu105) によって構築されました。
