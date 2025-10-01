# 非同期承認 (Asynchronous Authorization)

[Auth0 の非同期承認](https://auth0.com/ai/docs/async-authorization) は、バックグラウンドで動作するエージェントがユーザーの代わりに処理を進めつつ、重要なアクションの前に人間の承認を取得できる仕組みです。このディレクトリには、Auth0 と各種 AI フレームワークを組み合わせたサンプルが含まれています。

## サンプル一覧

以下のサンプルでは、Auth0 の Token Vault と Amazon Bedrock (Claude) を中心に構成したワークフローを紹介しています。`.env.local` に独自のモデル設定を追加すれば、OpenAI など他のプロバイダーにも切り替えられます。

- **Vercel AI SDK + Node.js (JavaScript)**  
  CLI で実行する最小構成の例です。`npm start` で非同期承認フローを確認できます。  
  [リポジトリを開く](https://github.com/auth0-samples/auth0-ai-samples/tree/main/asynchronous-authorization/vercel-ai-node-js)

- **Vercel AI SDK + Next.js (JavaScript)**  
  Web UI を備えた Next.js アプリケーションです。  
  [リポジトリを開く](https://github.com/auth0-samples/auth0-ai-samples/tree/main/asynchronous-authorization/vercel-ai-next-js)

- **LangChain + FastAPI (Python)**  
  LangGraph を用いた Python/FastAPI バックエンドと React フロントエンドの構成です。  
  [リポジトリを開く](https://github.com/auth0-samples/auth0-ai-samples/tree/main/asynchronous-authorization/langchain-fastapi-py)

- **LangChain + Next.js (JavaScript)**  
  LangChain.js と Next.js を組み合わせたフルスタックのサンプルです。  
  [リポジトリを開く](https://github.com/auth0-samples/auth0-ai-samples/tree/main/asynchronous-authorization/langchain-next-js)
