export interface AnnouncementReaction {
  reactionId: number;
  announcementId: number;
  membershipId: number;
  emoji: string;
  reactedAt: string;
  memberName: string;
}

export interface AnnouncementReactionCreateRequest {
  announcementId: number;
  emoji: string;
}
