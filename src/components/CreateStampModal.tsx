import React, { useState, useRef } from 'react';
import { StampItem, StampFrameStyle } from '../types';
import { StampPerforatedFrame } from './StampPerforatedFrame';

interface CreateStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stamp: StampItem) => void;
}

const FRAME_STYLES: {
  key: StampFrameStyle;
  label: string;
  sub: string;
  icon: string;
  badge: string;
}[] = [
  {
    key: 'classic',
    label: 'ฟันปลาคลาสสิก 14 รู',
    sub: 'Die-cut 14 รูมาตรฐานสากล',
    icon: 'crop',
    badge: 'CLASSIC',
  },
  {
    key: 'airmail',
    label: 'ไปรษณีย์แอร์เมล์',
    sub: 'ลายแถบสีแดง-น้ำเงิน Par Avion',
    icon: 'flight',
    badge: 'AIRMAIL',
  },
  {
    key: 'gold',
    label: 'ทองเหลืองราชสำนัก',
    sub: 'ขอบทองโบราณสลักลายหรูหรา',
    icon: 'military_tech',
    badge: 'GILDED',
  },
  {
    key: 'parchment',
    label: 'กระดาษสาโบราณ',
    sub: 'ขอบกระดาษวินเทจเซเปียแท้',
    icon: 'history_edu',
    badge: 'ARCHIVAL',
  },
  {
    key: 'imperial',
    label: 'เพชรจักรพรรดิ',
    sub: 'สีกรมท่า-ชาด ตราประทับหลวง',
    icon: 'stars',
    badge: 'IMPERIAL',
  },
];

const TEMPLATE_PRESETS = [
  {
    name: 'ภูเขาไฟฟูจิ (Japan)',
    country: 'ญี่ปุ่น (JAPAN)',
    banner: 'JAPAN • 富士山',
    region: 'asia' as const,
    regionLabel: 'เอเชีย / ทัศนียภาพ',
    station: 'TOKYO POST',
    currency: '¥',
    amount: '120',
    location: 'FUJIKAWAGUCHIKO',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxUcY3HSYBG1SZn5lyZoH8t1DrHn46BkNtvga-9eF1E2VsQUa78szjrBpZsl_w1kQZOOK5VJbmGqT0O2dw-qttiE-KR1OGvn4QU_IpW84PvEAvbAieMBYSs7HMNEo9SyjpRNX6V8siF2DcBAAmwIsZMtGyvkf_81GI4ph4IzGNSqvB3SrbTPfrf-uPK5WXpAA14RPq38SL63x_LjoLJl8Gc_DJyoDUOwGY0eHdBYstmxHB-vYre36N',
  },
  {
    name: 'หอไอเฟล (France)',
    country: 'ฝรั่งเศส (FRANCE)',
    banner: 'FRANCE • PARIS',
    region: 'europe' as const,
    regionLabel: 'ยุโรป / สถาปัตยกรรม',
    station: 'PARIS R.P.',
    currency: '€',
    amount: '2.80',
    location: 'CHAMP DE MARS',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD112cvYViX7jpakw7qyuCtkIsfnX1-qttQ-uLdGPFOVFIEpyeXNAi-DlCJEpbqOqEDjgYbPZ0qCcFE1Ba4eb1RfEtwvfnzLwysnnypBspE1t-aHv1twmsG6PL0N1Gm2ldlt-pjZfyGQvKzSDYwNb2MgUpUDTVQlWc9d4YLbBUANB4-Am_dH3S5q44K4Li6OpUAWMwPpd1ZQ7Snmq5HUZhrEST6Cgqd-XH_MhSiq00gjhv02P_Qran4',
  },
  {
    name: 'วัดอรุณฯ (Thailand)',
    country: 'ไทย (THAILAND)',
    banner: 'THAILAND • กรุงเทพฯ',
    region: 'asia' as const,
    regionLabel: 'เอเชีย / วัฒนธรรม',
    station: 'BANGKOK GPO',
    currency: '฿',
    amount: '3.00',
    location: 'WAT ARUN RATCHAWARARAM',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-30m4gzmJhOMUp0khT__4muTTlQDQ8Ube37Fl9u4-91Rt2prDUEC32s_VN9vEWdwy9YDRNsOoWjxeR9DVcCfargpFkd3o_FNiPtmkre_d4ZQoczjJ_W7Yi0ibaqd91HVdZXWi8pPch3G4EQFwd7twcHB-IbE2-OlkzLcO-SrhTeo2nC_dhrzFkFVNbPtF9mNRkV6LViOdEaOKBCI-4z7Royk1kl-ukjExedeJLRDFZOb8Dmw5igQc',
  },
  {
    name: 'สวิสกลาเซียร์ (Switzerland)',
    country: 'สวิตเซอร์แลนด์ (SWITZERLAND)',
    banner: 'SWITZERLAND • ZERMATT',
    region: 'europe' as const,
    regionLabel: 'ยุโรป / เทือกเขาแอลป์',
    station: 'ZERMATT POST',
    currency: 'CHF',
    amount: '1.80',
    location: 'GORNERGRAT BAHN',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBurXOEq-L4G6_Htp9hUt5cnNo1KeSITzbAlEaY-si0v2RqdfRFdVaZV1Dr52rzHcg8_pqj4mY4wfN99XIhb5f5NoeY1eRES0aS4a8bAAyQTeKSb1lGvxLbK2BdiF6Ey1ihzMli5lJBGgpv75BWVXLJ5BZnVu4PJLaMxvAeqVBc9ZdQfQ0jykfop5JzJOTXwsF7ZP3HY6xwWzoI9FZocSIBfri8_k561Jn8-MVo52lsE9ZnRy7wA5A6',
  },
];

