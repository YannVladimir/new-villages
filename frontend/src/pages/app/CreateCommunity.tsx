import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Globe, Lock, Image, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateCommunityRequest } from '../../hooks/useCommunities';
import { useUploadImage } from '../../hooks/useUpload';
import { useStore } from '../../store/useStore';
import { ApiError } from '../../lib/apiClient';
import { toast } from '../../store/useToastStore';

const STEPS = ['Basic Info', 'Details', 'Privacy', 'Review'];
const CATEGORIES = ['Professional', 'Social', 'Support', 'Cultural', 'Alumni', 'Sports', 'Arts', 'Faith'];

export function CreateCommunity() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', privacy: 'public', city: currentUser?.city ?? '', coverImageUrl: '' });
  const createRequest = useCreateCommunityRequest();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.info('Please choose an image file.');
      return;
    }
    uploadImage.mutate(file, {
      onSuccess: (res) => update('coverImageUrl', res.url),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Could not upload this image.'),
    });
  };

  const handleSubmit = () => {
    setFormError(null);
    createRequest.mutate(
      { name: form.name, description: form.description, category: form.category, city: form.city, visibility: form.privacy.toUpperCase(), coverImageUrl: form.coverImageUrl || undefined },
      { onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not submit your request.') }
    );
  };

  if (createRequest.isSuccess) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Community Submitted!</h2>
            <p className="text-gray-600 mb-6">Your community request is pending admin approval. You'll be notified once it's live.</p>
            <Link to="/communities"><Button className="w-full">Back to Communities</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/communities" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft size={16}/> Back to Communities
        </Link>
        <h1 className="text-3xl font-heading font-bold mb-2">Create a Community</h1>
        <p className="text-gray-600 mb-8">Fill in the details below. New communities require admin approval.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors", i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500')}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-1 mx-2 rounded", i < step ? 'bg-primary' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold mb-4">Basic Info</h2>
                    <div><label className="block text-sm font-medium mb-1">Community Name *</label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Toronto Book Club" required /></div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button key={cat} type="button" onClick={() => update('category', cat)} className={cn("px-3 py-1.5 rounded-full border text-sm font-medium transition-colors", form.category === cat ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary/50')}>{cat}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold mb-4">Details</h2>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description *</label>
                      <textarea value={form.description} onChange={e => update('description', e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={4} placeholder="What is your community about?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cover Image (optional)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      {form.coverImageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                          <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => update('coverImageUrl', '')}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Remove cover image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => !uploadImage.isPending && fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFile(e.dataTransfer.files?.[0]);
                          }}
                          className={cn(
                            "border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors",
                            uploadImage.isPending ? "cursor-wait opacity-70" : "hover:border-primary/50 cursor-pointer"
                          )}
                        >
                          {uploadImage.isPending ? (
                            <Loader2 size={32} className="mx-auto text-primary mb-2 animate-spin" />
                          ) : (
                            <Image size={32} className="mx-auto text-gray-400 mb-2"/>
                          )}
                          <p className="text-sm text-gray-500">{uploadImage.isPending ? 'Uploading…' : 'Click or drag to upload a cover image'}</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold mb-4">Privacy Settings</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'public', label: 'Public', desc: 'Anyone can find and join this community.', icon: Globe },
                        { id: 'private', label: 'Private', desc: 'Only invited members can join.', icon: Lock },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => update('privacy', opt.id)} className={cn("w-full text-left p-4 rounded-xl border-2 flex items-start gap-4 transition-colors", form.privacy === opt.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                          <opt.icon size={22} className={form.privacy === opt.id ? 'text-primary' : 'text-gray-400'} />
                          <div><p className="font-semibold text-gray-900">{opt.label}</p><p className="text-sm text-gray-500">{opt.desc}</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold mb-4">Review & Submit</h2>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{form.name || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{form.category || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Privacy</span><span className="font-medium capitalize">{form.privacy}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500">Cover Image</span><span className="font-medium">{form.coverImageUrl ? '✓ Attached' : 'None'}</span></div>
                    </div>
                    {form.coverImageUrl && (
                      <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                    )}
                    <p className="text-xs text-gray-500">By submitting, your community will be reviewed by an admin before going live, usually within 24 hours.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mt-6">
                {formError}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/communities')}><ArrowLeft size={16} className="mr-2"/>Back</Button>
              {step < STEPS.length - 1
                ? <Button onClick={() => setStep(s => s + 1)} disabled={step === 0 && (!form.name || !form.category)}>Next <ArrowRight size={16} className="ml-2"/></Button>
                : <Button onClick={handleSubmit} disabled={createRequest.isPending}>{createRequest.isPending ? 'Submitting…' : 'Submit for Approval'}</Button>
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
