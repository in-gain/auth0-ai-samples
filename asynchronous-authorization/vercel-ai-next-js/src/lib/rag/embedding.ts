import { embed, embedMany } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { desc, gt, sql, cosineDistance } from 'drizzle-orm';
import { chunk } from 'llm-chunk';

import { db } from '@/lib/db';
import { embeddings } from '@/lib/db/schema/embeddings';

const region = process.env.BEDROCK_REGION;
const embeddingModelId = process.env.BEDROCK_EMBEDDING_MODEL_ID ?? 'amazon.titan-embed-text-v2:0';

if (!region) {
  throw new Error('BEDROCK_REGION is not defined');
}

const credentialsChain = fromNodeProviderChain({ profile: process.env.AWS_PROFILE });

const dimensionsEnv = Number(process.env.BEDROCK_EMBEDDING_DIMENSIONS ?? '1024');
const supportedDims = [256, 512, 1024] as const;
const dimensions = supportedDims.find((value) => value === dimensionsEnv) ?? 1024;

const bedrock = createAmazonBedrock({
  region,
  credentialProvider: async () => {
    const { accessKeyId, secretAccessKey, sessionToken } = await credentialsChain();
    return { accessKeyId, secretAccessKey, sessionToken };
  },
});

const embeddingModel = bedrock.embedding(embeddingModelId, {
  ...(embeddingModelId === 'amazon.titan-embed-text-v2:0' ? { dimensions } : {}),
});

export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = chunk(value);
  const { embeddings: generatedEmbeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return generatedEmbeddings.map((embedding, index) => ({ content: chunks[index], embedding }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string, limit = 4) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedded)})`;
  const similarGuides = await db
    .select({ content: embeddings.content, similarity, documentId: embeddings.documentId })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t: any) => desc(t.similarity))
    .limit(limit);
  return similarGuides;
};
