# Gmail API + Token Vault セットアップ手順

このガイドでは、Auth0のToken Vaultを使ってGmail APIを安全に呼び出す方法を説明します。

## 前提条件

- Auth0アカウント
- Google Cloud アカウント
- Gmail API を有効化したGoogleプロジェクト

## 手順

### 1. Google Cloud Console での設定

#### 1.1 プロジェクトとGmail APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から「Gmail API」を検索
4. 「Gmail API」を有効化

#### 1.2 OAuth 2.0 クライアントIDの作成

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアントID」を選択
3. アプリケーションの種類: **ウェブアプリケーション**
4. 承認済みのリダイレクトURIを追加:
   ```
   https://YOUR_AUTH0_DOMAIN/login/callback
   ```
   例: `https://genai-8593398833715693.jp.auth0.com/login/callback`

5. 作成後、**クライアントID**と**クライアントシークレット**をコピー

#### 1.3 OAuth同意画面の設定

1. 「APIとサービス」→「OAuth同意画面」
2. ユーザータイプ: **外部**（テスト用）
3. 必要な情報を入力
4. スコープを追加:
   - `https://www.googleapis.com/auth/gmail.readonly` (メール読み取り専用)
   - 必要に応じて他のスコープも追加
5. テストユーザーを追加（自分のGmailアドレス）

### 2. Auth0 Dashboard での設定

#### 2.1 Token Vaultの有効化

1. [Auth0 Dashboard](https://manage.auth0.com/)にログイン
2. Settings → Advanced
3. **Token Vault**を有効化
4. 変更を保存

#### 2.2 Google Social Connectionの作成

1. Authentication → Social → 「+ Create Connection」
2. 「Google」を選択
3. 以下を設定:
   - **Client ID**: Google Cloud Consoleで取得したクライアントID
   - **Client Secret**: Google Cloud Consoleで取得したクライアントシークレット

4. 「Permissions」タブに移動し、以下のスコープを追加:
   ```
   email
   profile
   openid
   https://www.googleapis.com/auth/gmail.readonly
   ```

5. 「Enable for your Application」でアプリケーションを有効化

#### 2.3 Token Vault Connection の設定

1. Authentication → Social → Google Connection の設定画面
2. 「Advanced Settings」を開く
3. 「Token Vault」セクションで:
   - **Enable Token Vault**: ON
   - **Store Refresh Token**: ON（オプション、長期アクセスに必要）

#### 2.4 Auth0 Application の設定

1. Applications → Applications → あなたのアプリケーション
2. Settings タブ:
   - **Allowed Callback URLs**: `http://localhost:3004/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3004`
   - **Allowed Web Origins**: `http://localhost:3004`

3. Connections タブ:
   - Google Connection が有効になっていることを確認

### 3. 環境変数の設定

`.env.local`ファイルに以下を追加:

```bash
# Auth0 configuration
AUTH0_DOMAIN="https://YOUR_TENANT.auth0.com"
AUTH0_CLIENT_ID="YOUR_CLIENT_ID"
AUTH0_CLIENT_SECRET="YOUR_CLIENT_SECRET"
APP_BASE_URL="http://localhost:3004"

# その他の設定（既存）
AWS_BEARER_TOKEN_BEDROCK="..."
BEDROCK_REGION="us-east-1"
BEDROCK_CHAT_MODEL_ID="openai.gpt-oss-20b-1:0"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_documents_db"
LANGGRAPH_API_URL="http://localhost:54368"
```

### 4. アプリケーションの起動

```bash
# 依存関係のインストールとDBマイグレーション
npm run setup

# アプリケーションの起動
npm run all:dev
```

アプリケーションは以下のURLで起動します:
- Next.js: http://localhost:3004
- LangGraph: http://localhost:54368

### 5. 動作確認

1. http://localhost:3004 にアクセス
2. 「Log in」ボタンをクリック
3. Googleアカウントでログイン
4. Gmail APIへのアクセス許可を求められたら承認
5. チャットで「最近のメールを要約して」などと入力
6. AIがGmail APIを呼び出してメールを検索・要約

## トラブルシューティング

### エラー: `redirect_uri_mismatch`

**原因**: GoogleのOAuth設定でリダイレクトURIが一致していない

**解決方法**:
- Google Cloud ConsoleでリダイレクトURIを確認
- Auth0のドメインが正しく設定されているか確認

### エラー: `access_denied`

**原因**: ユーザーがGmail APIへのアクセスを拒否した、またはテストユーザーに追加されていない

**解決方法**:
- Google Cloud ConsoleのOAuth同意画面でテストユーザーを追加
- 再度ログインしてアクセスを許可

### エラー: `insufficient_scope`

**原因**: 必要なスコープがAuth0のGoogle Connectionに追加されていない

**解決方法**:
- Auth0 DashboardでGoogle Connectionの設定を確認
- `https://www.googleapis.com/auth/gmail.readonly`スコープが追加されているか確認

### Token Vaultが動作しない

**原因**: Token Vaultが有効化されていない、またはRefresh Tokenが保存されていない

**解決方法**:
- Auth0 DashboardでToken Vaultが有効になっているか確認
- Google ConnectionでToken Vaultが有効になっているか確認
- 「Store Refresh Token」がONになっているか確認

## 参考リンク

- [Auth0 Token Vault ドキュメント](https://auth0.com/docs/secure/tokens/token-vault)
- [Gmail API ドキュメント](https://developers.google.com/gmail/api)
- [Auth0 AI SDK](https://github.com/auth0-lab/auth0-ai-js)
- [Call Other's APIs on User's Behalf](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)

## セキュリティのベストプラクティス

1. **最小権限の原則**: 必要最小限のスコープのみを要求
2. **Refresh Tokenの管理**: Token Vaultで安全に保存
3. **ユーザー同意**: ユーザーが何にアクセスしているか明確に説明
4. **トークンの有効期限**: Access Tokenは短時間で期限切れにし、Refresh Tokenで更新
5. **監査ログ**: Token Vaultのアクセスログを定期的に確認