export const CreateStampModal: React.FC<CreateStampModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedFrameStyle, setSelectedFrameStyle] = useState<StampFrameStyle>('classic');
  const [title, setTitle] = useState('แสตมป์บันทึกภาพถ่ายส่วนตัว');
  const [banner, setBanner] = useState('EXPEDITION • 2024');
  const [locationName, setLocationName] = useState('MY DISCOVERY');
  const [postmarkStation, setPostmarkStation] = useState('STATION POST');
  const [currencySymbol, setCurrencySymbol] = useState('¥');
  const [amount, setAmount] = useState('120');
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [isSepia, setIsSepia] = useState(true);

  // Live Camera viewfinder state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (idx: number) => {
    setSelectedIdx(idx);
    const t = TEMPLATE_PRESETS[idx];
    setTitle(`แสตมป์${t.name}`);
    setBanner(t.banner);
    setLocationName(t.location);
    setPostmarkStation(t.station);
    setCurrencySymbol(t.currency);
    setAmount(t.amount);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhoto(event.target.result as string);
          setTitle('แสตมป์ภาพถ่ายส่วนตัว (Custom Stamp)');
          setBanner('PERSONAL • ARCHIVE');
          setLocationName('CUSTOM PHOTO');
          setPostmarkStation('CERTIFIED POST');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Live in-browser WebRTC camera
  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsLiveCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      // If WebRTC permission fails, trigger native mobile camera input
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setUploadedPhoto(dataUrl);
      setTitle('ภาพถ่ายจากกล้องมือถือ (Mobile Camera)');
      setBanner('CAPTURED • MOMENT');
      setLocationName('MOBILE SNAP');
      setPostmarkStation('LIVE POST');
    }
    stopLiveCamera();
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTpl = TEMPLATE_PRESETS[selectedIdx];
    const newStamp: StampItem = {
      id: `stamp-${Date.now()}`,
      title,
      banner,
      country: uploadedPhoto ? 'บันทึกภาพถ่ายส่วนตัว' : currentTpl.country,
      region: uploadedPhoto ? 'all' : currentTpl.region,
      regionLabel: uploadedPhoto ? 'คอลเลกชันส่วนตัว / Custom Die-cut' : currentTpl.regionLabel,
      price: `${currencySymbol} ${amount}`,
      postmarkStation,
      postmarkDate: new Date()
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
        .toUpperCase(),
      postmarkType: 'CERTIFIED POST',
      serialNumber: `#0${Math.floor(Math.random() * 900 + 100)}`,
      locationName,
      imageUrl: uploadedPhoto || currentTpl.photo,
      imageAlt: title,
      colorTheme: 'primary',
      frameStyle: selectedFrameStyle,
    };
    onSubmit(newStamp);
    onClose();
  };

  const currentTpl = TEMPLATE_PRESETS[selectedIdx];
  const activePhoto = uploadedPhoto || currentTpl.photo;

  return (
    <div className="fixed inset-0 z-50 bg-[#201b0e]/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#fff8f0] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[#d5c3b6] max-h-[94vh] overflow-y-auto">
        <div className="w-12 h-1 bg-[#d5c3b6] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6f4315]/10 flex items-center justify-center text-[#6f4315]">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[17px] text-[#6f4315] font-bold">
                ถ่ายภาพสร้างแสตมป์ & เลือกลายกรอบ
              </h3>
              <p className="font-label-coord text-[10px] text-[#837469] uppercase font-semibold">
                Camera Capture, File Upload & Stamp Frame Selection
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-1 rounded-full text-[#51443a] hover:bg-[#ece2cc] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Live Camera Viewfinder Overlay (when active) */}
        {isLiveCameraOpen && (
          <div className="mt-3 p-3 bg-black rounded-2xl flex flex-col items-center relative overflow-hidden shadow-2xl border border-white/20">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
              <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />
              {/* Stamp Viewfinder Guide Outline */}
              <div className="absolute inset-4 border-2 border-dashed border-[#ffdea5] rounded-lg pointer-events-none flex flex-col items-center justify-between p-2">
                <span className="font-label-stamp text-[9px] text-[#ffdea5] bg-black/60 px-2 py-0.5 rounded">
                  STAMP VIEWFINDER
                </span>
                <span className="font-label-coord text-[8px] text-white/80 bg-black/60 px-2 py-0.5 rounded">
                  จัดองค์ประกอบภาพภายในกรอบแสตมป์
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 w-full">
              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-title-md hover:bg-zinc-700"
              >
                ยกเลิก
              </button>
              {/* Shutter Button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full bg-white p-1 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-[#8b5a2b]"
                title="กดถ่ายภาพ"
              >
                <div className="w-10 h-10 rounded-full bg-[#6f4315] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Live Stamp Perforated Frame Preview */}
        <div className="mt-4 bg-[#fdf3dc] p-4 rounded-2xl border border-[#d5c3b6]/80 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#7f601f] animate-pulse" />
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase tracking-wider font-bold">
              ตัวอย่างแสตมป์จริง: {FRAME_STYLES.find((f) => f.key === selectedFrameStyle)?.label}
            </span>
          </div>

          {/* Renders the authentic perforated frame with chosen style */}
          <div className="my-2">
            <StampPerforatedFrame
              size="preview"
              imageUrl={activePhoto}
              imageAlt="Stamp Preview"
              banner={banner}
              price={`${currencySymbol} ${amount}`}
              postmarkStation={postmarkStation}
              postmarkDate={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              postmarkType="POSTAGE PAID"
              serialNumber="#NEW-2024"
              locationName={locationName}
              sepiaFilter={isSepia}
              isUploaded={Boolean(uploadedPhoto)}
              frameStyle={selectedFrameStyle}
            />
          </div>

          {uploadedPhoto ? (
            <div className="mt-2 bg-[#faf0dc] px-3 py-1 rounded-full border border-[#8b5a2b]/40 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[#6f4315] text-[15px]">verified</span>
              <span className="font-label-coord text-[9px] text-[#6f4315] font-bold">
                ใส่ลายกรอบแสตมป์ฉลุเรียบร้อย • สามารถเลือกลายกรอบด้านล่างได้
              </span>
            </div>
          ) : (
            <span className="font-label-coord text-[9px] text-[#837469] mt-1">
              ขอบฟันปลาฉลุรอบด้านตามลายกรอบที่เลือก
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* STEP 1: Camera Capture or File Upload */}
          <div>
            <label className="font-label-coord text-[11px] text-[#6f4315] uppercase block mb-1.5 font-bold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#6f4315] text-white flex items-center justify-center text-[9px]">
                1
              </span>
              <span>ถ่ายภาพด้วยกล้องมือถือ หรืออัปโหลดไฟล์จากเครื่อง</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Option A: Mobile Camera */}
              <button
                type="button"
                onClick={startLiveCamera}
                className="p-3 bg-white rounded-xl border border-[#d5c3b6] hover:border-[#6f4315] hover:bg-[#fdf3dc]/60 transition-all flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-[#ffdcc1] text-[#2e1500] flex items-center justify-center mb-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                </div>
                <span className="font-title-md text-xs text-[#201b0e] font-semibold">
                  ถ่ายภาพด้วยกล้อง
                </span>
                <span className="font-label-coord text-[9px] text-[#837469] mt-0.5">
                  เปิดกล้องมือถือถ่ายสด
                </span>
              </button>

              {/* Option B: File / Photo Library Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white rounded-xl border border-[#d5c3b6] hover:border-[#6f4315] hover:bg-[#fdf3dc]/60 transition-all flex flex-col items-center justify-center text-center shadow-xs cursor-pointer active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-[#d6e3ff] text-[#001b3d] flex items-center justify-center mb-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">upload_file</span>
                </div>
                <span className="font-title-md text-xs text-[#201b0e] font-semibold">
                  อัปโหลดจากมือถือ
                </span>
                <span className="font-label-coord text-[9px] text-[#837469] mt-0.5">
                  เลือกจากคลังรูปภาพ / ไฟล์
                </span>
              </button>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* STEP 2: Choose Stamp Frame (เลือกลายกรอบแสตมป์) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label-coord text-[11px] text-[#6f4315] uppercase font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#6f4315] text-white flex items-center justify-center text-[9px]">
                  2
                </span>
                <span>เลือกลายกรอบแสตมป์ (Choose Stamp Frame)</span>
              </label>
              <span className="font-label-stamp text-[9px] text-[#837469]">
                5 สไตล์ให้เลือก
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FRAME_STYLES.map((frame) => {
                const isSelected = selectedFrameStyle === frame.key;
                return (
                  <button
                    key={frame.key}
                    type="button"
                    onClick={() => setSelectedFrameStyle(frame.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#6f4315] bg-[#fdf3dc] ring-2 ring-[#ffdcc1] shadow-xs'
                        : 'border-[#ece2cc] bg-white hover:border-[#d5c3b6] hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#6f4315] text-white'
                            : 'bg-[#ece2cc] text-[#51443a]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {frame.icon}
                        </span>
                      </div>
                      <div>
                        <span className="font-title-md text-[12px] text-[#201b0e] font-semibold block leading-tight">
                          {frame.label}
                        </span>
                        <span className="font-label-coord text-[9px] text-[#837469]">
                          {frame.sub}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-label-stamp text-[8px] px-1.5 py-0.5 rounded font-bold ${
                        isSelected
                          ? 'bg-[#6f4315] text-white'
                          : 'bg-[#f2e7d1] text-[#6f4315]'
                      }`}
                    >
                      {frame.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Presets & Color Tone Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label-coord text-[11px] text-[#6f4315] uppercase font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#6f4315] text-white flex items-center justify-center text-[9px]">
                  3
                </span>
                <span>โทนสีภาพและเทมเพลตสถานที่</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSepia(!isSepia)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-coord font-bold transition-all ${
                  isSepia
                    ? 'bg-[#6f4315] text-white shadow-xs'
                    : 'bg-[#ece2cc] text-[#51443a]'
                }`}
              >
                {isSepia ? '✓ วินเทจเซเปีย' : 'สีธรรมชาติ'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {TEMPLATE_PRESETS.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleSelectTemplate(idx)}
                  className={`p-1 rounded-lg border text-center transition-all ${
                    selectedIdx === idx && !uploadedPhoto
                      ? 'border-[#6f4315] bg-[#fdf3dc] ring-1 ring-[#6f4315]'
                      : 'border-[#ece2cc] bg-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-full aspect-square object-cover rounded"
                  />
                  <span className="font-label-ui text-[9px] text-[#201b0e] truncate block mt-0.5 font-medium">
                    {t.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Stamp Details & Denomination */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#ece2cc]">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ชื่อแสตมป์
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                แถบล่าง (Banner)
              </label>
              <input
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                สกุลเงิน
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                มูลค่าดวงตรา
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                สถานีประทับ
              </label>
              <input
                type="text"
                value={postmarkStation}
                onChange={(e) => setPostmarkStation(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ece2cc]">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-title-md text-[#51443a] hover:bg-[#ece2cc]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#6f4315] text-white text-xs font-title-md shadow hover:bg-[#8b5a2b] flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>บันทึกแสตมป์พร้อมกรอบฉลุ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
