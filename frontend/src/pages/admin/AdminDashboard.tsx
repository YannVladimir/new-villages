import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BarChart2, Flag, CreditCard, FileText, Shield,
  UserX, CheckCircle, XCircle, Search, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import {
  useAdminCommunities,
  useAdminLeaderApplications,
  useAdminLogs,
  useAdminRemoveCommunity,
  useAdminReports,
  useAdminStats,
  useAdminSubscriptions,
  useAdminUsers,
  useApproveLeaderApplication,
  useReinstateUser,
  useRejectLeaderApplication,
  useResolveReport,
  useSuspendUser,
  type AdminStats,
} from '../../hooks/useAdmin';
import type { ReportResponse } from '../../hooks/useReports';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';

type AdminSection = 'overview' | 'users' | 'applications' | 'communities' | 'reports' | 'subscriptions' | 'logs';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b',
  REVIEWING: '#3b82f6',
  RESOLVED: '#9ca3af',
};

const StatTile = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700', SUSPENDED: 'bg-red-100 text-red-700',
    DEACTIVATED: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-amber-100 text-amber-700', REVIEWING: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-700',
    PAST_DUE: 'bg-amber-100 text-amber-700',
  };
  return <span className={cn("text-xs font-semibold px-2 py-1 rounded-full capitalize", colors[status] || 'bg-gray-100')}>{status.toLowerCase().replace('_', ' ')}</span>;
};

export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>('overview');
  const [userSearch, setUserSearch] = useState('');

  const stats = useAdminStats();
  const reports = useAdminReports();
  const leaderApps = useAdminLeaderApplications();

  const sidebarLinks: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'applications', label: 'Leader Applications', icon: CheckCircle, badge: leaderApps.data?.length },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'reports', label: 'Reports', icon: Flag, badge: reports.data?.filter(r => r.status === 'OPEN').length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <span className="font-heading font-bold text-sm">Admin Panel</span>
          </div>
          <Link to="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1 block">← Back to App</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => setSection(link.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors", section === link.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}
              >
                <Icon size={18} />
                <span className="flex-1">{link.label}</span>
                {!!link.badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{link.badge}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {section === 'overview' && <OverviewSection stats={stats.data} reports={reports.data ?? []} />}
        {section === 'users' && <UsersSection search={userSearch} setSearch={setUserSearch} />}
        {section === 'applications' && <ApplicationsSection />}
        {section === 'communities' && <CommunitiesSection />}
        {section === 'reports' && <ReportsSection />}
        {section === 'subscriptions' && <SubscriptionsSection />}
        {section === 'logs' && <LogsSection />}
      </div>
    </div>
  );
}

