import { NextResponse } from 'next/server';

// RUTA TEMPORAL DE DEBUG - ELIMINAR DESPUÉS
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  const publicClientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  return NextResponse.json({
    hasClientId: !!clientId,
    clientIdLength: clientId ? clientId.length : 0,
    clientIdPreview: clientId ? clientId.substring(0, 8) + '...' : 'MISSING',
    hasClientSecret: !!clientSecret,
    clientSecretLength: clientSecret ? clientSecret.length : 0,
    redirectUri: redirectUri || 'MISSING',
    hasPublicClientId: !!publicClientId,
    publicClientIdPreview: publicClientId ? publicClientId.substring(0, 8) + '...' : 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });
}

