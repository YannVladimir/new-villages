import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, EyeOff, Trash2, Moon, Sun, UserX, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useThemeStore } from '../../store/useThemeStore';
import { toast } from '../../store/useToastStore';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';
import { useBlockedUsers, useChangePassword, useDeactivateAccount, useUnblockUser } from '../../hooks/useUser';
import { ApiError } from '../../lib/apiClient';

interface ToggleProps { label: string; desc?: string; value: boolean; onChange: () => void; }
const Toggle = ({ label, desc, value, onChange }: ToggleProps) => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div>
      <p className="font-semibold text-gray-900 text-sm">{label}</p>
      {desc && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    <button
      onClick={onChange}
      aria-label={`Toggle ${label}`}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-1 ${value ? 'bg-[#2D2159]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

type TabType = 'appearance' | 'security' | 'notifications' | 'privacy' | 'danger';

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [notifs, setNotifs] = useState({ messages: true, events: true, invitations: true, announcements: false });
  const toggle = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));

  const { isDark, toggleDark } = useThemeStore();

  const handleThemeToggle = () => {
    toggleDark();
    toast.info(isDark ? '☀️ Light mode enabled' : '🌙 Dark mode enabled');
  };

  // --- Security: change password ---
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        },
        onError: (err) => setPasswordError(err instanceof ApiError ? err.message : 'Could not update your password.'),
      }
    );
  };

  // --- Privacy: blocked users ---
  const { data: blockedUsers } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  // --- Danger zone: deactivate account ---
  const deactivateAccount = useDeactivateAccount();
  const handleDeleteAccount = () => {
    deactivateAccount.mutate(undefined, {
      onSuccess: () => navigate('/'),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not delete your account.'),
    });
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: isDark ? Moon : Sun, danger: false },
    { id: 'security', label: 'Security', icon: Lock, danger: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, danger: false },
    { id: 'privacy', label: 'Privacy', icon: EyeOff, danger: false },
    { id: 'danger', label: 'Danger Zone', icon: Trash2, danger: true },
  ] as const;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#2D2159] mb-2">Settings</h1>
          <p className="text-gray-500">Manage your account preferences and security.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 shrink-0">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm whitespace-nowrap",
                      isActive
                        ? (tab.danger ? "bg-red-50 text-red-600" : "bg-[#F2F0FA] text-[#2D2159]")
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon size={18} className={cn(isActive ? "opacity-100" : "opacity-50")} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl">
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Appearance</h2>
                  <p className="text-sm text-gray-500 mb-6">Customize how OneVillage looks on your device.</p>
                </div>
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-0 divide-y divide-gray-100">
                    <div className="p-6">
                      <Toggle
                        label="Dark Mode"
                        desc="Switch between light and dark interface"
                        value={isDark}
                        onChange={handleThemeToggle}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Account Security</h2>
                  <p className="text-sm text-gray-500 mb-6">Manage your password and authentication methods.</p>
                </div>
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded-lg">
                          {passwordError}
                        </div>
                      )}
                      <input type="password" required placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="password" required minLength={8} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="password" required minLength={8} placeholder="Confirm new password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <Button type="submit" size="sm" disabled={changePassword.isPending} className="flex items-center gap-2">
                        {changePassword.isPending && <Loader2 size={14} className="animate-spin" />}
                        Update password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">Two-Factor Authentication (2FA)</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" onClick={() => toast.info('2FA setup coming soon!')}>Enable 2FA</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
                  <p className="text-sm text-gray-500 mb-6">Choose what you want to be notified about.</p>
                </div>
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-0 divide-y divide-gray-100">
                    <div className="p-6 space-y-2">
                      <Toggle label="New Messages" desc="Notify me when I receive a direct message" value={notifs.messages} onChange={() => toggle('messages')} />
                      <Toggle label="Events" desc="When an event is scheduled in my communities" value={notifs.events} onChange={() => toggle('events')} />
                      <Toggle label="Invitations" desc="When I am invited to join a new community" value={notifs.invitations} onChange={() => toggle('invitations')} />
                      <Toggle label="Announcements" desc="Important updates from community leaders" value={notifs.announcements} onChange={() => toggle('announcements')} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Privacy</h2>
                  <p className="text-sm text-gray-500 mb-6">Control who sees your profile and how you interact.</p>
                </div>
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-0 divide-y divide-gray-100">
                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">Blocked Users</p>
                        <p className="text-sm text-gray-500">{(blockedUsers?.length ?? 0)} user{(blockedUsers?.length ?? 0) === 1 ? '' : 's'} blocked</p>
                      </div>
                      <Button variant="outline" onClick={() => setBlockedModalOpen(true)}>Manage</Button>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">Profile Visibility</p>
                        <p className="text-sm text-gray-500">Who can view your full profile</p>
                      </div>
                      <select className="h-10 text-sm font-medium border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer">
                        <option>Community Members</option>
                        <option>Everyone</option>
                        <option>Only Me</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-sm text-gray-500 mb-6">Irreversible actions for your account.</p>
                </div>
                <Card className="border-red-100 shadow-sm rounded-2xl overflow-hidden bg-red-50/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-red-700 text-sm mb-1">Delete Account</p>
                        <p className="text-sm text-red-600/80">Permanently remove your account and all associated data. This action cannot be undone.</p>
                      </div>
                      <Button variant="danger" onClick={() => setDeleteOpen(true)} className="shrink-0 bg-red-600 hover:bg-red-700">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account">
        <div className="space-y-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-800">
            <p className="font-bold mb-2 text-base">This action cannot be undone.</p>
            <p>All your data, messages, and community memberships will be permanently deleted from our servers.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 py-5 rounded-xl font-semibold" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              className="flex-1 py-5 rounded-xl font-semibold bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmText !== 'DELETE' || deactivateAccount.isPending}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={blockedModalOpen} onClose={() => setBlockedModalOpen(false)} title="Blocked Users">
        <div className="space-y-3">
          {(blockedUsers ?? []).length > 0 ? (blockedUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`} className="w-10 h-10 rounded-full" alt="" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{u.fullName}</p>
                  <p className="text-xs text-gray-500">{u.city}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => unblockUser.mutate(u.id)} disabled={unblockUser.isPending}>
                <UserX size={14} /> Unblock
              </Button>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-6">No users blocked yet.</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
}
