import { Review, User, Comment } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Johnson',
  handle: 'alex.j@example.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCU2i1bPZrD-nbTicHH1PqYFWm382fyv1pVyeM-wIWB-rUKKxkwZrgn0OHq7XpYsxkTrYNFj1oNzxxd7WninKg98foZXcO-I5IF1j6c-J9nP3odwiw5Mg1KPH1woM-4i5hvxEtm9-XWa0Pp64gyx1d2rEMLVg7LVmLaEOjedKEwreMh3tGPLIdND7pYBo_vw5-trw9VbmAsQt8EY6ojMyJr27Gr0xSta6hcY2TddgfKdZkp9BM8ATec-e4YppfsBGHwdkzs2moCvI',
  verified: true,
  stats: {
    reviews: 24,
    votes: 158,
    rating: 4.8
  }
};

export const reviews: Review[] = [
  {
    id: 'r0',
    entityName: 'Downtown Bistro',
    entityType: 'Restaurant',
    rating: 5.0,
    date: '1h ago',
    timestamp: Date.now() - 3600000,
    text: 'Ideally located and the food was fantastic. I highly recommend the pasta dishes.',
    likes: 4,
    comments: 1,
    user: currentUser // Added current user review
  },
  {
    id: 'r1',
    entityName: 'TechStore NYC',
    entityType: 'Electronics',
    rating: 4.2,
    date: '2h ago',
    timestamp: Date.now() - 7200000,
    text: 'Great service, but the waiting time was a bit long. The staff was knowledgeable about the new laptop models.',
    likes: 124,
    comments: 8,
    tags: ['Verified'],
    user: {
      id: 'u2',
      name: 'TechStore NYC',
      handle: 'business',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjKJWtaOLIntJuAAYL94E2LM6Yzik-CDzZpdaNirNk_81EECI-0FOJrcym1xY7WWr4rz5dtvk3COIllEh0ysQnHwXpjgmvecWesDisuaMkaIIrXOVJ5mFRIZIQ53ZvtApnBs2SO8JbFQ-fSNpnSmxQy0AtoXAm2oe4RYJU3mj8GA-bfvMXHTt6yGRBmxZriPtURz5jJm863U9jzTZ9fwojA0B3qU0nwv8aQjElBLQSZFy8pbxFOs0VV8dUzng1Ez2qnBimMBUr8ic',
      verified: true
    }
  },
  {
    id: 'r2',
    entityName: '+1 (555) 019-2834',
    rating: 1.0,
    date: 'Yesterday',
    timestamp: Date.now() - 86400000,
    text: 'Warning: This number is associated with a known phishing scam claiming to be from the IRS.',
    likes: 452,
    comments: 0,
    tags: ['High Risk'],
    isScam: true,
    user: {
      id: 'system',
      name: 'System Alert',
      handle: 'alert',
      avatar: '',
      verified: false
    }
  },
  {
    id: 'r3',
    entityName: 'Bean & Leaf Cafe',
    entityType: 'Food & Drink',
    rating: 4.8,
    date: '5h ago',
    timestamp: Date.now() - 18000000,
    text: 'Absolutely the best espresso in town. The ambiance is perfect for remote work, though it gets busy around noon.',
    likes: 89,
    comments: 12,
    user: {
      id: 'u3',
      name: 'Bean & Leaf',
      handle: 'cafe',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlUxoSUdtTiSuUA_-PcEX6dzHUiQ8_OgkGtHD8nUNJvOaRiFSQGTQrXMSG1s9Gz44pd3pWIwVs3mMuQXjInU0jLr8sDXCOoeJTyWyxlnWfB8UG6fx0k-aEowTzk-SvqCpLDaPrJAy_-itu2zw7s52-cv3pm1C8n7Xc185Oh7GAulEcGWrZL45XFk3D17UXc-h_bk1qETC9n4dclOfcHZTobXc4CtITYGjglHldYJTs4-v6mbnzpZ_NPgj6x2XPTKAUxhcF0cDFwrM',
      verified: false
    }
  },
  {
    id: 'r4',
    entityName: 'CyberPunk 2077',
    entityType: 'Game',
    rating: 4.0,
    date: '2 hours ago',
    timestamp: Date.now() - 7200000,
    text: 'The game world is incredibly immersive and the visual design is top-notch. Night City feels alive. However, encountered several glitches.',
    images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD9sA2ZckWFV3PM6hkFf2Uznu7j1nln2OMWifQmIoePdTpgn4i_yhZ8cpQpsaAjYOgFmVTtS02AzFI1zfYQloz9AjaAf4HjAKiIQ0MjJhv_RmBeagMnq1XzSCtx5GvGDisIPkLOLMXMiE1P136ACXWrDK57zLXHLOv-nO58e_wryzZExERjoyaqlBBJLp4SR0fStR_b9x7LFgs3JRk0NbSxsEgd68PzhcwwoRs6F9cJCf3VpZlxwuFt9O9rMVFSbYA53zfOnwRzKq8',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDoNuhw9awbvmD9OfkHCdIXU_632PjUEsrkLKE5U2w09rUy_X6LtUnKes7fAQbK2-jcm6gIYITUADelNc9jQ8I-lfP0H_0UedwZPaCIpclsqEkLmmmJ8qgCivP4r_Ie_YLqP4P3FgqJ0goXBAqrZu5gOzNVWwxd9YxwkeCfsYiDn71Lgh4Oo3z3z-85DnuonXFTPvCzwoJfQjuaczNIsA-1YQ4Gl-mXzze1QszemLj1L-8n21ycta3QbFyDCkBO_JuiBIpfGlBj2PQ',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC00rirS2VMr9mliTaNBVxzJt20gElr0sBL8er0FvPQDPIdYAp6O2lvep3Pnj7-YrLMo7biR1j9dtUyqzifoBPSHA3HwuPr8d3QnwPnoxzuCGzxpamKjtjlt3H1vkfAj7XqbvAMTWlWEItiWWZW-Vxrbh2kt7oY9026_59VkKwTSrwABSOG77Tv5VfaIoLtxhONMjjOzYMp2cUvjboeOWXhEuRWHcjygRfLP6c07lCylyK0kD44LBDjlI9-gm5rwyeJpnge2vZtoqI'
    ],
    likes: 45,
    comments: 24,
    user: {
        id: 'u4',
        name: 'TechReviewer_99',
        handle: 'reviewer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZNzoafXfs7ZcHUlTA-rTXn-i1c08dV8JsopZuKbgkFsmf3643VUz2hQI6r11xNPOdxJuxsO34iXGk6m5cz704aEi7EguQea1Ler5jRUcSfL1AXsdms_zxAV6eM4gxYiUmDPdae_yiTV0RdCdm97fT8dmRYg1M_RY7M7yR2eU8Om1w97O6_7J6WjDsUV2TZA3bZp-HXJHKafY9ze_MX-ynJnfEdk2M8GvBu7Vi5-of_hUb_9ordOFdfcfBtXpuXUAURwknkiBvomA',
        verified: true
    }
  }
];

