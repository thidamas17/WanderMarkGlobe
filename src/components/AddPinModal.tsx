import React, { useState } from 'react';
import { GlobePin } from '../types';

interface AddPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPin: (pin: GlobePin) => void;
}

const PIN_SUGGESTIONS = [
  {
    city: 'Florence',
    country: 'Italy',
    region: 'ทัสคานี',
    lat: 43.7696,
    lng: 11.2558,
    latLngDisplay: '43°46\' N 11°15\' E',
    categoryTag: 'ศิลปะเรเนซองส์',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5GcEE_8LWB-pR2VcfKlCWeYCmR9wfopjW1RU0OodRIxgCiAOI1SvVQ-NG2TUK91LSFDMcuQtrPHMqOAnTkZoFu25bQqhr2NlJK0V1P8WvsQu0zegNF8cPxWuY1W5CE5TAYW5ZWxdShCtWG4C-0UVvhTIJZg0D7RuhJFrBgKvN0WgTHV4Uha3jo1sXEwKcuuARhp_VQa35p-w5R60dOT3Q3p-WY3sCK4JvXjvku6JcfYkAQtxf05Bl',
  },
  {
    city: 'Cusco',
    country: 'Peru',
    region: 'แอนดีส',
    lat: -13.5319,
    lng: -71.9675,
    latLngDisplay: '13°31\' S 71°58\' W',
    categoryTag: 'ยอดเขาสูง',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH3Ni6Nfb9LrPZChUYg8kHeke_9dgpIQzMJN3e2eCvZQEgtYWCjJcrnWkiHCjcR5a94LEY6dm3eMmG1XeCAnLkUnjNwdUEGhYtD0OmYSvYjrMeDSJezAJ3UX7IKcmrFOGG2L2DOTltHhFlh06DCGofEAl-nM_eoyzHYb995678l3JxZSdPo45lDm-gfsGUALlrjdfcqKxRRwcdLLCyJF2YJFU2_fhRsup4wnMHwiMH4U8LaQ-h6he8',
  },
  {
    city: 'Paris',
    country: 'France',
    region: 'อิล-เดอ-ฟร็องส์',
    lat: 48.8566,
    lng: 2.3522,
    latLngDisplay: '48°51\' N 2°21\' E',
    categoryTag: 'มหานครแห่งแสงไฟ',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD112cvYViX7jpakw7qyuCtkIsfnX1-qttQ-uLdGPFOVFIEpyeXNAi-DlCJEpbqOqEDjgYbPZ0qCcFE1Ba4eb1RfEtwvfnzLwysnnypBspE1t-aHv1twmsG6PL0N1Gm2ldlt-pjZfyGQvKzSDYwNb2MgUpUDTVQlWc9d4YLbBUANB4-Am_dH3S5q44K4Li6OpUAWMwPpd1ZQ7Snmq5HUZhrEST6Cgqd-XH_MhSiq00gjhv02P_Qran4',
  },
  {
    city: 'Zermatt',
    country: 'Switzerland',
    region: 'วาเลส์',
    lat: 45.9765,
    lng: 7.7491,
    latLngDisplay: '45°58\' N 7°44\' E',
    categoryTag: 'แมทเทอร์ฮอร์น',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBurXOEq-L4G6_Htp9hUt5cnNo1KeSITzbAlEaY-si0v2RqdfRFdVaZV1Dr52rzHcg8_pqj4mY4wfN99XIhb5f5NoeY1eRES0aS4a8bAAyQTeKSb1lGvxLbK2BdiF6Ey1ihzMli5lJBGgpv75BWVXLJ5BZnVu4PJLaMxvAeqVBc9ZdQfQ0jykfop5JzJOTXwsF7ZP3HY6xwWzoI9FZocSIBfri8_k561Jn8-MVo52lsE9ZnRy7wA5A6',
  },
];

