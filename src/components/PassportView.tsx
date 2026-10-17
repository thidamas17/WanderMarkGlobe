import React, { useState, useEffect, useMemo } from 'react';
import { PassportVisaStamp, GlobePin, UserProfile } from '../types';
import { ExportPassportModal } from './ExportPassportModal';

interface PassportViewProps {
  stamps: PassportVisaStamp[];
  pins?: GlobePin[];
  userProfile?: UserProfile;
  onAddStamp: (stamp: PassportVisaStamp) => void;
  onUpdatePinDate?: (pinOrStampId: string, newDate: string) => void;
  onOpenGlobe: () => void;
  onToast: (msg: string) => void;
}

type SpreadType = '01-02' | '03-04' | '05-06' | '07-08';

export const PassportView: React.FC<PassportViewProps> = ({
  stamps,
  pins = [],
  userProfile,
  onAddStamp,
  onUpdatePinDate,
  onOpenGlobe,
  onToast,
}) => {
  // เริ่มต้นที่ หน้า 1 (Spread 01-02) ตามที่ผู้ใช้สั่ง
  const [activeSpread, setActiveSpread] = useState<SpreadType>('01-02');
  const [selectedStamp, setSelectedStamp] = useState<PassportVisaStamp | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // การแก้ไขวันที่บันทึกพิกัด (Editable Pin / Stamp Date)
  const [customDates, setCustomDates] = useState<Record<string, string>>({});
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<string>('');

  // การแสตมป์อ้างอิงจากการปักหมุดของผู้ใช้ (Stamps linked directly from user pins)
  const effectiveStamps: PassportVisaStamp[] = useMemo(() => {
    if (pins && pins.length > 0) {
      // แปลงหมุดที่ผู้ใช้ปักไว้เป็นตราประทับวีซ่าในเล่มพาสปอร์ตโดยตรง
      return pins.map((pin, idx) => {
        const shapes: ('hexagon' | 'rectangle' | 'oval' | 'circle' | 'star')[] = [
          'hexagon',
          'rectangle',
          'oval',
          'circle',
        ];
        const colors = ['#ba1a1a', '#465f88', '#6f4315', '#2e476f', '#7f601f'];
        const stampId = `visa-${pin.id}`;
        const finalDate = customDates[stampId] || customDates[pin.id] || pin.date;

        return {
          id: stampId,
          country: `${pin.country} (${pin.city})`,
          date: finalDate,
          location: `${pin.city} Expedition Station`,
          coords: pin.latLngDisplay,
          type: `${pin.categoryTag || pin.region || 'พิกัดโลกจริง'} • Verified Entry`,
          note: `ปักหมุดสำเร็จ ณ ${pin.city}, ${pin.country} บันทึกพิกัดจริง ${pin.latLngDisplay}`,
          icon: pin.pinStyle === 'flag' ? 'flag' : pin.pinStyle === 'needle' ? 'push_pin' : 'location_on',
          code: pin.code || `WM-${idx + 101}`,
          shape: shapes[idx % shapes.length],
          color: pin.pinColor || colors[idx % colors.length],
          admitted: 'VERIFIED',
          pageNumber: Math.floor(idx / 2) + 2,
        };
      });
    }
    // ถ้าผู้ใช้ยังไม่ได้ปักหมุด ให้เซ็ทเป็น 0 (empty array)
    return [];
  }, [pins, customDates]);

  // ซิงค์การเลือกตราประทับ
  useEffect(() => {
    if (effectiveStamps.length > 0) {
      if (!selectedStamp || !effectiveStamps.find((s) => s.id === selectedStamp.id)) {
        setSelectedStamp(effectiveStamps[0]);
      }
    } else {
      setSelectedStamp(null);
    }
  }, [effectiveStamps, selectedStamp]);

  const handlePrevPage = () => {
    if (activeSpread === '07-08') {
      setActiveSpread('05-06');
      onToast('เปิดหน้า 05 – 06: ตราประทับบันทึกการเดินทาง');
    } else if (activeSpread === '05-06') {
      setActiveSpread('03-04');
      onToast('เปิดหน้า 03 – 04: ตราประทับบันทึกการเดินทาง');
    } else if (activeSpread === '03-04') {
      setActiveSpread('01-02');
      onToast('เปิดหน้า 01 – 02: ข้อมูลส่วนตัวนักสำรวจ & วีซ่าหน้าแรก');
    }
  };

  const handleNextPage = () => {
    if (activeSpread === '01-02') {
      setActiveSpread('03-04');
      onToast('เปิดหน้า 03 – 04: ตราประทับบันทึกการเดินทาง');
    } else if (activeSpread === '03-04') {
      setActiveSpread('05-06');
      onToast('เปิดหน้า 05 – 06: ตราประทับบันทึกการเดินทาง');
    } else if (activeSpread === '05-06') {
      setActiveSpread('07-08');
      onToast('เปิดหน้า 07 – 08: ตราประทับบันทึกการเดินทาง');
    }
  };

  // ดึงตราประทับประจำหน้านั้นๆ (2 ตราต่อหน้า)
  const getStampsForPage = (pageNum: number) => {
    const startIndex = (pageNum - 2) * 2;
    if (startIndex < 0) return [];
    return effectiveStamps.slice(startIndex, startIndex + 2);
  };

  // บันทึกการแก้ไขวันที่บันทึกพิกัด (Save edited date)
  const handleSaveDate = (stampId: string, newDate: string) => {
    const trimmed = newDate.trim();
    if (!trimmed) {
      onToast('กรุณาระบุวันที่');
      return;
    }
    setCustomDates((prev) => ({
      ...prev,
      [stampId]: trimmed,
    }));
    if (selectedStamp && selectedStamp.id === stampId) {
      setSelectedStamp((prev) => (prev ? { ...prev, date: trimmed } : null));
    }
    onUpdatePinDate?.(stampId, trimmed);
    setIsEditingDate(false);
    onToast(`แก้ไขวันที่บันทึกพิกัดเป็น "${trimmed}" เรียบร้อยแล้ว`);
  };

  // ตรวจสอบข้อมูลผู้ใช้สำหรับแสดงในหน้า 1
  const docId = userProfile?.docId || 'WM-000000';
  const fullName = userProfile?.fullName || 'นักสำรวจคนใหม่';
  const username = userProfile?.username || 'explorer';
  const avatarUrl = userProfile?.avatarUrl || '/logo.svg';
  const registeredDate = userProfile?.registeredAt || new Date().toLocaleDateString('th-TH');
  const titleRank = userProfile?.titleRank || 'NOVICE EXPLORER';

  return (
    <div className="flex flex-col w-full pb-24 max-w-2xl mx-auto">
      {/* Top Header & Page Turner */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6f4315] text-[20px]">
              menu_book
            </span>
            <span className="font-label-coord text-[10px] text-[#465f88] tracking-widest uppercase font-bold">
              DOC ID: {docId}
            </span>
          </div>
          <div className="bg-[#ece2cc] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-[#d5c3b6]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7f601f] animate-pulse" />
            <span className="font-label-stamp text-[9px] text-[#51443a] uppercase font-bold">
              {effectiveStamps.length > 0 ? `${effectiveStamps.length} ตราประทับในเล่ม` : 'เริ่มต้นที่ 0 ตราประทับ'}
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
            SERIES 2026-ARCHIVE
          </span>
        </div>

        {/* Clear & Easy Page Flipper Control (ปรับเล่มพาสปอร์ตให้ดูง่าย) */}
        <div className="mt-1 bg-[#f2e7d1] rounded-full p-1 flex items-center justify-between shadow-xs border border-[#d5c3b6]/60">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={activeSpread === '01-02'}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[#6f4315] shadow-xs transition-all cursor-pointer ${
              activeSpread === '01-02'
                ? 'opacity-40 cursor-not-allowed bg-transparent'
                : 'bg-[#fff8f0] hover:bg-white active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
            <span className="font-label-stamp text-[10px] font-bold">หน้าก่อนหน้า</span>
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeSpread === '01-02' ? 'bg-[#6f4315]' : 'bg-[#d5c3b6]'
                }`}
              />
              <span className="font-label-stamp text-[11px] text-[#6f4315] font-bold">
                {activeSpread === '01-02'
                  ? 'หน้า 01 – 02 (หน้าแรก)'
                  : activeSpread === '03-04'
                  ? 'หน้า 03 – 04'
                  : activeSpread === '05-06'
                  ? 'หน้า 05 – 06'
                  : 'หน้า 07 – 08'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeSpread !== '01-02' ? 'bg-[#6f4315]' : 'bg-[#d5c3b6]'
                }`}
              />
            </div>
            <span className="font-label-coord text-[9px] text-[#51443a]">
              {activeSpread === '01-02' ? 'หน้าข้อมูลส่วนตัว & ตราแรก' : 'หน้าตราประทับจากการปักหมุด'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={activeSpread === '07-08'}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[#6f4315] shadow-xs transition-all cursor-pointer ${
              activeSpread === '07-08'
                ? 'opacity-40 cursor-not-allowed bg-transparent'
                : 'bg-[#fff8f0] hover:bg-white active:scale-95'
            }`}
          >
            <span className="font-label-stamp text-[10px] font-bold">หน้าถัดไป</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward_ios</span>
          </button>
        </div>

        {/* Page Tab Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { id: '01-02' as const, label: 'หน้า 01-02 (ข้อมูลส่วนตัว)' },
            { id: '03-04' as const, label: 'หน้า 03-04 (ตราประทับ)' },
            { id: '05-06' as const, label: 'หน้า 05-06' },
            { id: '07-08' as const, label: 'หน้า 07-08' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSpread(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-title-md transition-all shrink-0 cursor-pointer ${
                activeSpread === tab.id
                  ? 'bg-[#6f4315] text-white font-bold shadow-xs'
                  : 'bg-[#fdf3dc] text-[#51443a] hover:bg-[#ffdea5]/50 border border-[#d5c3b6]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Passport Double-Spread Presentation */}
      <div className="px-4 mt-1">
        {/* Leatherette Spine Frame */}
        <div className="p-2 sm:p-3 bg-gradient-to-b from-[#201b0e] via-[#353021] to-[#201b0e] rounded-2xl shadow-xl relative overflow-hidden border border-[#d5c3b6]/40">
          <div className="flex flex-col gap-2 rounded-xl overflow-hidden">

            {/* ========================================================================= */}
            {/* SPREAD 01-02: เริ่มต้นที่ หน้า 1 (Official Explorer Identity & Bio Page) */}
            {/* ========================================================================= */}
            {activeSpread === '01-02' && (
              <>
                {/* ================= PAGE 01: หน้าข้อมูลประจำตัวนักสำรวจ ================= */}
                <div className="relative bg-[#faf5ea] rounded-t-xl p-4 shadow-[inset_0_2px_8px_rgba(111,67,21,0.08)] overflow-hidden border-b border-[#ece2cc]">
                  {/* Guilloché & Security Watermark Vectors */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05] text-[#6f4315]">
                    <defs>
                      <pattern id="guilloche-p1" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#guilloche-p1)" />
                  </svg>

                  {/* Header of Page 1 */}
                  <div className="flex items-center justify-between relative z-10 pb-2 border-b border-[#d5c3b6]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">✦</span>
                      <span className="font-label-coord text-[9px] text-[#6f4315] tracking-widest uppercase font-bold">
                        ราชอาณาจักรแห่งการสำรวจ • KINGDOM OF WANDER
                      </span>
                    </div>
                    <span className="font-headline-sm text-xs text-[#6f4315] font-bold bg-[#fdf3dc] px-1.5 py-0.5 rounded border border-[#d5c3b6]">
                      หน้า 01
                    </span>
                  </div>

                  {/* Explorer Bio Card Section */}
                  <div className="relative z-10 mt-3 flex flex-col sm:flex-row gap-3 items-center sm:items-start bg-white/70 p-3 rounded-xl border border-[#d5c3b6]/80 shadow-2xs">
                    {/* Photo Box with Archival Watermark */}
                    <div className="relative w-24 h-28 rounded-lg overflow-hidden bg-[#fdf3dc] border-2 border-[#6f4315] shrink-0 shadow-sm flex flex-col items-center justify-center p-1">
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 border border-white/40 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 bg-[#6f4315]/80 text-white text-[7px] font-label-coord px-1 rounded font-bold">
                        OFFICIAL
                      </div>
                    </div>

                    {/* Passport Data Table */}
                    <div className="flex-1 w-full space-y-1.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 pb-1.5 border-b border-[#ece2cc]">
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            เลขที่หนังสือเดินทาง / PASSPORT NO.
                          </span>
                          <span className="font-headline-sm text-sm text-[#ba1a1a] font-bold">
                            {docId}
                          </span>
                        </div>
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            สถานะการสำรวจ / STATUS
                          </span>
                          <span className="font-label-stamp text-[9px] text-[#6f4315] font-bold bg-[#ffdea5] px-1.5 py-0.5 rounded inline-block">
                            {titleRank}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            ชื่อ-นามสกุล / FULL NAME
                          </span>
                          <span className="font-headline-sm text-xs text-[#201b0e] font-bold block truncate">
                            {fullName}
                          </span>
                        </div>
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            ชื่อผู้ใช้ / USERNAME
                          </span>
                          <span className="font-label-coord text-xs text-[#465f88] font-bold block truncate">
                            @{username}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ece2cc]">
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            วันที่ออกหนังสือ / DATE OF ISSUE
                          </span>
                          <span className="font-label-stamp text-[10px] text-[#51443a] font-semibold">
                            {registeredDate}
                          </span>
                        </div>
                        <div>
                          <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                            สถิติตราประทับ / STAMPS RECORDED
                          </span>
                          <span className="font-headline-sm text-[11px] text-[#6f4315] font-bold">
                            {effectiveStamps.length} ตรา (จุดหมายที่ปักหมุด)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Machine Readable Zone (MRZ Code) */}
                  <div className="relative z-10 mt-2.5 p-2 bg-[#f4ece0] rounded-lg border border-[#d5c3b6]/60 font-mono text-[9px] text-[#353021] tracking-widest leading-tight overflow-x-auto select-none">
                    <p className="whitespace-nowrap">P&lt;WND&lt;&lt;{fullName.toUpperCase().replace(/\s+/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                    <p className="whitespace-nowrap">{docId}&lt;0THA0000000M2412318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;01</p>
                  </div>
                </div>

                {/* Center Binding Line */}
                <div className="h-2 bg-gradient-to-r from-[#201b0e]/30 via-[#201b0e]/70 to-[#201b0e]/30 flex items-center justify-center">
                  <div className="w-32 h-[1px] bg-[#f9ba82]/40" />
                </div>

                {/* ================= PAGE 02: หน้าตราประทับแรก (Visas & Entry Permits) ================= */}
                <div className="relative bg-[#faf5ea] rounded-b-xl p-4 shadow-[inset_0_-2px_8px_rgba(111,67,21,0.08)] overflow-hidden">
                  <div className="flex items-center justify-between relative z-10 pb-2 border-b border-[#ece2cc]">
                    <span className="font-headline-sm text-xs text-[#6f4315] font-bold bg-[#fdf3dc] px-1.5 py-0.5 rounded border border-[#d5c3b6]">
                      หน้า 02
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-coord text-[9px] text-[#837469] tracking-wider uppercase font-bold">
                        ตราประทับผ่านแดนจากการปักหมุด
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#d5c3b6]" />
                      <span className="font-label-stamp text-[9px] text-[#644807] font-bold">
                        VISAS / ENTRIES
                      </span>
                    </div>
                  </div>

                  {/* Stamp slots on Page 2 (Linked directly from user pins) */}
                  <div className="relative z-10 mt-3">
                    {effectiveStamps.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getStampsForPage(2).map((st) => (
                          <div
                            key={st.id}
                            onClick={() => setSelectedStamp(st)}
                            className="p-3 rounded-xl bg-[#fff8f0] text-left cursor-pointer border-2 border-dashed border-[#ba1a1a]/70 hover:border-[#ba1a1a] shadow-xs hover:shadow-md transition-all active:scale-98 group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-label-coord text-[8px] bg-[#ba1a1a] text-white px-1.5 py-0.2 rounded font-bold">
                                {st.code}
                              </span>
                              <span className="font-label-stamp text-[9px] text-[#ba1a1a] font-bold">
                                {st.date}
                              </span>
                            </div>
                            <h4 className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                              {st.country}
                            </h4>
                            <p className="font-label-coord text-[9px] text-[#465f88] font-bold mt-0.5">
                              {st.coords}
                            </p>
                            <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#ece2cc] text-[9px]">
                              <span className="text-[#6f4315] font-semibold">{st.admitted}</span>
                              <span className="text-[#ba1a1a] group-hover:underline flex items-center gap-0.5 font-bold">
                                <span>ดูข้อมูล</span>
                                <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Empty State when stamps = 0 on first use */
                      <div className="py-8 px-4 text-center rounded-xl bg-white/80 border border-dashed border-[#d5c3b6] space-y-2.5">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf3dc] text-[#6f4315] flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[26px]">approval</span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-sm text-[#201b0e] font-bold">
                            ยังไม่มีตราประทับในเล่ม (0 ตรา)
                          </h3>
                          <p className="font-body-sm text-xs text-[#51443a] max-w-sm mx-auto mt-1 leading-relaxed">
                            ตราประทับในพาสปอร์ตจะอ้างอิงและบันทึกอัตโนมัติจากการกดปักหมุดสถานที่ของคุณบนลูกโลก 3D
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenGlobe}
                          className="px-4 py-2 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-bold active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
                          <span>+ ไปที่ลูกโลกเพื่อปักหมุดแรก</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* SPREADS 03-04, 05-06, 07-08: ตราประทับหน้าถัดไป */}
            {/* ========================================================================= */}
            {activeSpread !== '01-02' && (
              <div className="relative bg-[#faf5ea] rounded-xl p-4 shadow-inner min-h-[360px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#ece2cc]">
                  <span className="font-headline-sm text-xs text-[#6f4315] font-bold bg-[#fdf3dc] px-2 py-0.5 rounded border border-[#d5c3b6]">
                    {activeSpread === '03-04' ? 'หน้า 03 – 04' : activeSpread === '05-06' ? 'หน้า 05 – 06' : 'หน้า 07 – 08'}
                  </span>
                  <span className="font-label-stamp text-[10px] text-[#644807] font-bold">
                    EXPEDITION VISA STAMPS • RECORDED WAYPOINTS
                  </span>
                </div>

                {effectiveStamps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {effectiveStamps
                      .slice(
                        activeSpread === '03-04' ? 2 : activeSpread === '05-06' ? 6 : 10,
                        activeSpread === '03-04' ? 6 : activeSpread === '05-06' ? 10 : 14
                      )
                      .map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStamp(st)}
                          className="p-3 rounded-xl bg-[#fff8f0] text-left cursor-pointer border-2 border-dashed border-[#465f88]/70 hover:border-[#465f88] shadow-xs hover:shadow-md transition-all active:scale-98"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-label-coord text-[8px] bg-[#465f88] text-white px-1.5 py-0.2 rounded font-bold">
                              {st.code}
                            </span>
                            <span className="font-label-stamp text-[9px] text-[#465f88] font-bold">
                              {st.date}
                            </span>
                          </div>
                          <h4 className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                            {st.country}
                          </h4>
                          <p className="font-label-coord text-[9px] text-[#465f88] font-bold mt-0.5">
                            {st.coords}
                          </p>
                          <span className="font-label-coord text-[8px] text-[#837469] block mt-1">
                            {st.type}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-[#837469] space-y-2">
                    <p>ยังไม่มีตราประทับในหน้านี้ (0 ตรา)</p>
                    <button
                      type="button"
                      onClick={onOpenGlobe}
                      className="px-3 py-1.5 rounded-lg bg-[#6f4315] text-white text-[11px] font-semibold"
                    >
                      + ปักหมุดบนลูกโลก
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Stamp Details Card */}
      {selectedStamp && (
        <div className="px-4 mt-3 hidden">
          <div
            className="hidden bg-white rounded-xl p-3.5 shadow-sm border border-[#d5c3b6] space-y-2 animate-in fade-in"
            style={{ display: 'none' }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#ece2cc]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6f4315] text-[18px]">verified</span>
                <span className="font-headline-sm text-xs text-[#6f4315] font-bold">
                  ข้อมูลตราประทับ: {selectedStamp.country}
                </span>
              </div>
              <span className="font-label-coord text-[9px] text-[#465f88] font-bold bg-[#fdf3dc] px-2 py-0.5 rounded border border-[#d5c3b6]">
                {selectedStamp.coords}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">สถานที่ / ด่านตรวจ</span>
                <span className="text-[#201b0e] font-semibold">{selectedStamp.location}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold block">
                    วันที่บันทึกพิกัด
                  </span>
                  {!isEditingDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempDate(selectedStamp.date);
                        setIsEditingDate(true);
                      }}
                      className="font-label-stamp text-[10px] text-[#6f4315] hover:text-[#8b5a2b] bg-[#fdf3dc] hover:bg-[#ffeed3] border border-[#d5c3b6] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold cursor-pointer transition-all shadow-2xs active:scale-95"
                      title="แก้ไขวันที่บันทึกพิกัด"
                    >
                      <span className="material-symbols-outlined text-[12px]">edit_calendar</span>
                      <span>แก้ไขวันที่</span>
                    </button>
                  )}
                </div>

                {!isEditingDate ? (
                  <span
                    onClick={() => {
                      setTempDate(selectedStamp.date);
                      setIsEditingDate(true);
                    }}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#fff8ee] hover:bg-[#ffeed3] border border-[#d5c3b6] hover:border-[#6f4315] text-[#201b0e] cursor-pointer transition-all shadow-2xs group active:scale-95"
                    title="คลิกเพื่อแก้ไขวันที่บันทึกพิกัด"
                  >
                    <span className="text-xs font-bold text-[#51443a] group-hover:text-[#6f4315]">
                      {selectedStamp.date}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[#837469] group-hover:text-[#6f4315] transition-transform group-hover:scale-110">
                      edit
                    </span>
                  </span>
                ) : (
                  <div className="p-2.5 bg-[#fdfaf5] rounded-xl border border-[#6f4315]/50 shadow-sm space-y-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        placeholder="เช่น 14 ต.ค. 2026 หรือ 2026-10-14"
                        className="flex-1 px-2.5 py-1 text-xs bg-white rounded-lg border border-[#6f4315] text-[#201b0e] font-semibold focus:outline-none shadow-inner"
                        autoFocus
                      />
                      <input
                        type="date"
                        onChange={(e) => {
                          if (e.target.value) {
                            const d = new Date(e.target.value);
                            const thaiMonths = [
                              'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                              'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                            ];
                            const formatted = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear()}`;
                            setTempDate(formatted);
                          }
                        }}
                        className="w-8 h-7 px-1 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#6f4315] cursor-pointer"
                        title="เลือกจากปฏิทิน"
                      />
                    </div>

                    {/* Quick Date Presets */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] text-[#837469] font-medium mr-0.5">ลัด:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const thaiMonths = [
                            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                          ];
                          setTempDate(`${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear()}`);
                        }}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-[#ece2cc]/70 hover:bg-[#d5c3b6] text-[#51443a] font-semibold cursor-pointer"
                      >
                        วันนี้
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          const thaiMonths = [
                            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                          ];
                          setTempDate(`${yesterday.getDate()} ${thaiMonths[yesterday.getMonth()]} ${yesterday.getFullYear()}`);
                        }}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-[#ece2cc]/70 hover:bg-[#d5c3b6] text-[#51443a] font-semibold cursor-pointer"
                      >
                        เมื่อวาน
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const past = new Date();
                          past.setDate(past.getDate() - 7);
                          const thaiMonths = [
                            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                          ];
                          setTempDate(`${past.getDate()} ${thaiMonths[past.getMonth()]} ${past.getFullYear()}`);
                        }}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-[#ece2cc]/70 hover:bg-[#d5c3b6] text-[#51443a] font-semibold cursor-pointer"
                      >
                        7 วันที่แล้ว
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#ece2cc]">
                      <button
                        type="button"
                        onClick={() => setIsEditingDate(false)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#ece2cc] hover:bg-[#d5c3b6] text-[#51443a] font-medium cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDate(selectedStamp.id, tempDate)}
                        className="px-3 py-1 rounded-lg text-xs bg-[#6f4315] hover:bg-[#8b5a2b] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[13px]">check</span>
                        <span>บันทึกวันที่</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#ece2cc]">
              <button
                type="button"
                onClick={onOpenGlobe}
                className="px-3 py-1.5 rounded-lg bg-[#6f4315] text-white text-xs font-semibold hover:bg-[#8b5a2b] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">explore</span>
                <span>หมุนลูกโลกไปยังพิกัดนี้</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStamp(null)}
                className="text-xs text-[#837469] hover:text-[#201b0e] cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-4 mt-3 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onOpenGlobe}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#6f4315] text-white shadow-sm flex items-center justify-center gap-2 font-title-md text-xs font-bold hover:bg-[#8b5a2b] transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          <span>ไปที่แผนที่ลูกโลกเพื่อปักหมุด</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-[#f2e7d1] text-[#6f4315] hover:bg-[#ece2cc] transition-colors flex items-center justify-center gap-1.5 border border-[#d5c3b6]/60 font-semibold text-xs cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          <span>ส่งออก PDF</span>
        </button>
      </div>

      {/* Export Folio Modal */}
      <ExportPassportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        stamps={effectiveStamps}
      />
    </div>
  );
};