function OverviewSection({ stats, reports }: { stats: AdminStats | undefined; reports: ReportResponse[] | undefined }) {
  const reportsByStatus = ['OPEN', 'REVIEWING', 'RESOLVED'].map(status => ({
    status,
    count: (reports ?? []).filter(r => r.status === status).length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Platform Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Users" value={stats?.totalUsers ?? '—'} icon={Users} color="bg-blue-500" />
        <StatTile label="Communities" value={stats?.totalCommunities ?? '—'} icon={Users} color="bg-green-500" />
        <StatTile label="Active Subscriptions" value={stats?.activeSubscriptions ?? '—'} icon={CreditCard} color="bg-purple-500" />
        <StatTile label="Open Reports" value={stats?.openReports ?? '—'} icon={Flag} color="bg-red-500" />
      </div>
      <Card>
        <CardHeader><CardTitle>Reports by Status</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reportsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {reportsByStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSection({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const { data, isLoading } = useAdminUsers(search);
  const suspend = useSuspendUser();
  const reinstate = useReinstateUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">User Management</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." className="flex-1 text-sm focus:outline-none" />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  {['User', 'Role', 'City', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.content ?? []).map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{user.role.toLowerCase().replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-gray-600">{user.city}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={user.accountStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.accountStatus === 'ACTIVE'
                          ? <button onClick={() => suspend.mutate(user.id)} disabled={suspend.isPending} className="text-xs text-amber-600 hover:text-amber-800 font-medium"><UserX size={14} className="inline mr-1"/>Suspend</button>
                          : <button onClick={() => reinstate.mutate(user.id)} disabled={reinstate.isPending} className="text-xs text-green-600 hover:text-green-800 font-medium"><CheckCircle size={14} className="inline mr-1"/>Reinstate</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationsSection() {
  const { data, isLoading } = useAdminLeaderApplications();
  const approve = useApproveLeaderApplication();
  const reject = useRejectLeaderApplication();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Leader Applications</h1>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (data ?? []).length === 0 ? (
        <p className="text-center text-gray-500 py-10">No pending applications.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map(app => (
            <Card key={app.id}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{app.applicantName}</p>
                  <p className="text-sm text-primary font-medium">{app.proposedName}</p>
                  <p className="text-xs text-gray-500 mt-1">{app.city} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => reject.mutate(app.id)} disabled={reject.isPending}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approve.mutate(app.id)} disabled={approve.isPending}>
                    <CheckCircle size={14} className="mr-1" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CommunitiesSection() {
  const { data, isLoading } = useAdminCommunities();
  const removeCommunity = useAdminRemoveCommunity();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Community Management</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>{['Community', 'Category', 'Members', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data ?? []).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category}</td>
                    <td className="px-4 py-3 text-gray-600">{c.memberCount.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.status !== 'ARCHIVED' && (
                        <button onClick={() => removeCommunity.mutate(c.id)} disabled={removeCommunity.isPending} className="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsSection() {
  const { data, isLoading } = useAdminReports();
  const resolve = useResolveReport();

  const handleResolve = (id: string, action: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'DISMISS') => {
    resolve.mutate({ id, action }, {
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not resolve this report.'),
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Reports Queue</h1>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (data ?? []).length === 0 ? (
        <p className="text-center text-gray-500 py-10">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map(report => (
            <Card key={report.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-gray-900">Subject: <span className="text-primary">{report.targetLabel}</span></p>
                    <p className="text-sm text-gray-600 mt-1">Reason: {report.reason}</p>
                    {report.details && <p className="text-xs text-gray-500 mt-1">"{report.details}"</p>}
                    <p className="text-xs text-gray-400 mt-1">Reported by: {report.reporterName}</p>
                  </div>
                  {report.status !== 'RESOLVED' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {report.targetType !== 'USER' && (
                        <Button size="sm" variant="danger" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'REMOVE_CONTENT')}>Remove Content</Button>
                      )}
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-600" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'SUSPEND_USER')}>Suspend User</Button>
                      <Button size="sm" variant="ghost" disabled={resolve.isPending} onClick={() => handleResolve(report.id, 'DISMISS')}>Dismiss</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionsSection() {
  const { data, isLoading } = useAdminSubscriptions();
  const activeCount = (data ?? []).filter(s => s.status === 'ACTIVE').length;
  const monthlyRevenue = (data ?? []).reduce((sum, s) => sum + (s.status === 'ACTIVE' ? (s.plan === 'ORGANIZATION' ? 20 : s.plan === 'COMMUNITY_LEADER' ? 10 : 0) : 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Subscriptions & Revenue</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">${monthlyRevenue}</p><p className="text-sm text-gray-500">Est. Monthly Revenue</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{activeCount}</p><p className="text-sm text-gray-500">Active Subs</p></CardContent></Card>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>{['User', 'Plan', 'Status', 'Renews', 'Since'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data ?? []).map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{sub.userName}</p>
                      <p className="text-xs text-gray-400">{sub.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{sub.plan.toLowerCase().replace('_', ' ')}</td>
                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LogsSection() {
  const { data, isLoading } = useAdminLogs();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Activity Logs</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(data ?? []).map(log => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.description} · By: {log.actorName}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
