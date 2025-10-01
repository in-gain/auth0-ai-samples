# [Asynchronous Authorization with Vercel AI SDK](https://auth0.com/ai/docs/async-authorization)

[Quickstart](https://auth0.com/ai/docs/async-authorization)

## Getting Started

### Prerequisites

- AWS credentials with access to [Amazon Bedrock](https://aws.amazon.com/bedrock/).
  - You can provide credentials through environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optional `AWS_SESSION_TOKEN`) or by configuring an `AWS_PROFILE` that has Bedrock permissions.
- An **[Auth0](https://auth0.com)** account and the following settings and resources configured:
  - An application for CIBA with the following settings:
    - **Application Type**: `Web Application`
    - **Grant Type**: `CIBA` (or `urn:openid:params:grant-type:ciba`)
  - An API with the following settings:
    - **Name**: `Sample Stock API`
    - **Identifier**: `sample-stock-api`
    - **Permissions**: `stock:trade`
  - **Push Notifications** using [Auth0 Guardian](https://auth0.com/docs/secure/multi-factor-authentication/auth0-guardian) must be `enabled`
  - A test user enrolled in Guardian MFA.

### Setup the workspace `.env` file

Copy the `.env.example` file to `.env` and fill in the values for the following variables, using the settings obtained from the prerequisites:

```sh
# Auth0
AUTH0_DOMAIN="<auth0-domain>"
# Client for CIBA
AUTH0_CLIENT_ID="<auth0-client-id>"
AUTH0_CLIENT_SECRET="<auth0-client-secret>"

# API
STOCK_API_URL=http://an-api-url
STOCK_API_AUDIENCE=sample-stock-api

# Amazon Bedrock
BEDROCK_REGION=us-east-1
BEDROCK_CHAT_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v1:0
# Optional embedding model configuration if you expand the sample
# BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0
# Provide credentials via AWS_PROFILE or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
# AWS_PROFILE=default
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_SESSION_TOKEN=""
```

### How to run it

1. Install dependencies.

   ```sh
   npm install
   ```

2. Running the example

   ```sh
   npm start
   ```

## License

Apache-2.0
