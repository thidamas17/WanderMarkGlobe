import React, { useState, useEffect } from 'react';
import { StampItem, StampFrameStyle } from '../types';

interface EditStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  stamp: StampItem | null;
  onSave: (updated: StampItem) => void;
}

export const EditStampModal: React.FC<EditStampModalProps> = ({
  isOpen,
  onClose,
  stamp,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [banner, setBanner] = useState('');
  const [country, setCountry] = useState('');
  const [price, setPrice] = useState('');
  const [region, setRegion] = useState<'asia' | 'europe' | 'africa' | 'america'>('asia');
  const [postmarkStation, setPostmarkStation] = useState('');
  const [postmarkDate, setPostmarkDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [frameStyle, setFrameStyle] = useState<StampFrameStyle>('classic');

  useEffect(() => {
    if (stamp && isOpen) {
      setTitle(stamp.title || '');
      setBanner(stamp.banner || stamp.country || '');
      setCountry(stamp.country || '');
      setPrice(stamp.price || '10฿');
      setRegion((stamp.region as 'asia' | 'europe' | 'africa' | 'america') || 'asia');
      setPostmarkStation(stamp.postmarkStation || '');
      setPostmarkDate(stamp.postmarkDate || '');
      setLocationName(stamp.locationName || '');
      setImageUrl(stamp.imageUrl || '');
      setFrameStyle(stamp.frameStyle || 'classic');
    }
  }, [stamp, isOpen]);

  if (!isOpen || !stamp) return null;

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

  const getRegionLabel = (r: string) => {
    switch (r) {
      case 'asia':
        return 'เอเชีย (Asia)';
      case 'europe':
        return 'ยุโรป (Europe)';
      case 'africa':
        return 'แอฟริกา (Africa)';
      case 'america':
        return 'อเมริกา (Americas)';
      default:
        return 'เอเชีย (Asia)';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StampItem = {
      ...stamp,
      title: title.trim() || stamp.title,
      banner: banner.trim().toUpperCase() || stamp.banner,
      country: country.trim() || stamp.country,
      region,
      regionLabel: getRegionLabel(region),
      price: price.trim() || stamp.price,
      postmarkStation: postmarkStation.trim() || stamp.postmarkStation,
      postmarkDate: postmarkDate.trim() || stamp.postmarkDate,
      locationName: locationName.trim() || stamp.locationName,
      imageUrl: imageUrl || stamp.imageUrl,
      frameStyle,
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
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6f4315] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base text-[#6f4315] font-bold">
                แก้ไขตราไปรษณียากร (Edit Stamp)
              </h3>
              <p className="font-label-coord text-[9.5px] text-[#837469] uppercase font-semibold">
                Philatelic Metadata & Perforated Stamp Design
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
          {/* Section 1: Stamp Details */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">approval</span>
                <span>ข้อมูลดวงตราไปรษณียากร</span>
              </span>
              <span className="font-label-stamp text-[9px] text-[#837469]">
                {stamp.serialNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ชื่อแสตมป์ (Stamp Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น พระบรมมหาราชวัง"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                />
              </div>

              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ข้อความแบนเนอร์ / ประเทศ (Banner)
                </label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="เช่น SIAM, THAILAND"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#6f4315] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ราคา / มูลค่า (Price)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="เช่น 10฿ หรือ 50 SEN"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#644807] font-bold focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
                />
              </div>

              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  ทวีป / ภูมิภาค (Region)
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold focus:outline-none"
                >
                  <option value="asia">เอเชีย (Asia)</option>
                  <option value="europe">ยุโรป (Europe)</option>
                  <option value="africa">แอฟริกา (Africa)</option>
                  <option value="america">อเมริกา (Americas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                สถานที่บันทึก (Location Name)
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="เช่น กรุงเทพมหานคร, ประเทศไทย"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Postmark Cancellation */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2.5">
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history_edu</span>
              <span>ตราประทับไปรษณีย์ประจำสถานี (Postmark Stamp)</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  สถานีประทับตรา (Station City)
                </label>
                <input
                  type="text"
                  value={postmarkStation}
                  onChange={(e) => setPostmarkStation(e.target.value)}
                  placeholder="เช่น BANGKOK G.P.O."
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
                  วันที่ประทับตรา (Postmark Date)
                </label>
                <input
                  type="text"
                  value={postmarkDate}
                  onChange={(e) => setPostmarkDate(e.target.value)}
                  placeholder="เช่น 14 OCT 1924"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-semibold uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stamp Image */}
          <div className="p-3 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6]/70 space-y-2">
            <span className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              <span>รูปภาพแสตมป์</span>
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

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ece2cc]">
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
              <span>บันทึกการแก้ไขแสตมป์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
