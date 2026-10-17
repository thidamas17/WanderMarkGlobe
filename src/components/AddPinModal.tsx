import React, { useState, useEffect } from 'react';
import { GlobePin, PinStyleType } from '../types';
import {
  WorldLocation,
  POPULAR_WORLD_LOCATIONS,
  searchLocalGazetteer,
  formatCoordinates,
  getLocationPhoto,
} from '../utils/worldLocations';

export interface AddPinInitialData {
  city?: string;
  country?: string;
  region?: string;
  lat?: number;
  lng?: number;
  categoryTag?: string;
  code?: string;
  photo?: string;
  sourceQuery?: string;
  flag?: string;
}

interface AddPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPin: (pin: GlobePin) => void;
  initialData?: AddPinInitialData | null;
}

const PIN_SUGGESTIONS = [
  {
    city: 'Florence',
    country: 'Italy',
    region: 'ทัสคานี',
    lat: 43.7696,
    lng: 11.2558,
    latLngDisplay: "43°46' N 11°15' E",
    categoryTag: 'ศิลปะเรเนซองส์',
    photo:
      'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=200&auto=format&fit=crop&q=80',
  },
  {
    city: 'Cusco',
    country: 'Peru',
    region: 'แอนดีส',
    lat: -13.5319,
    lng: -71.9675,
    latLngDisplay: "13°31' S 71°58' W",
    categoryTag: 'ยอดเขาสูง',
    photo:
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=200&auto=format&fit=crop&q=80',
  },
  {
    city: 'Paris',
    country: 'France',
    region: 'อิล-เดอ-ฟร็องส์',
    lat: 48.8566,
    lng: 2.3522,
    latLngDisplay: "48°51' N 2°21' E",
    categoryTag: 'มหานครแห่งแสงไฟ',
    photo:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&auto=format&fit=crop&q=80',
  },
  {
    city: 'Zermatt',
    country: 'Switzerland',
    region: 'วาเลส์',
    lat: 45.9765,
    lng: 7.7491,
    latLngDisplay: "45°58' N 7°44' E",
    categoryTag: 'แมทเทอร์ฮอร์น',
    photo:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=200&auto=format&fit=crop&q=80',
  },
];

