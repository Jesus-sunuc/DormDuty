export interface Announcement {
  announcementId: number;
  roomId: number;
  createdBy: number;
  message: string;
  createdAt: string;
  memberName: string;
  canReply: boolean;
}

export interface AnnouncementCreateRequest {
  roomId: number;
  message: string;
  canReply: boolean;
}
