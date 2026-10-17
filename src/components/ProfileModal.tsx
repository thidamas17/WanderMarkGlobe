import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  stats: {
    postcardsCount: number;
    stampsCount: number;
    visasCount: number;
    pinsCount: number;
  };
  onUpdateProfile: (updated: UserProfile) => void;
  onSignUpNewUser: (newUser: Omit<UserProfile, 'id' | 'docId' | 'registeredAt'>) => void;
  onResetDataToZero: () => void;
  onLoadDemoData: () => void;
  onLogout?: () => void;
  onToast: (msg: string) => void;
  initialMode?: 'view' | 'edit' | 'signup';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  stats,
  onUpdateProfile,
  onSignUpNewUser,
  onResetDataToZero,
  onLoadDemoData,
  onLogout,
  onToast,
  initialMode = 'view',
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'signup'>(initialMode);

  // Edit form state
  const [editUsername, setEditUsername] = useState(userProfile.username);
  const [editFullName, setEditFullName] = useState(userProfile.fullName);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editPhone, setEditPhone] = useState(userProfile.phoneNumber);
  const [editAvatarUrl, setEditAvatarUrl] = useState(userProfile.avatarUrl);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const [editTitleRank, setEditTitleRank] = useState(userProfile.titleRank);

  // Sign up form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAvatarUrl, setSignupAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [signupBio, setSignupBio] = useState('นักสำรวจหน้าใหม่ พร้อมออกเดินทางสร้างความทรงจำ');

  // Reset confirmation with phone or email verification
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetAuthInput, setResetAuthInput] = useState('');
  const [resetAuthError, setResetAuthError] = useState('');

  // Live Camera viewfinder state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'edit' | 'signup'>('edit');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Reset local state when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEditUsername(userProfile.username);
      setEditFullName(userProfile.fullName);
      setEditEmail(userProfile.email);
      setEditPhone(userProfile.phoneNumber);
      setEditAvatarUrl(userProfile.avatarUrl);
      setEditBio(userProfile.bio);
      setEditTitleRank(userProfile.titleRank);
    }
  }, [isOpen, userProfile, initialMode]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ยืนยันการรีเซ็ตข้อมูลด้วยเบอร์โทรหรืออีเมล
  const handleVerifyAndReset = () => {
    const input = resetAuthInput.trim().toLowerCase();
    if (!input) {
      setResetAuthError('กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมลเพื่อยืนยัน');
      return;
    }

    const regEmail = (userProfile.email || '').trim().toLowerCase();
    const regPhone = (userProfile.phoneNumber || '').replace(/\D/g, '');
    const inputDigits = input.replace(/\D/g, '');
    const regUsername = (userProfile.username || '').trim().toLowerCase();

    // ตรวจสอบความถูกต้องกับข้อมูลในโปรไฟล์
    const matchesEmail = regEmail && input === regEmail;
    const matchesPhone = regPhone && inputDigits && (inputDigits === regPhone || regPhone.includes(inputDigits) || inputDigits.includes(regPhone));
    const matchesUsername = regUsername && input === regUsername;

    // กรณีโปรไฟล์ยังไม่มีอีเมลหรือเบอร์โทรศัพท์ ให้ผ่านได้หากกรอกข้อมูล
    const canBypass = !regEmail && !regPhone;

    if (matchesEmail || matchesPhone || matchesUsername || canBypass) {
      onResetDataToZero();
      setIsResetConfirmOpen(false);
      setResetAuthInput('');
      setResetAuthError('');
      onToast('ยืนยันตัวตนสำเร็จ รีเซ็ตข้อมูลทั้งหมดเป็น 0 เรียบร้อยแล้ว');
    } else {
      setResetAuthError('เบอร์โทรศัพท์หรืออีเมลไม่ตรงกับข้อมูลในบัญชี กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'signup') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          if (target === 'edit') {
            setEditAvatarUrl(res);
          } else {
            setSignupAvatarUrl(res);
          }
          onToast('อัปโหลดรูปโปรไฟล์เรียบร้อย!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start in-browser camera
  const startCamera = async (target: 'edit' | 'signup') => {
    setCameraTarget(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch {
      // Fallback to native camera input
      cameraInputRef.current?.click();
    }
  };

  // Capture photo from live camera
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        if (cameraTarget === 'edit') {
          setEditAvatarUrl(dataUrl);
        } else {
          setSignupAvatarUrl(dataUrl);
        }
        stopCamera();
        onToast('ถ่ายภาพโปรไฟล์สำเร็จ!');
      }
    }
  };

  // Save profile edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim() || !editPhone.trim()) {
      onToast('กรุณากรอกชื่อผู้ใช้ อีเมล และเบอร์โทรศัพท์');
      return;
    }
    const updated: UserProfile = {
      ...userProfile,
      username: editUsername.trim(),
      fullName: editFullName.trim() || editUsername.trim(),
      email: editEmail.trim(),
      phoneNumber: editPhone.trim(),
      avatarUrl: editAvatarUrl,
      bio: editBio.trim(),
      titleRank: editTitleRank.trim() || 'EXPLORER',
    };
    onUpdateProfile(updated);
    setMode('view');
    onToast('บันทึกการแก้ไขโปรไฟล์เรียบร้อย!');
  };

  // Submit new user sign up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername.trim()) {
      onToast('กรุณาระบุ Username (ชื่อผู้ใช้)');
      return;
    }
    if (!signupEmail.trim()) {
      onToast('กรุณาระบุ Email');
      return;
    }
    if (!signupPhone.trim()) {
      onToast('กรุณาระบุเบอร์โทรศัพท์ (Phone Number)');
      return;
    }

    onSignUpNewUser({
      username: signupUsername.trim(),
      fullName: signupFullName.trim() || signupUsername.trim(),
      email: signupEmail.trim(),
      phoneNumber: signupPhone.trim(),
      avatarUrl: signupAvatarUrl,
      bio: signupBio.trim(),
      titleRank: 'NOVICE EXPLORER',
    });
    setMode('view');
    onClose();
  };

  return (
    <div
      onClick={() => {
        stopCamera();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-[#201b0e]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#faf5ea] rounded-2xl shadow-2xl border-2 border-[#837469]/50 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Hidden File / Camera Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, mode === 'signup' ? 'signup' : 'edit')}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => handleFileUpload(e, mode === 'signup' ? 'signup' : 'edit')}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ece2cc] bg-[#f5ede0] shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f4315] text-[22px]">
              {mode === 'signup' ? 'person_add' : mode === 'edit' ? 'manage_accounts' : 'badge'}
            </span>
            <div>
              <h2 className="font-headline-sm text-base text-[#6f4315] font-bold">
                {mode === 'signup'
                  ? 'สมัครสมาชิกนักสำรวจใหม่'
                  : mode === 'edit'
                  ? 'แก้ไขข้อมูลโปรไฟล์'
                  : 'ประวัตินักสำรวจประจำสถานี'}
              </h2>
              <span className="font-label-coord text-[9px] text-[#465f88] block">
                {mode === 'signup'
                  ? 'เริ่มต้นการผจญภัย ข้อมูลเริ่มต้นที่ 0'
                  : `DOC ID: ${userProfile.docId} • OFFICIAL REGISTRATION`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {mode === 'view' && (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-2.5 py-1 rounded-lg bg-[#fff8f0] text-[#6f4315] text-xs font-title-md border border-[#d5c3b6] hover:bg-white flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>แก้ไข</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1 rounded-full text-[#51443a] hover:bg-[#ece2cc] cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Live Camera Viewfinder Overlay */}
        {isCameraActive && (
          <div className="p-4 bg-black flex flex-col items-center justify-center shrink-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#ffdea5] shadow-lg mb-3">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 rounded-full bg-[#ffdea5] text-[#261900] font-title-md text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-[#ffe7be] active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>ถ่ายภาพตอนนี้</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 rounded-full bg-white/20 text-white font-title-md text-xs hover:bg-white/30 cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ============================================================== */}
          {/* VIEW MODE: Official Explorer Dossier */}
          {/* ============================================================== */}
          {mode === 'view' && (
            <>
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-[#fff8f0] border border-[#d5c3b6]/60 shadow-sm relative">
                <div className="relative group">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-3 ring-[#8b5a2b] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#6f4315] text-white shadow-md hover:bg-[#8b5a2b] active:scale-95 cursor-pointer"
                    title="เปลี่ยนรูปภาพโปรไฟล์"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <span className="font-label-stamp text-[9px] text-[#644807] uppercase bg-[#ffdea5] px-2 py-0.5 rounded font-bold">
                      {userProfile.titleRank}
                    </span>
                    <span className="font-label-coord text-[9px] text-[#465f88] bg-[#eef3fb] px-2 py-0.5 rounded font-bold">
                      DOC: {userProfile.docId}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-lg text-[#201b0e] font-bold">
                    {userProfile.fullName}
                  </h3>
                  <p className="font-label-coord text-xs text-[#6f4315] font-semibold">
                    @{userProfile.username}
                  </p>
                  <p className="font-body-sm text-[12px] text-[#51443a] mt-1 italic">
                    "{userProfile.bio || 'นักสำรวจพเนจร บันทึกการเดินทางทั่วโลก'}"
                  </p>
                </div>
              </div>

              {/* Contact & Registration Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#fdf3dc] border border-[#d5c3b6]/50 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#6f4315] text-[20px]">mail</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-label-coord text-[8px] text-[#837469] block uppercase">
                      อีเมล (Email)
                    </span>
                    <span className="font-label-ui text-xs text-[#201b0e] font-semibold truncate block">
                      {userProfile.email}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#fdf3dc] border border-[#d5c3b6]/50 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#6f4315] text-[20px]">phone</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-label-coord text-[8px] text-[#837469] block uppercase">
                      เบอร์โทรศัพท์ (Phone)
                    </span>
                    <span className="font-label-ui text-xs text-[#201b0e] font-semibold truncate block">
                      {userProfile.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid (Resets to 0 for New Users) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-coord text-[10px] text-[#837469] uppercase font-bold tracking-wider">
                    สถิติบันทึกการผจญภัย
                  </span>
                  {stats.postcardsCount === 0 && stats.stampsCount === 0 && (
                    <span className="font-label-stamp text-[9px] text-[#644807] bg-[#ffdea5] px-2 py-0.5 rounded font-bold">
                      บัญชีใหม่ (สถานะ 0)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#fff8f0] border border-[#d5c3b6]/60 shadow-2xs">
                    <span className="font-label-coord text-[9px] text-[#837469] block">โปสการ์ด</span>
                    <span className="font-headline-sm text-base text-[#6f4315] font-bold">
                      {stats.postcardsCount}
                    </span>
                    <span className="font-label-coord text-[8px] text-[#51443a] block">แผ่น</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#fff8f0] border border-[#d5c3b6]/60 shadow-2xs">
                    <span className="font-label-coord text-[9px] text-[#837469] block">แสตมป์</span>
                    <span className="font-headline-sm text-base text-[#6f4315] font-bold">
                      {stats.stampsCount}
                    </span>
                    <span className="font-label-coord text-[8px] text-[#51443a] block">ดวง</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#fff8f0] border border-[#d5c3b6]/60 shadow-2xs">
                    <span className="font-label-coord text-[9px] text-[#837469] block">ตราพาสปอร์ต</span>
                    <span className="font-headline-sm text-base text-[#465f88] font-bold">
                      {stats.visasCount}
                    </span>
                    <span className="font-label-coord text-[8px] text-[#51443a] block">ด่าน</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#fff8f0] border border-[#d5c3b6]/60 shadow-2xs">
                    <span className="font-label-coord text-[9px] text-[#837469] block">หมุดลูกโลก</span>
                    <span className="font-headline-sm text-base text-[#7f601f] font-bold">
                      {stats.pinsCount}
                    </span>
                    <span className="font-label-coord text-[8px] text-[#51443a] block">พิกัด</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="pt-2 border-t border-[#ece2cc] space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_square</span>
                    <span>แก้ไขข้อมูลโปรไฟล์ทั้งหมด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignupUsername('');
                      setSignupFullName('');
                      setSignupEmail('');
                      setSignupPhone('');
                      setMode('signup');
                    }}
                    className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-[#fff8f0] text-[#6f4315] border border-[#6f4315] text-xs font-title-md hover:bg-white shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>สมัครสมาชิกใหม่ (เริ่มจาก 0)</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetConfirmOpen(true);
                        setResetAuthInput('');
                        setResetAuthError('');
                      }}
                      className="text-xs text-[#ba1a1a] hover:text-white bg-[#fff0f0] hover:bg-[#ba1a1a] border border-[#ba1a1a]/30 hover:border-[#ba1a1a] px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold transition-all shadow-2xs active:scale-95"
                      title="รีเซ็ตข้อมูลทั้งหมดเป็น 0 (ต้องยืนยันเบอร์โทรหรืออีเมล)"
                    >
                      <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                      <span className="font-medium">รีเซ็ตข้อมูลทั้งหมดเป็น 0</span>
                    </button>

                    <button
                      type="button"
                      onClick={onLoadDemoData}
                      className="text-[11px] text-[#465f88] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      <span>โหลดข้อมูลตัวอย่าง (Demo)</span>
                    </button>
                  </div>

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        onClose();
                        onLogout();
                      }}
                      className="text-[11px] text-[#837469] hover:text-[#ba1a1a] flex items-center gap-1 cursor-pointer font-medium"
                      title="ออกจากระบบเพื่อทดสอบการลงทะเบียนใช้งานครั้งแรก"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      <span>ออกจากระบบ / ลงทะเบียนใหม่</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* EDIT MODE: Edit All Profile Details */}
          {/* ============================================================== */}
          {mode === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Avatar Customization Section */}
              <div className="p-3.5 rounded-xl bg-[#fff8f0] border border-[#d5c3b6]/70">
                <span className="font-label-coord text-[10px] text-[#6f4315] font-bold uppercase block mb-2">
                  รูปภาพประจำตัว (Profile Picture)
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  <img
                    src={editAvatarUrl}
                    alt="Current Avatar"
                    className="w-18 h-18 rounded-full object-cover ring-2 ring-[#8b5a2b] shadow-md shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera('edit')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#6f4315] text-white text-[11px] font-title-md hover:bg-[#8b5a2b] flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                        <span>ถ่ายภาพด้วยกล้อง</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-[#fff8f0] text-[#6f4315] border border-[#d5c3b6] text-[11px] font-title-md hover:bg-white flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">upload_file</span>
                        <span>อัปโหลดรูปภาพ</span>
                      </button>
                    </div>

                    {/* Presets Row */}
                    <div>
                      <span className="font-label-coord text-[8px] text-[#837469] block mb-1">
                        หรือเลือกอวตารสำเร็จรูป:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setEditAvatarUrl(preset.url)}
                            className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-transform cursor-pointer hover:scale-105 ${
                              editAvatarUrl === preset.url
                                ? 'border-[#6f4315] ring-2 ring-[#ffdea5]'
                                : 'border-[#d5c3b6] opacity-75'
                            }`}
                            title={preset.name}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Username (ชื่อผู้ใช้) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="e.g. explorer_somchai"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>

                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      ชื่อ-นามสกุล / นามแฝง *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="e.g. Somchai The Wanderer"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Email (อีเมล) *
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. explorer@wandermark.org"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>

                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Phone Number (เบอร์โทรศัพท์) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +66 81 234 5678"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      ฉายา / ตำแหน่งนักสำรวจ (Rank)
                    </label>
                    <input
                      type="text"
                      value={editTitleRank}
                      onChange={(e) => setEditTitleRank(e.target.value)}
                      placeholder="e.g. MASTER EXPLORER"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>

                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Image URL (กรณีใส่ลิงก์รูปตรง)
                    </label>
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                    คำแนะนำตัวสั้นๆ (Bio / Motto)
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="บันทึกการเดินทางรอบโลก..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315] resize-none"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ece2cc]">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="px-4 py-2 rounded-lg bg-transparent text-[#51443a] text-xs font-title-md hover:bg-[#ece2cc] cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>บันทึกการแก้ไขโปรไฟล์</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* SIGN UP MODE: New User Registration & Reset to Zero */}
          {/* ============================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Highlight Banner: Upon first use, all data resets to zero */}
              <div className="p-3 rounded-xl bg-[#ffdea5]/40 border border-[#d4af37] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#644807] text-[20px] shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <h4 className="font-headline-sm text-xs text-[#261900] font-bold">
                    เริ่มต้นเป็นนักสำรวจคนใหม่ (รีเซ็ตข้อมูลเป็น 0)
                  </h4>
                  <p className="font-body-sm text-[11px] text-[#51443a] mt-0.5 leading-relaxed">
                    เมื่อสมัครสมาชิกใหม่ ข้อมูลโปสการ์ด แสตมป์ ตราประทับพาสปอร์ต และหมุดบนลูกโลกทั้งหมดจะถูกรีเซ็ตเป็น 0 เพื่อให้คุณได้เริ่มบันทึกการเดินทางของคุณเองตั้งแต่ก้าวแรก!
                  </p>
                </div>
              </div>

              {/* Avatar Customization */}
              <div className="p-3.5 rounded-xl bg-[#fff8f0] border border-[#d5c3b6]/70">
                <span className="font-label-coord text-[10px] text-[#6f4315] font-bold uppercase block mb-2">
                  1. ปรับแต่งรูปภาพประจำตัว (Profile Picture)
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  <img
                    src={signupAvatarUrl}
                    alt="Signup Avatar"
                    className="w-18 h-18 rounded-full object-cover ring-2 ring-[#8b5a2b] shadow-md shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera('signup')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#6f4315] text-white text-[11px] font-title-md hover:bg-[#8b5a2b] flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                        <span>ถ่ายรูปด้วยกล้อง</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-[#fff8f0] text-[#6f4315] border border-[#d5c3b6] text-[11px] font-title-md hover:bg-white flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">upload_file</span>
                        <span>อัปโหลดรูปภาพ</span>
                      </button>
                    </div>

                    <div>
                      <span className="font-label-coord text-[8px] text-[#837469] block mb-1">
                        หรือเลือกอวตารนักสำรวจ:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSignupAvatarUrl(preset.url)}
                            className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-transform cursor-pointer hover:scale-105 ${
                              signupAvatarUrl === preset.url
                                ? 'border-[#6f4315] ring-2 ring-[#ffdea5]'
                                : 'border-[#d5c3b6] opacity-75'
                            }`}
                            title={preset.name}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                <span className="font-label-coord text-[10px] text-[#6f4315] font-bold uppercase block">
                  2. กรอกข้อมูลส่วนตัวนักสำรวจ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Username (ชื่อผู้ใช้) *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="e.g. wanderer_alice"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>

                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      ชื่อ-นามสกุล หรือ นามแฝง
                    </label>
                    <input
                      type="text"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder="e.g. Alice In Wonderland"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Email (อีเมล) *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. alice@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>

                  <div>
                    <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                      Phone Number (เบอร์โทรศัพท์) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="e.g. 081-234-5678"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-coord text-[10px] text-[#6f4315] font-bold block mb-1">
                    คำแนะนำตัว (Bio)
                  </label>
                  <input
                    type="text"
                    value={signupBio}
                    onChange={(e) => setSignupBio(e.target.value)}
                    placeholder="e.g. พร้อมออกเดินทางสำรวจโลกกว้าง..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#ece2cc]">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="px-3.5 py-2 rounded-lg bg-transparent text-[#51443a] text-xs font-title-md hover:bg-[#ece2cc] cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-md flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                  <span>สร้างบัญชี & เริ่มต้นจาก 0 (Sign Up)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reset Confirmation with Phone or Email Verification Modal (ถ้าต้องการรีเซ็ทข้อมูล ให้ยืนยันด้วย เบอร์โทร หรืออีเมล์ อีกครั้ง) */}
      {isResetConfirmOpen && (
        <div
          onClick={() => setIsResetConfirmOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#d5c3b6] text-center space-y-3.5 animate-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fff0f0] text-[#ba1a1a] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">restart_alt</span>
            </div>

            <div>
              <h3 className="font-headline-sm text-base text-[#201b0e] font-bold">
                ยืนยันการรีเซ็ตข้อมูลเป็น 0
              </h3>
              <p className="font-body-sm text-xs text-[#51443a] mt-1 leading-snug">
                เพื่อความปลอดภัย กรุณากรอก <strong>เบอร์โทรศัพท์</strong> หรือ <strong>อีเมล</strong> ของคุณเพื่อยืนยันอีกครั้ง
              </p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="font-label-coord text-[10px] text-[#837469] font-bold uppercase block">
                เบอร์โทร หรือ อีเมลที่ลงทะเบียน
              </label>
              <input
                type="text"
                value={resetAuthInput}
                onChange={(e) => {
                  setResetAuthInput(e.target.value);
                  setResetAuthError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyAndReset();
                  }
                }}
                placeholder="เช่น 081-xxx-xxxx หรือ name@example.com"
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#d5c3b6] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a] text-[#201b0e] font-medium outline-none"
                autoFocus
              />
              {resetAuthError && (
                <p className="text-[11px] text-[#ba1a1a] font-semibold mt-1">
                  ⚠️ {resetAuthError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#ece2cc]">
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setResetAuthInput('');
                  setResetAuthError('');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#ece2cc] hover:bg-[#d5c3b6] text-[#51443a] text-xs font-title-md font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleVerifyAndReset}
                className="flex-1 py-2 px-3 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-title-md font-bold shadow-sm transition-colors cursor-pointer active:scale-95"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
