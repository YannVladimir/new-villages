export interface Organization {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  services: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}
