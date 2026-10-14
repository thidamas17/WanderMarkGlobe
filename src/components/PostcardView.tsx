import React, { useState } from 'react';
import { PostcardItem } from '../types';
import { CreatePostcardModal } from './CreatePostcardModal';
import { StampPerforatedFrame } from './StampPerforatedFrame';

interface PostcardViewProps {
  postcards: PostcardItem[];
  onAddPostcard: (postcard: PostcardItem) => void;
  onToast: (msg: string) => void;
}

export const PostcardView: React.FC<PostcardViewProps> = ({
  postcards,
  onAddPostcard,
  onToast,
}) => {
  const [selectedPostcardId, setSelectedPostcardId] = useState<string>(postcards[0]?.id || '');
  const [isBackSide, setIsBackSide] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const activePostcard = postcards.find((p) => p.id === selectedPostcardId) || postcards[0];

  const handleToggleFlip = () => {
    setIsBackSide(!isBackSide);
  };

  const handleShare = () => {
    if (!activePostcard) return;
    navigator.clipboard?.writeText?.(window.location.href);
    onToast(`แชร์โปสการ์ด "${activePostcard.title}" คัดลอกลิงก์สำเร็จ!`);
  };

  const handleSelectRecent = (card: PostcardItem) => {
    setSelectedPostcardId(card.id);
    onToast(`เปิดโปสการ์ด: ${card.title}`);
  };

  const handleCopyNote = () => {
    if (!activePostcard) return;
    navigator.clipboard?.writeText?.(activePostcard.journalText);
    onToast('คัดลอกข้อความบันทึกประจำโปสการ์ดแล้ว');
  };

  if (postcards.length === 0 || !activePostcard) {
    return (
      <div className="flex flex-col w-full px-4 py-12 space-y-5 max-w-2xl mx-auto pb-28 items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#fdf3dc] border-2 border-[#d5c3b6] flex items-center justify-center text-[#6f4315] shadow-md">
          <span className="material-symbols-outlined text-[40px]">mark_email_unread</span>
        </div>
        <div className="max-w-md space-y-2">
          <span className="font-label-stamp text-[10px] text-[#644807] uppercase bg-[#ffdea5] px-2.5 py-1 rounded font-bold">
            ARCHIVE // 0 โปสการ์ด
          </span>
          <h2 className="font-headline-sm text-xl text-[#6f4315] font-bold">
            ยังไม่มีโปสการ์ดในคอลเลกชัน
          </h2>
          <p className="font-body-sm text-xs text-[#51443a] leading-relaxed">
            บัญชีนักสำรวจของคุณเริ่มต้นที่ 0 บันทึกความทรงจำการเดินทางใบแรกด้วยการถ่ายภาพหรืออัปโหลดรูปภาพของคุณเอง
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-6 py-3 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
          <span>สร้างโปสการ์ดใบแรก</span>
        </button>

        <CreatePostcardModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(newCard) => {
            onAddPostcard(newCard);
            setSelectedPostcardId(newCard.id);
            setIsBackSide(false);
            onToast(`สร้างโปสการ์ด "${newCard.frontTitle}" สำเร็จ!`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-3 sm:px-4 py-3 space-y-4 max-w-2xl mx-auto pb-28">
      {/* Modern Top Segmented Control & Dispatch Status Bar */}
      <div className="flex items-center justify-between bg-[#f7edd7]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-[#d5c3b6]/60">
        <div className="flex items-center space-x-1 p-0.5 bg-white/70 rounded-xl border border-[#ece2cc]">
          <button
            type="button"
            onClick={() => setIsBackSide(false)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-label-ui transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
              !isBackSide
                ? 'bg-[#6f4315] text-white shadow-sm font-semibold'
                : 'text-[#51443a] hover:text-[#6f4315]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">photo_library</span>
            <span>ดูด้านหน้า (รูปภาพ)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBackSide(true)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-label-ui transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
              isBackSide
                ? 'bg-[#6f4315] text-white shadow-sm font-semibold'
                : 'text-[#51443a] hover:text-[#6f4315]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              history_edu
            </span>
            <span>ดูด้านหลัง (บันทึก)</span>
          </button>
        </div>

        <div className="pr-1 flex items-center space-x-1.5">
          <span className="font-label-coord text-[10px] text-[#6f4315] font-bold uppercase bg-[#f2e7d1] px-2.5 py-1 rounded-lg border border-[#d5c3b6]/60 shadow-2xs">
            No. {activePostcard.code}
          </span>
        </div>
      </div>

      {/* Perspective 3D Flip Card Container */}
      <div className="relative w-full [perspective:1200px] select-none">
        <div
          onClick={handleToggleFlip}
          className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] shadow-xl rounded-2xl cursor-pointer ${
            isBackSide ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
          title="แตะเพื่อพลิกโปสการ์ด"
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="w-full [backface-visibility:hidden] rounded-2xl overflow-hidden bg-[#fdf3dc] p-2 sm:p-2.5 shadow-inner border border-[#d5c3b6]/70">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm flex flex-col justify-end p-3.5 sm:p-4">
              <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                alt={activePostcard.imageAlt}
                src={activePostcard.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#201b0e]/90 via-[#201b0e]/30 to-transparent" />

              {/* Front Corner Airmail Badge */}
              <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm flex items-center space-x-1.5 border border-[#d5c3b6]/50">
                <span className="material-symbols-outlined text-[14px] text-[#6f4315]">navigation</span>
                <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold tracking-wider">
                  {activePostcard.locationTag}
                </span>
              </div>

              {/* Front Stamp Cancellation Mark Over Print */}
              <div className="absolute top-3 right-3 pointer-events-none opacity-85 mix-blend-screen rotate-[-12deg]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed border-white flex flex-col items-center justify-center p-1 text-center">
                  <span className="font-label-coord text-[7px] sm:text-[8px] text-white tracking-tighter uppercase leading-none">
                    {activePostcard.postmarkCity}
                  </span>
                  <span className="font-label-stamp text-[8px] sm:text-[9px] text-white leading-none my-0.5 font-bold">
                    {activePostcard.postmarkDate}
                  </span>
                  <span className="font-label-coord text-[6px] sm:text-[7px] text-white tracking-tight uppercase leading-none">
                    PAR AVION
                  </span>
                </div>
              </div>

              {/* Front Photo Caption */}
              <div className="relative z-10 text-white">
                <span className="font-label-stamp text-[10px] text-[#ffdea5] tracking-wider uppercase block font-bold">
                  {activePostcard.frontSubtitle}
                </span>
                <h2 className="font-headline-md text-[19px] sm:text-[23px] text-white tracking-tight font-bold drop-shadow">
                  {activePostcard.frontTitle}
                </h2>
                <p className="font-label-coord text-[9px] sm:text-[10px] text-[#f2e7d1]/90 mt-0.5 font-medium">
                  {activePostcard.frontCoords}
                </p>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE: Split-Back Airmail ================= */}
          <div className="absolute inset-0 w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-[#fdf3dc] p-1.5 sm:p-2 shadow-inner overflow-hidden border border-[#d5c3b6]/70">
            {/* Airmail Par-Avion Chevron Frame Container */}
            <div
              className="w-full h-full rounded-xl bg-white p-1 shadow-sm flex flex-col justify-between relative overflow-hidden"
              style={{
                background:
                  'repeating-linear-gradient(135deg, #c2413c 0, #c2413c 10px, #ffffff 10px, #ffffff 14px, #465f88 14px, #465f88 24px, #ffffff 24px, #ffffff 28px)',
              }}
            >
              {/* Inner Cream Manila Postcard Paper Area */}
              <div className="w-full h-full bg-[#fdf3dc] rounded-lg p-2.5 sm:p-3 flex flex-col justify-between relative border border-[#d5c3b6]/40">
                {/* Airmail Watermark & Header */}
                <div className="flex items-center justify-between pb-1 border-b border-[#ece2cc]/80">
                  <div className="flex items-center space-x-1.5 bg-[#465f88] px-2.5 py-0.5 rounded-md shadow-xs">
                    <span className="material-symbols-outlined text-[13px] text-white">flight</span>
                    <span className="font-label-stamp text-[9px] sm:text-[10px] text-white tracking-widest uppercase font-bold">
                      BY AIR MAIL • PAR AVION
                    </span>
                  </div>
                  <span className="font-label-stamp text-[10px] text-[#837469] tracking-widest uppercase font-bold">
                    POST CARD
                  </span>
                </div>

                {/* Main Postcard Split Layout */}
                <div className="grid grid-cols-12 gap-2 flex-1 pt-1.5 relative">
                  {/* LEFT SIDE: Journal & Narrative Section */}
                  <div className="col-span-7 flex flex-col justify-between pr-1">
                    <div className="space-y-1">
                      <div>
                        <span className="font-label-coord text-[8px] sm:text-[9px] text-[#644807] uppercase tracking-wider block font-semibold truncate">
                          {activePostcard.dateDisplay}
                        </span>
                        <h3 className="font-headline-sm text-[13px] sm:text-[15px] text-[#6f4315] tracking-tight font-bold line-clamp-1">
                          {activePostcard.title}
                        </h3>
                      </div>

                      {/* Handwritten Narrative */}
                      <div className="relative pt-0.5">
                        <p className="font-headline-sm text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-[#51443a] italic font-normal tracking-wide line-clamp-4 sm:line-clamp-5">
                          {activePostcard.journalText}
                        </p>
                      </div>
                    </div>

                    {/* Weather & Impression */}
                    <div className="pt-1 flex items-center justify-between">
                      <div className="inline-flex items-center space-x-1 bg-[#f7edd7] px-2 py-0.5 rounded-md border border-[#d5c3b6]/40 shadow-2xs">
                        <span className="text-xs">{activePostcard.weatherEmoji}</span>
                        <span className="font-label-ui text-[10px] text-[#201b0e] font-medium truncate">
                          {activePostcard.temperature} • {activePostcard.weatherText}
                        </span>
                      </div>
                      <span className="font-label-coord text-[8px] text-[#837469] uppercase font-bold">
                        {activePostcard.locationTag}
                      </span>
                    </div>
                  </div>

                  {/* CENTER DIVIDER: French / English Cartographic Seam */}
                  <div className="absolute left-[58%] top-0 bottom-0 w-px bg-[#ece2cc] flex items-center justify-center pointer-events-none">
                    <div className="bg-[#fdf3dc] py-1 px-0.5 rotate-90 whitespace-nowrap">
                      <span className="font-label-coord text-[6px] text-[#837469] tracking-[0.2em] uppercase font-bold">
                        CARTE POSTALE
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Stamp & Address Lines */}
                  <div className="col-span-5 flex flex-col justify-between pl-2">
                    {/* Authentic Die-Cut Perforated Postage Stamp */}
                    <div className="flex justify-end relative">
                      <StampPerforatedFrame
                        size="sm"
                        imageUrl={activePostcard.stampImageUrl}
                        imageAlt="Postcard Stamp"
                        banner={activePostcard.stampCountry}
                        price={activePostcard.stampPrice}
                        postmarkStation={activePostcard.postmarkCity}
                        postmarkDate={activePostcard.postmarkDate}
                        postmarkType="OFFICIAL"
                        serialNumber=""
                        locationName=""
                        className="w-16 sm:w-20"
                      />
                    </div>

                    {/* Recipient Postal Address Lines */}
                    <div className="space-y-1 pt-1">
                      <div className="pb-0.5 border-b border-[#d5c3b6]/70">
                        <span className="font-label-coord text-[7px] sm:text-[8px] text-[#837469] uppercase block leading-none font-bold">
                          ถึง (TO)
                        </span>
                        <p className="font-headline-sm text-[10px] sm:text-[11px] text-[#201b0e] truncate leading-tight pt-0.5 font-semibold">
                          {activePostcard.toRecipient}
                        </p>
                      </div>
                      <div className="pb-0.5 border-b border-[#d5c3b6]/70">
                        <span className="font-label-coord text-[7px] sm:text-[8px] text-[#837469] uppercase block leading-none font-bold">
                          พิกัด (COORDINATES)
                        </span>
                        <p className="font-label-coord text-[8px] sm:text-[9px] text-[#465f88] truncate leading-tight pt-0.5 font-bold">
                          {activePostcard.coordinates}
                        </p>
                      </div>
                      <div className="pb-0.5 border-b border-[#d5c3b6]/70">
                        <span className="font-label-coord text-[7px] sm:text-[8px] text-[#837469] uppercase block leading-none font-bold">
                          สถานะ (STATUS)
                        </span>
                        <p className="font-label-stamp text-[8px] sm:text-[9px] text-[#644807] truncate leading-tight pt-0.5 font-bold">
                          {activePostcard.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Postal Barcode & Serial */}
                <div className="pt-1 mt-1 flex items-center justify-between opacity-75 border-t border-[#ece2cc]">
                  <span className="font-label-coord text-[7px] sm:text-[8px] text-[#837469] tracking-wider truncate font-semibold">
                    {activePostcard.serialNumber}
                  </span>
                  <div className="h-2.5 flex items-center space-x-0.5">
                    <span className="w-0.5 h-full bg-[#837469]" />
                    <span className="w-1 h-full bg-[#837469]" />
                    <span className="w-0.5 h-full bg-[#837469]" />
                    <span className="w-0.5 h-full bg-[#837469]" />
                    <span className="w-1.5 h-full bg-[#837469]" />
                    <span className="w-0.5 h-full bg-[#837469]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Refined Bottom Action Deck ("เมนูด้านหลัง") */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Flip Button */}
        <button
          type="button"
          onClick={handleToggleFlip}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 backdrop-blur-md text-[#201b0e] hover:bg-[#f7edd7] active:scale-95 transition-all shadow-sm border border-[#d5c3b6]/70 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-[#6f4315] mb-1">
            flip
          </span>
          <span className="font-label-ui text-[11px] font-semibold tracking-tight">
            {isBackSide ? 'พลิกดูภาพด้านหน้า' : 'พลิกดูบันทึกด้านหลัง'}
          </span>
        </button>

        {/* Create New Postcard Button */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#6f4315] text-white shadow-md hover:bg-[#8b5a2b] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] mb-1">edit_document</span>
          <span className="font-label-ui text-[11px] font-semibold tracking-tight">
            เขียนฉบับใหม่
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 backdrop-blur-md text-[#201b0e] hover:bg-[#f7edd7] active:scale-95 transition-all shadow-sm border border-[#d5c3b6]/70 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-[#465f88] mb-1">
            ios_share
          </span>
          <span className="font-label-ui text-[11px] font-semibold tracking-tight">
            แชร์โปสการ์ด
          </span>
        </button>
      </div>

      {/* Recent Postcards Keepsake Shelf */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#6f4315]">
              collections_bookmark
            </span>
            <span className="font-headline-sm text-[15px] text-[#201b0e] font-bold">
              โปสการ์ดล่าสุดในบันทึก
            </span>
          </div>
          <span className="font-label-coord text-[10px] text-[#465f88] font-bold uppercase">
            {postcards.length} แผ่นที่ผ่านมา
          </span>
        </div>

        {/* Horizontal Miniature Keepsakes */}
        <div className="grid grid-cols-3 gap-2">
          {postcards.slice(1, 4).map((card) => {
            const isSelected = card.id === selectedPostcardId;
            return (
              <div
                key={card.id}
                onClick={() => handleSelectRecent(card)}
                className={`bg-white p-2 rounded-xl shadow-xs flex flex-col space-y-1 hover:shadow-md transition-all cursor-pointer border ${
                  isSelected ? 'border-[#6f4315] ring-2 ring-[#ffdcc1]' : 'border-[#d5c3b6]/50'
                }`}
              >
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt={card.title}
                    src={card.imageUrl}
                  />
                  <span className="absolute top-1 right-1 bg-white/90 text-[#6f4315] text-[8px] font-label-coord px-1 rounded font-bold shadow-2xs">
                    {card.regionCode}
                  </span>
                </div>
                <div className="px-0.5">
                  <h4 className="font-headline-sm text-[11px] sm:text-[12px] text-[#201b0e] truncate leading-tight font-medium">
                    {card.frontTitle}
                  </h4>
                  <span className="font-label-coord text-[8px] sm:text-[9px] text-[#837469] block truncate">
                    {card.dateDisplay.split('•')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      <CreatePostcardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(newCard) => {
          onAddPostcard(newCard);
          setSelectedPostcardId(newCard.id);
          setIsBackSide(false);
          onToast(`สร้างโปสการ์ด "${newCard.frontTitle}" สำเร็จ!`);
        }}
      />
    </div>
  );
};
