export type EventType = 'DINNER' | 'MEETING' | 'WORKSHOP' | 'SOCIAL' | 'SUPPORT_NETWORKING';
export type RsvpStatus = 'GOING' | 'INTERESTED' | 'DECLINED';

export interface CommunityEvent {
  id: string;
  communityId: string | null;
  communityName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  title: string;
  description: string | null;
  type: EventType;
  startAt: string;
  online: boolean;
  location: string | null;
  onlineLink: string | null;
  coverImageUrl: string | null;
  createdBy: string;
  goingCount: number;
  myRsvpStatus: RsvpStatus | null;
  createdAt: string;
}
