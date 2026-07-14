export type CommunityVisibility = 'PUBLIC' | 'PRIVATE';
export type CommunityStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
export type MembershipState = 'NONE' | 'JOINED' | 'PENDING_REQUEST';

export interface Community {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  visibility: CommunityVisibility;
  coverImageUrl: string | null;
  iconName: string | null;
  color: string | null;
  status: CommunityStatus;
  leaderId: string;
  leaderName: string | null;
  memberCount: number;
  membershipState: MembershipState;
  createdAt: string;
}

export interface CommunityInvitation {
  id: string;
  communityId: string;
  communityName: string | null;
  invitedBy: string;
  invitedByName: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface CommunityMember {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  roleInCommunity: 'LEADER' | 'MEMBER';
  status: 'JOINED' | 'PENDING_REQUEST';
  requestedAt: string;
  joinedAt: string | null;
}

export interface CommunityCreationRequest {
  id: string;
  applicantId: string;
  applicantName: string | null;
  proposedName: string;
  description: string | null;
  category: string | null;
  city: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface CommunityAnalytics {
  totalMembers: number;
  pendingJoinRequests: number;
  upcomingEvents: number;
}
