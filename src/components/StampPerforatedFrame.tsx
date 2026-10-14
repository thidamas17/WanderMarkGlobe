import React from 'react';
import { StampFrameStyle } from '../types';

interface StampPerforatedFrameProps {
  imageUrl: string;
  imageAlt?: string;
  country?: string;
  banner?: string;
  price?: string;
  postmarkStation?: string;
  postmarkDate?: string;
  postmarkType?: string;
  serialNumber?: string;
  locationName?: string;
  sepiaFilter?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'preview';
  className?: string;
  isUploaded?: boolean;
  frameStyle?: StampFrameStyle;
}

export const StampPerforatedFrame: React.FC<StampPerforatedFrameProps> = ({
  imageUrl,
  imageAlt = 'Stamp',
  banner = 'VINTAGE POSTAGE',
  price = '¥ 120',
  postmarkStation = 'POSTAGE PAID',
  postmarkDate = '2024',
  postmarkType = 'OFFICIAL',
  serialNumber = '#0812',
  locationName = 'EXPEDITION ARCHIVE',
  sepiaFilter = true,
  size = 'md',
  className = '',
  isUploaded = false,
  frameStyle = 'classic',
}) => {
  // Dimensions and teeth count based on size
  const teethCountH = size === 'sm' ? 8 : size === 'preview' ? 14 : 10;
  const teethCountV = size === 'sm' ? 10 : size === 'preview' ? 16 : 12;

  // Frame styling variants
  const getFrameStyling = () => {
    switch (frameStyle) {
      case 'airmail':
        return {
          paperBg: 'bg-[#ffffff]',
          outerBorder: 'border-2 border-[#465f88]',
          innerBorder: 'border-2 border-[#c2413c]',
          teethColor: 'bg-[#fdf3dc]',
          bannerBg: 'bg-[#465f88]',
          bannerText: 'text-white',
          styleHeader: 'AIRMAIL EDITION',
          chevronStrip: true,
        };
      case 'gold':
        return {
          paperBg: 'bg-[#fffaf0]',
          outerBorder: 'border-2 border-[#b8860b]',
          innerBorder: 'border border-[#d4af37]',
          teethColor: 'bg-[#fdf3dc]',
          bannerBg: 'bg-gradient-to-r from-[#7f601f] via-[#b8860b] to-[#7f601f]',
          bannerText: 'text-[#fff8f0]',
          styleHeader: 'ROYAL GILDED',
          chevronStrip: false,
        };
      case 'parchment':
        return {
          paperBg: 'bg-[#f5e9d3]',
          outerBorder: 'border border-[#8b5a2b]',
          innerBorder: 'border border-dashed border-[#6f4315]/70',
          teethColor: 'bg-[#ece2cc]',
          bannerBg: 'bg-[#6f4315]',
          bannerText: 'text-[#ffddc2]',
          styleHeader: 'ARCHIVAL PARCHMENT',
          chevronStrip: false,
        };
      case 'imperial':
        return {
          paperBg: 'bg-[#fdfbf7]',
          outerBorder: 'border-2 border-[#001b3d]',
          innerBorder: 'border-2 border-[#7a1818]',
          teethColor: 'bg-[#fdf3dc]',
          bannerBg: 'bg-[#001b3d]',
          bannerText: 'text-[#d6e3ff]',
          styleHeader: 'IMPERIAL REGISTER',
          chevronStrip: false,
        };
      case 'classic':
      default:
        return {
          paperBg: 'bg-[#faf6ee]',
          outerBorder: 'border border-[#d5c3b6]/80',
          innerBorder: 'border border-[#c4a994]',
          teethColor: 'bg-[#fdf3dc]',
          bannerBg: 'bg-[#6f4315]/95',
          bannerText: 'text-white',
          styleHeader: 'CLASSIC 14-HOLE',
          chevronStrip: false,
        };
    }
  };

  const style = getFrameStyling();

  return (
    <div
      className={`relative ${style.paperBg} ${style.outerBorder} shadow-lg rounded-xs flex flex-col transition-all ${
        size === 'sm'
          ? 'w-16 p-1'
          : size === 'preview'
          ? 'w-52 p-2.5 sm:w-56'
          : size === 'lg'
          ? 'w-48 p-2'
          : 'w-full p-1.5'
      } ${className}`}
      style={{
        boxShadow:
          frameStyle === 'gold'
            ? '0 6px 18px rgba(184, 134, 11, 0.25), 0 2px 6px rgba(0, 0, 0, 0.12)'
            : '0 4px 14px rgba(111, 67, 21, 0.16), 0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Airmail Chevron Strip Accent if airmail style */}
      {style.chevronStrip && (
        <div
          className="absolute -inset-0.5 rounded pointer-events-none -z-10 opacity-70"
          style={{
            background:
              'repeating-linear-gradient(135deg, #c2413c 0, #c2413c 6px, #ffffff 6px, #ffffff 10px, #465f88 10px, #465f88 16px, #ffffff 16px, #ffffff 20px)',
          }}
        />
      )}

      {/* ================= STAMP PERFORATED TEETH (DIE-CUT 14-HOLE SCALLOPS) ================= */}
      {/* Top Perforations */}
      <div className="absolute -top-1 inset-x-1 flex justify-between pointer-events-none z-20">
        {Array.from({ length: teethCountH }).map((_, i) => (
          <span
            key={`top-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${style.teethColor} shadow-[inset_0_-1px_1px_rgba(0,0,0,0.15)] -mt-0.5`}
          />
        ))}
      </div>

      {/* Bottom Perforations */}
      <div className="absolute -bottom-1 inset-x-1 flex justify-between pointer-events-none z-20">
        {Array.from({ length: teethCountH }).map((_, i) => (
          <span
            key={`bot-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${style.teethColor} shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)] -mb-0.5`}
          />
        ))}
      </div>

      {/* Left Perforations */}
      <div className="absolute -left-1 inset-y-1 flex flex-col justify-between pointer-events-none z-20">
        {Array.from({ length: teethCountV }).map((_, i) => (
          <span
            key={`left-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${style.teethColor} shadow-[inset_-1px_0_1px_rgba(0,0,0,0.15)] -ml-0.5`}
          />
        ))}
      </div>

      {/* Right Perforations */}
      <div className="absolute -right-1 inset-y-1 flex flex-col justify-between pointer-events-none z-20">
        {Array.from({ length: teethCountV }).map((_, i) => (
          <span
            key={`right-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${style.teethColor} shadow-[inset_1px_0_1px_rgba(0,0,0,0.15)] -mr-0.5`}
          />
        ))}
      </div>

      {/* ================= INNER ENGRAVED POSTAL BORDER ================= */}
      <div
        className={`relative w-full aspect-[4/5] bg-[#ece2cc] rounded-xs overflow-hidden flex flex-col ${style.innerBorder} p-0.5 shadow-inner`}
      >
        {/* Double hairline inner frame */}
        <div className="relative w-full h-full overflow-hidden rounded-xs border border-dashed border-[#837469]/60">
          <img
            src={imageUrl}
            alt={imageAlt}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              sepiaFilter ? 'sepia-[0.18] contrast-[1.06]' : ''
            }`}
          />

          {/* Uploaded Authenticity Stamp Watermark */}
          {isUploaded && (
            <div className="absolute top-1 left-1 bg-[#6f4315]/90 text-white px-1.5 py-0.5 rounded text-[8px] font-label-coord flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
              <span>{style.styleHeader}</span>
            </div>
          )}

          {/* Cancellation Stamp Postmark Overlay */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply flex flex-col justify-center items-center opacity-85 rotate-[-7deg] select-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[1.5px] border-dashed border-[#6f4315] flex flex-col items-center justify-center p-1 bg-[#fff8f0]/10 backdrop-blur-[0.5px]">
              <span className="font-label-coord text-[7px] sm:text-[8px] text-[#6f4315] font-bold tracking-widest uppercase">
                {postmarkStation}
              </span>
              <span className="font-label-stamp text-[9px] sm:text-[11px] text-[#6f4315] font-bold my-0.5">
                {postmarkDate}
              </span>
              <div className="w-8 sm:w-10 h-0.5 bg-[#6f4315] my-0.5 opacity-60" />
              <span className="font-label-coord text-[6px] sm:text-[7px] text-[#6f4315]">
                {postmarkType}
              </span>
            </div>

            {/* Postmark cancellation wavy lines */}
            <svg
              className="w-20 sm:w-24 h-3 sm:h-4 text-[#6f4315] opacity-70 -mt-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              viewBox="0 0 100 20"
            >
              <path d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10" />
              <path d="M0,15 Q12.5,5 25,15 T50,15 T75,15 T100,15" />
            </svg>
          </div>

          {/* Top Denomination Tag */}
          <div className="absolute top-1 right-1 bg-white/92 px-1.5 py-0.5 rounded shadow-sm border border-[#d5c3b6]/50">
            <span className="font-label-stamp text-[9px] sm:text-[10px] text-[#6f4315] font-bold leading-none">
              {price}
            </span>
          </div>

          {/* Authentic Stamp Banner at Bottom */}
          <div
            className={`absolute bottom-0 inset-x-0 ${style.bannerBg} ${style.bannerText} py-0.5 px-1.5 flex items-center justify-between border-t border-[#8b5a2b]`}
          >
            <span className="font-headline-sm text-[8px] sm:text-[9px] tracking-wide uppercase truncate font-semibold">
              {banner}
            </span>
            <span className="font-label-stamp text-[7px] sm:text-[8px] opacity-85 font-bold">
              OFFICIAL
            </span>
          </div>
        </div>
      </div>

      {/* Stamp Perforation Margin Footer */}
      <div className="mt-1 flex items-center justify-between px-0.5 select-none">
        <span className="font-label-coord text-[7px] sm:text-[8px] text-[#837469] truncate font-medium">
          {locationName}
        </span>
        <span className="font-label-coord text-[7px] sm:text-[8px] text-[#465f88] font-bold">
          {serialNumber}
        </span>
      </div>
    </div>
  );
};
