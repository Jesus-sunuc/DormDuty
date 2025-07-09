export interface AnnouncementReply {
  replyId: number;
  announcementId: number;
  membershipId: number;
  message: string;
  repliedAt: string;
  memberName: string;
}

export interface AnnouncementReplyCreateRequest {
  announcementId: number;
  message: string;
}
