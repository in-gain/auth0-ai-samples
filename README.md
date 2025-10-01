# 生成AIアプリケーションのための認証

Auth0の認証・認可機能を生成AIアプリケーションの文脈で紹介するサンプルアプリケーション集です。[Auth0](https://www.auth0.ai/) の強力な機能をぜひお試しください。

[ホストされたデモはこちら](https://demo.auth0.ai/) からご覧いただけます。

サンプルは以下のとおり整理されています。

- [**authenticate-users**](https://auth0.com/ai/docs/user-authentication): チャットボットやバックグラウンドエージェントなど、AIエージェント向けに最適化されたログイン体験を簡単に実装できます。
- [**call-apis-on-users-behalf**](https://auth0.com/ai/docs/call-others-apis-on-users-behalf): Google や GitHub などの API トークンを安全な標準で取得し、他プロダクトとの連携をシームレスに実現できます。
- [**authorization-for-rag**](https://auth0.com/ai/docs/authorization-for-rag): ユーザーがアクセス権を持つドキュメントのみを取得し、閲覧できないはずのデータが漏洩することを防ぎます。
- [**asynchronous-authorization**](https://auth0.com/ai/docs/async-authorization): 自律的・非同期的に動作するエージェントがバックグラウンドで作業できるようにし、必要に応じて承認をリクエストする非同期認可を実装できます。
- [Auth0 AI へのサインアップはこちら](https://auth0.com/signup?onboard_app=genai&ocid=7014z000001NyoxAAC-aPA4z0000008OZeGAM)

## ローカルで検証するための共通手順

1. 任意のサンプルフォルダーに移動し、`.env.example` を `.env.local`（または使用しているランタイムが読み込むファイル名）としてコピーします。
2. 下表の環境変数を設定し、必要に応じて追加の変数も入力します。Auth0 テナントの作成方法やアプリケーション登録手順は [Auth0 のドキュメント](https://auth0.com/docs/get-started) を参照してください。
3. 依存パッケージをインストールし、各サンプルの README に記載された開発サーバー起動コマンドを実行します。

| 変数名 | 目的 | 設定例 |
| --- | --- | --- |
| `APP_BASE_URL` | ローカル開発環境のコールバック URL。Auth0 アプリの **Allowed Callback URLs** と一致させます。 | `http://localhost:3000` |
| `AUTH0_DOMAIN` | 利用する Auth0 テナントのドメイン。先頭に `https://` を付けて入力します。 | `https://tenant-region.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 で登録したアプリケーションのクライアント ID。 | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AUTH0_CLIENT_SECRET` | アプリケーションのクライアントシークレット。マシン間通信があるサンプルで必須です。 | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AUTH0_SECRET` | Next.js などのセッション暗号化に使用する値。`openssl rand -hex 32` で生成します。 | `f3e...` |
| `DATABASE_URL` | サンプルが利用する PostgreSQL などのデータベース接続文字列。ローカル検証では Docker などで Postgres を起動します。 | `postgresql://postgres:postgres@localhost:5432/ai_documents_db` |

### LLM プロバイダー別の追加設定

- **OpenAI を利用するサンプル**: `OPENAI_API_KEY` を設定します。必要に応じて `ANTHROPIC_API_KEY` などのオプションを有効にしてください。
- **Amazon Bedrock を利用するサンプル**: `AWS_BEARER_TOKEN_BEDROCK`, `BEDROCK_REGION`, `BEDROCK_CHAT_MODEL_ID`, `BEDROCK_EMBEDDING_MODEL_ID` などを設定します。API キーの取得方法や推奨モデル ID は [Amazon Bedrock を利用するための AWS 設定手順](docs/aws-bedrock-setup.md) を参照してください。
- **外部 API 呼び出しを行うサンプル**: `SHOP_API_URL` や `SHOP_API_AUDIENCE` など、対象 API ごとに `.env.example` に記載された変数を設定します。

各サンプルでは LangGraph や LangSmith など追加のサービスを利用する場合があるため、`.env.example` に含まれる任意項目も必要に応じて設定してください。環境変数の入力が完了したら、各フォルダーの README に従いデータベースのマイグレーションや開発サーバーの起動を行うことで、ローカルでの検証を開始できます。

## AWS 設定ガイド

Amazon Bedrock を利用するサンプルでは、AWS 側での初期設定が必要です。IAM ポリシーの作成や認証情報の管理手順については、[Amazon Bedrock を利用するための AWS 設定手順](docs/aws-bedrock-setup.md)を参照してください。

[**Sign up for Auth0 AI**](https://auth0.com/signup?onboard_app=genai&ocid=7014z000001NyoxAAC-aPA4z0000008OZeGAM)

# クイックスタートのリリースについて

[Auth for AI Agents ドキュメントサイト](https://auth0.com/ai/docs) から個別のクイックスタートをダウンロードできるようにするため、このリポジトリでは各クイックスタートの zip 形式アーティファクトを生成する GitHub Actions を用意しています。`main` ブランチのクイックスタートフォルダーで変更が発生すると、このアクションが実行され、常に最新のアーティファクトがダウンロードできるようになります。

新しいクイックスタートを **含める** 場合は、対象のクイックスタートのベースディレクトリに `release-config.yml` ファイルを追加します。例:

```
// authorization-for-rag/langchain-js/release-config.yml

category: "authorization-for-rag"
framework: "langchain-js"
included: true
```

特定のファイルをリリースから除外したい場合は、`release-config.yml` に `exclude_patterns` を *任意で* 追加できます。リリーススクリプトは一般的な機密ファイルの除外と検出を既に実施しています。例:

```
// release-config.yml

exclude_patterns:
  - "*.tmp"
  - "debug.log"
  - "test-data/*"
  - ".env.test"
  - "node_modules/.cache/*"
```

既存のクイックスタートを **除外** する場合は、`release-config.yml` 内の `included` を `false` に変更してください。
