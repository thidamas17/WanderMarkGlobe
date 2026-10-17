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
import { FirstTimeRegistrationModal } from './components/FirstTimeRegistrationModal';

const STORAGE_KEYS = {
  USER: 'wandermark_user_profile',
  POSTCARDS: 'wandermark_postcards',
  STAMPS: 'wandermark_stamps',
  PASSPORT: 'wandermark_passport_stamps',
  PINS: 'wandermark_globe_pins',
  INITIALIZED: 'wandermark_app_initialized',
  IS_REGISTERED: 'wandermark_is_registered',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('globe');

  // Check if user has completed first-time registration
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Load User Profile from localStorage or blank zeroed profile if new
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (isReg && saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    return {
      id: 'usr-new',
      username: '',
      fullName: 'นักสำรวจคนใหม่',
      email: '',
      phoneNumber: '',
      avatarUrl: '/logo.svg',
      bio: 'พร้อมออกเดินทางบันทึกโลกกว้าง',
      titleRank: 'NOVICE EXPLORER',
      docId: 'WM-000000',
      registeredAt: new Date().toISOString().split('T')[0],
    };
  });

  // Load Collections from localStorage, or empty [] when entering for first time (set to 0)
  const [postcards, setPostcards] = useState<PostcardItem[]>(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
      if (!isReg) return [];
      const saved = localStorage.getItem(STORAGE_KEYS.POSTCARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved postcards', e);
    }
    return [];
  });

  const [stamps, setStamps] = useState<StampItem[]>(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
      if (!isReg) return [];
      const saved = localStorage.getItem(STORAGE_KEYS.STAMPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved stamps', e);
    }
    return [];
  });

  const [passportStamps, setPassportStamps] = useState<PassportVisaStamp[]>(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
      if (!isReg) return [];
      const saved = localStorage.getItem(STORAGE_KEYS.PASSPORT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved passport stamps', e);
    }
    return [];
  });

  const [globePins, setGlobePins] = useState<GlobePin[]>(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === 'true';
      if (!isReg) return [];
      const saved = localStorage.getItem(STORAGE_KEYS.PINS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved globe pins', e);
    }
    return [];
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

  const handleUpdatePostcard = (updatedCard: PostcardItem) => {
    setPostcards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
  };

  const handleDeletePostcard = (cardId: string) => {
    setPostcards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleAddStamp = (newStamp: StampItem) => {
    setStamps((prev) => [newStamp, ...prev]);
  };

  const handleUpdateStamp = (updatedStamp: StampItem) => {
    setStamps((prev) =>
      prev.map((s) => (s.id === updatedStamp.id ? updatedStamp : s))
    );
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

  const handleUpdatePinDate = (pinOrStampId: string, newDate: string) => {
    setGlobePins((prev) =>
      prev.map((p) => {
        if (p.id === pinOrStampId || `visa-${p.id}` === pinOrStampId || p.code === pinOrStampId) {
          return { ...p, date: newDate };
        }
        return p;
      })
    );
    setPassportStamps((prev) =>
      prev.map((s) => {
        if (s.id === pinOrStampId || s.code === pinOrStampId) {
          return { ...s, date: newDate };
        }
        return s;
      })
    );
  };

  const handleDeleteGlobePin = (pinId: string) => {
    setGlobePins((prev) => prev.filter((p) => p.id !== pinId));
    setPassportStamps((prev) =>
      prev.filter((s) => s.id !== `visa-${pinId}` && s.id !== pinId)
    );
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
    setIsRegistered(true);

    try {
      localStorage.setItem(STORAGE_KEYS.IS_REGISTERED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(createdProfile));
      localStorage.setItem(STORAGE_KEYS.POSTCARDS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }

    showToast(`ยินดีต้อนรับ ${createdProfile.fullName}! ข้อมูลเริ่มต้นที่ 0 พร้อมออกเดินทางแล้ว`);
  };

  // Log out and return to first-time registration screen
  const handleLogout = () => {
    setIsRegistered(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_REGISTERED);
    } catch (e) {
      console.error(e);
    }
    showToast('ออกจากระบบเรียบร้อย กลับสู่หน้าลงทะเบียนครั้งแรก');
  };

  // Reset all data to zero manually
  const handleResetDataToZero = () => {
    setPostcards([]);
    setStamps([]);
    setPassportStamps([]);
    setGlobePins([]);
    try {
      localStorage.setItem(STORAGE_KEYS.POSTCARDS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('รีเซ็ตข้อมูลทั้งหมดเป็น 0 เรียบร้อยแล้ว');
  };

  // Load demo data for exploration
  const handleLoadDemoData = () => {
    setPostcards(INITIAL_POSTCARDS);
    setStamps(INITIAL_STAMPS);
    setPassportStamps(INITIAL_PASSPORT_STAMPS);
    setGlobePins(INITIAL_GLOBE_PINS);
    setUserProfile(DEFAULT_USER_PROFILE);
    setIsRegistered(true);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_REGISTERED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER_PROFILE));
      localStorage.setItem(STORAGE_KEYS.POSTCARDS, JSON.stringify(INITIAL_POSTCARDS));
      localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(INITIAL_STAMPS));
      localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify(INITIAL_PASSPORT_STAMPS));
      localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(INITIAL_GLOBE_PINS));
    } catch (e) {
      console.error(e);
    }
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
        isRegistered={isRegistered}
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
            savedStamps={stamps}
            onAddPostcard={handleAddPostcard}
            onUpdatePostcard={handleUpdatePostcard}
            onDeletePostcard={handleDeletePostcard}
            onToast={showToast}
          />
        )}

        {activeTab === 'stamps' && (
          <StampsView
            stamps={stamps}
            onAddStamp={handleAddStamp}
            onUpdateStamp={handleUpdateStamp}
            onToast={showToast}
          />
        )}

        {activeTab === 'passport' && (
          <PassportView
            stamps={passportStamps}
            pins={globePins}
            userProfile={userProfile}
            onAddStamp={handleAddPassportStamp}
            onUpdatePinDate={handleUpdatePinDate}
            onOpenGlobe={() => setActiveTab('globe')}
            onToast={showToast}
          />
        )}

        {activeTab === 'globe' && (
          <GlobeView
            pins={globePins}
            onAddPin={handleAddGlobePin}
            onUpdatePinDate={handleUpdatePinDate}
            onDeletePin={handleDeleteGlobePin}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Belt */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Mandatory First-Time Registration Modal (Blocks app until user completes registration) */}
      <FirstTimeRegistrationModal
        isOpen={!isRegistered}
        onRegister={handleSignUpNewUser}
      />

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
        onLogout={handleLogout}
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
