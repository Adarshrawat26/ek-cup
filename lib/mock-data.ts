import type { CreatorSummary } from '@/lib/types';

export const landingStats = [
  { label: 'Creators', value: '5,00,000+' },
  { label: 'Paid to creators', value: '₹12 Cr+' },
  { label: 'Flat fee', value: '5%' },
  { label: 'Cities', value: '100+' }
];

export const features = [
  {
    title: 'One-tap support',
    description: 'Fans send a cup of chai in seconds with UPI, cards, or wallets.'
  },
  {
    title: 'Memberships',
    description: 'Monthly and yearly plans with perks that feel personal, not corporate.'
  },
  {
    title: 'Creator shop',
    description: 'Sell ebooks, presets, sessions, art, and digital downloads in one place.'
  },
  {
    title: 'Email to fans',
    description: 'Send newsletters free without bouncing between tools or Mailchimp bills.'
  },
  {
    title: 'UPI payouts',
    description: 'Get paid instantly to your UPI ID or bank account with clear settlement.'
  },
  {
    title: 'You own your fans',
    description: 'Export supporter lists anytime. We never email your audience for ourselves.'
  }
];

export const howItWorks = [
  'Create your page',
  'Share your link',
  'Receive support',
  'Get paid'
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'One-tap chai, profile page, UPI payouts, 5% fee',
    featured: false
  },
  {
    name: 'Pro',
    price: '₹0',
    description: 'Everything + memberships, shop, email, analytics',
    featured: true
  },
  {
    name: 'Brand/Agency',
    price: 'Custom',
    description: 'Multi-creator dashboard, custom domain, negotiated fees',
    featured: false
  }
];

export const spotlightCreators = [
  { name: 'Ananya Mehta', category: 'Illustration', earnings: '₹1.8L/mo' },
  { name: 'Rohan Verma', category: 'YouTube', earnings: '₹3.2L/mo' },
  { name: 'Sana Shaikh', category: 'Writing', earnings: '₹94K/mo' },
  { name: 'Kabir Joshi', category: 'Music', earnings: '₹2.1L/mo' },
  { name: 'Priya Nair', category: 'Design', earnings: '₹1.2L/mo' },
  { name: 'Arjun Sen', category: 'Education', earnings: '₹2.5L/mo' }
];

export const creators: Record<string, CreatorSummary> = {
  ananya: {
    username: 'ananya',
    name: 'Ananya Mehta',
    handle: 'ekcup.in/ananya',
    bio: 'Illustrator from Jaipur making warm, story-driven art for books, brands, and the internet. She shares process notes, behind-the-scenes sketches, and downloadable assets for supporters.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    category: ['Illustration', 'Jaipur', 'Hindi & English'],
    location: 'Jaipur, India',
    earnings: '₹1.8L/mo',
    supportersCount: '2,428 supporters',
    socialLinks: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      twitter: 'https://x.com'
    },
    supporterFeed: [
      { id: '1', name: 'Ritika', message: 'Your sketch notes are pure gold.', time: '2m ago', avatarInitials: 'R' },
      { id: '2', name: 'Dev', message: 'Bought 3 cups for the color palette drop.', time: '18m ago', avatarInitials: 'D' },
      { id: '3', name: 'Meera', message: 'The Jaipur postcard set is beautiful.', time: '1h ago', avatarInitials: 'M' }
    ],
    memberships: [
      { name: 'Chai Circle', price: '₹149/mo', perks: ['Monthly process notes', 'Supporter-only sketches'] },
      { name: 'Atelier Club', price: '₹499/mo', perks: ['Monthly art drops', 'Critique sessions', 'Wallpaper pack'] },
      { name: 'Mentor Table', price: '₹1,499/mo', perks: ['1:1 portfolio review', 'Priority replies', 'Resource vault'] }
    ]
  },
  rohan: {
    username: 'rohan',
    name: 'Rohan Verma',
    handle: 'ekcup.in/rohan',
    bio: 'Educator and creator breaking down tech, freelancing, and creator growth for young India.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    category: ['Education', 'Bengaluru', 'Hindi'],
    location: 'Bengaluru, India',
    earnings: '₹3.2L/mo',
    supportersCount: '9,840 supporters',
    socialLinks: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      twitter: 'https://x.com'
    },
    supporterFeed: [
      { id: '1', name: 'Aman', message: 'Joined for the weekly creator teardown.', time: '4m ago', avatarInitials: 'A' },
      { id: '2', name: 'Nisha', message: 'UPI worked in seconds, neat!', time: '22m ago', avatarInitials: 'N' },
      { id: '3', name: 'Kunal', message: 'The membership lectures are super practical.', time: '45m ago', avatarInitials: 'K' }
    ],
    memberships: [
      { name: 'Community', price: '₹99/mo', perks: ['Weekly resources', 'Member forum access'] },
      { name: 'Builder', price: '₹399/mo', perks: ['Deep-dive sessions', 'Templates and tools'] },
      { name: 'Inner Circle', price: '₹999/mo', perks: ['Monthly live Q&A', 'Priority reviews', 'Private updates'] }
    ]
  }
};

export function getCreator(username: string): CreatorSummary {
  return creators[username.toLowerCase()] ?? creators.ananya;
}