export const searchResults: Review[] = [
    {
        id: 's1',
        entityName: 'TechZone Electronics',
        rating: 4.2,
        date: 'Updated 2 hrs ago',
        timestamp: Date.now() - 7200000,
        distance: '1.2 mi away',
        text: 'Great service but the parking situation is tricky. The staff was helpful in finding the right model for my needs.',
        likes: 0,
        comments: 128,
        user: { id: 's1u', name: 'TechZone', handle: 'tz', avatar: '', verified: false }
    },
    {
        id: 's2',
        entityName: 'Gadget World',
        rating: 4.8,
        date: 'Updated 5 hrs ago',
        timestamp: Date.now() - 18000000,
        distance: '3.5 mi away',
        text: 'Found exactly what I needed. The display units were clean and the variety of accessories is unmatched.',
        likes: 0,
        comments: 54,
        user: { id: 's2u', name: 'Gadget World', handle: 'gw', avatar: '', verified: false }
    }
];

export const comments: Comment[] = [
    {
        id: 'c1',
        user: { id: 'c1u', name: 'CyberFan_01', handle: 'cf01', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJJ2dLk_5IOoRjS-O2W_NUN5IzDcnmLk57d1aTT5FW7NM1TReZGgYKjuTr-UHiyfKXKh1FImC5TkYXm1MHmnj-sLWZ5qu3GWpNZbGP9niOuvCXa4UdK8fKx7xeTpArc4ozK-ZecbN4Y7DkeAZAw46gudwD_n2bYjDjs-XyIXrxug5ovZxIb0S3_jr_XbnwAlUxXjCtCeluFTL4G9SYFzXtwGQS-cUK-i5Dd2aSDORxDx6-2nUFv96iM4GEpLSEYGZBwjvm2IVYHT0', verified: false},
        text: 'Totally agree. The visuals are stunning on PC as well, but the bugs are hard to ignore.',
        timeAgo: '1h ago',
        likes: 12
    },
    {
        id: 'c2',
        user: { id: 'c2u', name: 'CasualGamer', handle: 'cg', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw8AkcAjMjNd7JTmRj2GgEiJe9iUbjI15IyXqABd72PDbrBB0foKFjXezizEJQYaZSmLamOj7neiWe07yZG5X9CvQU0k6UG_q7aiCFOk7NQu46EcT7SyM0a1v1mpRBqFce9yfQj_mohFeh_yYo886GGoRHN1Rt3wtifzljiYdHLe8rGC5mTDZmd1lAds08GaWKPRlWPohZNYckWfzf-c-aSs0v498nLd8faGEQ8kQO06aJN238ugJFxxTRVnH2DPMlMz-QAI1QSrY', verified: false},
        text: "I didn't have these issues on my console. Maybe I got lucky?",
        timeAgo: '45m ago',
        likes: 2
    }
];