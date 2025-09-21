import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/seven_days_ranking.json',
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch 7 days ranking videos: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching 7 days ranking videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 7 days ranking videos' },
      { status: 500 }
    );
  }
}
