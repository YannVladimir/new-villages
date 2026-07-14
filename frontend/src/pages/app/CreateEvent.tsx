import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useMyCommunities } from '../../hooks/useCommunities';
import { useMyOrganization } from '../../hooks/useOrganizations';
import { useCreateEvent } from '../../hooks/useEvents';
import { ApiError } from '../../lib/apiClient';
import { cn } from '../../lib/utils';

const EVENT_TYPES = [
  { id: 'DINNER', label: 'Community Dinner' },
  { id: 'MEETING', label: 'Zoom / Online Meeting' },
  { id: 'WORKSHOP', label: 'Workshop' },
  { id: 'SOCIAL', label: 'Social Activity' },
  { id: 'SUPPORT_NETWORKING', label: 'Support & Networking' },
];

export function CreateEvent() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const { data: myCommunities } = useMyCommunities();
  const { data: myOrganization } = useMyOrganization();
  const createEvent = useCreateEvent();

  const ledCommunities = (myCommunities ?? []).filter((c) => c.leaderId === currentUser?.id);
  const isOrgRole = currentUser?.role === 'ORGANIZATION';

  const [communityId, setCommunityId] = useState('');
  const [type, setType] = useState('SOCIAL');
  const [title, setTitle] = useState('');
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!date || !time) {
      setFormError('Please choose a date and time.');
      return;
    }
    const startAt = new Date(`${date}T${time}`).toISOString();

    createEvent.mutate(
      {
        communityId: isOrgRole ? undefined : communityId || undefined,
        organizationId: isOrgRole ? myOrganization?.id : undefined,
        title,
        description,
        type,
        startAt,
        online,
        location: online ? undefined : location,
        onlineLink: online ? onlineLink : undefined,
      },
      {
        onSuccess: () => navigate('/events'),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not publish this event.'),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <Link to="/events" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Publish Community Event</h1>
        <p className="text-sm text-gray-500">Organize dinners, meetups, webinars or local support workshops.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Meetup Dinner" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Type *</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
                  {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              {!isOrgRole && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target Community *</label>
                  <select value={communityId} onChange={e => setCommunityId(e.target.value)} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
                    <option value="" disabled>Select a community you lead</option>
                    {ledCommunities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {isOrgRole && !myOrganization && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
                You need to create your organization page before publishing events. <Link to="/org/me" className="underline font-semibold">Create it now</Link>.
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1">
                <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                This is an online event
              </label>
            </div>

            {online ? (
              <div>
                <label className="block text-sm font-medium mb-1">Online Link *</label>
                <Input value={onlineLink} onChange={e => setOnlineLink(e.target.value)} placeholder="Zoom / Google Meet link" required />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 123 Yonge St, Toronto" required />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event details *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="What should attendees prepare, expect, or bring to this event?"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link to="/events"><Button type="button" variant="ghost">Cancel</Button></Link>
              <Button type="submit" className={cn('flex items-center gap-2')} disabled={createEvent.isPending}>
                {createEvent.isPending && <Loader2 size={16} className="animate-spin" />}
                Publish Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
