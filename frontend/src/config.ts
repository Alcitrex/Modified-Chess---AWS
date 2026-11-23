// Injected at build time by the frontend workflow from the ChessStack outputs.
// For local dev, put the same values in frontend/.env.local (gitignored via .env.*).
export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,
  userPoolId: import.meta.env.VITE_USER_POOL_ID as string | undefined,
  userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID as string | undefined,
};
