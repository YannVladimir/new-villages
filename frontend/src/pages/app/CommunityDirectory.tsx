import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Users, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  useCommunityInvitations,
  useCommunitySearch,
  useJoinCommunity,
  useLeaveCommunity,
  useMyCommunities,
  useMyCreationRequests,
  useRespondToInvitation,
} from '../../hooks/useCommunities';
import { communityColor, communityIcon } from '../../lib/communityVisuals';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from '../../store/useToastStore';
import { CardSkeleton } from '../../components/ui/CardSkeleton';

export function CommunityDirectory() {
  const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'invitations'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const discoverQuery = useCommunitySearch(searchQuery, '', 0, 50);
  const myQuery = useMyCommunities();
  const myRequestsQuery = useMyCreationRequests();
  const invitationsQuery = useCommunityInvitations();
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const respondMutation = useRespondToInvitation();

  const communities = activeTab === 'discover' ? (discoverQuery.data?.content ?? []) : (myQuery.data ?? []);
  const loading = activeTab === 'discover' ? discoverQuery.isLoading : myQuery.isLoading;
  const invitations = invitationsQuery.data ?? [];

  const handleJoin = (id: string, name: string) => {
    joinMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.membershipState === 'JOINED' ? `🎉 Welcome to ${name}!` : `Request sent to join ${name}`);
      },
      onError: () => toast.info('Could not join this community. Please try again.'),
    });
  };

  const handleLeave = (id: string, name: string) => {
    leaveMutation.mutate(id, {
      onSuccess: () => toast.info(`You have left ${name}`),
      onError: (err) => toast.info(err.message || 'Could not leave this community.'),
    });
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Communities</h1>
        <Link to="/create-community">
          <Button className="whitespace-nowrap"><Plus size={18} className="mr-2" /> Create Community</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {[
          { id: 'discover', label: 'Discover' },
          { id: 'my', label: 'My Communities' },
          { id: 'invitations', label: 'Invitations', badge: invitations.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id ? "text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {tab.badge}
              </span>
            ) : null}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab !== 'invitations' && (
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <Input
              icon={<Search size={18} />}
              placeholder="Search communities by name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none shadow-none focus:ring-0 bg-gray-50"
            />
          </div>
          <Button variant="outline" className="hidden sm:flex border-gray-200">
            <Filter size={18} className="mr-2" /> Filter
          </Button>
        </div>
      )}

      {activeTab === 'my' && (myRequestsQuery.data ?? []).filter(r => r.status !== 'APPROVED').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Your Community Requests</h3>
          {(myRequestsQuery.data ?? []).filter(r => r.status !== 'APPROVED').map((req) => (
            <Card key={req.id} className={req.status === 'REJECTED' ? 'border-red-100' : 'border-amber-100'}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{req.proposedName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Submitted {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                {req.status === 'REJECTED' ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full shrink-0">
                    <XCircle size={14} /> Rejected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full shrink-0">
                    <Clock size={14} /> Pending admin approval
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'invitations' ? (
        invitationsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{invite.communityName}</p>
                    <p className="text-sm text-gray-500 mt-1">Invited by {invite.invitedByName ?? 'a community leader'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => respondMutation.mutate({ id: invite.id, accept: false })}>Decline</Button>
                    <Button size="sm" onClick={() => respondMutation.mutate({ id: invite.id, accept: true })}>Accept</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No invitations</h3>
            <p className="text-gray-500">Community leaders can invite you to join by email.</p>
          </div>
        )
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => {
            const Icon = communityIcon(community.iconName);
            return (
              <Card key={community.id} className="group hover:border-primary/30 flex flex-col h-full">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm shrink-0", communityColor(community.id, community.color))}>
                      <Icon size={24} />
                    </div>
                    {community.category && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wide">
                        {community.category}
                      </span>
                    )}
                  </div>

                  <Link to={`/communities/${community.id}`} className="block flex-1">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {community.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {community.description}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-500">
                      {community.memberCount.toLocaleString()} members
                    </span>
                    {community.membershipState === 'JOINED' ? (
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600" onClick={() => handleLeave(community.id, community.name)} disabled={leaveMutation.isPending}>Leave</Button>
                    ) : community.membershipState === 'PENDING_REQUEST' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                        <Clock size={14} /> Requested
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => handleJoin(community.id, community.name)} disabled={joinMutation.isPending}>Join</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No communities found</h3>
          <p className="text-gray-500">Try adjusting your search terms, or be the first to create one.</p>
        </div>
      )}

    </div>
  );
}
