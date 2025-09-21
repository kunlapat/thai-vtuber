import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/upcoming_videos.json',
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming videos: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching upcoming videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming videos' },
      { status: 500 }
    );
  }
}
