import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/live_videos.json',
      {
        next: { revalidate: 60 }, // Cache for 1 minute (live videos change more frequently)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch live videos: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching live videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live videos' },
      { status: 500 }
    );
  }
}
