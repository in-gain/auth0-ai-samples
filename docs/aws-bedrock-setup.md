# AWS Bedrock セットアップガイド

このガイドでは、Auth0 AI サンプルで AWS Bedrock を使用するためのセットアップ方法を説明します。

## 前提条件

- Amazon Bedrock にアクセスできる AWS アカウント
- 適切な権限を持つ IAM ユーザーまたはロール

## 必要な IAM 権限

ベアラートークン認証で Bedrock を使用するには、以下の権限が必要です：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:CallWithBearerToken"
      ],
      "Resource": "*"
    }
  ]
}
```

### AWS コンソールでの権限追加方法

1. **IAM** → **ユーザー**（または **ロール**）に移動
2. IAM ユーザー（例：`auth0-ai-sample-bedrock`）を選択
3. **アクセス許可を追加** → **インラインポリシーを作成** をクリック
4. **JSON** タブに切り替えて、上記のポリシーを貼り付け
5. **ポリシーの確認** をクリックし、名前を付けて（例：`BedrockAccess`）**ポリシーの作成** をクリック

## 環境変数

`.env.local` ファイルに以下の環境変数を設定してください：

```bash
# Amazon Bedrock 設定
AWS_BEARER_TOKEN_BEDROCK="<ベアラートークン>"
BEDROCK_REGION="us-east-1"
BEDROCK_CHAT_MODEL_ID="anthropic.claude-3-5-sonnet-20241022-v2:0"
BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
```

### モデル ID

`@langchain/aws` の `ChatBedrockConverse` を使用する場合：
- バージョンサフィックス**付き**の完全なモデル ID を使用：`anthropic.claude-3-5-sonnet-20241022-v2:0`

利用可能な Claude モデル：
- `anthropic.claude-3-5-sonnet-20241022-v2:0`（推奨）
- `anthropic.claude-3-5-haiku-20241022-v1:0`
- `anthropic.claude-3-opus-20240229-v1:0`

利用可能な埋め込みモデル：
- `amazon.titan-embed-text-v2:0`（推奨）
- `amazon.titan-embed-text-v1`

## トラブルシューティング

### エラー：「User is not authorized to perform: bedrock:CallWithBearerToken」

IAM ユーザーに `bedrock:CallWithBearerToken` 権限がありません。上記の「AWS コンソールでの権限追加方法」に従って権限を追加してください。

### エラー：「The provided model identifier is invalid」

`ChatBedrockConverse` では、バージョンサフィックス付きの正しいモデル ID を使用していることを確認してください。例：`anthropic.claude-3-5-sonnet-20241022-v2:0`

### エラー：「import_aws.ChatBedrock is not a constructor」

`@langchain/aws` からインポートする際は、`ChatBedrock` ではなく `ChatBedrockConverse` を使用してください：

```typescript
import { ChatBedrockConverse } from '@langchain/aws';

const llm = new ChatBedrockConverse({
  model: process.env.BEDROCK_CHAT_MODEL_ID,
  region: process.env.BEDROCK_REGION,
  temperature: 0,
});
```

## ベアラートークン認証について

このサンプルでは AWS ベアラートークン認証（`AWS_BEARER_TOKEN_BEDROCK`）を使用しています。これは AWS アクセスキーを管理するよりもシンプルです。このトークンは AWS 管理者から提供され、Bedrock API を呼び出すために必要な認証情報が含まれています。

注意：すべての AWS SDK がベアラートークン認証をサポートしているわけではありません。`@langchain/aws` パッケージの `ChatBedrockConverse` はサポートしていますが、`@ai-sdk/amazon-bedrock` はサポートしていません。
