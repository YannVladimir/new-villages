import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowLeft, Flag, UserPlus, UserMinus, ShieldAlert, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useCommunity, useCommunityMembers, useJoinCommunity, useLeaveCommunity } from '../../hooks/useCommunities';
import { useEvents, useRsvpToEvent } from '../../hooks/useEvents';
import type { CommunityEvent } from '../../types/event';
import { useCommunityPosts, useCreatePost } from '../../hooks/usePosts';
import { communityColor } from '../../lib/communityVisuals';
import { formatEventDate, formatEventTime, formatRelativeTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { GlobalReportModal } from '../../components/ui/GlobalReportModal';
import { toast } from '../../store/useToastStore';

type Tab = 'feed' | 'members' | 'events' | 'about';

export function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [postDraft, setPostDraft] = useState('');

  const { data: community, isLoading: communityLoading } = useCommunity(id);
  const { data: members, isLoading: membersLoading } = useCommunityMembers(id);
  const { data: eventsPage } = useEvents({ communityId: id });
  const { data: postsPage, isLoading: postsLoading } = useCommunityPosts(id);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const createPost = useCreatePost(id ?? '');

  const communityEvents = eventsPage?.content ?? [];
  const posts = postsPage?.content ?? [];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: `Events (${communityEvents.length})` },
    { id: 'about', label: 'About' },
  ];

  if (communityLoading || !community) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const joined = community.membershipState === 'JOINED';
  const pending = community.membershipState === 'PENDING_REQUEST';

  const handleJoinToggle = () => {
    if (joined) {
      leaveMutation.mutate(community.id, {
        onError: (err) => toast.info(err.message || 'Could not leave this community.'),
      });
    } else if (!pending) {
      joinMutation.mutate(community.id);
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDraft.trim()) return;
    createPost.mutate(postDraft, {
      onSuccess: () => setPostDraft(''),
      onError: (err) => toast.info(err.message || 'Could not publish your post.'),
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-purple-600 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url('${community.coverImageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'}')` }}
        />
        <div className="absolute top-4 left-4">
          <Link to="/communities" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Community Info */}
      <div className="px-4 md:px-8 pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
          <div className={cn("w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold shrink-0", communityColor(community.id, community.color))}>
            {community.name.charAt(0)}
          </div>
          <div className="flex-1 pt-14 sm:pt-0 min-w-0">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 truncate">{community.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Users size={14}/> {community.memberCount.toLocaleString()} members</span>
              {community.category && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">{community.category}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pending ? (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                <Clock size={16} /> Requested
              </span>
            ) : (
              <Button
                variant={joined ? "outline" : "primary"}
                onClick={handleJoinToggle}
                disabled={joinMutation.isPending || leaveMutation.isPending}
              >
                {joined ? <><UserMinus size={16} className="mr-2"/> Leave</> : <><UserPlus size={16} className="mr-2"/>Join</>}
              </Button>
            )}
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Report community"
            >
              <Flag size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("relative px-4 py-3 text-sm font-medium transition-colors", activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700')}
            >
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="communityTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {joined && (
              <Card>
                <CardContent className="p-5">
                  <form onSubmit={handlePost}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">+</div>
                      <textarea
                        value={postDraft}
                        onChange={(e) => setPostDraft(e.target.value)}
                        className="flex-1 resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        placeholder="Share something with the community..."
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button type="submit" size="sm" disabled={!postDraft.trim() || createPost.isPending}>Post</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {postsLoading ? (
              <CardSkeleton />
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Card key={post.id}>
                  <CardContent className="p-5 flex gap-3">
                    <img src={post.authorAvatarUrl || `https://i.pravatar.cc/150?u=${post.authorId}`} alt="" className="w-10 h-10 rounded-full shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{post.authorName ?? 'Someone'}</span>
                        <span className="text-gray-400 text-xs">{formatRelativeTime(post.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{post.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card><CardContent className="p-5"><p className="text-gray-500 text-center py-4">No posts yet. Be the first to share something!</p></CardContent></Card>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          membersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(members ?? []).map(member => (
                <Card key={member.userId}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <img src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`} alt="" className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-900">{member.fullName ?? 'Member'}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.roleInCommunity.toLowerCase()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {communityEvents.length > 0 ? communityEvents.map(event => (
              <EventRow key={event.id} event={event} />
            )) : <p className="text-center text-gray-500 py-8">No upcoming events for this community.</p>}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">About</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{community.description || 'No description yet.'}</p>
                  </div>
                  {community.category && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Category</h3>
                      <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-semibold">
                        {community.category}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                    <ShieldAlert size={16} className="text-primary" /> Leadership Portal
                  </h4>
                  <div className="flex items-center gap-3 pt-2">
                    <img src="https://i.pravatar.cc/40?u=leader" className="w-10 h-10 rounded-full" alt="Leader" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{community.leaderName ?? 'Community Leader'}</p>
                      <p className="text-xs text-gray-500">Community Leader</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/messages">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Contact Leader
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <GlobalReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetName={community.name}
        targetType="COMMUNITY"
        targetId={community.id}
      />
    </div>
  );
}

function EventRow({ event }: { event: CommunityEvent }) {
  const rsvp = useRsvpToEvent(event.id);
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Calendar className="text-primary" size={24}/></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14}/>{event.online ? 'Online' : event.location}</p>
          <p className="text-xs text-gray-400 mt-1">{formatEventDate(event.startAt)} · {formatEventTime(event.startAt)}</p>
        </div>
        <Button size="sm" onClick={() => rsvp.mutate('GOING')} disabled={rsvp.isPending || event.myRsvpStatus === 'GOING'}>
          {event.myRsvpStatus === 'GOING' ? 'Going ✓' : 'RSVP'}
        </Button>
      </CardContent>
    </Card>
  );
}
