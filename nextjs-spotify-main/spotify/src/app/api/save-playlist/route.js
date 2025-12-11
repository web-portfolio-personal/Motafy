import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, name, description, isPublic, tracks, accessToken } = await request.json();

    if (!userId || !name || !accessToken) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // 1. Crear la playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description: description || 'Playlist creada con Motafy',
          public: isPublic ?? true
        })
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al crear la playlist' },
        { status: createResponse.status }
      );
    }

    const playlist = await createResponse.json();

    // 2. Añadir tracks a la playlist (si hay tracks)
    if (tracks && tracks.length > 0) {
      const trackUris = tracks.map(track =>
        typeof track === 'string' ? track : `spotify:track:${track.id || track}`
      );

      // Spotify permite máximo 100 tracks por request
      for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);

        const addResponse = await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: chunk })
          }
        );

        if (!addResponse.ok) {
          console.error('Error adding tracks:', await addResponse.text());
          // Continuamos aunque falle la adición de algunos tracks
        }
      }
    }

    return NextResponse.json({
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        external_urls: playlist.external_urls,
        tracks_added: tracks?.length || 0
      }
    });

  } catch (error) {
    console.error('Error saving playlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

