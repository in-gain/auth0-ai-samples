# Amazon Bedrock 対応のための修正内容

## 概要

このドキュメントでは、Auth0 AI Samplesプロジェクトを OpenAI から Amazon Bedrock に移行するために行った変更をまとめています。

コミット: `a30714e` - feat: add Amazon Bedrock support to Next.js samples

## 対象プロジェクト

以下のすべてのNext.jsサンプルプロジェクトで同様の変更を実施：

- `asynchronous-authorization/langchain-next-js`
- `authenticate-users/langchain-next-js`
- `authorization-for-rag/langchain-next-js`
- `call-apis-on-users-behalf/others-api/langchain-next-js`
- `call-apis-on-users-behalf/your-api/langchain-next-js`

## 主な変更内容

### 1. パッケージ依存関係の変更

**package.json**

```diff
- "@langchain/openai": "0.6"
+ "@langchain/aws": "^0.1.15"
```

OpenAI用のLangChainパッケージから AWS Bedrock用のパッケージに変更。

---

### 2. 環境変数の変更

**.env.example**

```diff
- OPENAI_API_KEY="YOUR_API_KEY"
+ # Amazon Bedrock configuration
+ BEDROCK_REGION="us-east-1"
+ BEDROCK_CHAT_MODEL_ID="anthropic.claude-3-5-sonnet-20241022-v1:0"
+ BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
+ # Optional: specify an AWS profile instead of environment credentials
+ # AWS_PROFILE="default"
+ # AWS_ACCESS_KEY_ID=""
+ # AWS_SECRET_ACCESS_KEY=""
+ # AWS_SESSION_TOKEN=""
```

**変更内容：**
- OpenAI API キーの代わりに Bedrock の設定を追加
- `BEDROCK_REGION`: AWS リージョンを指定（デフォルト: us-east-1）
- `BEDROCK_CHAT_MODEL_ID`: チャットモデルのID（Claude 3.5 Sonnetを使用）
- `BEDROCK_EMBEDDING_MODEL_ID`: 埋め込みモデルのID（Amazon Titan Embeddings v2を使用）
- AWS認証情報の設定オプションを追加（プロファイル、アクセスキー等）

---

### 3. エージェントの変更

**src/lib/agent.ts**

```diff
- import { ChatOpenAI } from '@langchain/openai';
+ import { ChatBedrock } from '@langchain/aws';

+ const region = process.env.BEDROCK_REGION;
+ const model = process.env.BEDROCK_CHAT_MODEL_ID;
+
+ if (!region) {
+   throw new Error('BEDROCK_REGION is not defined');
+ }
+
+ if (!model) {
+   throw new Error('BEDROCK_CHAT_MODEL_ID is not defined');
+ }

- const llm = new ChatOpenAI({
-   model: 'gpt-4o',
+ const llm = new ChatBedrock({
+   model,
+   region,
    temperature: 0,
  });
```

**変更内容：**
- `ChatOpenAI` を `ChatBedrock` に変更
- 環境変数からリージョンとモデルIDを読み込み
- 環境変数の存在チェックを追加（未定義の場合はエラー）
- ハードコードされたモデル名を環境変数ベースの設定に変更

**注意：** 後続のコミットで `ChatBedrock` が `ChatBedrockConverse` に更新されています。

---

### 4. 埋め込み処理の変更

**src/lib/rag/embedding.ts**

```diff
- import { OpenAIEmbeddings } from '@langchain/openai';
+ import { BedrockEmbeddings } from '@langchain/aws';

+ const embeddingRegion = process.env.BEDROCK_REGION;
+ const embeddingModelId = process.env.BEDROCK_EMBEDDING_MODEL_ID;
+
+ if (!embeddingRegion) {
+   throw new Error('BEDROCK_REGION is not defined');
+ }
+
+ if (!embeddingModelId) {
+   throw new Error('BEDROCK_EMBEDDING_MODEL_ID is not defined');
+ }

- const embeddingModel = new OpenAIEmbeddings({
-   model: 'text-embedding-3-small',
+ const embeddingModel = new BedrockEmbeddings({
+   region: embeddingRegion,
+   model: embeddingModelId,
  });
```

**変更内容：**
- `OpenAIEmbeddings` を `BedrockEmbeddings` に変更
- 環境変数からリージョンとモデルIDを読み込み
- 環境変数の存在チェックを追加
- ハードコードされたモデル名を環境変数ベースの設定に変更

---

### 5. データベーススキーマの変更

**src/lib/db/schema/embeddings.ts**

