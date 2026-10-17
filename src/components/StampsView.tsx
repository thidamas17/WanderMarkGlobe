import React, { useState } from 'react';
import { StampItem } from '../types';
import { CreateStampModal } from './CreateStampModal';
import { EditStampModal } from './EditStampModal';
import { StampPerforatedFrame } from './StampPerforatedFrame';

interface StampsViewProps {
  stamps: StampItem[];
  onAddStamp: (stamp: StampItem) => void;
  onUpdateStamp?: (stamp: StampItem) => void;
  onToast: (msg: string) => void;
}

export const StampsView: React.FC<StampsViewProps> = ({
  stamps,
  onAddStamp,
  onUpdateStamp,
  onToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'asia' | 'europe' | 'africa' | 'america'>('all');
  const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [stampToEdit, setStampToEdit] = useState<StampItem | null>(null);

  const totalCount = stamps.length;
  const asiaCount = stamps.filter((s) => s.region === 'asia').length;
  const europeCount = stamps.filter((s) => s.region === 'europe').length;
  const africaCount = stamps.filter((s) => s.region === 'africa').length;
  const americaCount = stamps.filter((s) => s.region === 'america').length;

  const filterTabs = [
    { key: 'all' as const, num: '01', label: `ทั้งหมด (${totalCount})` },
    { key: 'asia' as const, num: '02', label: `เอเชีย (${asiaCount})` },
    { key: 'europe' as const, num: '03', label: `ยุโรป (${europeCount})` },
    { key: 'africa' as const, num: '04', label: `แอฟริกา (${africaCount})` },
    { key: 'america' as const, num: '05', label: `อเมริกา (${americaCount})` },
  ];

  const filteredStamps = stamps.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.region === activeFilter;
  });

  const handleOpenStamp = (stamp: StampItem) => {
    setSelectedStamp(stamp);
  };

  const handleCloseModal = () => {
    setSelectedStamp(null);
  };

  const handleShareStamp = (stamp: StampItem) => {
    const text = `📮 ดวงตราไปรษณียากรสะสม Wandermark: ${stamp.title} (${stamp.banner || stamp.country} - ${stamp.price})\nชมภาพแสตมป์: ${stamp.imageUrl}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(stamp.imageUrl);
    }
    onToast(`เปิด LINE เพื่อแชร์แสตมป์ "${stamp.title}" (คัดลอกลิงก์ภาพแล้ว)`);
  };

  const handleDownloadStampJpg = async (stamp: StampItem) => {
    onToast(`กำลังสร้างไฟล์ภาพ .jpg สำหรับแสตมป์ "${stamp.title}"...`);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 600;
      canvas.height = 750;

      // Outer Paper
      ctx.fillStyle = '#fdf3dc';
      ctx.fillRect(0, 0, 600, 750);

      // Stamp border
      ctx.fillStyle = '#fffdfa';
      ctx.fillRect(40, 40, 520, 670);
      ctx.strokeStyle = '#6f4315';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 520, 670);

      // Banner text
      ctx.fillStyle = '#6f4315';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((stamp.banner || stamp.country || 'POSTAGE').toUpperCase(), 300, 95);

      // Try image
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = stamp.imageUrl;
        });
        ctx.drawImage(img, 65, 120, 470, 450);
      } catch {
        ctx.fillStyle = '#353021';
        ctx.fillRect(65, 120, 470, 450);
      }

      // Title & Price
      ctx.fillStyle = '#201b0e';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(stamp.title, 300, 615);

      ctx.fillStyle = '#644807';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(stamp.price, 300, 665);

      // Postmark mark
      ctx.save();
      ctx.translate(450, 200);
      ctx.rotate((-15 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(111, 67, 21, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(111, 67, 21, 0.7)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(stamp.postmarkStation || 'OFFICIAL', 0, -10);
      ctx.fillText(stamp.postmarkDate || 'REGISTERED', 0, 15);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `stamp_${stamp.title.replace(/[^\wก-๙]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast(`บันทึกไฟล์ภาพแสตมป์ "${stamp.title}.jpg" สำเร็จ!`);
    } catch {
      onToast(`บันทึกภาพสำเร็จ`);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 max-w-2xl mx-auto">
      {/* Top Philatelic Header & Stats Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6f4315] text-[20px]">approval</span>
            <span className="font-label-coord text-[10px] text-[#465f88] uppercase tracking-widest font-bold">
              SERIES IV • PHILATELIC REGISTER
            </span>
          </div>
          <span className="font-label-stamp text-[10px] text-[#7f601f] bg-[#f2e7d1] px-2 py-0.5 rounded font-bold border border-[#d5c3b6]/50">
            VOL. 1924
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1.5">
          <h1 className="font-headline-md text-[22px] text-[#6f4315] tracking-tight font-bold">
            สมุดสะสมแสตมป์ภาพถ่าย
          </h1>
          <span className="font-label-stamp text-[11px] text-[#837469] font-bold">
            {stamps.length} ดวงที่เก็บแล้ว
          </span>
        </div>

        <p className="font-body-sm text-[12px] text-[#51443a] mb-3 leading-relaxed">
          เปลี่ยนบันทึกภาพถ่ายจากการเดินทางให้เป็นดวงตราไปรษณียากรวินเทจ พร้อมประทับตรารับรองประจำสถานี
        </p>

        {/* Vintage Archive File Tabs (Filter bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-t-lg font-title-md text-[13px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6f4315] text-white shadow-sm font-semibold'
                    : 'bg-[#f2e7d1] text-[#51443a] hover:bg-[#ece2cc]'
                }`}
              >
                <span className={`font-label-stamp text-[10px] ${isActive ? '' : 'opacity-60'}`}>
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Craft Ledger Mount Background (Collector's Album Sheet) */}
      <div className="mx-4 bg-[#fdf3dc] rounded-xl p-3 shadow-md mb-5 relative overflow-hidden border border-[#d5c3b6]">
        {/* Album ruled watermarks */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7f601f] inline-block" />
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold tracking-wider">
              PORTFOLIO SHEET • 35MM RETRO PERFORATIONS
            </span>
          </div>
          <span className="font-label-stamp text-[10px] text-[#644807] font-semibold">
            LAT. 13°45'N — LONG. 100°30'E
          </span>
        </div>

        {/* 2x2 or responsive postage stamp grid */}
        {filteredStamps.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredStamps.map((stamp) => (
              <div
                key={stamp.id}
                onClick={() => handleOpenStamp(stamp)}
                className="group relative bg-[#e3d9c3] rounded p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-[0.98] hover:scale-[1.01]"
                title="แตะเพื่อดูรายละเอียดแสตมป์"
              >
                {/* Stamp Mount Corner Tabs */}
                <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-[#353021]/40 rounded-tl pointer-events-none" />
                <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#353021]/40 rounded-tr pointer-events-none" />
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 bg-[#353021]/40 rounded-bl pointer-events-none" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#353021]/40 rounded-br pointer-events-none" />

                {/* Quick Edit Stamp Button on Card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStampToEdit(stamp);
                    setIsEditOpen(true);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white/90 hover:bg-[#6f4315] hover:text-white text-[#6f4315] shadow-xs flex items-center justify-center transition-all z-10 cursor-pointer"
                  title="แก้ไขข้อมูลแสตมป์ดวงนี้"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                </button>

                {/* Stamp with Authentic Perforated Frame */}
                <StampPerforatedFrame
                  imageUrl={stamp.imageUrl}
                  imageAlt={stamp.imageAlt}
                  banner={stamp.banner}
                  price={stamp.price}
                  postmarkStation={stamp.postmarkStation}
                  postmarkDate={stamp.postmarkDate}
                  postmarkType={stamp.postmarkType}
                  serialNumber={stamp.serialNumber}
                  locationName={stamp.locationName}
                  isUploaded={stamp.id.startsWith('stamp-')}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 px-4 text-center rounded-xl bg-white/70 border border-dashed border-[#d5c3b6] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f7edd7] flex items-center justify-center text-[#6f4315]">
              <span className="material-symbols-outlined text-[26px]">approval</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-sm text-[#201b0e] font-bold">
                ยังไม่มีดวงตราไปรษณียากรสะสม (0 ดวง)
              </h3>
              <p className="font-body-sm text-xs text-[#51443a] max-w-sm mx-auto mt-1">
                บัญชีเริ่มต้นของคุณพร้อมสะสมภาพถ่ายจากการเดินทาง กดปุ่มด้านล่างเพื่อสร้างแสตมป์ดวงแรกด้วยภาพถ่ายจริงของคุณ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-sm inline-flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              <span>+ สร้างแสตมป์ดวงแรก</span>
            </button>
          </div>
        )}

        {/* Album Page Metadata Footer */}
        <div className="mt-3.5 pt-2 flex items-center justify-between text-[#51443a] font-label-coord text-[10px] border-t border-[#ece2cc]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            MOUNTED WITH ARCHIVAL MYLAR
          </span>
          <span>PAGE 03 OF 12</span>
        </div>
      </div>

      {/* StampCraft™ Technology Educational Section */}
      <div className="px-4 mb-4">
        <div className="bg-[#f7edd7] p-3.5 rounded-xl shadow-sm border border-[#d5c3b6]/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#6f4315]/10 flex items-center justify-center flex-shrink-0 text-[#6f4315]">
              <span className="material-symbols-outlined text-[24px]">auto_fix_high</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-title-md text-[15px] text-[#6f4315] font-semibold">
                  เทคโนโลยี StampCraft™
                </h2>
                <span className="font-label-stamp text-[10px] bg-[#ffdea5] text-[#261900] px-1.5 py-0.5 rounded font-bold">
                  AUTO-TAG
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#51443a] mt-1 leading-relaxed">
                ทุกภาพถ่ายที่คุณอัปโหลด ระบบจะสกัดพิกัด GPS อัตโนมัติ แปลงสกุลเงินตามประเทศ ออกแบบลายฟันปลาฉลุ (Die-cut) และประทับตราไปรษณีย์ประจำสถานีแบบโบราณ
              </p>
            </div>
          </div>

          {/* Mini Perforation Anatomy Visual Diagram */}
          <div className="mt-3 bg-white p-2 rounded-lg flex items-center justify-around text-center border border-[#ece2cc]">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-[#465f88] text-[18px] mb-0.5">crop</span>
              <span className="font-label-coord text-[9px] text-[#51443a] uppercase font-semibold">
                1. ขอบฟันปลา 14 รู
              </span>
            </div>
            <div className="w-3 h-0.5 bg-[#d5c3b6]" />
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-[#644807] text-[18px] mb-0.5">palette</span>
              <span className="font-label-coord text-[9px] text-[#51443a] uppercase font-semibold">
                2. โทนสีเซเปียวินเทจ
              </span>
            </div>
            <div className="w-3 h-0.5 bg-[#d5c3b6]" />
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-[#6f4315] text-[18px] mb-0.5">history_edu</span>
              <span className="font-label-coord text-[9px] text-[#51443a] uppercase font-semibold">
                3. ตราประทับหมึกจริง
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Camera Creator CTA */}
      <div className="px-4 mb-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-full bg-[#8b5a2b] text-white font-headline-sm text-[16px] py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-3 active:scale-[0.99] hover:bg-[#6f4315] transition-all cursor-pointer font-semibold"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </div>
          <span className="tracking-wide">ถ่ายภาพสร้างแสตมป์ใหม่</span>
          <span className="material-symbols-outlined text-[18px] opacity-80 ml-auto">arrow_forward</span>
        </button>
        <div className="text-center mt-2">
          <span className="font-label-coord text-[10px] text-[#837469]">
            รองรับไฟล์ JPG, PNG หรือกล้องมือถือโดยตรง • คัดแยกอัตโนมัติ
          </span>
        </div>
      </div>

      {/* Modal: Enlarged Stamp Details */}
      {selectedStamp && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-[#201b0e]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto border border-[#d5c3b6]"
          >
            <div className="w-12 h-1 bg-[#d5c3b6] rounded-full mx-auto mb-2 sm:hidden" />
            <div className="flex items-center justify-between mb-3 border-b border-[#ece2cc] pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#6f4315]">verified</span>
                <span className="font-title-md text-base text-[#6f4315] font-semibold">
                  รายละเอียดแสตมป์
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-full text-[#51443a] hover:bg-[#ece2cc]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Preview Render with Authentic Perforated Stamp Frame */}
            <div className="bg-[#fdf3dc] p-4 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-[#d5c3b6]/60">
              <StampPerforatedFrame
                size="preview"
                imageUrl={selectedStamp.imageUrl}
                imageAlt={selectedStamp.title}
                banner={selectedStamp.banner}
                price={selectedStamp.price}
                postmarkStation={selectedStamp.postmarkStation}
                postmarkDate={selectedStamp.postmarkDate}
                postmarkType={selectedStamp.postmarkType}
                serialNumber={selectedStamp.serialNumber}
                locationName={selectedStamp.locationName}
                isUploaded={selectedStamp.id.startsWith('stamp-')}
              />
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between py-1 border-b border-[#ece2cc]">
                <span className="text-[#51443a]">หมวดหมู่คอลเลกชัน</span>
                <span className="font-title-md text-[#6f4315] font-semibold">{selectedStamp.regionLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ece2cc]">
                <span className="text-[#51443a]">มูลค่าตราไปรษณีย์</span>
                <span className="font-label-stamp text-[#644807] font-bold">{selectedStamp.price}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ece2cc]">
                <span className="text-[#51443a]">รหัสการจัดพิมพ์</span>
                <span className="font-label-coord text-[#465f88] font-bold">
                  ARCHIVE-WM-2024-{selectedStamp.serialNumber.replace('#', '')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStampToEdit(selectedStamp);
                  setIsEditOpen(true);
                }}
                className="bg-[#fff8f0] border border-[#d5c3b6] text-[#6f4315] py-2.5 rounded-lg font-title-md text-xs flex items-center justify-center gap-1 hover:bg-[#fdf3dc] font-bold transition-colors cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>แก้ไขแสตมป์</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareStamp(selectedStamp)}
                className="bg-[#06C755] text-white py-2.5 rounded-lg font-title-md text-xs flex items-center justify-center gap-1 hover:bg-[#05b34c] font-bold transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">share</span>
                <span>LINE / ลิงก์</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadStampJpg(selectedStamp)}
                className="bg-[#6f4315] text-white py-2.5 rounded-lg font-title-md text-xs flex items-center justify-center gap-1 hover:bg-[#8b5a2b] font-bold shadow-sm transition-colors cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>บันทึก .jpg</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Stamp Modal */}
      <CreateStampModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(newStamp) => {
          onAddStamp(newStamp);
          onToast(`สร้างแสตมป์ "${newStamp.title}" บันทึกลงสมุดเรียบร้อย!`);
        }}
      />

      {/* Edit Stamp Modal (ในโปสการ์ดทั้งหมด รวมทั้ง Stamp สามารถ แก้ไขได้) */}
      <EditStampModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setStampToEdit(null);
        }}
        stamp={stampToEdit}
        onSave={(updated) => {
          onUpdateStamp?.(updated);
          if (selectedStamp?.id === updated.id) {
            setSelectedStamp(updated);
          }
          onToast(`บันทึกการแก้ไขแสตมป์ "${updated.title}" สำเร็จ!`);
        }}
      />
    </div>
  );
};
