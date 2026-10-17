import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import appLogo from '../assets/logo.svg';

interface FirstTimeRegistrationModalProps {
  isOpen: boolean;
  onRegister: (user: Omit<UserProfile, 'id' | 'docId' | 'registeredAt'>) => void;
}

export const FirstTimeRegistrationModal: React.FC<FirstTimeRegistrationModalProps> = ({
  isOpen,
  onRegister,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('นักสำรวจคนใหม่ พร้อมออกเดินทางบันทึกโลกกว้าง');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);

  // Errors state
  const [errors, setErrors] = useState<{
    username?: string;
    phoneNumber?: string;
    email?: string;
  }>({});

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Camera controls
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn('Camera error', err);
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาใช้การอัปโหลดไฟล์รูปภาพแทน');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: {
      username?: string;
      phoneNumber?: string;
      email?: string;
    } = {};

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      newErrors.username = 'กรุณาระบุชื่อผู้ใช้ (Username)';
    } else if (cleanUsername.length < 2) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      newErrors.phoneNumber = 'กรุณาระบุเบอร์โทรศัพท์';
    } else if (cleanPhone.replace(/[^0-9]/g, '').length < 8) {
      newErrors.phoneNumber = 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 8-10 หลัก)';
    }

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      newErrors.email = 'กรุณาระบุอีเมล';
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น explorer@wandermark.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    stopCamera();
    onRegister({
      username: username.trim(),
      fullName: fullName.trim() || username.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      avatarUrl,
      bio: bio.trim(),
      titleRank: 'NOVICE EXPLORER',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#201b0e]/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#fff8f0] rounded-2xl shadow-2xl border-2 border-[#d5c3b6] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Postal Header Bar */}
        <div className="bg-[#f7edd7] px-4 py-3.5 border-b border-[#ece2cc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-base text-[#6f4315] font-bold">
                  ลงทะเบียนนักสำรวจคนใหม่
                </span>
                <span className="font-label-stamp text-[9px] bg-[#6f4315] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                  FIRST USE
                </span>
              </div>
              <span className="font-label-coord text-[9px] text-[#465f88] block font-bold">
                WANDERMARK OFFICIAL EXPEDITION ENROLLMENT
              </span>
            </div>
          </div>
          <span className="font-label-coord text-[10px] text-[#7f601f] bg-[#ffdea5]/60 px-2 py-0.5 rounded-full font-bold border border-[#d4af37]/40">
            เริ่มต้นที่ 0
          </span>
        </div>

        {/* Live Camera Viewfinder if active */}
        {isCameraActive && (
          <div className="p-3 bg-black flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-[#ffdea5] shadow-lg mb-2">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-3.5 py-1.5 rounded-full bg-[#ffdea5] text-[#261900] text-xs font-bold hover:bg-[#ffe7be] cursor-pointer"
              >
                ถ่ายภาพตอนนี้
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs hover:bg-white/30 cursor-pointer"
              >
                ยกเลิกกล้อง
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* First-time Zero Notice Banner */}
          <div className="p-3 rounded-xl bg-[#fff2d6] border border-[#f9ba82]/80 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#644807] text-[20px] shrink-0 mt-0.5">
              verified
            </span>
            <div className="text-left">
              <h4 className="font-headline-sm text-xs text-[#261900] font-bold">
                ลงทะเบียนเพื่อเริ่มต้นใช้งานครั้งแรก
              </h4>
              <p className="font-body-sm text-[11px] text-[#51443a] mt-0.5 leading-relaxed">
                กรุณาระบุ <strong>ชื่อผู้ใช้, เบอร์โทรศัพท์ และอีเมล</strong> เพื่อเปิดสมุดบันทึกส่วนตัวของคุณ เมื่อเข้าใช้งานครั้งแรก ระบบจะเซ็ตค่าสถิติ โปสการ์ด แสตมป์ และหมุดทั้งหมดเป็น <strong>0</strong> พร้อมให้คุณเริ่มเก็บความทรงจำจริง
              </p>
            </div>
          </div>

          {/* Live Passport Card Preview */}
          <div className="p-3 rounded-xl bg-[#fdfaf3] border border-[#d5c3b6] shadow-sm flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#8b5a2b] shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#6f4315] text-white p-0.5 rounded-full text-[10px] flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px]">badge</span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-label-stamp text-[8px] bg-[#ffdea5] text-[#261900] px-1.5 py-0.2 rounded font-bold">
                  NOVICE EXPLORER
                </span>
                <span className="font-label-coord text-[8px] text-[#837469]">
                  STATUS: ZEROED (0)
                </span>
              </div>
              <h4 className="font-headline-sm text-sm text-[#201b0e] font-bold truncate">
                {fullName.trim() || username.trim() || 'ชื่อนักสำรวจของคุณ'}
              </h4>
              <p className="font-label-coord text-[11px] text-[#6f4315] font-semibold truncate">
                @{username.trim() || 'username'} • {phoneNumber.trim() || 'เบอร์โทร'}
              </p>
              <p className="font-label-coord text-[10px] text-[#465f88] truncate">
                {email.trim() || 'อีเมลติดต่อ'}
              </p>
            </div>
          </div>

          {/* Form Fields: Username, Phone, Email (Required) */}
          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="font-label-coord text-[11px] text-[#6f4315] font-bold block mb-1">
                ชื่อผู้ใช้ (Username) <span className="text-[#ba1a1a]">*จำเป็น</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#837469]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder="เช่น alex_wanderer"
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border text-[#201b0e] focus:outline-none focus:ring-1 ${
                    errors.username
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                      : 'border-[#d5c3b6] focus:ring-[#6f4315]'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="font-label-coord text-[10px] text-[#ba1a1a] mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="font-label-coord text-[11px] text-[#6f4315] font-bold block mb-1">
                เบอร์โทรศัพท์ (Phone Number) <span className="text-[#ba1a1a]">*จำเป็น</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#837469]">
                  phone
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                  }}
                  placeholder="เช่น 081-234-5678"
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border text-[#201b0e] focus:outline-none focus:ring-1 ${
                    errors.phoneNumber
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                      : 'border-[#d5c3b6] focus:ring-[#6f4315]'
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="font-label-coord text-[10px] text-[#ba1a1a] mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-label-coord text-[11px] text-[#6f4315] font-bold block mb-1">
                อีเมล (Email) <span className="text-[#ba1a1a]">*จำเป็น</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#837469]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="เช่น explorer@example.com"
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border text-[#201b0e] focus:outline-none focus:ring-1 ${
                    errors.email
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                      : 'border-[#d5c3b6] focus:ring-[#6f4315]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="font-label-coord text-[10px] text-[#ba1a1a] mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Optional Full Name */}
            <div>
              <label className="font-label-coord text-[11px] text-[#6f4315] font-bold block mb-1">
                ชื่อ-นามสกุล หรือ นามแฝงนักสำรวจ (ไม่บังคับ)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#837469]">
                  badge
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น Alex The Voyager (หากไม่กรอกจะใช้ชื่อผู้ใช้แทน)"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="pt-1">
              <span className="font-label-coord text-[11px] text-[#6f4315] font-bold block mb-1.5">
                เลือกรูปภาพประจำตัว (Profile Avatar)
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-transform cursor-pointer hover:scale-105 ${
                      avatarUrl === preset.url
                        ? 'border-[#6f4315] ring-2 ring-[#ffdea5]'
                        : 'border-[#d5c3b6] opacity-75'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-9 h-9 rounded-full bg-[#f2e7d1] border border-[#d5c3b6] flex items-center justify-center shrink-0 hover:bg-[#ece2cc] text-[#6f4315] cursor-pointer"
                  title="ถ่ายรูปจากกล้อง"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-[#f2e7d1] border border-[#d5c3b6] flex items-center justify-center shrink-0 hover:bg-[#ece2cc] text-[#6f4315] cursor-pointer"
                  title="อัปโหลดรูปภาพ"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Zero Summary Matrix */}
          <div className="p-2.5 rounded-xl bg-[#ece2cc]/50 border border-[#d5c3b6]/60">
            <span className="font-label-coord text-[9px] text-[#837469] block text-center uppercase font-bold mb-1">
              สถานะเริ่มต้นการผจญภัยของคุณ (All values set to 0)
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-white/80 p-1.5 rounded border border-[#d5c3b6]/40">
                <span className="font-headline-sm text-sm text-[#6f4315] font-bold block">0</span>
                <span className="font-label-coord text-[8px] text-[#51443a]">โปสการ์ด</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded border border-[#d5c3b6]/40">
                <span className="font-headline-sm text-sm text-[#6f4315] font-bold block">0</span>
                <span className="font-label-coord text-[8px] text-[#51443a]">แสตมป์</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded border border-[#d5c3b6]/40">
                <span className="font-headline-sm text-sm text-[#465f88] font-bold block">0</span>
                <span className="font-label-coord text-[8px] text-[#51443a]">วีซ่าพาสปอร์ต</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded border border-[#d5c3b6]/40">
                <span className="font-headline-sm text-sm text-[#7f601f] font-bold block">0</span>
                <span className="font-label-coord text-[8px] text-[#51443a]">หมุดลูกโลก</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6f4315] text-white text-sm font-title-md hover:bg-[#8b5a2b] shadow-md flex items-center justify-center gap-2 cursor-pointer font-bold active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>ลงทะเบียน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
