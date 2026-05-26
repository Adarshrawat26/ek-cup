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
  handle: string;
  bio: string;
  avatarUrl?: string;
  category: string[];
  location: string;
  earnings: string;
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
    audience: string;
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
