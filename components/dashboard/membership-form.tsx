'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/toast';

type Membership = {
  id: string;
  name: string;
  priceInPaise: number;
  perks: string;
};

export function MembershipForm({
  creatorId,
  memberships,
}: {
  creatorId: string;
  memberships?: Membership[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [perks, setPerks] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, name, price, perks }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? 'Unable to create membership');
      }
      setName('');
      setPrice('');
      setPerks('');
      toast({ title: 'Membership created', description: 'Your support plan is now live.' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Could not create membership', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(membershipId: string) {
    setDeleting(membershipId);
    try {
      const response = await fetch(`/api/memberships/${membershipId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete membership');
      toast({ title: 'Membership removed', description: 'The support tier has been deleted.' });
      router.refresh();
    } catch {
      toast({ title: 'Could not delete membership', description: 'Please try again.' });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      {memberships?.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-brand-50/30 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{m.name}</div>
            <div className="text-xs text-brand-700">₹{(m.priceInPaise / 100).toLocaleString('en-IN')}/mo</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(m.id)}
            disabled={deleting === m.id}
            aria-label="Delete membership"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[1.5rem] border border-brand-200/70 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chai Dost" required />
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99" type="number" min="0" step="1" required />
        </div>
        <Textarea value={perks} onChange={(e) => setPerks(e.target.value)} placeholder="Early access&#10;Monthly notes" rows={4} />
        <div className="flex justify-end">
          <Button type="submit" className="rounded-full bg-brand-500 text-white hover:bg-brand-600" disabled={loading}>
            {loading ? 'Saving…' : 'Add membership'}
          </Button>
        </div>
      </form>
    </div>
  );
}
