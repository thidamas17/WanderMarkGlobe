/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, PostcardItem, StampItem, PassportVisaStamp, GlobePin, UserProfile } from './types';
import {
  INITIAL_POSTCARDS,
  INITIAL_STAMPS,
  INITIAL_PASSPORT_STAMPS,
  INITIAL_GLOBE_PINS,
  DEFAULT_USER_PROFILE,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PostcardView } from './components/PostcardView';
import { StampsView } from './components/StampsView';
import { PassportView } from './components/PassportView';
import { GlobeView } from './components/GlobeView';
import { ProfileModal } from './components/ProfileModal';

const STORAGE_KEYS = {
  USER: 'wandermark_user_profile',
  POSTCARDS: 'wandermark_postcards',
  STAMPS: 'wandermark_stamps',
  PASSPORT: 'wandermark_passport_stamps',
  PINS: 'wandermark_globe_pins',
  INITIALIZED: 'wandermark_app_initialized',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('globe');

  // Load User Profile from localStorage or default
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  // Load Collections from localStorage or mockData
  const [postcards, setPostcards] = useState<PostcardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTCARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved postcards', e);
    }
    return INITIAL_POSTCARDS;
  });

  const [stamps, setStamps] = useState<StampItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAMPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved stamps', e);
    }
    return INITIAL_STAMPS;
  });

  const [passportStamps, setPassportStamps] = useState<PassportVisaStamp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PASSPORT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved passport stamps', e);
    }
    return INITIAL_PASSPORT_STAMPS;
  });

  const [globePins, setGlobePins] = useState<GlobePin[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PINS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved globe pins', e);
    }
    return INITIAL_GLOBE_PINS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalMode, setProfileModalMode] = useState<'view' | 'edit' | 'signup'>('view');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTCARDS, JSON.stringify(postcards));
    } catch (e) {
      console.error(e);
    }
  }, [postcards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(stamps));
    } catch (e) {
      console.error(e);
    }
  }, [stamps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify(passportStamps));
    } catch (e) {
      console.error(e);
    }
  }, [passportStamps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(globePins));
    } catch (e) {
      console.error(e);
    }
  }, [globePins]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddPostcard = (newCard: PostcardItem) => {
    setPostcards((prev) => [newCard, ...prev]);
  };

  const handleAddStamp = (newStamp: StampItem) => {
    setStamps((prev) => [newStamp, ...prev]);
  };

  const handleAddPassportStamp = (newVisa: PassportVisaStamp) => {
    setPassportStamps((prev) => [...prev, newVisa]);
  };

  const handleAddGlobePin = (newPin: GlobePin) => {
    setGlobePins((prev) => [newPin, ...prev]);
    // Also create matching visa stamp in passport
    const autoVisa: PassportVisaStamp = {
      id: `visa-${Date.now()}`,
      country: `${newPin.country} (${newPin.city})`,
      date: newPin.date,
      location: `${newPin.city} Expedition Station`,
      coords: newPin.latLngDisplay,
      type: 'Explorer Waypoint Stamp',
      note: `ปักหมุดสำเร็จ ณ ${newPin.city} ${newPin.country} บันทึกพิกัดดาวเทียมเสร็จสมบูรณ์`,
      icon: 'location_on',
      code: newPin.code,
      shape: 'hexagon',
      color: '#6f4315',
      admitted: 'RECORDED',
      pageNumber: 7,
    };
    setPassportStamps((prev) => [...prev, autoVisa]);
  };

  // Sign up as new user -> Upon first use, all data resets to zero!
  const handleSignUpNewUser = (newUser: Omit<UserProfile, 'id' | 'docId' | 'registeredAt'>) => {
    const randomDocNum = Math.floor(Math.random() * 900000 + 100000);
    const createdProfile: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
      docId: `WM-${randomDocNum}`,
      registeredAt: new Date().toISOString().split('T')[0],
      titleRank: 'NOVICE EXPLORER',
    };

    setUserProfile(createdProfile);

    // Reset all expedition data to zero!
    setPostcards([]);
    setStamps([]);
    setPassportStamps([]);
    setGlobePins([]);

    showToast(`ยินดีต้อนรับ ${createdProfile.fullName}! ข้อมูลเริ่มต้นที่ 0 พร้อมออกเดินทางแล้ว`);
  };

  // Reset all data to zero manually
  const handleResetDataToZero = () => {
    setPostcards([]);
    setStamps([]);
    setPassportStamps([]);
    setGlobePins([]);
    showToast('รีเซ็ตข้อมูลทั้งหมดเป็น 0 เรียบร้อยแล้ว');
  };

  // Load demo data for exploration
  const handleLoadDemoData = () => {
    setPostcards(INITIAL_POSTCARDS);
    setStamps(INITIAL_STAMPS);
    setPassportStamps(INITIAL_PASSPORT_STAMPS);
    setGlobePins(INITIAL_GLOBE_PINS);
    setUserProfile(DEFAULT_USER_PROFILE);
    showToast('โหลดข้อมูลตัวอย่าง (Demo Data) สำเร็จ');
  };

  // Update profile details
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#201b0e] flex flex-col antialiased selection:bg-[#ffdea5] selection:text-[#261900]">
      {/* Fixed Sticky Header */}
      <Header
        activeTab={activeTab}
        userProfile={userProfile}
        onProfileClick={() => {
          setProfileModalMode('view');
          setIsProfileModalOpen(true);
        }}
        onSignUpClick={() => {
          setProfileModalMode('signup');
          setIsProfileModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 bg-[#fff8f0]">
        {activeTab === 'postcards' && (
          <PostcardView
            postcards={postcards}
            onAddPostcard={handleAddPostcard}
            onToast={showToast}
          />
        )}

        {activeTab === 'stamps' && (
          <StampsView
            stamps={stamps}
            onAddStamp={handleAddStamp}
            onToast={showToast}
          />
        )}

        {activeTab === 'passport' && (
          <PassportView
            stamps={passportStamps}
            userProfile={userProfile}
            onAddStamp={handleAddPassportStamp}
            onOpenGlobe={() => setActiveTab('globe')}
            onToast={showToast}
          />
        )}

        {activeTab === 'globe' && (
          <GlobeView
            pins={globePins}
            onAddPin={handleAddGlobePin}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Belt */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Profile & Sign Up Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        initialMode={profileModalMode}
        stats={{
          postcardsCount: postcards.length,
          stampsCount: stamps.length,
          visasCount: passportStamps.length,
          pinsCount: globePins.length,
        }}
        onUpdateProfile={handleUpdateProfile}
        onSignUpNewUser={handleSignUpNewUser}
        onResetDataToZero={handleResetDataToZero}
        onLoadDemoData={handleLoadDemoData}
        onToast={showToast}
      />

      {/* Floating Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto bg-[#353021] text-[#faf0d9] px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-2.5 z-50 border border-[#f9ba82]/40 transition-all duration-300">
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[#ffdea5] text-[18px]">verified</span>
            <span className="font-body-sm text-[12px] truncate">{toastMessage}</span>
          </div>
          <span className="font-label-stamp text-[9px] text-[#ffdea5] font-bold uppercase shrink-0">
            CONFIRMED
          </span>
        </div>
      )}
    </div>
  );
}
