import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Calendar, Award, TrendingUp, Check, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  useApproveJoinRequest,
  useCommunityMembers,
  useLeaderAnalytics,
  useLeaderPendingRequests,
  useMyCommunities,
  useRejectJoinRequest,
} from '../../hooks/useCommunities';
import { useCreatePost } from '../../hooks/usePosts';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';

export function LeaderDashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'requests' | 'composer' | 'analytics'>('members');
  const [announcementText, setAnnouncementText] = useState('');

  const { data: myCommunities } = useMyCommunities();
  const ledCommunities = (myCommunities ?? []).filter((c) => c.leaderId === currentUser?.id);
  const [communityId, setCommunityId] = useState('');

  useEffect(() => {
    if (!communityId && ledCommunities.length > 0) {
      setCommunityId(ledCommunities[0].id);
    }
  }, [ledCommunities, communityId]);

  const { data: members, isLoading: membersLoading } = useCommunityMembers(communityId || undefined);
  const { data: pendingRequests } = useLeaderPendingRequests(communityId || undefined);
  const { data: analytics } = useLeaderAnalytics(communityId || undefined);
  const approveRequest = useApproveJoinRequest(communityId);
  const rejectRequest = useRejectJoinRequest(communityId);
  const createPost = useCreatePost(communityId);

  const handleAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !communityId) return;
    createPost.mutate(announcementText, {
      onSuccess: () => {
        toast.success('Announcement published to your community feed!');
        setAnnouncementText('');
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not publish this announcement.'),
    });
  };

  if (ledCommunities.length === 0) {
    return (
      <div className="px-6 md:px-12 py-16 max-w-[1600px] mx-auto text-center">
        <Award size={40} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">No communities yet</h1>
        <p className="text-gray-500">You don't lead any communities yet. Once your community request is approved, it'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Leader Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your community portals, events, and member roster.</p>
        </div>
        <div className="flex items-center gap-3">
          {ledCommunities.length > 1 && (
            <select value={communityId} onChange={e => setCommunityId(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
              {ledCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full whitespace-nowrap">
            <Award size={14} /> Community Leader
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {[
          { id: 'members', label: 'Member Roster' },
          { id: 'requests', label: `Join Requests (${pendingRequests?.length ?? 0})` },
          { id: 'composer', label: 'Publish Announcement' },
          { id: 'analytics', label: 'Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeSubTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {activeSubTab === 'members' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Active Roster</h3>
            {membersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(members ?? []).map(member => (
                      <tr key={member.userId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`} className="w-8 h-8 rounded-full" alt="" />
                          <p className="font-semibold text-gray-900">{member.fullName ?? 'Member'}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{member.roleInCommunity.toLowerCase()}</td>
                        <td className="px-4 py-3 text-gray-500">{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Requests */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {(pendingRequests ?? []).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending join requests.</p>
          ) : (pendingRequests ?? []).map(req => (
            <Card key={req.userId}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={req.avatarUrl || `https://i.pravatar.cc/150?u=${req.userId}`} className="w-10 h-10 rounded-full" alt="" />
                  <p className="font-bold text-gray-900">{req.fullName ?? 'Member'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => rejectRequest.mutate(req.userId)} disabled={rejectRequest.isPending}>Reject</Button>
                  <Button size="sm" onClick={() => approveRequest.mutate(req.userId)} disabled={approveRequest.isPending}>Approve</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Composer tab */}
      {activeSubTab === 'composer' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Publish Announcement</h3>
            <form onSubmit={handleAnnounce} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Community</label>
                <select value={communityId} onChange={e => setCommunityId(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
                  {ledCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message content</label>
                <textarea
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Share updates, news or event details directly to your community feed..."
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                {createPost.isSuccess && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check size={14} /> Announcement published!
                  </span>
                )}
                <span className="flex-1" />
                <Button type="submit" disabled={createPost.isPending}>{createPost.isPending ? 'Publishing…' : 'Broadcast Message'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Analytics tab */}
      {activeSubTab === 'analytics' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users size={32} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalMembers ?? '—'}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar size={32} className="mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.upcomingEvents ?? '—'}</p>
              <p className="text-sm text-gray-500">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp size={32} className="mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.pendingJoinRequests ?? '—'}</p>
              <p className="text-sm text-gray-500">Pending Join Requests</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
