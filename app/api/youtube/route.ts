import { YouTubeFeedItem } from "@/types/youtube";
import { NextRequest, NextResponse } from "next/server";
import { parseString } from "xml2js";

async function fetchYouTubeFeed(
  channelId: string,
  limit: number = 10
): Promise<YouTubeFeedItem[]> {
  const feedUrl =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube feed: ${response.status}`);
    }

    const xmlText = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlText, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const entries = result.feed.entry || [];
          const youtubeItems: YouTubeFeedItem[] = [];

          for (let i = 0; i < Math.min(entries.length, limit); i++) {
            const entry = entries[i];

            const id = entry.id?.[0] || "";
            const videoId = entry["yt:videoId"]?.[0] || "";
            const title = entry.title?.[0] || "";
            const published = entry.published?.[0] || "";
            const updated = entry.updated?.[0] || "";

            const authorName = entry.author?.[0]?.name?.[0] || "";

            const mediaGroup = entry["media:group"]?.[0];
            const description = mediaGroup?.["media:description"]?.[0] || "";
            const thumbnail = mediaGroup?.["media:thumbnail"]?.[0]?.$.url || "";

            const community = mediaGroup?.["media:community"]?.[0];
            const views = parseInt(
              community?.["media:statistics"]?.[0]?.$.views || "0"
            );
            const rating = parseFloat(
              community?.["media:starRating"]?.[0]?.$.average || "0"
            );

            youtubeItems.push({
              id,
              videoId,
              title,
              description,
              thumbnail,
              published,
              updated,
              author: authorName,
              views,
              rating,
              youtubeId: videoId,
            });
          }

          resolve(youtubeItems);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching YouTube feed:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId") || "";
  const limit = Number(searchParams.get("limit")) || 10;

  try {
    const youtubeList = await fetchYouTubeFeed(channelId, limit);
    return NextResponse.json(youtubeList);
  } catch (error) {
    console.error("Error in YouTube API:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
