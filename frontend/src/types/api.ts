export type UserRole = 'MEMBER' | 'COMMUNITY_LEADER' | 'ORGANIZATION' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  country?: string;
  city?: string;
  preferredLanguage?: string;
  bio?: string;
  avatarUrl?: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  selectedCommunityId?: string;
  selectedCommunityName?: string;
  spokenLanguages: string[];
  acceptedTermsVersion?: string;
  acceptedTermsDate?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TermsVersionResponse {
  version: string;
  body: string;
  publishedAt: string;
}

export interface TermsStatusResponse {
  upToDate: boolean;
  currentVersion: string;
  acceptedVersion: string | null;
}
