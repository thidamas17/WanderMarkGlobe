import React from 'react';
import { TabType, UserProfile } from '../types';
import { APP_LOGO_URL } from '../data/mockData';
import appLogo from '../assets/logo.svg';

interface HeaderProps {
  activeTab: TabType;
  userProfile?: UserProfile;
  onProfileClick?: () => void;
  onSignUpClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userProfile,
  onProfileClick,
  onSignUpClick,
}) => {
  const getSubTitle = () => {
    switch (activeTab) {
      case 'globe':
        return 'Globe';
      case 'passport':
        return 'Passport';
      case 'stamps':
        return 'Stamps';
      case 'postcards':
        return 'Postcards';
      default:
        return 'Explorer';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#fff8f0]/92 backdrop-blur-xl shadow-[0_2px_12px_rgba(111,67,21,0.06)] border-b border-[#d5c3b6]/40">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          <img
            alt="WanderMark Explorer Logo"
            className="h-8 w-8 object-contain shrink-0 drop-shadow-sm"
            src={appLogo || APP_LOGO_URL}
          />
          <div className="flex flex-col justify-center leading-none">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-[18px] text-[#6f4315] tracking-tight font-semibold">
                WanderMark
              </span>
              <span className="font-label-coord text-[10px] text-[#465f88] uppercase opacity-85 font-medium tracking-wider">
                {getSubTitle()}
              </span>
            </div>
            <span className="font-label-stamp text-[10px] text-[#644807] uppercase tracking-wider mt-0.5 font-bold">
              Explorer's Log
            </span>
          </div>
        </div>

        {/* Right: Explorer Profile Badge & Sign Up button */}
        <div className="flex items-center gap-2">
          {onSignUpClick && (
            <button
              type="button"
              onClick={onSignUpClick}
              className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fdf3dc] text-[#6f4315] text-[11px] font-label-coord font-semibold border border-[#d5c3b6]/70 hover:bg-[#ffdea5]/50 transition-colors cursor-pointer"
              title="สมัครสมาชิกนักสำรวจใหม่"
            >
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              <span>สมัครสมาชิก</span>
            </button>
          )}

          <div
            onClick={onProfileClick}
            className="flex items-center gap-1.5 cursor-pointer group"
            title={`โปรไฟล์: ${userProfile?.fullName || 'นักสำรวจ'}`}
          >
            <div className="hidden sm:flex flex-col text-right mr-0.5">
              <span className="font-label-coord text-[9px] text-[#837469] uppercase">
                {userProfile?.username ? `@${userProfile.username}` : 'นักสำรวจ'}
              </span>
              <span className="font-label-stamp text-[10px] text-[#6f4315] font-bold">
                {userProfile?.docId || 'WM-2024'}
              </span>
            </div>
            <div className="p-0.5 rounded-full bg-[#ece2cc] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] ring-2 ring-[#ffdcc1]/70 group-hover:scale-105 active:scale-95 transition-transform">
              <img
                alt={userProfile?.fullName || 'Explorer Profile'}
                className="w-8 h-8 rounded-full object-cover"
                src={userProfile?.avatarUrl || APP_LOGO_URL}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
