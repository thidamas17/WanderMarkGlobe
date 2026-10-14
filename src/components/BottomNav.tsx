import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { key: TabType; label: string; icon: string; count?: string }[] = [
    { key: 'globe', label: 'Globe', icon: 'public' },
    { key: 'passport', label: 'Passport', icon: 'menu_book' },
    { key: 'stamps', label: 'Stamps', icon: 'approval', count: '42' },
    { key: 'postcards', label: 'Postcards', icon: 'mark_email_unread' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pt-1 pointer-events-none">
      <div className="max-w-md mx-auto mb-2 pointer-events-auto bg-[#fff8f0]/95 backdrop-blur-2xl border border-[#d5c3b6]/80 rounded-2xl shadow-[0_8px_30px_rgba(40,25,10,0.12)] p-1.5 transition-all duration-300">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                type="button"
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#6f4315] font-semibold bg-[#f7edd7]/90 shadow-2xs scale-[1.02]'
                    : 'text-[#6b584a] hover:text-[#6f4315] hover:bg-[#f2e7d1]/50 active:scale-95'
                }`}
              >
                {/* Active Brass Pip */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-transparent via-[#7f601f] to-transparent" />
                )}

                <div className="relative flex items-center justify-center">
                  <span
                    className={`material-symbols-outlined text-[23px] transition-transform duration-200 ${
                      isActive ? 'scale-110 drop-shadow-xs' : 'opacity-85'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>

                  {item.count && !isActive && (
                    <span className="absolute -top-1 -right-2 text-[8px] font-label-coord bg-[#f2e7d1] text-[#6f4315] px-1 rounded-full font-bold border border-[#d5c3b6]/50">
                      {item.count}
                    </span>
                  )}
                </div>

                <span
                  className={`font-label-ui text-[11px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isActive ? 'font-bold text-[#6f4315]' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#7f601f] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
