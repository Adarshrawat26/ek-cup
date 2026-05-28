export type PayoutData = {
  creatorId?: string;
  upiId?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
};

export type CreatorSummary = {
  username: string;
  name: string;
  /** @deprecated Use `username` — compute the display URL as `ekcup.in/${username}` at the call site. */
  handle?: string;
  bio: string;
  avatarUrl?: string;
  /** Tags stored as a comma-joined string in the DB, split to an array here. */
  category: string[];
  location: string;
  /** Pre-formatted: e.g. "₹2,400" — gross lifetime earnings. */
  earnings: string;
  /** Pre-formatted: e.g. "5 supporters". */
  supportersCount: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  supporterFeed: {
    id: string;
    name: string;
    message: string;
    time: string;
    avatarInitials: string;
  }[];
  memberships: {
    name: string;
    price: string;
    perks: string[];
  }[];
  posts?: {
    id: string;
    title: string;
    body: string;
    audience: 'public' | 'members';
    createdAt: string;
  }[];
  shopItems?: {
    id: string;
    name: string;
    description: string;
    price: string;
    deliveryUrl?: string | null;
  }[];
};
