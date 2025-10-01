# 生成AIアプリケーションのための認証

Auth0の認証・認可機能を生成AIアプリケーションの文脈で紹介するサンプルアプリケーション集です。[Auth0](https://www.auth0.ai/) の強力な機能をぜひお試しください。

[ホストされたデモはこちら](https://demo.auth0.ai/) からご覧いただけます。

サンプルは以下のとおり整理されています。

- [**authenticate-users**](https://auth0.com/ai/docs/user-authentication): チャットボットやバックグラウンドエージェントなど、AIエージェント向けに最適化されたログイン体験を簡単に実装できます。
- [**call-apis-on-users-behalf**](https://auth0.com/ai/docs/call-others-apis-on-users-behalf): Google や GitHub などの API トークンを安全な標準で取得し、他プロダクトとの連携をシームレスに実現できます。
- [**authorization-for-rag**](https://auth0.com/ai/docs/authorization-for-rag): ユーザーがアクセス権を持つドキュメントのみを取得し、閲覧できないはずのデータが漏洩することを防ぎます。
- [**asynchronous-authorization**](https://auth0.com/ai/docs/async-authorization): 自律的・非同期的に動作するエージェントがバックグラウンドで作業できるようにし、必要に応じて承認をリクエストする非同期認可を実装できます。

[Auth0 AI へのサインアップはこちら](https://auth0.com/signup?onboard_app=genai&ocid=7014z000001NyoxAAC-aPA4z0000008OZeGAM)

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
