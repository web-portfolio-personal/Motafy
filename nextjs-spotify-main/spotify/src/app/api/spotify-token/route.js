import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Código no proporcionado' },
        { status: 400 }
      );
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    // DEBUG: Log para ver qué valores tiene el servidor
    console.log('DEBUG Token Exchange:', {
      hasClientId: !!clientId,
      clientIdPreview: clientId ? clientId.substring(0, 8) + '...' : 'MISSING',
      hasClientSecret: !!clientSecret,
      redirectUri: redirectUri || 'MISSING'
    });

    // Verificar que las variables existen
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        {
          error: 'Configuración incompleta del servidor',
          debug: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasRedirectUri: !!redirectUri
          }
        },
        { status: 500 }
      );
    }

    // Intercambiar código por tokens
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Spotify API Error:', data);
      return NextResponse.json(
        {
          error: data.error_description || data.error || 'Error al obtener token',
          spotifyError: data.error,
          redirectUsed: redirectUri
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Error en token exchange:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}