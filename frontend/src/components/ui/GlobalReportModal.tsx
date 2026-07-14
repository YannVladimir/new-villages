import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useSubmitReport, type SubmitReportPayload } from '../../hooks/useReports';

interface GlobalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetType: SubmitReportPayload['targetType'];
  targetId: string;
}

export function GlobalReportModal({ isOpen, onClose, targetName, targetType, targetId }: GlobalReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const submitReport = useSubmitReport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    submitReport.mutate(
      { targetType, targetId, reason, details: details || undefined },
      {
        onSuccess: () => {
          setTimeout(() => {
            submitReport.reset();
            setReason('');
            setDetails('');
            onClose();
          }, 2000);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Content / Account`}>
      {submitReport.isSuccess ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <Check size={24} />
          </div>
          <h3 className="font-bold text-lg">Report Submitted</h3>
          <p className="text-sm text-gray-500">Thank you. The moderation board has been notified and will review "{targetName}" shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Help us protect the OneVillage community. Why are you reporting <strong>{targetName}</strong>?
          </p>

          <div className="space-y-2">
            {[
              'Harassment, bullying, or safety concerns',
              'Hate speech or discrimination',
              'Spam, scam, or misleading information',
              'Inappropriate content or explicit behavior',
              'Other violation of Community Guidelines'
            ].map(r => (
              <label key={r} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 text-sm">
                <input
                  type="radio"
                  name="reportReason"
                  value={r}
                  onChange={e => setReason(e.target.value)}
                  className="text-primary focus:ring-primary"
                  required
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Additional Context (Optional)</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Provide any additional links or specific details..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="danger" className="flex-1" disabled={!reason || submitReport.isPending}>
              {submitReport.isPending ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
