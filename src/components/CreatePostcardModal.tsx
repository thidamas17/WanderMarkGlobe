import React, { useState } from 'react';
import { PostcardItem } from '../types';

interface CreatePostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postcard: PostcardItem) => void;
}

const PRESET_PHOTOS = [
  {
    name: 'เกียวโต (Kyoto)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Rv0V0ae3W7nM_AbnXsH1SnByRSLexfp_03QIOUchw4IjugOmAZgr8oGYod1MMlV9Wqyc1wanOPSmKkTr7_nIxgAoi8dMbAMP9TmGdE553JujxtieQi1SgcLYJ5i_ZvENh125mt2oBMObY0w8o9Kf4zZsSU36BPOSMr6IHHW6LbR3x3EqUfzI8HuaegWLHoAKtLJaYhCad2VEszC-HeG1V3TEbhZTq0OvylaPOuD1OYI1afGZLTUi',
    coords: '35.0116° N, 135.6777° E',
    region: 'JPN',
    continent: 'asia' as const,
    city: 'Arashiyama, Kyoto',
    country: 'ญี่ปุ่น (JAPAN)',
    stampImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXV66JEkGb1i56gJAw8Rvfo_jH_2wir80VmS45NFlUoUFXsYJvdcKPwa9FO3f4JLDnM_VUgjMBBD604JacOYY5COCRZGdGzEW1KUbR0TJqevvy7o9pmjyC0MyUxkMp8Npq8CHY_XTw5ahxLuYwcwlPBCjCva7e_dI1QSx_uWoqWOzpAmeLfLPvgY6-WtF2zdTGG9M8ZeXvc6PrPK_BHEiofW02rBhW_7u7LXx_D6IqlBjRJqZuzlMc',
    stampCountry: 'NIPPON',
    stampPrice: '¥120',
  },
  {
    name: 'เวนิส (Venice)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5GcEE_8LWB-pR2VcfKlCWeYCmR9wfopjW1RU0OodRIxgCiAOI1SvVQ-NG2TUK91LSFDMcuQtrPHMqOAnTkZoFu25bQqhr2NlJK0V1P8WvsQu0zegNF8cPxWuY1W5CE5TAYW5ZWxdShCtWG4C-0UVvhTIJZg0D7RuhJFrBgKvN0WgTHV4Uha3jo1sXEwKcuuARhp_VQa35p-w5R60dOT3Q3p-WY3sCK4JvXjvku6JcfYkAQtxf05Bl',
    coords: '45.4408° N, 12.3155° E',
    region: 'ITA',
    continent: 'europe' as const,
    city: 'Grand Canal, Venice',
    country: 'อิตาลี (ITALY)',
    stampImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD112cvYViX7jpakw7qyuCtkIsfnX1-qttQ-uLdGPFOVFIEpyeXNAi-DlCJEpbqOqEDjgYbPZ0qCcFE1Ba4eb1RfEtwvfnzLwysnnypBspE1t-aHv1twmsG6PL0N1Gm2ldlt-pjZfyGQvKzSDYwNb2MgUpUDTVQlWc9d4YLbBUANB4-Am_dH3S5q44K4Li6OpUAWMwPpd1ZQ7Snmq5HUZhrEST6Cgqd-XH_MhSiq00gjhv02P_Qran4',
    stampCountry: 'ITALIA',
    stampPrice: '€2.50',
  },
  {
    name: 'ทรอมโซ (Tromsø)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXvyqijfxfuD2iAXwDiPTRGqB_LPTgsbZ6ShEfQg63ycdPY_OKgQP6RyrEfd26mNC8SWR7VQ-dRP6EaGKczGrYmF-c1hFGiDF8SexYOxEQbAhROwqh-T6jOARdObvrOhy8khHjNTWD6gIKNLsFxV3OjXv1Ag_AGczp1FIulYm2UG5rLYppZu1e9Ky4cyuw_ub6bi4v6KAE7BURkpdBTyU3ungFnBVcTe7DCQPckPSN6gPonxX76qMZ',
    coords: '69.6492° N, 18.9553° E',
    region: 'NOR',
    continent: 'europe' as const,
    city: 'Fjords, Tromsø',
    country: 'นอร์เวย์ (NORWAY)',
    stampImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBurXOEq-L4G6_Htp9hUt5cnNo1KeSITzbAlEaY-si0v2RqdfRFdVaZV1Dr52rzHcg8_pqj4mY4wfN99XIhb5f5NoeY1eRES0aS4a8bAAyQTeKSb1lGvxLbK2BdiF6Ey1ihzMli5lJBGgpv75BWVXLJ5BZnVu4PJLaMxvAeqVBc9ZdQfQ0jykfop5JzJOTXwsF7ZP3HY6xwWzoI9FZocSIBfri8_k561Jn8-MVo52lsE9ZnRy7wA5A6',
    stampCountry: 'NORGE',
    stampPrice: 'NOK 32',
  },
  {
    name: 'มาราเกช (Marrakech)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpKa-AyvqZkAoZUXK1mg95nfEQEhZECSHcmZ7Iewa819OlTf4_QUWsh0C_UV6NtYVZI451Q-31xL84dTFQTNnr76PVCUKEna6nj1W8VrJKDVC9XbNzxGbVWvkze-UzIEKC-h9pjRMWG1n_0IbajttoeHkcxre-IVaXWSOJaclTKQrEdUVXpmIWKJbAY4HFdSJfFO52ny2hqBSzS3qBuY0hxjHsizpgMe9GSW8YOI9Z4LX-ZvkKAdr6',
    coords: '31.6295° N, 7.9811° W',
    region: 'MAR',
    continent: 'africa' as const,
    city: 'Medina, Marrakech',
    country: 'โมร็อกโก (MOROCCO)',
    stampImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-30m4gzmJhOMUp0khT__4muTTlQDQ8Ube37Fl9u4-91Rt2prDUEC32s_VN9vEWdwy9YDRNsOoWjxeR9DVcCfargpFkd3o_FNiPtmkre_d4ZQoczjJ_W7Yi0ibaqd91HVdZXWi8pPch3G4EQFwd7twcHB-IbE2-OlkzLcO-SrhTeo2nC_dhrzFkFVNbPtF9mNRkV6LViOdEaOKBCI-4z7Royk1kl-ukjExedeJLRDFZOb8Dmw5igQc',
    stampCountry: 'MAROC',
    stampPrice: '4.50 DH',
  },
  {
    name: 'มาชูปิกชู (Peru)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH3Ni6Nfb9LrPZChUYg8kHeke_9dgpIQzMJN3e2eCvZQEgtYWCjJcrnWkiHCjcR5a94LEY6dm3eMmG1XeCAnLkUnjNwdUEGhYtD0OmYSvYjrMeDSJezAJ3UX7IKcmrFOGG2L2DOTltHhFlh06DCGofEAl-nM_eoyzHYb995678l3JxZSdPo45lDm-gfsGUALlrjdfcqKxRRwcdLLCyJF2YJFU2_fhRsup4wnMHwiMH4U8LaQ-h6he8',
    coords: '13.1631° S, 72.5450° W',
    region: 'PER',
    continent: 'americas' as const,
    city: 'Machu Picchu, Andes',
    country: 'เปรู (PERU)',
    stampImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBurXOEq-L4G6_Htp9hUt5cnNo1KeSITzbAlEaY-si0v2RqdfRFdVaZV1Dr52rzHcg8_pqj4mY4wfN99XIhb5f5NoeY1eRES0aS4a8bAAyQTeKSb1lGvxLbK2BdiF6Ey1ihzMli5lJBGgpv75BWVXLJ5BZnVu4PJLaMxvAeqVBc9ZdQfQ0jykfop5JzJOTXwsF7ZP3HY6xwWzoI9FZocSIBfri8_k561Jn8-MVo52lsE9ZnRy7wA5A6',
    stampCountry: 'PERÚ',
    stampPrice: 'S/. 6.50',
  },
];

