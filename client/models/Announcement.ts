export interface Announcement {
  announcementId: number;
  roomId: number;
  createdBy: number;
  message: string;
  createdAt: string;
  memberName: string;
}

export interface AnnouncementCreateRequest {
  roomId: number;
  message: string;
}
