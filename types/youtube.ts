
export interface CategoryTag {
  id: number;
  documentId: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface YoutubeItem {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  dateCreated?: string;
  content?: string;
  category: string;
  writerName?: string;
  writerEmail?: string;
  oldSlug?: string;
  idWp?: number;
  youtubeLinkAll: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  youtubeThumbnail: string;
  categoryTags: CategoryTag[];
  youtubeId: string;
}

// New types for YouTube RSS feed
export interface YouTubeFeedAuthor {
  name: string;
  uri: string;
}

export interface YouTubeFeedLink {
  rel: string;
  href: string;
}

export interface YouTubeFeedThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeFeedContent {
  url: string;
  type: string;
  width: number;
  height: number;
}

export interface YouTubeFeedStatistics {
  views: number;
}

export interface YouTubeFeedStarRating {
  count: number;
  average: number;
  min: number;
  max: number;
}

export interface YouTubeFeedCommunity {
  starRating: YouTubeFeedStarRating;
  statistics: YouTubeFeedStatistics;
}

export interface YouTubeFeedMediaGroup {
  title: string;
  content: YouTubeFeedContent;
  thumbnail: YouTubeFeedThumbnail;
  description: string;
  community: YouTubeFeedCommunity;
}

export interface YouTubeFeedEntry {
  id: string;
  videoId: string;
  channelId: string;
  title: string;
  link: string;
  author: YouTubeFeedAuthor;
  published: string;
  updated: string;
  mediaGroup: YouTubeFeedMediaGroup;
}

export interface YouTubeFeed {
  link: string;
  id: string;
  channelId: string;
  title: string;
  alternateLink: string;
  author: YouTubeFeedAuthor;
  published: string;
  entries: YouTubeFeedEntry[];
}

// Combined type for API response
export interface YouTubeFeedItem {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  published: string;
  updated: string;
  author: string;
  views: number;
  rating: number;
  youtubeId: string;
}

// Type for YouTube playlist items
export interface YouTubePlaylistItem {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  published: string;
  updated: string;
  author: string;
  views: number;
  rating: number;
  youtubeId: string;
  playlistId: string;
}
