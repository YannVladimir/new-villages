import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useCreateOrganization, useMyOrganization, useOrganization, useUpdateOrganization } from '../../hooks/useOrganizations';
import { useCommunitySearch } from '../../hooks/useCommunities';
import { useStartConversation } from '../../hooks/useMessaging';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';
import type { Organization } from '../../types/organization';

export function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const isMine = id === 'me';
  const currentUser = useStore((s) => s.currentUser);

  const myOrgQuery = useMyOrganization();
  const otherOrgQuery = useOrganization(isMine ? undefined : id);
  const org = isMine ? myOrgQuery.data : otherOrgQuery.data;
  const isLoading = isMine ? myOrgQuery.isLoading : otherOrgQuery.isLoading;

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (isMine && !org) {
    return <CreateOrganizationForm />;
  }

  if (!org) {
    return <div className="text-center py-24 text-gray-500">This organization page could not be found.</div>;
  }

  const canEdit = org.ownerUserId === currentUser?.id;
  return <OrganizationView org={org} canEdit={canEdit} />;
}

function CreateOrganizationForm() {
  const createOrg = useCreateOrganization();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [services, setServices] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createOrg.mutate(
      { name, description, contactEmail, services },
      { onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not create your organization page.') }
    );
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
          <Building2 size={32} />
        </div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Create your organization page</h1>
        <p className="text-gray-500 text-sm mt-1">Introduce your organization to the OneVillage community.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Organization Name *</label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tech Startups Canada" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="info@yourorg.ca" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="What does your organization do?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Services & Programs</label>
              <textarea value={services} onChange={e => setServices(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="List the programs or services you offer..." />
            </div>
            <Button type="submit" className="w-full" disabled={createOrg.isPending}>
              {createOrg.isPending ? 'Creating…' : 'Create Organization Page'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationView({ org, canEdit }: { org: Organization; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: org.name,
    description: org.description ?? '',
    contactEmail: org.contactEmail ?? '',
    services: org.services ?? '',
  });

  const updateOrg = useUpdateOrganization(org.id);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [proposalCommunityId, setProposalCommunityId] = useState('');
  const [proposalText, setProposalText] = useState('');
  const { data: communitiesPage } = useCommunitySearch('', '', 0, 50);
  const startConversation = useStartConversation();

  const handleSave = () => {
    updateOrg.mutate(form, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Organization page updated.');
      },
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not save changes.'),
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalCommunityId || !proposalText.trim()) return;
    startConversation.mutate(
      { type: 'LEADER', communityId: proposalCommunityId, initialMessage: proposalText },
      {
        onSuccess: () => setContactSuccess(true),
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not send this proposal.'),
      }
    );
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Organization Profile</h1>
        {canEdit && (
          !editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>Edit Details</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateOrg.isPending}>{updateOrg.isPending ? 'Saving…' : 'Save Org Page'}</Button>
            </div>
          )
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto overflow-hidden">
                {org.logoUrl ? <img src={org.logoUrl} alt="" className="w-full h-full object-cover" /> : <Building2 size={40} />}
              </div>
              <div>
                {editing
                  ? <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="text-center font-bold" />
                  : <h2 className="font-heading font-bold text-xl">{org.name}</h2>}
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">Organization</span>
              </div>
              <div className="text-sm text-gray-500 space-y-2 pt-2 border-t border-gray-100 text-left">
                {editing
                  ? <Input value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} icon={<Mail size={16} />} />
                  : <p className="flex items-center gap-2"><Mail size={16}/>{org.contactEmail || 'No contact email set'}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">About Us</h3>
              {editing ? (
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{org.description || 'No description yet.'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Services & Programs Offered</h3>
              {editing ? (
                <textarea
                  value={form.services}
                  onChange={e => setForm(prev => ({ ...prev, services: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{org.services || 'No services listed yet.'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Contact Communities</h3>
              <p className="text-xs text-gray-500">Send an inquiry proposal to a community's leadership.</p>

              {contactSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                  Proposal inquiry sent successfully!
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Select Community Portal</label>
                    <select value={proposalCommunityId} onChange={e => setProposalCommunityId(e.target.value)} required className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-primary focus:outline-none">
                      <option value="" disabled>Select a community</option>
                      {(communitiesPage?.content ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Message proposal details</label>
                    <textarea value={proposalText} onChange={e => setProposalText(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Describe potential collaboration opportunities..." required />
                  </div>
                  <Button type="submit" size="sm" disabled={startConversation.isPending}>
                    {startConversation.isPending ? 'Sending…' : 'Send Collaboration proposal'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
