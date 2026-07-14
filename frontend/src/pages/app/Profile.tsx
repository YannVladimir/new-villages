import { useEffect, useRef, useState } from 'react';
import { Camera, Edit2, Save, X, MapPin, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { toast } from '../../store/useToastStore';
import { useUpdateProfile, useUploadAvatar } from '../../hooks/useUser';
import { useMyCommunities } from '../../hooks/useCommunities';
import { ApiError } from '../../lib/apiClient';

const LANGUAGES = ['English', 'French', 'Spanish', 'Mandarin', 'Arabic', 'Portuguese'];

export function Profile() {
  const { currentUser } = useStore();
  const { data: myCommunities } = useMyCommunities();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: currentUser?.fullName ?? '',
    bio: currentUser?.bio ?? '',
    city: currentUser?.city ?? '',
    languages: currentUser?.spokenLanguages ?? [],
    selectedCommunityId: currentUser?.selectedCommunityId ?? '',
  });

  // Keep the form in sync if currentUser changes (e.g. after avatar upload).
  useEffect(() => {
    if (!editing && currentUser) {
      setForm({
        fullName: currentUser.fullName,
        bio: currentUser.bio ?? '',
        city: currentUser.city ?? '',
        languages: currentUser.spokenLanguages ?? [],
        selectedCommunityId: currentUser.selectedCommunityId ?? '',
      });
    }
  }, [currentUser, editing]);

  const toggleLang = (lang: string) =>
    setForm(p => ({ ...p, languages: p.languages.includes(lang) ? p.languages.filter(l => l !== lang) : [...p.languages, lang] }));

  const handleSave = () => {
    updateProfile.mutate(
      {
        fullName: form.fullName,
        bio: form.bio,
        city: form.city,
        spokenLanguages: form.languages,
        selectedCommunityId: form.selectedCommunityId || undefined,
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success('Profile saved successfully!');
        },
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not save your profile.'),
      }
    );
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file, {
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not upload your photo.'),
    });
    e.target.value = '';
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold">Profile</h1>
        {!editing
          ? <Button variant="outline" onClick={() => setEditing(true)}><Edit2 size={16} className="mr-2"/>Edit Profile</Button>
          : <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}><X size={16} className="mr-1"/>Cancel</Button>
              <Button onClick={handleSave} disabled={updateProfile.isPending} className="flex items-center gap-2">
                {updateProfile.isPending ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                Save
              </Button>
            </div>
        }
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
            <div className="relative">
              <img src={currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`} className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover" alt="Profile" />
              {editing && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={uploadAvatar.isPending}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-hover"
                  >
                    {uploadAvatar.isPending ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                </>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editing
                ? <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className="text-xl font-bold mb-2" />
                : <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">{form.fullName}</h2>
              }
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize">{(currentUser?.role ?? 'Member').toLowerCase().replace('_', ' ')}</span>
                {form.city && <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin size={14}/>{form.city}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
              {editing
                ? <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Tell the community a bit about yourself..." />
                : <p className="text-gray-600">{form.bio || 'No bio yet.'}</p>
              }
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              {editing
                ? <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} icon={<MapPin size={16}/>} />
                : <p className="text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/>{form.city || '—'}</p>
              }
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Selected Community</label>
              {editing ? (
                <select
                  value={form.selectedCommunityId}
                  onChange={e => setForm(p => ({ ...p, selectedCommunityId: e.target.value }))}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">None</option>
                  {(myCommunities ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">{currentUser?.selectedCommunityName || 'None selected'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Spoken Languages</label>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button key={lang} type="button" onClick={() => toggleLang(lang)} className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${form.languages.includes(lang) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary/50'}`}>{lang}</button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.languages.length > 0
                    ? form.languages.map(l => <span key={l} className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700"><Globe size={14}/>{l}</span>)
                    : <p className="text-gray-500 text-sm">None set.</p>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Section */}
      {currentUser?.acceptedTermsVersion && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-3">Legal & Compliance</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Terms Version Accepted</span><span className="font-medium">{currentUser.acceptedTermsVersion}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date Accepted</span><span className="font-medium">{currentUser.acceptedTermsDate ? new Date(currentUser.acceptedTermsDate).toLocaleDateString() : '—'}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
