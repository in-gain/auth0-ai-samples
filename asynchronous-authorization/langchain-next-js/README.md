# Assistant0: Auth0 で保護された AI パーソナルアシスタント - LangChain + Next.js 版

Assistant0 は、複数の外部ツールと連携しながらユーザーの作業を代行する AI パーソナルアシスタントのデモです。LangChain と Next.js を利用し、Auth0 のトークン ボールトや CIBA フローを通じて人間の承認を必要とする処理を安全に実行します。

## 主な機能

1. **Gmail 連携** – 受信トレイを要約し、優先度の高いメールを抽出します。
2. **カレンダー管理** – スケジュールの重複を確認し、候補日時を提案します。
3. **ユーザープロファイル取得** – Auth0 のユーザープロフィールから必要な情報を取得します。
4. **人間による最終承認付きショッピング** – 購入前にユーザーへ確認を求めます。
5. **ドキュメントのアップロード／検索** – 他のユーザーと共有できる PDF やテキストの取り込み。

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/auth0-samples/auth0-ai-samples.git
cd auth0-ai-samples/asynchronous-authorization/langchain-next-js
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーし、必要な値を入力します。アプリは `.env` → `.env.local` の順で読み込み、`.env.local` の設定で上書きされます。

- Auth0 ドメイン、クライアント ID／シークレット、Token Vault 設定
- Auth0 FGA のストア情報
- Amazon Bedrock を利用する場合は次の環境変数を追加します。

  ```bash
  AWS_ACCESS_KEY_ID=xxxxxxxx
  AWS_SECRET_ACCESS_KEY=xxxxxxxx
  AWS_REGION=us-east-1
  BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
  ```

  既定では `.env.example` に含まれる `OPENAI_API_KEY` を使用します。Bedrock を使用する際は、LangChain の LLM 設定を Amazon Bedrock 用に変更してください。

### 3. 依存関係のインストールと開発サーバー

```bash
bun install
bun dev
```

または `npm install && npm run dev` を使用できます。

## バンドルサイズの確認

`@next/bundle-analyzer` が組み込まれており、以下のコマンドでバンドル内容を可視化できます。

```bash
ANALYZE=true bun run build
```

## セキュリティメモ

Auth0 の Token Vault によって、AI エージェントは直接資格情報を保持せず、スコープされたアクセストークン経由でツールを呼び出します。Bedrock などの LLM と連携する際も、Auth0 を中心にしたアーキテクチャで人間による承認フローを実装できます。

## ライセンス

MIT ライセンスです。詳細は [LICENSE](LICENSE) を参照してください。

## 作者

[Deepu K Sasidharan](https://github.com/deepu105) が作成しました。
