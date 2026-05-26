'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/toast';

type Post = { id: string; title: string; audience: string; createdAt: Date };

export function PostForm({ creatorId, posts }: { creatorId: string; posts?: Post[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('public');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, title, body, audience }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? 'Unable to create post');
      }
      setTitle('');
      setBody('');
      setAudience('public');
      toast({ title: 'Post published', description: 'Supporters will see your update.' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Could not publish post', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(postId: string) {
    setDeleting(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete post');
      toast({ title: 'Post deleted', description: 'The update has been removed.' });
      router.refresh();
    } catch {
      toast({ title: 'Could not delete post', description: 'Please try again.' });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      {posts?.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-brand-50/20 px-4 py-3">
          <div>
            <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
            <div className="text-xs text-brand-700">{p.audience === 'members' ? 'Members only' : 'Public'}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(p.id)}
            disabled={deleting === p.id}
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[1.5rem] border border-brand-200/70 bg-white p-4 shadow-sm">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New sketch drop" required />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share an update with supporters or members." rows={5} required />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="public">Public</option>
            <option value="members">Members only</option>
          </select>
          <Button type="submit" className="rounded-full bg-brand-500 text-white hover:bg-brand-600" disabled={loading}>
            {loading ? 'Publishing…' : 'Publish post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