export const AddPinModal: React.FC<AddPinModalProps> = ({ isOpen, onClose, onAddPin }) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState('35.6762');
  const [lng, setLng] = useState('139.6503');
  const [tag, setTag] = useState('การค้นพบใหม่');

  const [pinStyle, setPinStyle] = useState<'dot' | 'flag' | 'needle'>('dot');
  const [pinColor, setPinColor] = useState('#ffb703');

  if (!isOpen) return null;

  const handleSelectSuggestion = (s: typeof PIN_SUGGESTIONS[0]) => {
    setCity(s.city);
    setCountry(s.country);
    setRegion(s.region);
    setLat(s.lat.toString());
    setLng(s.lng.toString());
    setTag(s.categoryTag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat) || 0;
    const parsedLng = parseFloat(lng) || 0;
    const newPin: GlobePin = {
      id: `pin-${Date.now()}`,
      code: `${country.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 800 + 100)}`,
      city: city || 'เมืองใหม่',
      country: country || 'จุดหมายปลายทาง',
      region: region || 'พิกัดสำรวจ',
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      lat: parsedLat,
      lng: parsedLng,
      latLngDisplay: `${Math.abs(parsedLat).toFixed(2)}° ${parsedLat >= 0 ? 'N' : 'S'} ${Math.abs(parsedLng).toFixed(2)}° ${parsedLng >= 0 ? 'E' : 'W'}`,
      categoryTag: tag,
      isStamped: true,
      memoriesCount: 1,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Rv0V0ae3W7nM_AbnXsH1SnByRSLexfp_03QIOUchw4IjugOmAZgr8oGYod1MMlV9Wqyc1wanOPSmKkTr7_nIxgAoi8dMbAMP9TmGdE553JujxtieQi1SgcLYJ5i_ZvENh125mt2oBMObY0w8o9Kf4zZsSU36BPOSMr6IHHW6LbR3x3EqUfzI8HuaegWLHoAKtLJaYhCad2VEszC-HeG1V3TEbhZTq0OvylaPOuD1OYI1afGZLTUi',
      status: 'VERIFIED',
      pinStyle,
      pinColor,
    };
    onAddPin(newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#201b0e]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#fff8f0] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-[#d5c3b6]">
        <div className="w-12 h-1 bg-[#d5c3b6] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6f4315] text-[22px]">
              add_location_alt
            </span>
            <div>
              <h3 className="font-headline-sm text-[16px] text-[#6f4315] font-semibold">
                ปักหมุดพิกัดสำรวจโลก
              </h3>
              <p className="font-label-coord text-[10px] text-[#837469] uppercase">
                Add Expedition Waypoint
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#51443a] hover:bg-[#ece2cc]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-3">
          <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
            เลือกจากจุดหมายยอดนิยม
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PIN_SUGGESTIONS.map((s) => (
              <button
                key={s.city}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="p-2 text-left bg-white rounded-lg border border-[#d5c3b6]/70 hover:border-[#6f4315] hover:bg-[#fdf3dc] transition-all flex items-center gap-2"
              >
                <img src={s.photo} alt={s.city} className="w-8 h-8 rounded object-cover" />
                <div className="truncate">
                  <span className="font-title-md text-xs text-[#201b0e] block truncate">
                    {s.city}
                  </span>
                  <span className="font-label-coord text-[9px] text-[#837469] truncate">
                    {s.country}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                เมือง (City)
              </label>
              <input
                type="text"
                placeholder="เช่น Kyoto, Rome"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ประเทศ (Country)
              </label>
              <input
                type="text"
                placeholder="เช่น Japan, Italy"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ละติจูด (Lat)
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
                ลองจิจูด (Lng)
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
              />
            </div>
          </div>

          <div>
            <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1">
              ป้ายกำกับความทรงจำ (Tag)
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6]"
            />
          </div>

          {/* Pin Style & Appearance Selector */}
          <div className="p-3 rounded-xl bg-[#fdf3dc] border border-[#d5c3b6]/60 space-y-2.5">
            <label className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold block">
              ลักษณะของหมุด (Pin Style)
            </label>
            
            {/* Style Choices */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPinStyle('dot')}
                className={`py-2 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  pinStyle === 'dot'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
                <span className="text-[11px] font-semibold">จุดสีกระพริบ</span>
              </button>

              <button
                type="button"
                onClick={() => setPinStyle('flag')}
                className={`py-2 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  pinStyle === 'flag'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                <span className="text-[11px] font-semibold">ธงปักหลัก</span>
              </button>

              <button
                type="button"
                onClick={() => setPinStyle('needle')}
                className={`py-2 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  pinStyle === 'needle'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">push_pin</span>
                <span className="text-[11px] font-semibold">หมุดแผนที่</span>
              </button>
            </div>

            {/* Color Palette Choices */}
            <div>
              <span className="font-label-coord text-[9px] text-[#837469] block mb-1">
                เลือกสีหมุด (Pin Color):
              </span>
              <div className="flex items-center gap-2">
                {[
                  { color: '#ffb703', name: 'สีทอง (Gold)' },
                  { color: '#e63946', name: 'สีแดง (Ruby)' },
                  { color: '#00b4d8', name: 'สีฟ้า (Cyan)' },
                  { color: '#2a9d8f', name: 'สีเขียว (Emerald)' },
                  { color: '#9d4edd', name: 'สีม่วง (Purple)' },
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => setPinColor(item.color)}
                    style={{ backgroundColor: item.color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                      pinColor === item.color
                        ? 'border-[#201b0e] ring-2 ring-[#ffdea5] scale-110'
                        : 'border-white/80 opacity-80'
                    }`}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#ece2cc]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-title-md text-[#51443a] hover:bg-[#ece2cc] rounded-lg"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-title-md bg-[#6f4315] text-white rounded-lg shadow hover:bg-[#8b5a2b]"
            >
              + บันทึกหมุดลงแผนที่โลก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
