export interface Notification {
  id: string;
  type: 'message' | 'invitation' | 'event' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'New Message',
    description: 'John Smith sent you a message: "See you at the meetup!"',
    timestamp: '2 mins ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'invitation',
    title: 'Community Invitation',
    description: 'You have been invited to join the UBC Alumni Tech Network.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'event',
    title: 'Upcoming Event',
    description: 'Monthly Founder Meetup is starting in 2 hours.',
    timestamp: '2 hours ago',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'announcement',
    title: 'System Announcement',
    description: 'New messaging and community features are now live!',
    timestamp: '1 day ago',
    isRead: true,
  }
];
