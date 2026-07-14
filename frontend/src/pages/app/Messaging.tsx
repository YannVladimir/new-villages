import { useEffect, useState } from 'react';
import { Send, MoreVertical, Flag, Ban, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import { useConversations, useMessages, useSendMessage, useStartConversation } from '../../hooks/useMessaging';
import { useMyCommunities } from '../../hooks/useCommunities';
import { useOrganizationsList } from '../../hooks/useOrganizations';
import { useBlockUser } from '../../hooks/useUser';
import { useSubmitReport } from '../../hooks/useReports';
import { ApiError } from '../../lib/apiClient';
import { toast } from '../../store/useToastStore';

export function Messaging() {
  const { data: conversations } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selected = (conversations ?? []).find((c) => c.id === selectedId) ?? null;

  const { data: messagesPage } = useMessages(selected?.id);
  const sendMessage = useSendMessage(selected?.id ?? '');
  const startConversation = useStartConversation();
  const blockUser = useBlockUser();
  const submitReport = useSubmitReport();

  const [draft, setDraft] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const [composeTo, setComposeTo] = useState<'LEADER' | 'ORG' | 'ADMIN'>('LEADER');
  const [composeCommunityId, setComposeCommunityId] = useState('');
  const [composeOrgId, setComposeOrgId] = useState('');
  const [composeText, setComposeText] = useState('');
  const [reportReason, setReportReason] = useState('');

  const { data: myCommunities } = useMyCommunities();
  const { data: organizations } = useOrganizationsList();

  const messages = messagesPage?.content?.slice().reverse() ?? [];

  const sendCurrentMessage = () => {
    if (!draft.trim() || !selected) return;
    sendMessage.mutate(draft, {
      onSuccess: () => setDraft(''),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not send message.'),
    });
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeText.trim()) return;

    startConversation.mutate(
      {
        type: composeTo,
        communityId: composeTo === 'LEADER' ? composeCommunityId : undefined,
        organizationId: composeTo === 'ORG' ? composeOrgId : undefined,
        initialMessage: composeText,
      },
      {
        onSuccess: (conversation) => {
          setSelectedId(conversation.id);
          setComposeText('');
          setComposeOpen(false);
        },
        onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not start this conversation.'),
      }
    );
  };

  const handleBlock = () => {
    if (!selected) return;
    blockUser.mutate(selected.otherUserId, {
      onSuccess: () => {
        toast.info(`${selected.otherUserName ?? 'This user'} has been blocked.`);
        setBlockOpen(false);
      },
    });
  };

  const handleReport = () => {
    if (!selected || !reportReason) return;
    submitReport.mutate(
      { targetType: 'USER', targetId: selected.otherUserId, reason: reportReason },
      {
        onSuccess: () => {
          toast.success('Report submitted. Our moderation team will review it.');
          setReportOpen(false);
          setReportReason('');
        },
      }
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex overflow-hidden">

      {/* Conversation List */}
      <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <h2 className="text-xl font-heading font-bold">Messages</h2>
          <Button variant="ghost" size="sm" onClick={() => setComposeOpen(true)} className="p-1 hover:bg-gray-50 rounded-full" title="New Message">
            <PlusCircle size={22} className="text-primary" />
          </Button>
        </div>
        <div className="p-3 border-b border-gray-50">
          <Input placeholder="Search messages..." className="bg-gray-50 text-xs" />
        </div>
        <div className="overflow-y-auto flex-1">
          {(conversations ?? []).length === 0 && (
            <div className="text-center text-gray-400 text-sm p-8">No conversations yet. Start one with the + button above.</div>
          )}
          {(conversations ?? []).map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn("w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left", selected?.id === conv.id && 'bg-primary/5 border-l-2 border-l-primary')}
            >
              <div className="relative shrink-0">
                <img src={conv.otherUserAvatar || `https://i.pravatar.cc/150?u=${conv.otherUserId}`} alt="" className="w-12 h-12 rounded-full" />
                {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{conv.otherUserName ?? 'Unknown'}</p>
                    <p className="text-xs text-primary font-medium capitalize">{(conv.otherUserRole ?? '').toLowerCase().replace('_', ' ')}</p>
                  </div>
                  {conv.lastMessageAt && <p className="text-xs text-gray-400 shrink-0">{new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src={selected.otherUserAvatar || `https://i.pravatar.cc/150?u=${selected.otherUserId}`} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{selected.otherUserName ?? 'Unknown'}</p>
                <p className="text-xs text-primary font-medium capitalize">{(selected.otherUserRole ?? '').toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical size={20} className="text-gray-500" />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-10">
                  <button onClick={() => { setReportOpen(true); setShowOptions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"><Flag size={14}/>Report User</button>
                  <button onClick={() => { setBlockOpen(true); setShowOptions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Ban size={14}/>Block User</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex", msg.mine ? 'justify-end' : 'justify-start')}>
                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm", msg.mine ? 'bg-primary text-white rounded-tr-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm shadow-sm')}>
                  <p>{msg.body}</p>
                  <p className={cn("text-[10px] mt-1", msg.mine ? 'text-white/70 text-right' : 'text-gray-400')}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCurrentMessage()} placeholder="Type a message..." className="rounded-full" />
              </div>
              <Button onClick={sendCurrentMessage} disabled={sendMessage.isPending} className="rounded-full w-10 h-10 p-0 shrink-0">
                {sendMessage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a conversation, or start a new one.
        </div>
      )}

      {/* Compose Message Modal */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Start New Conversation">
        <form onSubmit={handleComposeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'LEADER' as const, label: 'Leader' },
                { id: 'ORG' as const, label: 'Organization' },
                { id: 'ADMIN' as const, label: 'Admin' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setComposeTo(opt.id)}
                  className={cn(
                    "py-2 text-xs border rounded-lg font-semibold",
                    composeTo === opt.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {composeTo === 'LEADER' && (
            <div>
              <label className="block text-sm font-medium mb-1">Community</label>
              <select value={composeCommunityId} onChange={e => setComposeCommunityId(e.target.value)} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
                <option value="" disabled>Select a community</option>
                {(myCommunities ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {composeTo === 'ORG' && (
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <select value={composeOrgId} onChange={e => setComposeOrgId(e.target.value)} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:outline-none">
                <option value="" disabled>Select an organization</option>
                {(organizations ?? []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Write your initial inquiry..."
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={startConversation.isPending}>
              {startConversation.isPending ? 'Sending…' : 'Send Message'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report User">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Please select a reason and provide details. Our moderation team will review your report.</p>
          <div className="space-y-2">
            {['Harassment or bullying', 'Spam or misleading content', 'Hate speech', 'Inappropriate content', 'Other'].map(r => (
              <label key={r} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="reason" value={r} onChange={e => setReportReason(e.target.value)} className="text-primary" />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>
          <Button className="w-full" variant="danger" onClick={handleReport} disabled={!reportReason || submitReport.isPending}>
            {submitReport.isPending ? 'Submitting…' : 'Submit Report'}
          </Button>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal isOpen={blockOpen} onClose={() => setBlockOpen(false)} title="Block User">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to block <strong>{selected?.otherUserName}</strong>? They will no longer be able to message you or see your profile.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleBlock} disabled={blockUser.isPending}>Block</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
