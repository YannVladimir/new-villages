import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Video, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useEvent, useEvents, useRsvpToEvent } from '../../hooks/useEvents';
import { formatEventDate, formatEventTime } from '../../lib/format';
import { toast } from '../../store/useToastStore';
import { PageTransition } from '../../components/ui/PageTransition';

export function Events() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useEvents({ upcoming: true, size: 50 });

  const all = data?.content ?? [];
  const filtered = all.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.communityName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F5FB] pb-24">
        {/* Hero Section */}
        <div className="bg-[#2D2159] text-white py-16 md:py-24 px-6 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Discover Events</h1>
              <p className="text-primary-100 text-lg">Connect locally, learn new skills, and show up together with your community.</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0">
              <Link to="/create-event" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-[#2D2159] hover:bg-gray-100 py-6 px-8 rounded-xl font-bold">
                  + Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-6">
          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-10 max-w-xl">
            <Input
              icon={<Search size={20} className="text-gray-400" />}
              placeholder="Search by name, location, or community..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-none shadow-none focus:ring-0 h-12 text-base"
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => (
                <Link to={`/events/${event.id}`} key={event.id} className="block group h-full">
                  <Card className="h-full flex flex-col group-hover:border-[#2D2159]/30 group-hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-[#9A7DCA] to-[#2D2159] relative">
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#2D2159] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        {event.communityName ?? event.organizationName ?? 'OneVillage'}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col relative -mt-6 bg-white rounded-t-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#2D2159] mb-4">
                        <Calendar size={24} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl mb-3 leading-tight group-hover:text-[#2D2159] transition-colors">{event.title}</h3>

                      <div className="space-y-2 mt-auto mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar size={16} className="text-[#9A7DCA]" /> {formatEventDate(event.startAt)} · {formatEventTime(event.startAt)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {event.online ? <Video size={16} className="text-green-500" /> : <MapPin size={16} className="text-gray-400" />}
                          <span className="truncate">{event.online ? 'Online' : event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Users size={14} /> {event.goingCount} attending
                        </div>
                        <span className="text-[#2D2159] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Details <ArrowRight size={14} />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-gray-100">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try a different search or browse communities to find more events.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const rsvpMutation = useRsvpToEvent(id ?? '');

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-[#F6F5FB] px-6 py-12">
        <div className="max-w-4xl mx-auto"><CardSkeleton /></div>
      </div>
    );
  }

  const attending = event.myRsvpStatus === 'GOING';

  const handleRsvpToggle = () => {
    rsvpMutation.mutate(attending ? 'DECLINED' : 'GOING', {
      onSuccess: () => toast.success(attending ? 'You have cancelled your RSVP.' : '🎉 You have registered for this event!'),
      onError: (err) => toast.info(err.message || 'Could not update your RSVP.'),
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F5FB] pb-24">
        {/* Hero */}
        <div className="bg-[#2D2159] text-white py-12 px-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-2 text-primary-200 hover:text-white font-medium mb-8 transition-colors">
              <ArrowLeft size={16} /> Back to Events
            </Link>
            <div className="inline-flex items-center bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider mb-4">
              {event.communityName ?? event.organizationName ?? 'OneVillage'}
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-6 leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-primary-100">
              <span className="flex items-center gap-2"><Calendar size={18} />{formatEventDate(event.startAt)} · {formatEventTime(event.startAt)}</span>
              <span className="flex items-center gap-2"><MapPin size={18} />{event.online ? 'Online' : event.location}</span>
              <span className="flex items-center gap-2"><Users size={18} />{event.goingCount} attending</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-white rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">About this event</h2>
                <div className="prose prose-purple text-gray-600 leading-relaxed max-w-none">
                  <p>{event.description || 'No additional details provided.'}</p>
                  {event.online && event.onlineLink && (
                    <p>Join online: <a href={event.onlineLink} target="_blank" rel="noreferrer" className="text-primary underline">{event.onlineLink}</a></p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="bg-white rounded-2xl border-gray-100 shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-xl text-gray-900">RSVP</h3>
                <Button className="w-full py-6 rounded-xl font-bold" variant={attending ? 'outline' : 'primary'} onClick={handleRsvpToggle} disabled={rsvpMutation.isPending}>
                  {attending ? '✓ Attending' : 'Attend This Event'}
                </Button>
                {attending && <p className="text-sm text-green-600 text-center font-bold bg-green-50 py-2 rounded-lg">You're on the list! 🎉</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
