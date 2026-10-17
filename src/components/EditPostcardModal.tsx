import React, { useState, useEffect } from 'react';
import { PostcardItem } from '../types';

interface EditPostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  postcard: PostcardItem | null;
  initialFocusField?: 'frontSubtitle' | 'regionCode' | 'frontTitle' | 'journalText' | null;
  onSave: (updated: PostcardItem) => void;
  onDelete?: (postcardId: string) => void;
}

export const EditPostcardModal: React.FC<EditPostcardModalProps> = ({
  isOpen,
  onClose,
  postcard,
  initialFocusField,
  onSave,
  onDelete,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [frontSubtitle, setFrontSubtitle] = useState('');
  const [frontTitle, setFrontTitle] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [frontCoords, setFrontCoords] = useState('');
  const [title, setTitle] = useState('');
  const [journalText, setJournalText] = useState('');
  const [toRecipient, setToRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weatherText, setWeatherText] = useState('');
  const [weatherEmoji, setWeatherEmoji] = useState('🌤️');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (postcard && isOpen) {
      setFrontSubtitle(postcard.frontSubtitle || '');
      setFrontTitle(postcard.frontTitle || '');
      setRegionCode(postcard.regionCode || '');
      setFrontCoords(postcard.frontCoords || '');
      setTitle(postcard.title || '');
      setJournalText(postcard.journalText || '');
      setToRecipient(postcard.toRecipient || '');
      setStatus(postcard.status || 'จัดส่งเรียบร้อย');
      setTemperature(postcard.temperature || '28°C');
      setWeatherText(postcard.weatherText || 'แจ่มใส');
      setWeatherEmoji(postcard.weatherEmoji || '🌤️');
      setImageUrl(postcard.imageUrl || '');
      setIsConfirmingDelete(false);
    }
  }, [postcard, isOpen]);

  if (!isOpen || !postcard) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PostcardItem = {
      ...postcard,
      frontSubtitle: frontSubtitle.trim() || postcard.frontSubtitle,
      frontTitle: frontTitle.trim() || postcard.frontTitle,
      regionCode: regionCode.trim().toUpperCase() || postcard.regionCode,
      frontCoords: frontCoords.trim() || postcard.frontCoords,
      title: title.trim() || postcard.title,
      journalText: journalText.trim() || postcard.journalText,
      toRecipient: toRecipient.trim() || postcard.toRecipient,
      status: status.trim() || postcard.status,
      temperature: temperature.trim() || postcard.temperature,
      weatherText: weatherText.trim() || postcard.weatherText,
      weatherEmoji,
      imageUrl: imageUrl || postcard.imageUrl,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#fffdfa] rounded-2xl shadow-2xl border border-[#d5c3b6] p-4.5 sm:p-5 flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6f4315] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base text-[#6f4315] font-bold">
                แก้ไขข้อมูลโปสการ์ดด้วยตนเอง
              </h3>
              <p className="font-label-coord text-[9.5px] text-[#837469] uppercase font-semibold">
                Custom Postcard Entry & Metadata
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-[#837469] hover:bg-[#ece2cc] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {/* Section 1: Front Info (คำบรรยายด้านหน้า & รหัสโค้ด) */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">image</span>
                <span>ข้อมูลด้านหน้าโปสการ์ด (Front Photo & Text)</span>
              </span>
              <span className="font-label-stamp text-[9px] text-[#837469] font-bold">
                NO. {postcard.code}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Region Code */}
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  รหัสโค้ด (Region Code)
                </label>
                <input
                  type="text"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  placeholder="เช่น BKK-01"
                  autoFocus={initialFocusField === 'regionCode'}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#6f4315] font-bold focus:outline-none focus:ring-1 focus:ring-[#6f4315] uppercase shadow-2xs"
                />
              </div>

              {/* Front Subtitle */}
              <div className="col-span-2">
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  คำบรรยายบนภาพ (Front Subtitle)
                </label>
                <input
                  type="text"
                  value={frontSubtitle}
                  onChange={(e) => setFrontSubtitle(e.target.value)}
                  placeholder="เช่น SIAM ARCHIVE • 1924"
                  autoFocus={initialFocusField === 'frontSubtitle'}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6f4315] shadow-2xs"
                />
              </div>
            </div>

            {/* Front Title */}
            <div>
              <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                ชื่อภาพด้านหน้า (Front Title)
              </label>
              <input
                type="text"
                value={frontTitle}
                onChange={(e) => setFrontTitle(e.target.value)}
                placeholder="เช่น วัดพระแก้วและพระบรมมหาราชวัง"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-bold focus:outline-none focus:ring-1 focus:ring-[#6f4315] shadow-2xs"
              />
            </div>

            {/* Front Coords */}
            <div>
              <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                พิกัด / ละติจูดลองจิจูด (Coordinates Display)
              </label>
              <input
                type="text"
                value={frontCoords}
                onChange={(e) => setFrontCoords(e.target.value)}
                placeholder="เช่น LAT 13°45' N 100°29' E • EXPEDITION"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#465f88] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6f4315] shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Back Info (บันทึกด้านหลัง & ผู้รับ) */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2.5">
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history_edu</span>
              <span>บันทึกความทรงจำด้านหลัง (Back Narrative)</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ชื่อหัวข้อบันทึก (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น สายลมยามเช้า ณ กรุงเทพฯ"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-medium focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ถึง (TO Recipient)
                </label>
                <input
                  type="text"
                  value={toRecipient}
                  onChange={(e) => setToRecipient(e.target.value)}
                  placeholder="เช่น ถึง ตัวฉันในอนาคต"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                ข้อความบันทึกประจำโปสการ์ด (Journal Note)
              </label>
              <textarea
                rows={3}
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="เขียนความทรงจำ ความรู้สึก หรือสิ่งที่ประทับใจ..."
                className="w-full p-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315] italic shadow-inner"
              />
            </div>

            {/* Weather & Status */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  สภาพอากาศ & อุณหภูมิ
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={weatherEmoji}
                    onChange={(e) => setWeatherEmoji(e.target.value)}
                    className="w-10 px-1 py-1.5 text-center text-xs bg-white rounded-lg border border-[#d5c3b6]"
                    title="Emoji สภาพอากาศ"
                  />
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="28°C"
                    className="w-16 px-2 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
                  />
                  <input
                    type="text"
                    value={weatherText}
                    onChange={(e) => setWeatherText(e.target.value)}
                    placeholder="แจ่มใส"
                    className="flex-1 px-2 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  สถานะ (Status)
                </label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="เช่น บันทึกแล้ว, ส่งถึงปลายทาง"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Change Image URL or Upload */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2">
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              <span>เปลี่ยนรูปภาพโปสการ์ด</span>
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="วาง URL รูปภาพ..."
                className="flex-1 px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] truncate"
              />
              <label className="px-3 py-1.5 rounded-lg bg-[#6f4315] text-white text-xs font-bold hover:bg-[#8b5a2b] cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs">
                <span className="material-symbols-outlined text-[15px]">upload</span>
                <span>อัปโหลด</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-[#ece2cc]">
            {/* Delete Postcard Action */}
            {onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span className="text-[11px] text-[#c2413c] font-bold">ยืนยันลบ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(postcard.id);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#c2413c] text-white text-[11px] font-bold hover:bg-[#a5332e] cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                    <span>ลบจริง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1.5 rounded-lg bg-[#ece2cc] text-[#51443a] text-[11px] font-medium hover:bg-[#d5c3b6] cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-title-md text-[#c2413c] hover:bg-[#fee2e2] transition-colors cursor-pointer flex items-center gap-1.5 border border-[#fca5a5]/50 active:scale-95"
                  title="ลบโปสการ์ดฉบับนี้ออกจากบันทึก"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>ลบโปสการ์ด</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-title-md text-[#51443a] hover:bg-[#ece2cc] transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#6f4315] text-white text-xs font-title-md hover:bg-[#8b5a2b] shadow-md font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>บันทึกข้อมูลโปสการ์ด</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
