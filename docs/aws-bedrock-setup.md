# Amazon Bedrock を利用するための AWS 設定手順

Auth0 AI サンプル群で Amazon Bedrock を利用する際に必要となる AWS 側の基本的なセットアップ手順をまとめています。既に AWS アカウントや Bedrock の利用権限をお持ちの場合でも、最低限のセキュリティベストプラクティスを確認する目的で参照してください。

## 1. 前提条件

- 有効な AWS アカウントを所有していること
- Amazon Bedrock が提供されているリージョン（例: `us-east-1`, `us-west-2` など）にアクセスできること
- ルートユーザーではなく、適切に保護された IAM ユーザーまたはフェデレーテッドユーザーを使用すること

> **ヒント:** 初めて Bedrock を利用する場合は、AWS マネジメントコンソールで [Amazon Bedrock](https://us-east-1.console.aws.amazon.com/bedrock/home) にアクセスし、利用規約へ同意する必要があります。これを行わないと API 呼び出しが失敗します。

## 2. Amazon Bedrock へのアクセス権を持つ IAM ポリシーの作成

1. AWS マネジメントコンソールで **IAM** サービスに移動します。
2. 左メニューから **ポリシー** を選択し、**ポリシーを作成** をクリックします。
3. **JSON** タブを選択し、必要最小限の権限を付与するポリシーを入力します。例として以下のポリシーは Bedrock のモデル推論 (`InvokeModel`, `InvokeModelWithResponseStream`) とモデルメタデータの参照 (`GetFoundationModel`, `ListFoundationModels`) のみに限定しています。

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

4. **次へ** をクリックし、ポリシー名（例: `Auth0AIBedrockInvokePolicy`）と説明を入力して作成します。

> **注意:** 既存の `AmazonBedrockFullAccess` を付与することもできますが、不要な権限を避けるため、利用用途に応じたカスタムポリシーの作成を推奨します。

## 3. アプリケーション用の IAM ユーザーまたはロールの作成

Auth0 AI サンプルはサーバー側から Amazon Bedrock を呼び出すため、プログラムから利用できる認証情報が必要です。以下では IAM ユーザーを作成する場合の例を記載します。

1. IAM の **ユーザー** 画面から **ユーザーを追加** をクリックします。
2. ユーザー名（例: `auth0-ai-sample-bedrock`）を設定し、**アクセスキー - プログラムによるアクセス** にチェックを入れます。
3. **次のステップ: 権限** で、先ほど作成したカスタムポリシーを直接アタッチするか、ポリシーを含む IAM グループに所属させます。
4. タグを必要に応じて追加し、ユーザーを作成します。
5. 作成完了画面で表示される **アクセスキー ID** と **シークレットアクセスキー** を安全な場所に保存します。後から再表示できないため、必要に応じてダウンロードしてください。

> **代替案:** AWS Organizations や SSO を使用している場合は、IAM ロールを作成し、CI/CD からの一時認証情報取得 (AssumeRole) を利用する構成も検討してください。

## 4. 認証情報の安全な保管と共有

- 認証情報はソースコードに直書きせず、`.env.local` などの環境変数ファイルやシークレットマネージャー（AWS Secrets Manager、Parameter Store、Vercel/Netlify のプロジェクトシークレットなど）で管理します。
- チームで共有する場合は、パスワードマネージャーや秘密管理サービスを利用し、アクセスログを残します。
- 可能な限り IAM ユーザーではなく短期利用の一時認証情報（STS）を使用し、長期キーの漏洩リスクを下げます。

## 5. ローカル開発環境での AWS CLI 設定

1. 開発マシンに [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) をインストールします。
2. ターミナルで `aws configure` を実行し、取得したアクセスキー ID、シークレットアクセスキー、既定リージョン（Bedrock を利用するリージョン）を入力します。
3. 認証情報は通常 `~/.aws/credentials` に保存されます。Auth0 AI サンプルでは `.env.local` に以下のように設定して参照します。

   ```bash
   AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
   AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
   ```

4. Vercel などのホスティング環境にデプロイする場合は、同じ値をプラットフォームのシークレット設定に入力してください。

## 6. Bedrock API への接続確認

1. AWS CLI で簡単な疎通確認を行います。

   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

   モデル一覧が返ってくれば、IAM ポリシーと認証情報が正しく設定されています。

2. アプリケーションから利用する場合は、`.env.local` の値を読み込んで Bedrock クライアントを初期化します。各サンプルの README に従って依存パッケージをインストールした後、開発サーバーを起動し、ログやレスポンスでエラーがないことを確認してください。

## 7. 運用時のセキュリティとコスト管理のポイント

- 利用しないモデルやリージョンへのアクセス権を付与しない最小権限の原則を徹底します。
- CloudTrail や CloudWatch Logs を活用し、Bedrock API の呼び出し履歴をモニタリングします。
- 不要になったアクセスキーは必ず無効化または削除します。
- コストアラート（AWS Budgets 等）を設定し、予期しない利用増加にすぐ気づけるようにします。
- 定期的にポリシーと認証情報の棚卸しを行い、利用状況に応じて更新またはローテーションします。

---

これで Auth0 AI サンプルを動かすための AWS 側の準備は完了です。Auth0 側の設定手順と合わせて、各サンプルの README を参考に開発を進めてください。
