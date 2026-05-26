'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/toast';

type ShopItem = { id: string; name: string; priceInPaise: number };

export function ShopItemForm({
  creatorId,
  shopItems,
}: {
  creatorId: string;
  shopItems?: ShopItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/shop-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, name, description, price, deliveryUrl }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? 'Unable to create shop item');
      }
      setName('');
      setDescription('');
      setPrice('');
      setDeliveryUrl('');
      toast({ title: 'Shop item created', description: 'Your product is now listed.' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Could not create shop item', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(itemId: string) {
    setDeleting(itemId);
    try {
      const response = await fetch(`/api/shop-items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete shop item');
      toast({ title: 'Shop item removed', description: 'The product has been unlisted.' });
      router.refresh();
    } catch {
      toast({ title: 'Could not delete item', description: 'Please try again.' });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      {shopItems?.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-brand-50/20 px-4 py-3">
          <div>
            <div className="text-sm font-semibold line-clamp-1">{item.name}</div>
            <div className="text-xs text-brand-700">₹{(item.priceInPaise / 100).toLocaleString('en-IN')}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(item.id)}
            disabled={deleting === item.id}
            aria-label="Delete shop item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[1.5rem] border border-brand-200/70 bg-white p-4 shadow-sm">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Figma template" required />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is included and who it is for." rows={4} required />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" type="number" min="0" step="1" required />
          <Input value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="rounded-full bg-brand-500 text-white hover:bg-brand-600" disabled={loading}>
            {loading ? 'Saving…' : 'Add shop item'}
          </Button>
        </div>
      </form>
    </div>
  );
}
