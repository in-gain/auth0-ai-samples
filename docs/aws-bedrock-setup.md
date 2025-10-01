# Amazon Bedrock を利用するための AWS 設定手順

Auth0 AI サンプル群で Amazon Bedrock を利用する際に必要となる AWS 側の基本的なセットアップ手順をまとめています。本リポジトリは PoC 利用を想定しているため、**Amazon Bedrock の API キー発行を前提とした最も手軽な手順**を中心に記載します。既に AWS アカウントや Bedrock の利用権限をお持ちの場合でも、最低限のセキュリティベストプラクティスを確認する目的で参照してください。

## 1. 前提条件

- 有効な AWS アカウントを所有していること
- Amazon Bedrock が提供されているリージョン（例: `us-east-1`, `us-west-2` など）にアクセスできること
- ルートユーザーではなく、適切に保護された IAM ユーザーまたはフェデレーテッドユーザーを使用すること

> **ヒント:** 初めて Bedrock を利用する場合は、AWS マネジメントコンソールで [Amazon Bedrock](https://us-east-1.console.aws.amazon.com/bedrock/home) にアクセスし、利用規約へ同意する必要があります。これを行わないと API 呼び出しが失敗します。

## 2. PoC 向けの標準構成: Amazon Bedrock API キーを発行する

2024 年以降、Amazon Bedrock ではサービス専用の **API キー** を発行できるようになりました。IAM アクセスキーを使った従来の方法と比べてセットアップの手順を簡素化できるため、PoC や個人での評価用途ではこちらを標準手順としてください。運用や長期利用を前提とする場合は、[付録](#appendix-iam) に記載の IAM ユーザー／ロールを用いた構成を検討してください。

### 2.1 権限の確認

API キーを生成するには、利用する IAM ユーザー／ロールに Amazon Bedrock へのアクセス権が必要です。最低限、以下のアクションを許可してください。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetFoundationModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

既に `AmazonBedrockFullAccess` 等のポリシーが付与されている場合はそのまま利用できます。PoC でも最小権限を心がける場合は上記のようなカスタムポリシーを用意してください。

### 2.2 API キーの種類と制限事項

- **短期キー**: コンソールのセッション期間（最長 12 時間）に限り有効。既存の IAM プリンシパルの権限を継承し、生成したリージョンでのみ利用できます。CI や本番環境では、[aws-bedrock-token-generator](https://github.com/aws/aws-bedrock-token-generator-python) などのクライアントライブラリで自動更新する運用が可能です。
- **長期キー**: 30 日など任意の期限で発行でき、Amazon Bedrock の基本的な API 呼び出しが可能です。セキュリティ上の観点から探索や検証用途のみに利用し、期限が切れる前に必ずローテーションしてください。
- いずれのキーも **Amazon Bedrock / Bedrock Runtime** のコア API のみに利用でき、`InvokeModelWithBidirectionalStream` や Agents、Data Automation といった機能には使用できません。

### 2.3 コンソールからの発行手順

1. 権限を持つ IAM ユーザー／ロールで [Amazon Bedrock コンソール](https://console.aws.amazon.com/bedrock) にサインインし、左メニューの **API keys** を開きます。
2. **Short-term API keys** タブで **Generate short-term API keys** を選択すると、セッション終了（最大 12 時間）まで有効なキーが発行されます。リージョンを変更したい場合は生成画面で選択してください。
3. 迅速な検証を行いたい場合は **Long-term API keys** タブで **Generate long-term API keys** を選択し、期限と必要に応じた追加ポリシーを設定します。デフォルトでは `AmazonBedrockLimitedAccess` ポリシーが付与されます。
4. 表示された API キーは再表示できないため、安全な保管場所にコピーしてください。

> **ベストプラクティス:** 長期キーはあくまで評価用に限定し、本番用途では短期キー＋自動更新、もしくは [付録](#appendix-iam) の構成に切り替えてください。

### 2.4 API キーの利用方法

Amazon Bedrock は環境変数 `AWS_BEARER_TOKEN_BEDROCK` を自動的に認識します。ローカル開発では以下のいずれかの方法で設定します。

```bash
# macOS / Linux
export AWS_BEARER_TOKEN_BEDROCK=XXXXXXXXXXXXXXXXXXXXXXXX

# Windows (PowerShell)
$Env:AWS_BEARER_TOKEN_BEDROCK = "XXXXXXXXXXXXXXXXXXXXXXXX"

# Windows (コマンドプロンプト)
setx AWS_BEARER_TOKEN_BEDROCK "XXXXXXXXXXXXXXXXXXXXXXXX"
```

コード内で設定したい場合は、例として以下のように環境変数へ代入してからクライアントを初期化します。

```python
import os

os.environ["AWS_BEARER_TOKEN_BEDROCK"] = "XXXXXXXXXXXXXXXXXXXXXXXX"
```

HTTP クライアントを直接利用する場合は、`Authorization: Bearer <API キー>` ヘッダーを付与します。Boto3 など AWS SDK を利用する場合は、上記の環境変数を設定するだけで認証に使用されます。

### 2.5 `.env.local` の設定例

Auth0 AI サンプルの各アプリケーションでは `.env.local` などの環境変数ファイルを読み込んで Bedrock を呼び出します。API キー運用では以下のように設定してください。

```bash
AWS_BEARER_TOKEN_BEDROCK=XXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
```

> **補足:** API キーのみを利用する構成では、`aws configure` による CLI プロファイル設定やアクセスキーの管理は不要です。一方で、CloudTrail によるログ監査やキーのローテーション方針は IAM アクセスキーの場合と同様に考慮してください。各サンプルの `.env.example` も同じ環境変数構成に更新しているため、必要に応じてコピーして利用できます。

## 3. 認証情報の安全な保管と共有

- 認証情報はソースコードに直書きせず、`.env.local` などの環境変数ファイルやシークレットマネージャー（AWS Secrets Manager、Parameter Store、Vercel/Netlify のプロジェクトシークレットなど）で管理します。
- チームで共有する場合は、パスワードマネージャーや秘密管理サービスを利用し、アクセスログを残します。
- 可能な限り長期キーの利用を避け、短期キーまたは期限が短いキーを運用しつつ定期的なローテーションを行います。

## 4. Bedrock API への接続確認

1. AWS CLI で簡単な疎通確認を行います。`AWS_BEARER_TOKEN_BEDROCK` を設定したターミナルで以下を実行してください。

   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

   モデル一覧が返ってくれば、ポリシーと API キーが正しく設定されています。

2. アプリケーションから利用する場合は、`.env.local` の値を読み込んで Bedrock クライアントを初期化します。各サンプルの README に従って依存パッケージをインストールした後、開発サーバーを起動し、ログやレスポンスでエラーがないことを確認してください。

## 5. 運用時のセキュリティとコスト管理のポイント

- 利用しないモデルやリージョンへのアクセス権を付与しない最小権限の原則を徹底します。
- CloudTrail や CloudWatch Logs を活用し、Bedrock API の呼び出し履歴をモニタリングします。
- 不要になった API キーは必ず無効化または削除します。
- コストアラート（AWS Budgets 等）を設定し、予期しない利用増加にすぐ気づけるようにします。
- 定期的にポリシーと認証情報の棚卸しを行い、利用状況に応じて更新またはローテーションします。

## 付録: IAM アクセスキー運用を行う場合 <a id="appendix-iam"></a>

長期運用や既存の AWS 基盤との統合が必要な場合は、API キーではなく IAM ユーザー／ロールとアクセスキーを利用することもできます。手順の概要を以下に示します。

1. IAM の **ユーザー** 画面から **ユーザーを追加** をクリックします。
2. ユーザー名（例: `auth0-ai-sample-bedrock`）を設定し、**アクセスキー - プログラムによるアクセス** にチェックを入れます。
3. [2.1](#21-権限の確認) で紹介したポリシーを直接アタッチするか、ポリシーを含む IAM グループに所属させます。
4. タグを必要に応じて追加し、ユーザーを作成します。
5. 作成完了画面で表示される **アクセスキー ID** と **シークレットアクセスキー** を安全な場所に保存します。後から再表示できないため、必要に応じてダウンロードしてください。
6. ローカル開発環境やホスティング環境では以下のような環境変数を利用します。

   ```bash
   AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
   AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
   ```

> **代替案:** AWS Organizations や SSO を使用している場合は、IAM ロールを作成し、CI/CD からの一時認証情報取得 (AssumeRole) を利用する構成も検討してください。

---

これで Auth0 AI サンプルを動かすための AWS 側の準備は完了です。Auth0 側の設定手順と合わせて、各サンプルの README を参考に開発を進めてください。