export const AddPinModal: React.FC<AddPinModalProps> = ({
  isOpen,
  onClose,
  onAddPin,
  initialData,
}) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState('13.7563');
  const [lng, setLng] = useState('100.5018');
  const [tag, setTag] = useState('การค้นพบใหม่');
  const [code, setCode] = useState('');
  const [flag, setFlag] = useState('📍');

  const [pinStyle, setPinStyle] = useState<PinStyleType>('dot');
  const [pinColor, setPinColor] = useState('#ffb703');

  // Quick In-Modal Search state
  const [modalSearch, setModalSearch] = useState('');
  const [modalResults, setModalResults] = useState<WorldLocation[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Link and populate all searched data completely when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCity(initialData.city || '');
        setCountry(initialData.country || '');
        setRegion(initialData.region || 'พิกัดโลกจริง');
        if (initialData.lat !== undefined) {
          setLat(initialData.lat.toFixed(4));
        }
        if (initialData.lng !== undefined) {
          setLng(initialData.lng.toFixed(4));
        }
        if (initialData.categoryTag) {
          setTag(initialData.categoryTag);
        }
        if (initialData.code) {
          setCode(initialData.code);
        }
        if (initialData.flag) {
          setFlag(initialData.flag);
        }
        setModalSearch('');
      } else {
        // Fallback default
        setCity('Bangkok');
        setCountry('Thailand');
        setRegion('เมืองหลวง / มหานคร');
        setLat('13.7563');
        setLng('100.5018');
        setTag('จุดเริ่มต้นการสำรวจ');
        setCode('TH');
        setFlag('🇹🇭');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (s: typeof PIN_SUGGESTIONS[0]) => {
    setCity(s.city);
    setCountry(s.country);
    setRegion(s.region);
    setLat(s.lat.toString());
    setLng(s.lng.toString());
    setTag(s.categoryTag);
  };

  const handleSelectLocationFromSearch = (loc: WorldLocation) => {
    setCity(loc.nameTh || loc.name);
    setCountry(loc.countryTh || loc.country);
    setRegion(loc.category || 'พิกัดโลกจริง');
    setLat(loc.lat.toFixed(4));
    setLng(loc.lng.toFixed(4));
    setTag(loc.category || 'พิกัดสำรวจ');
    setCode(loc.code || 'LOC');
    setFlag(loc.flag || '📍');
    setModalSearch('');
    setShowResultsDropdown(false);
  };

  const handleModalSearchChange = (val: string) => {
    setModalSearch(val);
    if (!val.trim()) {
      setModalResults([]);
      setShowResultsDropdown(false);
      return;
    }
    const matches = searchLocalGazetteer(val.trim());
    setModalResults(matches);
    setShowResultsDropdown(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat) || 0;
    const parsedLng = parseFloat(lng) || 0;
    const generatedCode =
      code || `${country.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 800 + 100)}`;

    const newPin: GlobePin = {
      id: `pin-${Date.now()}`,
      code: generatedCode,
      city: city || 'เมืองใหม่',
      country: country || 'จุดหมายปลายทาง',
      region: region || 'พิกัดสำรวจ',
      date: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      lat: parsedLat,
      lng: parsedLng,
      latLngDisplay: formatCoordinates(parsedLat, parsedLng),
      categoryTag: tag,
      isStamped: true,
      memoriesCount: 1,
      imageUrl: getLocationPhoto(city, country, initialData?.photo),
      status: 'VERIFIED',
      pinStyle,
      pinColor,
    };

    onAddPin(newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#201b0e]/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#fffdfa] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-[#d5c3b6] max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1 bg-[#d5c3b6] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6f4315] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] text-[#6f4315] font-bold">
                ปักหมุดพิกัดสำรวจโลก
              </h3>
              <p className="font-label-coord text-[10px] text-[#837469] uppercase font-semibold">
                Expedition Waypoint Marker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#51443a] hover:bg-[#ece2cc] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Linked Search Information Banner (ลิ้งค์ข้อมูลจากการค้นหามาใส่ให้ครบถ้วน) */}
        {initialData && (initialData.city || initialData.lat !== undefined) && (
          <div className="mt-3 p-3 bg-[#fdf3dc] border border-[#d4af37]/70 rounded-xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">{flag}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-label-coord text-[8px] bg-[#6f4315] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    ลิ้งค์จากการค้นหา 100%
                  </span>
                  <span className="font-label-coord text-[9px] text-[#6f4315] font-bold truncate">
                    {region}
                  </span>
                </div>
                <h4 className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                  {city} {country && `• ${country}`}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="font-label-coord text-[9px] text-[#465f88] font-bold block bg-white/80 px-2 py-0.5 rounded border border-[#ece2cc]">
                {formatCoordinates(parseFloat(lat) || 0, parseFloat(lng) || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Live Search to change location immediately inside modal */}
        <div className="mt-3 relative">
          <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
            ค้นหาเปลี่ยนสถานที่ (ค้นหาเจอ 100% ลิ้งค์พิกัดจริง)
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#6f4315] text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="ค้นหาประเทศ เมือง หรือสถานที่เพื่อดึงข้อมูลพิกัดอัตโนมัติ..."
              value={modalSearch}
              onChange={(e) => handleModalSearchChange(e.target.value)}
              onFocus={() => {
                if (modalResults.length > 0) setShowResultsDropdown(true);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315]"
            />
          </div>

          {/* Autocomplete Dropdown inside Modal */}
          {showResultsDropdown && modalResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#d5c3b6] z-30 max-h-48 overflow-y-auto divide-y divide-[#ece2cc]">
              {modalResults.slice(0, 6).map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocationFromSearch(loc)}
                  className="p-2 hover:bg-[#fff8f0] flex items-center justify-between cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{loc.flag}</span>
                    <span className="font-semibold text-[#201b0e] truncate">
                      {loc.nameTh || loc.name}, {loc.countryTh || loc.country}
                    </span>
                  </div>
                  <span className="font-label-coord text-[9px] text-[#465f88] font-bold shrink-0 ml-2">
                    {formatCoordinates(loc.lat, loc.lng)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Suggestions Chips */}
        <div className="mt-3">
          <label className="font-label-coord text-[9px] text-[#837469] uppercase block mb-1 font-bold">
            หรือเลือกพิกัดสำรวจยอดนิยม
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PIN_SUGGESTIONS.map((s) => (
              <button
                key={s.city}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="p-1.5 text-left bg-white rounded-lg border border-[#d5c3b6]/70 hover:border-[#6f4315] hover:bg-[#fdf3dc] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <img src={s.photo} alt={s.city} className="w-7 h-7 rounded object-cover shrink-0" />
                <div className="truncate min-w-0">
                  <span className="font-title-md text-xs text-[#201b0e] font-bold block truncate">
                    {s.city}
                  </span>
                  <span className="font-label-coord text-[9px] text-[#837469] truncate block">
                    {s.country} • {s.region}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Pin Form - All fields filled in completely */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                เมือง / สถานที่ (City / Spot)
              </label>
              <input
                type="text"
                placeholder="เช่น กรุงเทพฯ, โตเกียว"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-medium"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                ประเทศ (Country)
              </label>
              <input
                type="text"
                placeholder="เช่น ไทย, ญี่ปุ่น"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e] font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                ภูมิภาค / เขต (Region)
              </label>
              <input
                type="text"
                placeholder="เช่น เอเชียตะวันออกเฉียงใต้"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e]"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                ป้ายกำกับ (Category Tag)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#201b0e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                ละติจูดจริง (Latitude)
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#465f88] font-bold"
              />
            </div>
            <div>
              <label className="font-label-coord text-[10px] text-[#837469] uppercase block mb-1 font-bold">
                ลองจิจูดจริง (Longitude)
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#d5c3b6] text-[#465f88] font-bold"
              />
            </div>
          </div>

          {/* Pin Style & Appearance Selector */}
          <div className="p-2.5 rounded-xl bg-[#fdf3dc] border border-[#d5c3b6]/70 space-y-2">
            <label className="font-label-coord text-[10px] text-[#6f4315] uppercase font-bold block">
              ลักษณะของหมุดบนลูกโลก (Pin Style & Color)
            </label>

            {/* Style Choices */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPinStyle('dot')}
                className={`py-1.5 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-0.5 border transition-all cursor-pointer ${
                  pinStyle === 'dot'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">radio_button_checked</span>
                <span className="text-[10px] font-semibold">จุดสีกระพริบ</span>
              </button>

              <button
                type="button"
                onClick={() => setPinStyle('flag')}
                className={`py-1.5 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-0.5 border transition-all cursor-pointer ${
                  pinStyle === 'flag'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">flag</span>
                <span className="text-[10px] font-semibold">ธงปักหลัก</span>
              </button>

              <button
                type="button"
                onClick={() => setPinStyle('needle')}
                className={`py-1.5 px-2 rounded-lg text-xs font-title-md flex flex-col items-center gap-0.5 border transition-all cursor-pointer ${
                  pinStyle === 'needle'
                    ? 'bg-[#6f4315] text-white border-[#6f4315] shadow-xs'
                    : 'bg-white text-[#51443a] border-[#d5c3b6] hover:bg-[#fff8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">push_pin</span>
                <span className="text-[10px] font-semibold">หมุดแผนที่</span>
              </button>
            </div>

            {/* Color Palette Choices */}
            <div className="pt-1 flex items-center justify-between">
              <span className="font-label-coord text-[9px] text-[#837469] font-semibold">
                สีของหมุด:
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
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
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

          <div className="pt-2.5 flex justify-end gap-2 border-t border-[#ece2cc]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-title-md text-[#51443a] hover:bg-[#ece2cc] rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-title-md bg-[#6f4315] text-white rounded-lg shadow-sm hover:bg-[#8b5a2b] font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_location</span>
              <span>+ บันทึกปักหมุดลงแผนที่โลก</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
