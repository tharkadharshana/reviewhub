import React from 'react';
import { ViewState } from './types';
import { AppProvider, useApp } from './context/Store';
import { BottomNav } from './components/Shared';

// Pages
import { Splash } from './pages/Splash';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ReviewDetails } from './pages/ReviewDetails';
import { Profile } from './pages/Profile';
import { MyReviews } from './pages/MyReviews';
import { WriteReviewModal } from './pages/WriteReviewModal';
import { Verify } from './pages/Verify';
import { Login } from './pages/Login';
import { LegalDocs } from './pages/LegalDocs';

const AppContent = () => {
  const { currentView, viewData, navigate, currentUser, showToast } = useApp();

  const handleNavigate = (view: string) => {
    // Intercept Add Review action if not logged in
    if (view === 'WRITE_REVIEW_MODAL' && !currentUser) {
        showToast("Please login to write a review", "info");
        navigate('LOGIN');
        return;
    }
    navigate(view as ViewState);
  };

  const renderView = () => {
    switch (currentView) {
      case 'SPLASH': return <Splash navigate={navigate} />;
      case 'HOME': return <Home />;
      case 'SEARCH': return <Search />;
      case 'REVIEW_DETAILS': return <ReviewDetails review={viewData} />;
      case 'PROFILE': return <Profile />;
      case 'MY_REVIEWS': return <MyReviews navigate={navigate} onReviewClick={(r) => navigate('REVIEW_DETAILS', r)} />;
      case 'VERIFY': return <Verify />;
      case 'LOGIN': return <Login />;
      case 'LEGAL': return <LegalDocs docId={viewData} />;
      default: return <Home />;
    }
  };

  const showNav = ['HOME', 'PROFILE', 'SEARCH'].includes(currentView);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-background-dark min-h-screen relative shadow-2xl overflow-hidden font-sans">
      {renderView()}
      
      {showNav && (
        <BottomNav 
            activeTab={currentView} 
            onNavigate={handleNavigate} 
        />
      )}

      {currentView === 'WRITE_REVIEW_MODAL' && (
        <WriteReviewModal onClose={() => navigate('HOME')} />
      )}
    </div>
  );
};

const App = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;