export const CreatePostcardModal: React.FC<CreatePostcardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [title, setTitle] = useState('บันทึกความทรงจำจากเกียวโต');
  const [frontTitle, setFrontTitle] = useState('เงาไผ่ต้องลมยามเช้า');
  const [journalText, setJournalText] = useState(
    '“เช้าวันนี้ตื่นตั้งแต่ 6 โมงเช้าเพื่อมาเดินในป่าไผ่ สายลมพัดกระทบต้นไผ่เสียงดังก้องกังวาน ได้กลิ่นใบไม้สดชื่นหลังฝนตก แวะดื่มมัทฉะร้อนในศาลเจ้าโบราณ... เป็นช่วงเวลาที่สงบสุขที่สุดของทริปนี้”'
  );
  const [recipient, setRecipient] = useState('ตัวฉันในอนาคต');
  const [temperature, setTemperature] = useState('16°C');
  const [weatherText, setWeatherText] = useState('อากาศแจ่มใส');
  const [weatherEmoji, setWeatherEmoji] = useState('🌤️');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  if (!isOpen) return null;

  const currentPreset = PRESET_PHOTOS[selectedPresetIndex];

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = PRESET_PHOTOS[idx];
    if (idx === 0) {
      setTitle('บันทึกความทรงจำจากเกียวโต');
      setFrontTitle('เงาไผ่ต้องลมยามเช้า');
      setJournalText('“เช้าวันนี้ตื่นตั้งแต่ 6 โมงเช้าเพื่อมาเดินในป่าไผ่ สายลมพัดกระทบต้นไผ่เสียงดังก้องกังวาน แวะดื่มมัทฉะร้อนในศาลเจ้าโบราณ... เป็นช่วงเวลาที่สงบสุขที่สุดของทริปนี้”');
    } else if (idx === 1) {
      setTitle('มนต์เสน่ห์แห่งเวนิส');
      setFrontTitle('เวนิสยามเย็นริมคลองใหญ่');
      setJournalText('“ล่องเรือกอนโดลาผ่านสะพานริอัลโต แสงอาทิตย์สะท้อนผิวน้ำเป็นประกายสีส้มสว่าง เสียงเพลงและสายลมพัดเบาๆ ในยามพลบค่ำ”');
    } else if (idx === 2) {
      setTitle('คืนแสงเหนืออาร์กติก');
      setFrontTitle('แสงเหนือที่ทรอมโซ');
      setJournalText('“ม่านแสงสีเขียวพาดผ่านฟากฟ้าขั้วโลกเหนือเหนือยอดเขาที่ปกคลุมด้วยหิมะ อากาศเหน็บหนาวแต่หัวใจอบอุ่นด้วยความอัศจรรย์”');
    } else if (idx === 3) {
      setTitle('กลิ่นอายตลาดมาราเกช');
      setFrontTitle('ตลาดเครื่องเทศและพรมทอ');
      setJournalText('“เดินลัดเลาะในตรอกซอกซอยเมดินา สัมผัสวัฒนธรรมอันรุ่มรวย จิบชามิ้นต์ร้อนหวานละมุนท่ามกลางเสียงระฆังและร้านค้าโบราณ”');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhoto = customPhotoUrl || currentPreset.url;
    const newPostcard: PostcardItem = {
      id: `pc-${Date.now()}`,
      code: `${Math.floor(Math.random() * 800 + 100)}/24`,
      title,
      frontTitle,
      frontSubtitle: currentPreset.name,
      frontCoords: `LAT ${currentPreset.coords} • EXPEDITION`,
      regionCode: currentPreset.region,
      country: currentPreset.country,
      continent: currentPreset.continent || 'asia',
      createdAt: Date.now(),
      dateDisplay: 'วันนี้ • ภาพถ่ายฝีมือคุณ',
      dateRaw: new Date().toLocaleDateString('en-GB'),
      imageUrl: finalPhoto,
      imageAlt: frontTitle,
      postmarkCity: `${currentPreset.region} POST`,
      postmarkDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      stampImageUrl: currentPreset.stampImg,
      stampCountry: currentPreset.stampCountry,
      stampPrice: currentPreset.stampPrice,
      journalText,
      temperature,
      weatherEmoji,
      weatherText,
      locationTag: currentPreset.city,
      toRecipient: recipient,
      coordinates: currentPreset.coords,
      status: 'เก็บเข้าคอลเลกชันส่วนตัว',
      serialNumber: `EXPEDITION ARCHIVE // SER. NO. WM-${Math.floor(Math.random() * 9000 + 1000)}-${currentPreset.region}`,
    };
    onSubmit(newPostcard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#201b0e]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#fff8f0] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-[#d5c3b6] max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1 bg-[#d5c3b6] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f4315] text-[22px]">
              edit_document
            </span>
            <div>
              <h3 className="font-headline-sm text-[17px] text-[#6f4315] font-semibold">
                เขียนโปสการ์ดจากภาพถ่ายของคุณ
              </h3>
              <p className="font-label-coord text-[10px] text-[#837469] uppercase">
                Personal Travel Photo Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#51443a] hover:bg-[#ece2cc] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Preset Photo Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label-coord text-[10px] text-[#837469] uppercase font-bold">
                1. ภาพถ่ายสถานที่ฝีมือคุณ (YOUR CAPTURE)
              </label>
              <span className="font-label-coord text-[9px] text-[#465f88]">
                📷 ถ่ายโดยตัวคุณเอง
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_PHOTOS.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`flex flex-col items-center p-1 rounded-lg border text-left transition-all ${
                    selectedPresetIndex === idx && !customPhotoUrl
                      ? 'border-[#6f4315] bg-[#fdf3dc] ring-1 ring-[#6f4315]'
                      : 'border-[#ece2cc] bg-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full aspect-[4/3] object-cover rounded"
                  />
                  <span className="font-label-ui text-[10px] text-[#201b0e] font-medium mt-1 truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom upload option */}
            <div className="mt-2.5 flex items-center gap-2 text-[11px]">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2e7d1] text-[#6f4315] hover:bg-[#ece2cc] transition-colors border border-[#d5c3b6]">
                <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                <span>อัปโหลดรูปภาพของตัวเอง</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {customPhotoUrl && (
                <span className="font-label-coord text-[10px] text-[#644807] font-semibold">
                  ✓ ใช้ภาพที่อัปโหลดแล้ว
                </span>
              )}
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ชื่อภาพด้านหน้า
              </label>
              <input
                type="text"
                value={frontTitle}
                onChange={(e) => setFrontTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                หัวข้อบันทึกด้านหลัง
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
              />
            </div>
          </div>

          {/* Recipient and weather */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ถึง (Recipient)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                สภาพอากาศ & อุณหภูมิ
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={weatherEmoji}
                  onChange={(e) => setWeatherEmoji(e.target.value)}
                  className="w-10 px-2 py-2 text-xs text-center bg-white rounded-lg border border-[#d5c3b6]"
                />
                <input
                  type="text"
                  value={`${temperature} • ${weatherText}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('•');
                    if (parts[0]) setTemperature(parts[0].trim());
                    if (parts[1]) setWeatherText(parts[1].trim());
                  }}
                  className="flex-1 px-2.5 py-2 text-xs bg-white rounded-lg border border-[#d5c3b6]"
                />
              </div>
            </div>
          </div>

          {/* Narrative message */}
          <div>
            <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
              ข้อความบันทึกปากกาหมึกซึม (Journal Narrative)
            </label>
            <textarea
              rows={3}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              required
              className="w-full p-2.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-headline-sm italic focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ece2cc]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-title-md text-xs text-[#51443a] hover:bg-[#ece2cc] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#6f4315] text-white font-title-md text-xs shadow-md hover:bg-[#8b5a2b] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
              <span>บันทึกและประทับตราโปสการ์ด</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
