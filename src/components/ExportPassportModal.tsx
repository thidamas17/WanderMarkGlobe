import React from 'react';
import { PassportVisaStamp } from '../types';

interface ExportPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stamps: PassportVisaStamp[];
}

export const ExportPassportModal: React.FC<ExportPassportModalProps> = ({
  isOpen,
  onClose,
  stamps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#201b0e]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#faf5ea] rounded-2xl p-6 shadow-2xl border-4 border-[#353021] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#837469]/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#6f4315] text-[28px]">
              menu_book
            </span>
            <div>
              <h2 className="font-headline-sm text-lg text-[#6f4315] font-bold">
                สมุดพาสปอร์ตนักผจญภัยฉบับสมบูรณ์ (Full Folio)
              </h2>
              <span className="font-label-coord text-[10px] text-[#837469] uppercase">
                KINGDOM OF WANDER • OFFICIAL EXPEDITION DOSSIER
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#51443a] hover:bg-[#ece2cc] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Passport Identity Page */}
        <div className="mt-4 p-4 rounded-xl bg-[#fdf3dc] border border-[#d5c3b6] relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded bg-[#ece2cc] overflow-hidden border border-[#837469] shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgeNThf6jTw52QxDGGKm7daeeZ0mF2t0QybUZDNX0pUvzkKL8-vf-izQ0USfKHTJBPIzNi5I6W5wylrvefX-byvWEjy6cUll0lJzZf0Az4wnOcBzvIz6UNl7puZh1qoGs5VDLW3c8okMPibJ5zFGqOQqBe0N4qnDzAWgdI7sXghAJQghCK8b3j70tUE8kAEO6VLfKH8yuUvhGrdAiRdLYx_y1alMITxQKuG2cgiEwkjSy5VXNC6oUm"
                  alt="Explorer Photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <span className="font-label-coord text-[9px] text-[#837469] uppercase">ผู้ถือเอกสาร / BEARER</span>
                <h3 className="font-headline-sm text-base text-[#201b0e] font-bold">
                  THAWANDERER, SOMCHAI
                </h3>
                <p className="font-label-coord text-[11px] text-[#6f4315]">
                  PASSPORT NO: TH-892041 • EXPEDITIONARY STATUS: ACTIVE
                </p>
                <p className="font-body-sm text-[11px] text-[#51443a]">
                  ตราประทับตรวจคนเข้าเมืองสะสม: {stamps.length} ตราประทับ
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-stamp text-xs text-[#644807] font-bold bg-[#ffdea5] px-2 py-0.5 rounded">
                SERIES 2024-B
              </span>
            </div>
          </div>
        </div>

        {/* Stamped Visas Index */}
        <div className="mt-5">
          <h4 className="font-label-coord text-[11px] text-[#6f4315] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">approval</span>
            <span>ประวัติวีซ่าและตราประทับตรวจคนเข้าเมือง</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stamps.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-lg bg-white border border-[#d5c3b6]/70 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-stamp text-[10px] text-[#6f4315] font-bold">
                      {st.code}
                    </span>
                    <h5 className="font-headline-sm text-sm text-[#201b0e] font-semibold">
                      {st.country}
                    </h5>
                    <p className="font-label-coord text-[10px] text-[#837469]">
                      {st.location}
                    </p>
                  </div>
                  <span className="font-label-stamp text-[10px] text-[#ba1a1a] font-bold border border-dashed border-[#ba1a1a] px-1.5 py-0.5 rounded">
                    {st.date}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#ece2cc] text-[11px] italic text-[#51443a]">
                  “{st.note}”
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#837469]/30 flex items-center justify-between">
          <span className="font-label-coord text-[10px] text-[#837469]">
            CERTIFIED BY EXPEDITION DISPATCH
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg bg-[#f2e7d1] text-[#6f4315] font-title-md text-xs hover:bg-[#ece2cc] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#6f4315] text-white font-title-md text-xs hover:bg-[#8b5a2b]"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
