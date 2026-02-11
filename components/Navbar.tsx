
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnimatedText } from './ui/animated-shiny-text';
import CalendarModal from './CalendarModal';
import GuestModal from './GuestModal';
import LoginModal from './LoginModal';
import { ViewMode } from '../types';

interface NavbarProps {
  user: { fullName: string; email: string; phoneNumber: string; countryCode: string } | null;
  setUser: (user: { fullName: string; email: string; phoneNumber: string; countryCode: string } | null) => void;
  onOpenLogin: (mode: 'login' | 'signup') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser, onOpenLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchSection, setActiveSearchSection] = useState<'when' | 'who' | null>(null);

  // Single Date State (Reverted from Range)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Determine current view based on route
  const currentView: ViewMode = location.pathname === '/experiences' ? 'experiences' :
    location.pathname === '/services' ? 'services' : 'homes';

  // Lifted state for guest counts
  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // Handler for single date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // CalendarModal usually closes itself or we close it.
    // Let's keep existing behavior if possible, but for search bar we usually want it closed after selection?
    // The previous implementation in Navbar had: setShowCalendar(false) inside handleSearch or similar.
    // CalendarModal prop onClose={() => setShowCalendar(false)} handles closing.
    setShowCalendar(false); // Auto close calendar on select
  };

  // Sync active section with dropdown states
  useEffect(() => {
    if (showCalendar) {
      setActiveSearchSection('when');
    } else if (showGuestModal) {
      setActiveSearchSection('who');
    }
  }, [showCalendar, showGuestModal]);

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearching(true);

    const totalGuests = guestCounts.adults + guestCounts.children;

    setTimeout(() => {
      setIsSearching(false);
      setShowCalendar(false);
      setShowGuestModal(false);

      const params = new URLSearchParams();
      if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
      if (totalGuests > 0) params.set('guests', totalGuests.toString());

      navigate(`/?${params.toString()}`);
    }, 600);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
        {/* Top Row: Logo Navigation */}
        <div className="h-20 md:h-24 flex flex-row items-center justify-between relative">
          {/* Left: Al-Baith Branding with Back Button */}
          <div className="flex flex-row items-center gap-2 md:gap-4 shrink-0">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-1.5 md:p-2 rounded-full hover:bg-neutral-100 transition-colors duration-200 group"
                aria-label="Back to Home"
              >
                <ArrowLeft className="h-4 w-4 md:h-6 md:w-6 text-neutral-600 group-hover:text-amber-950" />
              </Link>
            )}
            <Link to="/" className="flex flex-row items-center gap-1 cursor-pointer filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              <AnimatedText
                text="Al-Baith"
                textClassName="text-xl md:text-3xl lg:text-4xl tracking-wider font-bold"
                className="py-0"
                style={{ fontFamily: '"Cinzel Decorative", cursive' }}
                gradientColors="linear-gradient(90deg, #B8860B, #FFD700, #FFF9C4, #FFD700, #B8860B)"
                gradientAnimationDuration={15}
              />
            </Link>
          </div>

          {/* Center: Enhanced Navigation - Hidden on mobile, shown from md up */}
          <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 flex-row items-center gap-4 md:gap-6 lg:gap-8">
            {/* Homes */}
            <Link
              to="/"
              className="flex flex-col items-center gap-1 cursor-pointer group py-2 relative"
            >
              {/* House Icon */}
              {/* House Icon - Modern 3D Style */}
              {/* House Icon - Modern 3D Style */}
              <img
                src="/icons/house-3d.png"
                alt="Homes"
                className="w-5 h-5 md:w-8 md:h-8 object-contain"
              />
              <span className={`text-[10px] md:text-sm lg:text-base font-semibold ${currentView === 'homes' ? 'text-black' : 'text-neutral-600 group-hover:text-black'} transition hidden md:inline`}>Homes</span>
              {currentView === 'homes' && <div className="absolute -bottom-0 left-0 w-full h-0.5 md:h-1 bg-black rounded-full"></div>}
            </Link>

            {/* Experiences */}
            <Link
              to="/experiences"
              className="flex flex-col items-center gap-1 cursor-pointer group py-2 relative"
            >
              <div className="relative">
                {/* Hot Air Balloon Icon */}
                {/* Hot Air Balloon Icon - 3D Style */}
                {/* Hot Air Balloon Icon - 3D Style */}
                <img
                  src="/icons/balloon-3d.png"
                  alt="Experiences"
                  className="w-5 h-5 md:w-8 md:h-8 object-contain"
                />
                {/* NEW Badge */}
                <div className="absolute -top-1 -right-2 bg-[#4A5568] text-white text-[6px] md:text-[8px] font-bold px-1 md:px-1.5 py-0.5 rounded-full">NEW</div>
              </div>
              <span className={`text-[10px] md:text-sm lg:text-base font-semibold ${currentView === 'experiences' ? 'text-black' : 'text-neutral-600 group-hover:text-black'} transition hidden md:inline`}>Experiences</span>
              {currentView === 'experiences' && <div className="absolute -bottom-0 left-0 w-full h-0.5 md:h-1 bg-black rounded-full"></div>}
            </Link>
          </div>


          {/* Right: User Actions */}
          <div className="flex flex-row items-center gap-1 md:gap-3 shrink-0">

            <div className="relative">
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 px-2 border border-neutral-200 flex flex-row items-center gap-1 md:gap-3 rounded-full cursor-pointer hover:shadow-md transition bg-white"
              >
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M2 16h28M2 24h28M2 8h28" /></svg>
                {user ? (
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] md:text-[12px] font-bold overflow-hidden">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-neutral-500 rounded-full flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold">P</div>
                )}
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-[240px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-neutral-200 py-2 flex flex-col overflow-hidden z-[100]">
                  {!user ? (
                    <>
                      <div
                        className="font-semibold px-4 py-3 hover:bg-neutral-50 cursor-pointer transition"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenLogin('signup');
                        }}
                      >
                        Sign up
                      </div>
                      <div
                        className="px-4 py-3 hover:bg-neutral-50 cursor-pointer transition"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenLogin('login');
                        }}
                      >
                        Log in
                      </div>
                      <Link
                        to="/profile"
                        className="px-4 py-3 hover:bg-neutral-50 cursor-pointer text-neutral-600 block transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 font-semibold border-b border-neutral-100">
                        Hello, {user.fullName}
                      </div>
                      <Link
                        to="/profile"
                        className="px-4 py-3 hover:bg-neutral-50 cursor-pointer text-neutral-600 block transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <div
                        className="px-4 py-3 hover:bg-neutral-50 cursor-pointer text-neutral-600 transition"
                        onClick={() => {
                          setUser(null);
                          setIsMenuOpen(false);
                          navigate('/');
                        }}
                      >
                        Log out
                      </div>
                    </>
                  )}
                  <div className="h-[1px] bg-neutral-200 my-2"></div>
                  <Link
                    to="/help"
                    className="px-4 py-3 hover:bg-neutral-50 cursor-pointer text-neutral-600 block transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Help Center
                  </Link>
                  <Link
                    to="/cancellation-policy"
                    className="px-4 py-3 hover:bg-neutral-50 cursor-pointer text-neutral-600 block transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cancellation options
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Row with Apple-inspired Sliding Animation */}
        <div className="flex justify-center pb-6 md:pb-8 pt-3 md:pt-4">
          <div className="w-full max-w-[600px] relative px-2 md:px-0">
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white border border-neutral-200 rounded-3xl md:rounded-full shadow-md hover:shadow-lg transition cursor-pointer h-auto md:h-16 group overflow-visible md:overflow-hidden p-2 md:p-0 gap-1 md:gap-0">
              {/* Animated sliding pill background - Desktop Only */}
              <div
                className={`hidden md:block absolute top-0 bottom-0 bg-neutral-100 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeSearchSection === 'when' ? 'left-0 w-[calc(50%-0.5px)]' :
                  activeSearchSection === 'who' ? 'left-[calc(50%+0.5px)] w-[calc(50%-0.5px)]' :
                    'opacity-0'
                  }`}
                style={{ zIndex: 1 }}
              ></div>

              {/* When section */}
              <div
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  setShowGuestModal(false);
                }}
                onMouseEnter={() => !showGuestModal && setActiveSearchSection('when')}
                onMouseLeave={() => !showCalendar && !showGuestModal && setActiveSearchSection(null)}
                className="flex-1 flex flex-col justify-center px-6 py-3 md:p-0 md:px-10 rounded-2xl md:rounded-full hover:bg-neutral-100 md:hover:bg-transparent transition-colors relative border-b md:border-none border-neutral-100"
                style={{ zIndex: 2 }}
              >
                <span className="text-xs md:text-[12px] font-bold uppercase tracking-wider text-neutral-800">When</span>
                <span className="text-sm text-neutral-600 truncate mt-0.5">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                    : 'Add dates'
                  }
                </span>
              </div>

              {/* Separator - Desktop Only */}
              <div className="hidden md:block h-6 md:h-8 w-[1px] bg-neutral-200 relative" style={{ zIndex: 2 }}></div>

              {/* Who section */}
              <div
                onClick={() => {
                  setShowGuestModal(!showGuestModal);
                  setShowCalendar(false);
                }}
                onMouseEnter={() => !showCalendar && setActiveSearchSection('who')}
                onMouseLeave={() => !showCalendar && !showGuestModal && setActiveSearchSection(null)}
                className="flex-1 flex flex-row items-center justify-between pl-6 pr-2 py-2 md:p-0 md:pl-10 md:pr-2 rounded-2xl md:rounded-full hover:bg-neutral-100 md:hover:bg-transparent transition-colors relative group/who"
                style={{ zIndex: 2 }}
              >
                <div className="flex flex-col min-w-0 flex-shrink">
                  <span className="text-xs md:text-[12px] font-bold uppercase tracking-wider text-neutral-800">Who</span>
                  <span className="text-sm text-neutral-600 truncate mt-0.5">
                    {guestCounts.adults + guestCounts.children > 0
                      ? `${guestCounts.adults + guestCounts.children} guests`
                      : 'Add guests'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md flex items-center justify-center gap-2 px-6 py-3 md:py-3 rounded-full hover:shadow-lg hover:brightness-105 transition active:scale-95 ml-2 md:ml-4 disabled:opacity-70 disabled:cursor-wait relative flex-shrink-0 min-w-[44px] min-h-[44px]"
                  style={{ zIndex: 3 }}
                >
                  {isSearching ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="4"><path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9" /></svg>
                  )}
                  <span className="font-bold text-sm hidden md:inline">{isSearching ? '...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {showCalendar && (
              <CalendarModal
                currentView={currentView}
                onDateSelect={handleDateSelect}
                onClose={() => setShowCalendar(false)}
              />
            )}
            {showGuestModal && (
              <GuestModal
                counts={guestCounts}
                setCounts={setGuestCounts}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
