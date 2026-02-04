
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnimatedText } from './ui/animated-shiny-text';
import CalendarModal from './CalendarModal';
import GuestModal from './GuestModal';
import { ViewMode } from '../types';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchSection, setActiveSearchSection] = useState<'when' | 'who' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Determine current view based on route
  const currentView: ViewMode = location.pathname === '/experiences' ? 'experiences' :
    location.pathname === '/services' ? 'services' : 'homes';

  // Lifted state for guest counts so the Search button can access them
  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  });

  // Handler for date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
    const summary = `Searching for:
- Mode: ${currentView}
- Dates: Selected in calendar
- Guests: ${totalGuests} (${guestCounts.adults} adults, ${guestCounts.children} children)
- Infants: ${guestCounts.infants}
- Pets: ${guestCounts.pets}`;

    // Simulate search delay
    setTimeout(() => {
      alert(summary);
      setIsSearching(false);
      setShowCalendar(false);
      setShowGuestModal(false);
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
            <Link to="/" className="flex flex-row items-center gap-1 cursor-pointer">
              <AnimatedText
                text="Al-Baith"
                textClassName="text-xl md:text-3xl lg:text-4xl tracking-wider font-bold"
                className="py-0"
                style={{ fontFamily: '"Cinzel Decorative", cursive' }}
                gradientColors="linear-gradient(90deg, #B8860B, #FFD700, #FFF, #FFD700, #B8860B)"
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6">
                <path d="M3 10L12 3L21 10V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10Z" stroke="#C79D27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12H15V22" stroke="#C79D27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="11" y="7" width="2" height="2" fill="#4CAF50" />
              </svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6">
                  <ellipse cx="12" cy="10" rx="7" ry="8" fill="url(#balloon-gradient)" />
                  <path d="M12 18L10 22H14L12 18Z" stroke="#8B4513" strokeWidth="1.5" fill="none" />
                  <rect x="10" y="21" width="4" height="2" rx="0.5" fill="#8B4513" />
                  <defs>
                    <linearGradient id="balloon-gradient" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF6B6B" />
                      <stop offset="0.5" stopColor="#FFA500" />
                      <stop offset="1" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* NEW Badge */}
                <div className="absolute -top-1 -right-2 bg-[#4A5568] text-white text-[6px] md:text-[8px] font-bold px-1 md:px-1.5 py-0.5 rounded-full">NEW</div>
              </div>
              <span className={`text-[10px] md:text-sm lg:text-base font-semibold ${currentView === 'experiences' ? 'text-black' : 'text-neutral-600 group-hover:text-black'} transition hidden md:inline`}>Experiences</span>
              {currentView === 'experiences' && <div className="absolute -bottom-0 left-0 w-full h-0.5 md:h-1 bg-black rounded-full"></div>}
            </Link>

            {/* Services */}
            <Link
              to="/services"
              className="flex flex-col items-center gap-1 cursor-pointer group py-2 relative"
            >
              <div className="relative">
                {/* Service Bell Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6">
                  <path d="M12 3C12 3 8 3 8 7C8 11 5 12 5 15H19C19 12 16 11 16 7C16 3 12 3 12 3Z" fill="#757575" />
                  <ellipse cx="12" cy="15" rx="7" ry="1" fill="#9E9E9E" />
                  <rect x="11" y="1" width="2" height="3" rx="1" fill="#FFD700" />
                  <circle cx="12" cy="1.5" r="1" fill="#FFC107" />
                  <line x1="4" y1="18" x2="20" y2="18" stroke="#424242" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {/* NEW Badge */}
                <div className="absolute -top-1 -right-2 bg-[#4A5568] text-white text-[6px] md:text-[8px] font-bold px-1 md:px-1.5 py-0.5 rounded-full">NEW</div>
              </div>
              <span className={`text-[10px] md:text-sm lg:text-base font-semibold ${currentView === 'services' ? 'text-black' : 'text-neutral-600 group-hover:text-black'} transition hidden md:inline`}>Services</span>
              {currentView === 'services' && <div className="absolute -bottom-0 left-0 w-full h-0.5 md:h-1 bg-black rounded-full"></div>}
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex flex-row items-center gap-1 md:gap-3 shrink-0">
            <div className="text-sm font-semibold p-2 md:p-3 hover:bg-neutral-100 rounded-full cursor-pointer transition hidden lg:block">Become a host</div>
            <div className="p-2 md:p-3 hover:bg-neutral-100 rounded-full cursor-pointer hidden sm:block">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6 6.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" /></svg>
            </div>
            <div className="p-1 px-2 border border-neutral-200 flex flex-row items-center gap-1 md:gap-3 rounded-full cursor-pointer hover:shadow-md transition bg-white">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M2 16h28M2 24h28M2 8h28" /></svg>
              <div className="h-6 w-6 md:h-8 md:w-8 bg-neutral-500 rounded-full flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold">A</div>
            </div>
          </div>
        </div>

        {/* Search Bar Row with Apple-inspired Sliding Animation */}
        <div className="flex justify-center pb-6 md:pb-8 pt-3 md:pt-4">
          <div className="w-full max-w-[600px] relative px-2 md:px-0">
            <div className="relative flex flex-row items-center bg-white border border-neutral-200 rounded-full shadow-md hover:shadow-lg transition cursor-pointer h-14 md:h-16 group overflow-hidden">
              {/* Animated sliding pill background */}
              <div
                className={`absolute top-0 bottom-0 bg-neutral-100 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeSearchSection === 'when' ? 'left-0 w-[calc(50%-0.5px)]' :
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
                className="flex-1 flex flex-col justify-center px-4 md:px-10 rounded-full h-full transition-colors relative"
                style={{ zIndex: 2 }}
              >
                <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-wider">When</span>
                <span className="text-xs md:text-sm text-neutral-500 truncate">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                    : 'Add dates'
                  }
                </span>
              </div>

              {/* Separator */}
              <div className="h-6 md:h-8 w-[1px] bg-neutral-200 relative" style={{ zIndex: 2 }}></div>

              {/* Who section */}
              <div
                onClick={() => {
                  setShowGuestModal(!showGuestModal);
                  setShowCalendar(false);
                }}
                onMouseEnter={() => !showCalendar && setActiveSearchSection('who')}
                onMouseLeave={() => !showCalendar && !showGuestModal && setActiveSearchSection(null)}
                className="flex-1 flex flex-row items-center justify-between pl-4 md:pl-10 pr-1 md:pr-2 rounded-full h-full transition-colors relative group/who"
                style={{ zIndex: 2 }}
              >
                <div className="flex flex-col min-w-0 flex-shrink">
                  <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-wider">Who</span>
                  <span className="text-xs md:text-sm text-neutral-500 truncate">
                    {guestCounts.adults + guestCounts.children > 0
                      ? `${guestCounts.adults + guestCounts.children} guests`
                      : 'Add guests'}
                  </span>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gold-glow text-amber-950 flex items-center gap-1 md:gap-2 px-2.5 md:px-6 py-2 md:py-3 rounded-full hover:shadow-lg transition active:scale-95 ml-1 md:ml-4 disabled:opacity-70 disabled:cursor-wait relative flex-shrink-0"
                  style={{ zIndex: 3 }}
                >
                  {isSearching ? (
                    <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="4"><path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9" /></svg>
                  )}
                  <span className="font-bold text-[10px] md:text-[15px] hidden md:inline">{isSearching ? '...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {showCalendar && <CalendarModal currentView={currentView} onDateSelect={handleDateSelect} onClose={() => setShowCalendar(false)} />}
            {showGuestModal && (
              <GuestModal
                counts={guestCounts}
                setCounts={setGuestCounts}
              />
            )}
          </div>
        </div>
      </div>
    </header >
  );
};

export default Navbar;