```diff
  export const embeddings = pgTable(
    'embeddings',
    {
      id: serial('id').primaryKey(),
      documentId: varchar('document_id', { length: 191 }).references(() => documents.id, { onDelete: 'cascade' }),
      content: text('content').notNull(),
      metadata: jsonb('metadata').notNull(),
-     embedding: vector('embedding', { dimensions: 1536 }).notNull(),
+     embedding: vector('embedding', { dimensions: 1024 }).notNull(),
    },
    (table) => [index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))],
  );
```

**変更内容：**
- ベクトルの次元数を 1536次元（OpenAI text-embedding-3-small）から 1024次元（Amazon Titan Embeddings v2）に変更

---

### 6. データベースマイグレーションの変更

**src/lib/db/migrations/0000_embeddings.sql**

```diff
  CREATE TABLE IF NOT EXISTS "embeddings" (
    "id" serial PRIMARY KEY NOT NULL,
    "document_id" varchar(191),
    "content" text NOT NULL,
    "metadata" jsonb NOT NULL,
-   "embedding" vector(1536) NOT NULL
+   "embedding" vector(1024) NOT NULL
  );
```

**変更内容：**
- SQLマイグレーションファイルのベクトル次元数も 1536 → 1024 に変更

---

## モデルの仕様

### チャットモデル: Claude 3.5 Sonnet

- **モデルID**: `anthropic.claude-3-5-sonnet-20241022-v1:0`
- **提供**: Anthropic（Amazon Bedrock経由）
- **用途**: 会話型AIアシスタント、テキスト生成

### 埋め込みモデル: Amazon Titan Embeddings Text v2

- **モデルID**: `amazon.titan-embed-text-v2:0`
- **提供**: Amazon
- **次元数**: 1024次元
- **用途**: テキストのベクトル化、セマンティック検索

---

## AWS認証設定

Bedrockを使用するには、以下のいずれかの方法でAWS認証を設定する必要があります：

### 方法1: AWS認証情報（推奨）

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_SESSION_TOKEN="your-session-token"  # 一時的な認証情報を使用する場合
```

### 方法2: AWSプロファイル

```bash
export AWS_PROFILE="your-profile-name"
```

### 方法3: IAMロール（EC2/ECS/Lambdaで実行する場合）

インスタンス/タスクにBedrockへのアクセス権限を持つIAMロールをアタッチ。

---

## 必要なIAMポリシー

BedrockのモデルにアクセスするためのIAMポリシー例：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v1:0",
        "arn:aws:bedrock:*::foundation-model/amazon.titan-embed-text-v2:0"
      ]
    }
  ]
}
```

---

## データベース移行時の注意事項

既存のデータベースに OpenAI の埋め込みデータ（1536次元）が存在する場合：

1. **新しいテーブルを作成**して移行するか
2. **既存のデータを削除**してから再度埋め込みを生成する必要があります

次元数の変更は後方互換性がないため、既存の埋め込みベクトルは使用できません。

---

## 影響範囲

### 破壊的変更

- **パッケージ**: `@langchain/openai` を使用しているコードはすべて更新が必要
- **環境変数**: OpenAI APIキーの代わりにBedrock設定が必要
- **データベース**: 埋め込みテーブルの次元数変更により既存データとの互換性なし

### 非破壊的変更

- ツールやエージェントのロジックは変更なし
- UIコンポーネントは影響なし
- Auth0関連の設定は影響なし

---

## テスト方法

1. **環境変数の設定**
   ```bash
   export BEDROCK_REGION="us-east-1"
   export BEDROCK_CHAT_MODEL_ID="anthropic.claude-3-5-sonnet-20241022-v1:0"
   export BEDROCK_EMBEDDING_MODEL_ID="amazon.titan-embed-text-v2:0"
   # AWS認証情報も設定
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   # または
   bun install
   ```

3. **データベースのマイグレーション**
   ```bash
   npm run migrate
   ```

4. **アプリケーションの起動**
   ```bash
   npm run dev
   ```

5. **動作確認**
   - チャット機能が正常に動作するか
   - ツールの呼び出しが正常に動作するか
   - RAGサンプルの場合、ドキュメント検索が正常に動作するか

---

## まとめ

この変更により、OpenAI APIの代わりにAmazon Bedrockを使用してAIエージェントを実行できるようになりました。主な利点：

- **コスト最適化**: AWSの料金体系を活用
- **データ主権**: データがAWS環境内で処理される
- **統合性**: 既存のAWSインフラストラクチャとの統合が容易
- **モデルの選択肢**: Bedrock上の複数のモデルを利用可能

変更は主に設定とパッケージの切り替えであり、アプリケーションのロジック自体に大きな変更は加えられていません。
