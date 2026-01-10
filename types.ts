
export interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatar: string;
  verified: boolean;
  stats?: {
    reviews: number;
    votes: number;
    rating: number;
  };
}

export interface Review {
  id: string;
  entityName: string;
  entityType?: string;
  rating: number;
  date: string;
  timestamp: number;
  distance?: string;
  text: string;
  images?: string[];
  likes: number;
  comments: number;
  user: User;
  tags?: string[];
  isScam?: boolean;
  keywords?: string[];
  status?: 'active' | 'hidden' | 'flagged';
  toxicityScore?: number;
  verifiedBadge?: boolean;
  meta?: {
    platform?: string;
    identifier?: string;
    issueType?: string;
    [key: string]: any;
  };
}

export type ViewState = 
  | 'SPLASH' 
  | 'HOME' 
  | 'SEARCH' 
  | 'REVIEW_DETAILS' 
  | 'PROFILE' 
  | 'VERIFY'
  | 'MY_REVIEWS'
  | 'WRITE_REVIEW_MODAL'
  | 'LOGIN'
  | 'LEGAL';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppContextType {
  currentView: ViewState;
  viewData: any;
  navigate: (view: ViewState, data?: any) => void;
  currentUser: User | null;
  login: (email?: string, pass?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  config: {
      categories: any[];
      loaded: boolean;
  };
}

export interface Comment {
    id: string;
    user: User;
    text: string;
    timeAgo: string;
    likes: number;
    timestamp?: number;
}

export interface ApiService {
    auth: {
        login: (email: string, pass: string) => Promise<User>;
        loginWithGoogle: () => Promise<User>;
        logout: () => Promise<void>;
        onStateChange: (callback: (user: User | null) => void) => () => void;
        sendOtp: (phone: string) => Promise<boolean>;
        verifyOtp: (phone: string, code: string) => Promise<boolean>;
    };
    config: {
        get: () => Promise<any[]>;
    };
    reviews: {
        getAll: (filter?: string) => Promise<Review[]>;
        getUserReviews: (userId: string) => Promise<Review[]>;
        create: (data: Partial<Review>) => Promise<Review>;
        vote: (reviewId: string, type: 'up' | 'down') => Promise<number>;
        addComment: (reviewId: string, text: string, user: User) => Promise<Comment>;
        getComments: (reviewId: string) => Promise<Comment[]>;
        report: (reviewId: string, reason: string) => Promise<void>;
    };
    search: {
        query: (term: string) => Promise<Review[]>;
    };
    ai: {
        analyzeReview: (text: string, entity: string) => Promise<string>;
        checkToxicity: (text: string) => Promise<number>;
        globalSearch: (query: string) => Promise<{ text: string, sources: any[] }>;
    };
}
