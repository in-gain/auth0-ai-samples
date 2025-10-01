# Assistant0: Auth0 で保護された AI パーソナルアシスタント - LangGraph Python/FastAPI 版

Assistant0 は、複数のツールを動的に呼び出して日々のタスクを支援する AI パーソナルアシスタントのサンプルです。このプロジェクトでは、Auth0 による認可と非同期承認フローを組み合わせて、バックグラウンドで動作する AI エージェントを安全に運用する方法を示します。

## テンプレートの特徴

- [LangGraph](https://langchain-ai.github.io/langgraph/) と [LangChain Python フレームワーク](https://python.langchain.com/docs/introduction/) を利用したエージェント指向のワークフロー。
- [Auth0 AI SDK for Python](https://github.com/auth0-lab/auth0-ai-python) と [Auth0 FastAPI SDK](https://github.com/auth0/auth0-fastapi) による認証・外部 API 呼び出しの保護。
- [Auth0 FGA](https://auth0.com/fine-grained-authorization) によるツールおよび RAG パイプラインの権限制御。
- Amazon Bedrock を利用した Claude モデルの実行例。OpenAI など他の LLM を利用する場合は `.env.local` でモデル設定を差し替えられます。

## 🚀 セットアップ手順

まずリポジトリをクローンしてください。

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/asynchronous-authorization/langchain-fastapi-py
```

このテンプレートは `backend/` と `frontend/` に分かれています。

- `backend/`: FastAPI で実装された API サーバー
- `frontend/`: React (Vite) で実装されたシングルページアプリケーション

### Backend のセットアップ

```bash
cd backend
```

1. `.env.example` を `.env.local` にコピーし、環境変数を設定します。アプリは `.env` → `.env.local` の順で読み込み、`.env.local` の値で上書きします。

   - Auth0 テナント、CIBA 用アプリケーション、Token Vault の設定値
   - Auth0 FGA ストア ID、クライアント ID／シークレット、API URL
   - Amazon Bedrock を利用する場合は、以下の変数も追加してください。

     ```bash
     AWS_ACCESS_KEY_ID=xxxxxxxx
     AWS_SECRET_ACCESS_KEY=xxxxxxxx
     AWS_REGION=us-east-1
     BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
     ```

     既定では OpenAI 用の `OPENAI_API_KEY` を読み込みます。Bedrock を使用する場合は、`.env.local` で `OPENAI_API_KEY` を削除するか、アプリケーションの LLM 設定を Bedrock 用に更新してください。

2. 依存関係をインストールします (例: [uv](https://github.com/astral-sh/uv) を使用)。

   ```bash
   uv sync --frozen
   ```

3. 開発サーバーを起動します。

   ```bash
   source .venv/bin/activate
   uv pip install auth0_fastapi
   fastapi dev app/main.py
   ```

### LangGraph サーバーの起動

別ターミナルでインメモリ版 LangGraph サーバーを起動します。

```bash
source .venv/bin/activate
uv pip install -U langgraph-api
langgraph dev --port 54367 --allow-blocking
```

### Frontend のセットアップ

`frontend` ディレクトリでも `.env.example` を `.env.local` にコピーし、Auth0 設定や API エンドポイントを入力します。

```bash
cd frontend
npm install
npm run dev
```

デフォルトではポート 5173 で Vite サーバーが立ち上がります。

![A streaming conversation between the user and the AI](./public/images/home-page.png)

エージェント設定は `backend/app/agents/assistant0.py` にあります。ここでプロンプトや利用するモデル (Bedrock Claude や OpenAI など) を変更できます。

## ライセンス

MIT ライセンスです。詳細は [LICENSE](LICENSE) を参照してください。

## 作者

[Juan Cruz Martinez](https://github.com/jcmartinezdev) によって作成されました。
