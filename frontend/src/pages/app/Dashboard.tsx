import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CardSkeleton, Skeleton } from '../../components/ui/CardSkeleton';
import { useStore } from '../../store/useStore';
import { useMyCommunities } from '../../hooks/useCommunities';
import { useEvents } from '../../hooks/useEvents';
import { useActivityFeed } from '../../hooks/usePosts';
import { communityColor } from '../../lib/communityVisuals';
import { formatEventDate, formatEventTime, formatRelativeTime } from '../../lib/format';
import { Bell, Calendar, MapPin, MessageSquare, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';

export function Dashboard() {
  const { currentUser } = useStore();
  const userName = currentUser?.fullName || 'Guest';
  const role = currentUser?.role || 'MEMBER';

  const { data: myCommunities, isLoading: communitiesLoading } = useMyCommunities();
  const { data: eventsPage, isLoading: eventsLoading } = useEvents({ upcoming: true, size: 3 });
  const { data: feedPage, isLoading: feedLoading } = useActivityFeed(0, 5);

  const upcomingEvents = eventsPage?.content ?? [];
  const activityFeed = feedPage?.content ?? [];

  return (
    <PageTransition>
      <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-8 w-full">
        {/* Greeting Banner */}
        <section className="relative bg-primary rounded-3xl overflow-hidden text-white p-8 md:p-12">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503756234508-e32369269deb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <p className="text-primary-100 text-lg max-w-xl">
                You have {upcomingEvents.length} upcoming event{upcomingEvents.length === 1 ? '' : 's'} coming up.
              </p>
            </div>
            {role === 'COMMUNITY_LEADER' && (
              <Link to="/leader-dashboard">
                <Button variant="secondary" className="whitespace-nowrap">
                  Go to Leader Portal
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Announcements */}
        {role === 'MEMBER' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
            <Bell className="text-blue-500 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900">Welcome to OneVillage</h4>
              <p className="text-blue-800 text-sm">Discover communities that match your interests, or send a direct message to a community leader.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Communities */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-heading font-bold">My Communities</h2>
                <Link to="/communities" className="text-primary hover:underline text-sm font-medium">View all</Link>
              </div>
              {communitiesLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-64 h-40 rounded-2xl shrink-0" />)}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {(myCommunities ?? []).map(community => (
                    <Link to={`/communities/${community.id}`} key={community.id} className="snap-start shrink-0 w-64 group">
                      <Card className="h-full border-transparent group-hover:border-primary/20">
                        <CardContent className="p-5 flex flex-col items-center text-center">
                          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white mb-3 shadow-sm", communityColor(community.id, community.color))}>
                            <span className="text-xl font-bold">{community.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{community.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{community.memberCount.toLocaleString()} members</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  <div className="snap-start shrink-0 w-64">
                    <Link to="/communities" className="h-full block">
                      <Card className="h-full border-dashed bg-transparent shadow-none hover:bg-white hover:shadow-sm flex items-center justify-center min-h-[160px]">
                        <div className="text-center text-primary">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-light">+</span>
                          </div>
                          <span className="font-medium text-sm">Discover More</span>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Activity Feed */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Recent Activity</h2>
              {feedLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : activityFeed.length > 0 ? (
                <div className="space-y-4">
                  {activityFeed.map(post => (
                    <Card key={post.id}>
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <img src={post.authorAvatarUrl || `https://i.pravatar.cc/150?u=${post.authorId}`} alt="" className="w-10 h-10 rounded-full shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{post.authorName ?? 'Someone'}</span>
                              <span className="text-gray-400 text-sm">•</span>
                              <Link to={`/communities/${post.communityId}`} className="text-primary text-sm font-medium hover:underline">{post.communityName}</Link>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{post.body}</p>
                            <div className="flex items-center gap-4 text-gray-500 text-xs">
                              <span>{formatRelativeTime(post.createdAt)}</span>
                              <Link to={`/communities/${post.communityId}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                <MessageSquare size={14} /> View in community
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Users className="mx-auto text-gray-300 mb-3" size={32} />
                  <p className="text-gray-500 text-sm">No recent activity yet. Join a community and post an update to get things started.</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-heading font-bold">Upcoming Events</h2>
                <Link to="/events" className="text-primary hover:underline text-sm font-medium">Calendar</Link>
              </div>
              {eventsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <Link to={`/events/${event.id}`} key={event.id}>
                      <Card className="overflow-hidden hover:border-primary/30 cursor-pointer">
                        <div className="h-2 bg-primary/20 w-full" />
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <Calendar size={16} className="text-primary shrink-0 mt-0.5" />
                              <span>{formatEventDate(event.startAt)} · {formatEventTime(event.startAt)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{event.online ? 'Online' : event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <Calendar className="mx-auto text-gray-300 mb-2" size={28} />
                  <p className="text-gray-500 text-sm">No upcoming events yet.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
