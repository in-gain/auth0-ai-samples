import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();

// Get the Access token from Auth0 session
export const getAccessToken = async () => {
  const session = await auth0.getSession();
  return session?.tokenSet?.accessToken;
};