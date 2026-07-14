export interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string | null;
  authorId: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: string;
}
