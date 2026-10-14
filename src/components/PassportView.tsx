import React, { useState, useEffect } from 'react';
import { PassportVisaStamp, UserProfile } from '../types';
import { ExportPassportModal } from './ExportPassportModal';

interface PassportViewProps {
  stamps: PassportVisaStamp[];
  userProfile?: UserProfile;
  onAddStamp: (stamp: PassportVisaStamp) => void;
  onOpenGlobe: () => void;
  onToast: (msg: string) => void;
}

export const PassportView: React.FC<PassportViewProps> = ({
  stamps,
  userProfile,
  onAddStamp,
  onOpenGlobe,
  onToast,
}) => {
  const [activeSpread, setActiveSpread] = useState<'04-05' | '06-07' | '08-09'>('06-07');
  const [selectedStamp, setSelectedStamp] = useState<PassportVisaStamp | null>(stamps[0] || null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  useEffect(() => {
    if (stamps.length > 0 && (!selectedStamp || !stamps.find((s) => s.id === selectedStamp.id))) {
      setSelectedStamp(stamps[0]);
    } else if (stamps.length === 0) {
      setSelectedStamp(null);
    }
  }, [stamps]);

  const handlePrevPage = () => {
    if (activeSpread === '08-09') setActiveSpread('06-07');
    else if (activeSpread === '06-07') {
      setActiveSpread('04-05');
      onToast('เปิดหน้า 04 - 05: หมวดวีซ่าเอเชียตะวันออกเฉียงใต้');
    }
  };

  const handleNextPage = () => {
    if (activeSpread === '04-05') setActiveSpread('06-07');
    else if (activeSpread === '06-07') {
      setActiveSpread('08-09');
      onToast('เปิดหน้า 08 - 09: หมวดบันทึกเส้นทางทวีปอเมริกา');
    }
  };

  const handleAutoStamp = () => {
    const newVisa: PassportVisaStamp = {
      id: `visa-${Date.now()}`,
      country: 'อิตาลี (ITALY)',
      date: '28 ต.ค. 2024',
      location: 'Aeroporto di Firenze-Peretola (FLR)',
      coords: '43.8100° N, 11.2051° E',
      type: 'Tuscany Cultural Pass • 30 Days',
      note: 'ประทับตราผ่านด่านตรวจเมืองฟลอเรนซ์ มุ่งหน้าชมภาพวาดกำแพงโบราณและสถาปัตยกรรมโดมบรูเนลเลสกี',
      icon: 'palette',
      code: 'FIRENZE / FLR',
      shape: 'hexagon',
      color: '#6f4315',
      admitted: 'TUSCANY ENTRY',
      pageNumber: 7,
    };
    onAddStamp(newVisa);
    setSelectedStamp(newVisa);
    onToast('ประทับตราเมืองเวนิส & ฟลอเรนซ์ ลงในสมุดเรียบร้อย!');
  };

  return (
    <div className="flex flex-col w-full pb-24 max-w-2xl mx-auto">
      {/* Booklet Spine Header & Page Turner */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6f4315] text-[20px]">
              book_2
            </span>
            <span className="font-label-coord text-[10px] text-[#465f88] tracking-widest uppercase font-bold">
              DOC ID: TH-892041
            </span>
          </div>
          <div className="bg-[#ece2cc] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#d5c3b6]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7f601f] animate-pulse" />
            <span className="font-label-stamp text-[9px] text-[#51443a] uppercase font-bold">
              EXPEDITION READY
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="font-headline-sm text-lg text-[#6f4315] tracking-tight font-bold">
              หนังสือเดินทางนักผจญภัย
            </h1>
            <p className="font-label-ui text-[11px] text-[#51443a] -mt-0.5">
              Explorer Official Passport • Kingdom of Wander
            </p>
          </div>
          <span className="font-label-coord text-[10px] text-[#644807] font-bold tracking-wider">
            SERIES 2024-B
          </span>
        </div>

        {/* Antique Page Flipper Control */}
        <div className="mt-1 bg-[#f2e7d1] rounded-full p-1 flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] border border-[#d5c3b6]/60">
          <button
            type="button"
            onClick={handlePrevPage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fff8f0] text-[#6f4315] shadow-sm active:scale-95 transition-all hover:bg-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
            <span className="font-label-stamp text-[10px] font-bold">หน้า 04-05</span>
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeSpread === '04-05' ? 'bg-[#6f4315]' : 'bg-[#d5c3b6]'}`} />
              <span className="font-label-stamp text-[11px] text-[#6f4315] font-bold">
                {activeSpread === '04-05' ? 'หน้า 04 – 05' : activeSpread === '06-07' ? 'หน้า 06 – 07' : 'หน้า 08 – 09'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${activeSpread === '08-09' ? 'bg-[#6f4315]' : 'bg-[#d5c3b6]'}`} />
            </div>
            <span className="font-label-coord text-[9px] text-[#51443a]">จากทั้งหมด 24 หน้า</span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fff8f0] text-[#6f4315] shadow-sm active:scale-95 transition-all hover:bg-white cursor-pointer"
          >
            <span className="font-label-stamp text-[10px] font-bold">หน้า 08-09</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward_ios</span>
          </button>
        </div>
      </div>

      {/* Physical Passport Double-Spread Presentation */}
      <div className="px-4 mt-2">
        {/* Leatherette Spine Frame */}
        <div className="p-2 bg-gradient-to-b from-[#201b0e] via-[#353021] to-[#201b0e] rounded-xl shadow-[0_8px_24px_rgba(32,27,14,0.35)] relative overflow-hidden border border-[#d5c3b6]/30">
          <div className="flex flex-col gap-2 rounded-lg overflow-hidden">
            {/* ================= LEFT PAGE: หน้า 06 ================= */}
            <div className="relative bg-[#faf5ea] rounded-t-lg p-3.5 shadow-[inset_0_2px_8px_rgba(111,67,21,0.08)] overflow-hidden">
              {/* Guilloché & Security Watermark Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] text-[#6f4315]">
                <defs>
                  <pattern id="guilloche-left" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M20,0 Q30,20 20,40 T20,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#guilloche-left)" />
                <path d="M20 70 Q 60 40, 110 50 T 180 80 T 260 40 T 340 70" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </svg>

              {/* Archival Header Ribbon */}
              <div className="flex items-center justify-between relative z-10 pb-2 border-b border-[#ece2cc]">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-coord text-[9px] text-[#837469] tracking-wider uppercase font-bold">
                    IMMIGRATION • VISAS
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#d5c3b6]" />
                  <span className="font-label-stamp text-[9px] text-[#644807] font-bold">
                    ENTRIES / SORTIES
                  </span>
                </div>
                <span className="font-headline-sm text-[13px] text-[#6f4315] font-bold">06</span>
              </div>

              {/* Stamped Visas Cluster (Left Page) */}
              <div className="grid grid-cols-2 gap-2.5 relative z-10 mt-2">
                {/* Stamp 1: Narita */}
                {stamps[0] && (
                  <button
                    type="button"
                    onClick={() => setSelectedStamp(stamps[0])}
                    className="p-2.5 rounded-lg bg-[#faf0dc]/60 text-left cursor-pointer transform -rotate-2 hover:rotate-0 hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-[#ba1a1a]/30"
                  >
                    <div className="w-full aspect-[4/3] rounded border-2 border-dashed border-[#ba1a1a]/70 flex flex-col items-center justify-center p-1.5 relative overflow-hidden bg-[#ba1a1a]/[0.03]">
                      <svg className="absolute inset-0 w-full h-full text-[#ba1a1a]" fill="none" viewBox="0 0 120 90">
                        <polygon points="60,4 114,24 114,66 60,86 6,66 6,24" stroke="currentColor" strokeWidth="2" strokeDasharray="3 1" opacity="0.85" />
                      </svg>
                      <div className="flex items-center gap-1 text-[#ba1a1a] opacity-90">
                        <span className="material-symbols-outlined text-[13px]">flight_land</span>
                        <span className="font-label-stamp text-[9px] font-bold tracking-widest">NARITA</span>
                      </div>
                      <span className="font-label-stamp text-[10px] text-[#ba1a1a] font-bold tracking-wider my-0.5">
                        {stamps[0].date}
                      </span>
                      <span className="font-label-coord text-[8px] text-[#ba1a1a] uppercase font-semibold">
                        ADMITTED • 90D
                      </span>
                      <div className="absolute -bottom-2 -right-2 text-[28px] text-[#ba1a1a]/10 font-bold select-none">
                        JPN
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="font-label-stamp text-[8px] text-[#6f4315] font-semibold">TOKYO / NRT</span>
                      <span className="material-symbols-outlined text-[12px] text-[#ba1a1a]">touch_app</span>
                    </div>
                  </button>
                )}

                {/* Stamp 2: France */}
                {stamps[1] && (
                  <button
                    type="button"
                    onClick={() => setSelectedStamp(stamps[1])}
                    className="p-2.5 rounded-lg bg-[#eef3fb]/60 text-left cursor-pointer transform rotate-3 hover:rotate-0 hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-[#465f88]/30"
                  >
                    <div className="w-full aspect-[4/3] rounded border border-[#001b3d]/60 flex flex-col items-center justify-center p-1.5 relative overflow-hidden bg-[#465f88]/[0.04]">
                      <span className="font-label-stamp text-[8px] text-[#465f88] tracking-widest font-bold">
                        FRANCE • CDG
                      </span>
                      <div className="flex items-center gap-1 my-0.5">
                        <span className="material-symbols-outlined text-[11px] text-[#465f88]">flight</span>
                        <span className="font-label-stamp text-[10px] text-[#001b3d] font-bold tracking-wider">
                          {stamps[1].date}
                        </span>
                      </div>
                      <span className="font-label-coord text-[7px] text-[#465f88] tracking-widest uppercase font-semibold">
                        POLICE AUX FRONTIERES
                      </span>
                      <span className="font-label-coord text-[7px] text-[#465f88]/70">SCHENGEN • F-082</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="font-label-stamp text-[8px] text-[#465f88] font-semibold">PARIS / CDG</span>
                      <span className="material-symbols-outlined text-[12px] text-[#465f88]">touch_app</span>
                    </div>
                  </button>
                )}

                {/* Stamp 3: Cairo Immigration (Spans 2 columns) */}
                {stamps[2] && (
                  <button
                    type="button"
                    onClick={() => setSelectedStamp(stamps[2])}
                    className="col-span-2 p-2.5 rounded-lg bg-[#fdf3dc]/60 text-left cursor-pointer transform -rotate-1 hover:rotate-0 hover:scale-[1.01] active:scale-95 transition-all shadow-sm border border-[#7f601f]/30"
                  >
                    <div className="w-full py-2 rounded-full border-2 border-[#7f601f]/70 flex items-center justify-between px-3 relative bg-[#ffdea5]/[0.08]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#7f601f]/15 flex items-center justify-center text-[#644807]">
                          <span className="material-symbols-outlined text-[16px]">account_balance</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-stamp text-[9px] sm:text-[10px] text-[#644807] font-bold tracking-wider">
                            CAIRO IMMIGRATION ENTRY
                          </span>
                          <span className="font-label-coord text-[8px] text-[#7f601f]">
                            ARAB REPUBLIC OF EGYPT • {stamps[2].date}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-label-stamp text-[8px] text-[#644807] font-bold bg-[#ffdea5] px-1.5 py-0.5 rounded">
                          AUTHENTIC
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Center Gutter Folding Line */}
            <div className="h-2 bg-gradient-to-r from-[#201b0e]/30 via-[#201b0e]/70 to-[#201b0e]/30 flex items-center justify-center">
              <div className="w-32 h-[1px] bg-[#f9ba82]/40" />
            </div>

            {/* ================= RIGHT PAGE: หน้า 07 ================= */}
            <div className="relative bg-[#faf5ea] rounded-b-lg p-3.5 shadow-[inset_0_-2px_8px_rgba(111,67,21,0.08)] overflow-hidden">
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] text-[#6f4315]">
                <defs>
                  <pattern id="guilloche-right" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="15" cy="15" r="7" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#guilloche-right)" />
              </svg>

              <div className="flex items-center justify-between relative z-10 pb-2 border-b border-[#ece2cc]">
                <span className="font-headline-sm text-[13px] text-[#6f4315] font-bold">07</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-label-coord text-[9px] text-[#837469] tracking-wider uppercase font-bold">
                    VALIDATIONS • SEALS
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#d5c3b6]" />
                  <span className="font-label-stamp text-[9px] text-[#644807] font-bold">
                    VISAS • STAMPS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 relative z-10 mt-2">
                {/* Stamp 4: Reykjavik */}
                {stamps[3] && (
                  <button
                    type="button"
                    onClick={() => setSelectedStamp(stamps[3])}
                    className="p-2.5 rounded-lg bg-[#eaf3f5]/60 text-left cursor-pointer transform rotate-2 hover:rotate-0 hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-[#2e476f]/30"
                  >
                    <div className="w-full aspect-[4/3] rounded-full border-2 border-double border-[#2e476f] flex flex-col items-center justify-center p-1 relative overflow-hidden bg-[#d6e3ff]/[0.08]">
                      <span className="material-symbols-outlined text-[13px] text-[#2e476f]">ac_unit</span>
                      <span className="font-label-stamp text-[8px] text-[#001b3d] font-bold tracking-wider">
                        REYKJAVIK
                      </span>
                      <span className="font-label-coord text-[7px] text-[#2e476f] uppercase font-semibold">
                        ARCTIC 2024
                      </span>
                      <span className="font-label-stamp text-[9px] text-[#2e476f] font-bold mt-0.5">
                        {stamps[3].date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="font-label-stamp text-[8px] text-[#2e476f] font-semibold">KEFLAVIK</span>
                      <span className="material-symbols-outlined text-[12px] text-[#2e476f]">touch_app</span>
                    </div>
                  </button>
                )}

                {/* Stamp 5: Marrakech */}
                {stamps[4] && (
                  <button
                    type="button"
                    onClick={() => setSelectedStamp(stamps[4])}
                    className="p-2.5 rounded-lg bg-[#fcefee]/60 text-left cursor-pointer transform -rotate-3 hover:rotate-0 hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-[#ba1a1a]/30"
                  >
                    <div className="w-full aspect-[4/3] rounded border border-[#ba1a1a]/60 flex flex-col items-center justify-center p-1 relative overflow-hidden bg-[#ba1a1a]/[0.03]">
                      <svg className="absolute inset-0 w-full h-full text-[#ba1a1a]/20" fill="currentColor" viewBox="0 0 100 80">
                        <polygon points="50,5 62,28 88,28 68,44 76,69 50,54 24,69 32,44 12,28 38,28" />
                      </svg>
                      <span className="font-label-stamp text-[8px] text-[#ba1a1a] font-bold tracking-widest relative z-10">
                        MARRAKECH
                      </span>
                      <span className="font-label-stamp text-[10px] text-[#93000a] font-bold tracking-wider relative z-10 my-0.5">
                        {stamps[4].date}
                      </span>
                      <span className="font-label-coord text-[7px] text-[#ba1a1a] uppercase relative z-10 font-semibold">
                        ROYAL PERMIT • SOUK
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="font-label-stamp text-[8px] text-[#93000a] font-semibold">MENARA / RAK</span>
                      <span className="material-symbols-outlined text-[12px] text-[#ba1a1a]">touch_app</span>
                    </div>
                  </button>
                )}

                {/* Slot 6: Empty Interactive Slot */}
                <button
                  type="button"
                  onClick={onOpenGlobe}
                  className="col-span-2 group relative p-3 rounded-lg bg-[#fdf3dc]/80 text-center cursor-pointer hover:bg-[#f7edd7] transition-all active:scale-[0.98] shadow-sm border border-dashed border-[#837469]/50 hover:border-[#6f4315]"
                >
                  <div className="w-full py-2.5 flex flex-col items-center justify-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-[#ece2cc] flex items-center justify-center text-[#6f4315] group-hover:bg-[#6f4315] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                    </div>
                    <span className="font-title-md text-[13px] text-[#6f4315] font-semibold">
                      + ปักหมุดประเทศใหม่เพื่อรับตราประทับ
                    </span>
                    <span className="font-label-coord text-[9px] text-[#51443a] uppercase tracking-wider">
                      AVAILABLE VISA SPACE • PAGE 07
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Machine Readable Zone (MRZ) Strip */}
          <div className="mt-2 px-2 py-1.5 bg-[#1b170c] rounded text-[8px] font-label-coord text-[#d6e3ff] tracking-widest select-none overflow-hidden text-center opacity-90 border border-white/10 uppercase">
            P&lt;THA{userProfile?.username?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'WANDERER'}&lt;&lt;{userProfile?.fullName?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'SOMCHAI'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
            {userProfile?.docId?.replace(/[^A-Z0-9]/g, '') || '892041'}&lt;3THA9205124M3010156&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
          </div>
        </div>
      </div>

      {/* Interactive Stamp Inspector Card */}
      <div className="px-4 mt-4">
        {selectedStamp ? (
          <div className="bg-white rounded-xl p-4 shadow-md border border-[#d5c3b6]/70 transition-all">
            <div className="flex items-center justify-between pb-2 border-b border-[#ece2cc]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#ffdcc1] flex items-center justify-center text-[#2e1500]">
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedStamp.icon || 'verified'}
                  </span>
                </span>
                <div>
                  <span className="font-label-coord text-[10px] text-[#465f88] uppercase tracking-wider font-bold">
                    แว่นขยายตรวจสอบตราประทับ
                  </span>
                  <h2 className="font-headline-sm text-base text-[#6f4315] font-bold -mt-0.5">
                    {selectedStamp.country}
                  </h2>
                </div>
              </div>
              <span className="font-label-stamp text-[10px] text-[#644807] bg-[#fdf3dc] px-2 py-1 rounded font-bold border border-[#d5c3b6]/50">
                {selectedStamp.date}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#fdf3dc] border border-[#d5c3b6]/40">
              <div className="flex flex-col">
                <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold">
                  สถานที่ / ด่านตรวจคนเข้าเมือง
                </span>
                <span className="font-title-md text-[12px] text-[#201b0e] font-semibold truncate">
                  {selectedStamp.location}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold">
                  พิกัดทางภูมิศาสตร์
                </span>
                <span className="font-label-coord text-[11px] text-[#465f88] font-bold">
                  {selectedStamp.coords}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="font-label-coord text-[9px] text-[#837469] uppercase tracking-wider font-bold">
                ประเภทการเข้าเมือง:
              </span>
              <span className="font-label-stamp text-[10px] text-[#6f4315] font-bold">
                {selectedStamp.type}
              </span>
            </div>

            <div className="mt-2 p-2.5 rounded-lg bg-[#f2e7d1]/60 border border-[#d5c3b6]/40">
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px] text-[#644807]">edit_note</span>
                <span className="font-label-stamp text-[9px] text-[#644807] uppercase tracking-wider font-bold">
                  บันทึกสมุดเดินทาง
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#201b0e] italic leading-relaxed">
                “{selectedStamp.note}”
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between pt-1">
              <span className="font-label-coord text-[9px] text-[#51443a] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">touch_app</span>
                แตะตราประทับอื่นในสมุดเพื่อสลับดูข้อมูล
              </span>
              <button
                type="button"
                onClick={() => onToast(`คัดลอกข้อมูลตราประทับ ${selectedStamp.country} เรียบร้อย`)}
                className="font-label-stamp text-[10px] text-[#6f4315] flex items-center gap-1 hover:underline font-bold"
              >
                <span className="material-symbols-outlined text-[14px]">share</span>
                แชร์ตรานี้
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#d5c3b6]/70 text-center space-y-2">
            <span className="material-symbols-outlined text-[#6f4315] text-[32px]">menu_book</span>
            <h3 className="font-headline-sm text-sm text-[#201b0e] font-bold">
              หนังสือเดินทางพร้อมรับตราประทับแรก
            </h3>
            <p className="font-body-sm text-xs text-[#51443a]">
              ยังไม่มีตราประทับในสมุดพาสปอร์ต ไปที่แท็บลูกโลกเพื่อปักหมุดเมืองแรก หรือแตะปุ่มด้านล่าง
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={handleAutoStamp}
                className="px-4 py-2 rounded-lg bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-xs cursor-pointer"
              >
                + ประทับตราแรกทันที
              </button>
              <button
                type="button"
                onClick={onOpenGlobe}
                className="px-4 py-2 rounded-lg bg-[#fff8f0] text-[#6f4315] border border-[#d5c3b6] text-xs font-title-md hover:bg-white cursor-pointer"
              >
                เปิดดูลูกโลก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick Actions Group */}
      <div className="px-4 mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAutoStamp}
          className="w-full py-3 px-4 rounded-xl bg-[#6f4315] text-white shadow-md flex items-center justify-between active:scale-[0.98] hover:bg-[#8b5a2b] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8b5a2b] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">approval</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-title-md text-[14px] font-semibold leading-tight">
                ประทับตราอัตโนมัติจากหมุดล่าสุด
              </span>
              <span className="font-label-coord text-[9px] text-[#ffdcc1] uppercase tracking-wider font-semibold">
                พบ 2 จุดแวะพักที่ยังไม่ได้ลงตรา
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#ffdcc1] text-[20px]">
            arrow_forward
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#f2e7d1] text-[#6f4315] hover:bg-[#ece2cc] transition-colors flex items-center justify-center gap-2 active:scale-[0.98] border border-[#d5c3b6]/60 font-semibold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          <span className="font-title-md text-[13px]">
            ส่งออกสมุดพาสปอร์ต PDF (Full Folio)
          </span>
        </button>
      </div>

      {/* Export Folio Modal */}
      <ExportPassportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        stamps={stamps}
      />
    </div>
  );
};
