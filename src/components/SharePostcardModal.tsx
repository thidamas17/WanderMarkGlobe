import React, { useState, useRef } from 'react';
import { PostcardItem } from '../types';

interface SharePostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  postcard: PostcardItem | null;
  onToast: (msg: string) => void;
}

export const SharePostcardModal: React.FC<SharePostcardModalProps> = ({
  isOpen,
  onClose,
  postcard,
  onToast,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [showSeparateSides, setShowSeparateSides] = useState<boolean>(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState<boolean>(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen || !postcard) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const imageUrl = postcard.imageUrl;

  // Format message for LINE and email
  const shareTitle = `📮 โปสการ์ดความทรงจำ: ${postcard.frontTitle}`;
  const shareTextLine = `${shareTitle}
📍 พิกัด: ${postcard.locationTag || postcard.postmarkCity} (${postcard.frontCoords})
📅 วันที่: ${postcard.dateDisplay}
✉️ ถึง: ${postcard.toRecipient}

"${postcard.journalText.slice(0, 150)}${postcard.journalText.length > 150 ? '...' : ''}"

ชมภาพโปสการ์ด: ${imageUrl}`;

  const mailSubject = encodeURIComponent(`📮 โปสการ์ดจาก ${postcard.postmarkCity}: ${postcard.frontTitle}`);
  const mailBody = encodeURIComponent(
    `สวัสดี,\n\nส่งโปสการ์ดความทรงจำการเดินทางมาให้คุณ:\n\n` +
      `【 ${postcard.frontTitle} 】\n` +
      `สถานที่ / พิกัด: ${postcard.locationTag || postcard.postmarkCity} (${postcard.frontCoords})\n` +
      `วันที่: ${postcard.dateDisplay}\n` +
      `ถึง: ${postcard.toRecipient}\n\n` +
      `บันทึกความทรงจำ:\n"${postcard.journalText}"\n\n` +
      `ภาพถ่ายโปสการ์ด:\n${imageUrl}\n\n` +
      `---\nส่งผ่าน Wandermark Vintage Expedition Journal`
  );

  // Copy direct image URL to clipboard
  const handleCopyImageUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
      } else {
        const input = document.createElement('input');
        input.value = imageUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      onToast('คัดลอกลิงก์รูปภาพโปสการ์ดเรียบร้อยแล้ว!');
    } catch (e) {
      console.error(e);
      onToast('ไม่สามารถคัดลอกได้อัตโนมัติ กรุณาคัดลอกจากกล่องข้อความ');
    }
  };

  // Share via LINE
  const handleShareLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareTextLine)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
    onToast('กำลังเปิด LINE เพื่อแชร์โปสการ์ด...');
  };

  // Share via Email
  const handleShareEmail = () => {
    const mailtoUrl = `mailto:?subject=${mailSubject}&body=${mailBody}`;
    window.location.href = mailtoUrl;
    onToast('กำลังเปิดโปรแกรม E-mail...');
  };

  // Native Web Share API (Mobile / Tablet)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `โปสการ์ดบันทึกการเดินทาง: ${postcard.frontTitle} - "${postcard.journalText.slice(0, 80)}..."`,
          url: imageUrl,
        });
        onToast('แชร์โปสการ์ดสำเร็จ!');
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          onToast('ไม่สามารถเปิดเมนูแชร์ได้');
        }
      }
    } else {
      handleCopyImageUrl();
    }
  };

  // Helper to load image safely into canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  // Download Postcard as .jpg
  const handleDownloadJpg = async (side: 'front' | 'back' | 'both') => {
    setIsGeneratingJpg(true);
    onToast('กำลังประมวลผลไฟล์ .jpg ความละเอียดสูง...');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');

      const width = 1200;
      const height = side === 'both' ? 1800 : 900;
      canvas.width = width;
      canvas.height = height;

      // Draw Front side
      const drawFront = async (startY: number, targetHeight: number) => {
        // Base background
        ctx.fillStyle = '#fdf3dc';
        ctx.fillRect(0, startY, width, targetHeight);

        // Try loading photo
        let photoLoaded = false;
        try {
          const img = await loadImage(postcard.imageUrl);
          ctx.drawImage(img, 30, startY + 30, width - 60, targetHeight - 60);
          photoLoaded = true;
        } catch {
          // Fallback background if CORS restricts image export
          const grad = ctx.createLinearGradient(0, startY, 0, startY + targetHeight);
          grad.addColorStop(0, '#51443a');
          grad.addColorStop(1, '#201b0e');
          ctx.fillStyle = grad;
          ctx.fillRect(30, startY + 30, width - 60, targetHeight - 60);
        }

        // Dark gradient overlay at bottom
        const darkGrad = ctx.createLinearGradient(0, startY + targetHeight - 350, 0, startY + targetHeight - 30);
        darkGrad.addColorStop(0, 'rgba(32, 27, 14, 0)');
        darkGrad.addColorStop(1, 'rgba(32, 27, 14, 0.92)');
        ctx.fillStyle = darkGrad;
        ctx.fillRect(30, startY + targetHeight - 350, width - 60, 320);

        // Photo border
        ctx.strokeStyle = '#d5c3b6';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, startY + 30, width - 60, targetHeight - 60);

        // Cancellation Postmark Stamp on top-right
        ctx.save();
        ctx.translate(width - 150, startY + 130);
        ctx.rotate((-12 * Math.PI) / 180);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(postcard.postmarkCity.toUpperCase(), 0, -20);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(postcard.postmarkDate, 0, 10);
        ctx.font = '13px sans-serif';
        ctx.fillText('PAR AVION • OFFICIAL', 0, 35);
        ctx.restore();

        // Front Typography
        ctx.fillStyle = '#ffdea5';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(postcard.frontSubtitle.toUpperCase() || 'WANDERMARK VINTAGE ARCHIVE', 60, startY + targetHeight - 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 46px sans-serif';
        ctx.fillText(postcard.frontTitle, 60, startY + targetHeight - 100);

        ctx.fillStyle = 'rgba(242, 231, 209, 0.9)';
        ctx.font = '500 20px monospace';
        ctx.fillText(`${postcard.frontCoords}  •  NO. ${postcard.code}`, 60, startY + targetHeight - 60);
      };

      // Draw Back side
      const drawBack = async (startY: number, targetHeight: number) => {
        // Outer cream frame
        ctx.fillStyle = '#fdf3dc';
        ctx.fillRect(0, startY, width, targetHeight);

        // Airmail border with blue and red chevrons
        const borderWidth = 18;
        ctx.save();
        ctx.lineWidth = borderWidth;
        const stripeSize = 30;
        for (let i = 0; i < width; i += stripeSize * 2) {
          ctx.fillStyle = '#c2413c';
          ctx.fillRect(i, startY, stripeSize, borderWidth);
          ctx.fillRect(i, startY + targetHeight - borderWidth, stripeSize, borderWidth);
          ctx.fillStyle = '#465f88';
          ctx.fillRect(i + stripeSize, startY, stripeSize, borderWidth);
          ctx.fillRect(i + stripeSize, startY + targetHeight - borderWidth, stripeSize, borderWidth);
        }
        for (let j = 0; j < targetHeight; j += stripeSize * 2) {
          ctx.fillStyle = '#c2413c';
          ctx.fillRect(0, startY + j, borderWidth, stripeSize);
          ctx.fillRect(width - borderWidth, startY + j, borderWidth, stripeSize);
          ctx.fillStyle = '#465f88';
          ctx.fillRect(0, startY + j + stripeSize, borderWidth, stripeSize);
          ctx.fillRect(width - borderWidth, startY + j + stripeSize, borderWidth, stripeSize);
        }
        ctx.restore();

        // Inner Card Paper
        const innerMargin = 30;
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(innerMargin, startY + innerMargin, width - innerMargin * 2, targetHeight - innerMargin * 2);
        ctx.strokeStyle = '#d5c3b6';
        ctx.lineWidth = 2;
        ctx.strokeRect(innerMargin, startY + innerMargin, width - innerMargin * 2, targetHeight - innerMargin * 2);

        // Header Airmail label
        ctx.fillStyle = '#465f88';
        ctx.fillRect(50, startY + 50, 260, 36);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✈ BY AIR MAIL • PAR AVION', 180, startY + 74);

        ctx.fillStyle = '#837469';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('POST CARD', width - 260, startY + 76);

        // Center dividing line
        ctx.strokeStyle = '#ece2cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.56, startY + 110);
        ctx.lineTo(width * 0.56, startY + targetHeight - 70);
        ctx.stroke();

        // Left Side: Journal & Notes
        ctx.textAlign = 'left';
        ctx.fillStyle = '#644807';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(postcard.dateDisplay, 60, startY + 130);

        ctx.fillStyle = '#6f4315';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(postcard.title, 60, startY + 170);

        // Handwritten journal text wrapped
        ctx.fillStyle = '#51443a';
        ctx.font = 'italic 20px serif';
        const words = postcard.journalText.split('');
        let currentLine = '';
        let lineY = startY + 220;
        const maxLineWidth = width * 0.56 - 100;

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth) {
            ctx.fillText(currentLine, 60, lineY);
            currentLine = words[i];
            lineY += 34;
            if (lineY > startY + targetHeight - 120) break;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          ctx.fillText(currentLine, 60, lineY);
        }

        // Weather note bottom left
        ctx.fillStyle = '#f7edd7';
        ctx.fillRect(60, startY + targetHeight - 100, 320, 40);
        ctx.strokeStyle = '#d5c3b6';
        ctx.strokeRect(60, startY + targetHeight - 100, 320, 40);
        ctx.fillStyle = '#201b0e';
        ctx.font = '16px sans-serif';
        ctx.fillText(
          `${postcard.weatherEmoji} ${postcard.temperature} • ${postcard.weatherText} (${postcard.locationTag})`,
          75,
          startY + targetHeight - 74
        );

        // Right Side: Stamp Box & Address
        const stampX = width - 210;
        const stampY = startY + 50;
        const stampW = 150;
        const stampH = 190;

        // Draw Stamp
        ctx.fillStyle = '#fdf3dc';
        ctx.fillRect(stampX, stampY, stampW, stampH);
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(stampX, stampY, stampW, stampH);
        ctx.setLineDash([]);

        // Try draw stamp image
        try {
          if (postcard.stampImageUrl) {
            const stampImg = await loadImage(postcard.stampImageUrl);
            ctx.drawImage(stampImg, stampX + 10, stampY + 10, stampW - 20, stampH - 50);
          }
        } catch {
          // Stamp placeholder
          ctx.fillStyle = '#6f4315';
          ctx.fillRect(stampX + 10, stampY + 10, stampW - 20, stampH - 50);
        }

        ctx.fillStyle = '#6f4315';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(postcard.stampCountry || 'POSTAGE', stampX + stampW / 2, stampY + stampH - 24);
        ctx.fillText(postcard.stampPrice || '1924', stampX + stampW / 2, stampY + stampH - 10);

        // Address Lines
        const addrX = width * 0.56 + 30;
        let addrY = startY + 280;

        const drawAddrField = (label: string, value: string) => {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#837469';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(label, addrX, addrY);
          ctx.fillStyle = '#201b0e';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(value, addrX, addrY + 26);
          ctx.strokeStyle = '#d5c3b6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(addrX, addrY + 34);
          ctx.lineTo(width - 50, addrY + 34);
          ctx.stroke();
          addrY += 65;
        };

        drawAddrField('ถึง (TO RECIPIENT):', postcard.toRecipient || 'ตัวฉันในอนาคต');
        drawAddrField('พิกัด (COORDINATES):', postcard.coordinates || postcard.frontCoords);
        drawAddrField('สถานะการส่ง (STATUS):', postcard.status || 'บันทึกเรียบร้อย');

        // Serial watermark bottom
        ctx.fillStyle = '#837469';
        ctx.font = '13px monospace';
        ctx.fillText(postcard.serialNumber || `WM-${postcard.code}`, addrX, startY + targetHeight - 65);
      };

      if (side === 'front') {
        await drawFront(0, 900);
      } else if (side === 'back') {
        await drawBack(0, 900);
      } else {
        await drawFront(0, 900);
        await drawBack(900, 900);
      }

      // Export as JPG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const downloadLink = document.createElement('a');
      const filename = `${postcard.frontTitle.replace(/[^\wก-๙]/g, '_')}_${side}.jpg`;
      downloadLink.href = dataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      onToast(`บันทึกไฟล์ "${filename}" สำเร็จ!`);
    } catch (err) {
      console.error(err);
      onToast('เกิดข้อผิดพลาดในการบันทึกภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#fffdfa] rounded-2xl shadow-2xl border border-[#d5c3b6] p-4 sm:p-5 flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece2cc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#465f88] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base text-[#201b0e] font-bold">
                แชร์โปสการ์ดความทรงจำ
              </h3>
              <p className="font-label-coord text-[10px] text-[#837469] uppercase font-semibold">
                Share Postcard • No. {postcard.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#837469] hover:bg-[#ece2cc] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Postcard Mini Preview & Side Selector (ย่อให้เล็กลงหรือซ่อนไว้) */}
        <div className="mt-3.5 bg-[#fdf3dc]/80 rounded-xl p-2.5 sm:p-3 border border-[#d5c3b6]/70">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
              className="font-label-coord text-[10.5px] text-[#6f4315] uppercase font-bold flex items-center gap-1 cursor-pointer hover:text-[#8b5a2b] transition-colors"
              title={isPreviewCollapsed ? 'กดเพื่อขยายภาพดู' : 'กดย่อให้เล็กลงหรือซ่อนไว้'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isPreviewCollapsed ? 'visibility' : 'preview'}
              </span>
              <span>ตัวอย่างภาพโปสการ์ด {isPreviewCollapsed ? '(ย่อไว้)' : ''}</span>
              <span className="material-symbols-outlined text-[14px] text-[#837469]">
                {isPreviewCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              {!isPreviewCollapsed && (
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#d5c3b6]">
                  <button
                    type="button"
                    onClick={() => setActiveSide('front')}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-label-ui transition-all cursor-pointer ${
                      activeSide === 'front'
                        ? 'bg-[#6f4315] text-white font-bold shadow-xs'
                        : 'text-[#51443a] hover:text-[#6f4315]'
                    }`}
                  >
                    ด้านหน้า
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide('back')}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-label-ui transition-all cursor-pointer ${
                      activeSide === 'back'
                        ? 'bg-[#6f4315] text-white font-bold shadow-xs'
                        : 'text-[#51443a] hover:text-[#6f4315]'
                    }`}
                  >
                    ด้านหลัง
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                className="text-[9.5px] font-label-coord text-[#837469] bg-white/80 hover:bg-white px-2 py-0.5 rounded border border-[#d5c3b6]/60 cursor-pointer transition-colors"
              >
                {isPreviewCollapsed ? 'ขยายดูภาพ' : 'ย่อไว้'}
              </button>
            </div>
          </div>

          {/* Collapsed Compact Strip */}
          {isPreviewCollapsed ? (
            <div
              onClick={() => setIsPreviewCollapsed(false)}
              className="flex items-center gap-2.5 p-2 bg-white/80 rounded-lg border border-[#d5c3b6]/60 cursor-pointer hover:bg-white transition-all shadow-2xs"
            >
              <img
                src={postcard.imageUrl}
                alt={postcard.frontTitle}
                className="w-12 h-9 object-cover rounded shadow-2xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                  {postcard.frontTitle}
                </h4>
                <p className="font-label-coord text-[9px] text-[#837469] truncate">
                  {postcard.locationTag || postcard.postmarkCity} • {postcard.dateDisplay}
                </p>
              </div>
              <span className="text-[10px] text-[#6f4315] font-semibold flex items-center gap-0.5 shrink-0">
                <span>แตะเพื่อขยาย</span>
                <span className="material-symbols-outlined text-[13px]">expand_more</span>
              </span>
            </div>
          ) : (
            /* Expanded Thumbnail representation */
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#d5c3b6] bg-black/10 flex items-center justify-center shadow-inner">
              {activeSide === 'front' ? (
                <>
                  <img
                    src={postcard.imageUrl}
                    alt={postcard.frontTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                    <span className="font-label-stamp text-[9px] text-[#ffdea5] uppercase font-bold">
                      {postcard.frontSubtitle}
                    </span>
                    <h4 className="font-headline-sm text-sm sm:text-base font-bold drop-shadow">
                      {postcard.frontTitle}
                    </h4>
                    <span className="font-label-coord text-[9px] text-white/80">
                      {postcard.frontCoords}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-[#fdf3dc] p-3 flex flex-col justify-between border-4 border-dashed border-[#465f88]/40 text-[#201b0e]">
                  <div className="flex items-center justify-between border-b border-[#ece2cc] pb-1">
                    <span className="font-label-stamp text-[9px] bg-[#465f88] text-white px-1.5 py-0.5 rounded font-bold">
                      PAR AVION • {postcard.postmarkCity}
                    </span>
                    <span className="font-label-coord text-[9px] text-[#837469]">
                      {postcard.dateDisplay}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-auto">
                    <div className="text-left pr-2 border-r border-[#ece2cc]">
                      <h5 className="font-headline-sm text-xs text-[#6f4315] font-bold truncate">
                        {postcard.title}
                      </h5>
                      <p className="font-body-sm text-[10px] text-[#51443a] italic line-clamp-2 mt-0.5">
                        "{postcard.journalText}"
                      </p>
                    </div>
                    <div className="text-left pl-1 space-y-0.5">
                      <span className="font-label-coord text-[8px] text-[#837469] block">
                        ถึง: {postcard.toRecipient}
                      </span>
                      <span className="font-label-coord text-[8px] text-[#465f88] block">
                        {postcard.coordinates}
                      </span>
                      <span className="font-label-stamp text-[8px] text-[#644807] font-bold block">
                        สถานะ: {postcard.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-coord text-[8px] text-[#837469]">
                      NO. {postcard.code}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= 4 MAIN SHARING METHODS ================= */}
        <div className="mt-4 space-y-3">
          <span className="font-label-coord text-[10px] text-[#51443a] uppercase font-bold tracking-wider block">
            เลือกช่องทางการแชร์ (Sharing Options)
          </span>

          {/* Option 1: แชร์เป็นลิ้งค์รูปภาพ (Share as Image Link) */}
          <div className="p-3 bg-white rounded-xl border border-[#d5c3b6] shadow-xs hover:border-[#465f88] transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-title-md text-xs text-[#201b0e] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#465f88]">link</span>
                <span>1. แชร์เป็นลิ้งค์รูปภาพ (Direct Image Link)</span>
              </span>
              <span className="font-label-coord text-[9px] text-[#837469] bg-[#f2e7d1] px-1.5 py-0.5 rounded">
                URL LINK
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#fdf3dc]/60 px-2.5 py-1.5 rounded-lg border border-[#ece2cc] text-xs font-mono text-[#51443a] truncate select-all">
                {imageUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyImageUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                  copiedLink
                    ? 'bg-[#1b6b36] text-white'
                    : 'bg-[#465f88] text-white hover:bg-[#344868]'
                }`}
                title="คัดลอกลิงก์รูปภาพไปยังคลิปบอร์ด"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิ้งค์'}</span>
              </button>
            </div>
          </div>

          {/* Option 2 & 3: LINE & E-MAIL buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Share via LINE */}
            <button
              type="button"
              onClick={handleShareLine}
              className="p-3 rounded-xl bg-[#06C755] text-white hover:bg-[#05b34c] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 group font-bold text-xs"
              title="แชร์ข้อความและลิงก์ไปยัง LINE"
            >
              <div className="w-6 h-6 rounded-full bg-white text-[#06C755] flex items-center justify-center font-black text-xs shadow-xs">
                L
              </div>
              <div className="text-left">
                <span className="block leading-none text-xs">แชร์ผ่าน LINE</span>
                <span className="text-[9px] opacity-90 font-normal">ส่งหาเพื่อนในแชท</span>
              </div>
              <span className="material-symbols-outlined text-[16px] ml-auto group-hover:translate-x-0.5 transition-transform">
                send
              </span>
            </button>

            {/* Share via E-mail */}
            <button
              type="button"
              onClick={handleShareEmail}
              className="p-3 rounded-xl bg-[#465f88] text-white hover:bg-[#364b6e] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 group font-bold text-xs"
              title="ส่งโปสการ์ดผ่าน E-mail"
            >
              <div className="w-6 h-6 rounded-full bg-white text-[#465f88] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[14px]">mail</span>
              </div>
              <div className="text-left">
                <span className="block leading-none text-xs">แชร์ผ่าน E-mail</span>
                <span className="text-[9px] opacity-90 font-normal">ส่งจดหมายอิเล็กทรอนิกส์</span>
              </div>
              <span className="material-symbols-outlined text-[16px] ml-auto group-hover:translate-x-0.5 transition-transform">
                forward_to_inbox
              </span>
            </button>
          </div>

          {/* Option 4: บันทึกเป็นไฟล์ .jpg (Save / Download as .jpg) */}
          <div className="p-3.5 bg-[#fdf3dc]/80 rounded-xl border border-[#d5c3b6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-title-md text-xs text-[#6f4315] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                <span>4. บันทึกเป็นไฟล์ .jpg (Download High-Res JPG)</span>
              </span>
              <span className="font-label-stamp text-[9px] bg-[#ffdea5] text-[#261900] px-1.5 py-0.5 rounded font-bold">
                HD .JPG
              </span>
            </div>

            <p className="font-body-sm text-[11px] text-[#51443a]">
              บันทึกโปสการ์ดลงในเครื่องเป็นรูปภาพ .jpg ความละเอียดสูง พร้อมกรอบแสตมป์ ตราประทับ และลายมือ
            </p>

            {/* ลำดับที่ 1: แผ่นคู่ประกบ (.jpg) (ย้ายมาเป็นลำดับที่ 1 ตามคำขอ) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isGeneratingJpg}
                onClick={() => handleDownloadJpg('both')}
                className="w-full p-3 rounded-xl bg-[#6f4315] text-white hover:bg-[#8b5a2b] font-bold text-xs flex items-center justify-between shadow-md cursor-pointer active:scale-[0.99] transition-all disabled:opacity-50 group border border-[#8b5a2b]"
                title="1. แผ่นคู่ประกบ หน้า-หลัง (.jpg) - รวมภาพหน้าและบันทึกหลังในใบเดียว"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[19px]">collections</span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-white tracking-tight">
                        1. แผ่นคู่ประกบ หน้า-หลัง (.jpg)
                      </span>
                      <span className="bg-[#ffdea5] text-[#261900] text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">
                        แนะนำ
                      </span>
                    </div>
                    <span className="text-[10px] text-[#f2e7d1]/90 block font-normal mt-0.5">
                      รวมภาพถ่ายด้านหน้าและบันทึกด้านหลังในไฟล์เดียว ครบถ้วนพร้อมแชร์
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-white text-[11px] font-semibold group-hover:bg-white group-hover:text-[#6f4315] transition-all shrink-0">
                  <span>ดาวน์โหลด</span>
                  <span className="material-symbols-outlined text-[15px]">download</span>
                </div>
              </button>

              {/* ส่วนภาพด้านหน้า และบันทึกภาพด้านหลัง (ย่อให้เล็กลงหรือซ่อนไว้) */}
              <div className="pt-1 border-t border-[#d5c3b6]/60">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSeparateSides(!showSeparateSides)}
                    className="text-[11px] font-label-coord text-[#837469] hover:text-[#6f4315] flex items-center gap-1 cursor-pointer transition-colors py-0.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {showSeparateSides ? 'expand_less' : 'expand_more'}
                    </span>
                    <span className="font-semibold">
                      {showSeparateSides
                        ? 'ซ่อนตัวเลือกแยกหน้า'
                        : 'ตัวเลือกดาวน์โหลดแยกหน้าเดี่ยว (ย่อไว้)'}
                    </span>
                  </button>
                  <span className="text-[9px] text-[#837469] bg-white/80 px-2 py-0.5 rounded border border-[#d5c3b6]/50">
                    {showSeparateSides ? 'ขนาดย่อ' : 'ย่อซ่อนไว้'}
                  </span>
                </div>

                {/* เมื่อเปิดดู จะแสดงปุ่มขนาดย่อกะทัดรัด */}
                {showSeparateSides && (
                  <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in duration-200">
                    <button
                      type="button"
                      disabled={isGeneratingJpg}
                      onClick={() => handleDownloadJpg('front')}
                      className="py-1.5 px-2.5 rounded-lg bg-white/90 border border-[#d5c3b6] hover:bg-[#f7edd7] text-[#201b0e] text-[10.5px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                      title="ดาวน์โหลดเฉพาะภาพด้านหน้า"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#6f4315]">image</span>
                      <span>เฉพาะภาพด้านหน้า (.jpg)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGeneratingJpg}
                      onClick={() => handleDownloadJpg('back')}
                      className="py-1.5 px-2.5 rounded-lg bg-white/90 border border-[#d5c3b6] hover:bg-[#f7edd7] text-[#201b0e] text-[10.5px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                      title="ดาวน์โหลดเฉพาะบันทึกด้านหลัง"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#465f88]">history_edu</span>
                      <span>เฉพาะบันทึกด้านหลัง (.jpg)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Extra: Mobile Web Share API */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#d5c3b6] hover:bg-[#ece2cc] text-[#201b0e] font-title-md text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px] text-[#6f4315]">share</span>
              <span>แชร์ไปยังแอปอื่นๆ ในเครื่อง (AirDrop, Facebook, Instagram ฯลฯ)</span>
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-3 flex items-center justify-end border-t border-[#ece2cc]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#ece2cc] text-[#51443a] hover:bg-[#d5c3b6] text-xs font-title-md font-bold cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
