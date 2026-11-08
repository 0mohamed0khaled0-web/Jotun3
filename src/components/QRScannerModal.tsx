import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, Camera, Zap, Image, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ZoneInspection } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ZoneInspection[];
  onZoneScanned: (zoneId: string, notes?: string) => void;
  targetZoneId?: string | null;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  zones,
  onZoneScanned,
  targetZoneId,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{ zone: ZoneInspection; code: string } | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualZoneSelect, setManualZoneSelect] = useState<string>(targetZoneId || zones[0]?.id || '');
  const [scanNotes, setScanNotes] = useState<string>('');
  const animFrameIdRef = useRef<number | null>(null);

  // Play audio beep on scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz (A5)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Start Camera
  const startCamera = async () => {
    setErrorMessage(null);
    setScannedResult(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check torch capability
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
      if (capabilities && 'torch' in capabilities) {
        setHasTorch(true);
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setHasCamera(false);
      setErrorMessage('تعذر الوصول للكاميرا تلقائياً. يمكنك رفع صورة أو مسح المنطقة يدوياً.');
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const newTorchState = !isTorchOn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (track as any).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setIsTorchOn(newTorchState);
    } catch (e) {
      console.warn('Failed to toggle torch', e);
    }
  };

  // Main QR detection loop
  useEffect(() => {
    if (!isOpen || !hasCamera) return;

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleCodeFound(code.data);
            return;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen, hasCamera, zones]);

  // Handle scanned string
  const handleCodeFound = (codeText: string) => {
    playBeep();
    // Try to match against zone code or zone name
    const foundZone = zones.find(
      (z) =>
        z.code.toLowerCase() === codeText.trim().toLowerCase() ||
        codeText.includes(z.code) ||
        codeText.includes(z.name) ||
        z.id === codeText
    );

    if (foundZone) {
      setScannedResult({ zone: foundZone, code: codeText });
    } else {
      // If code doesn't match predefined codes, let the user choose which zone
      const fallbackZone = targetZoneId
        ? zones.find((z) => z.id === targetZoneId)
        : zones[0];
      if (fallbackZone) {
        setScannedResult({ zone: fallbackZone, code: codeText });
      }
    }
  };

  // Scan from uploaded photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleCodeFound(code.data);
          } else {
            alert('لم يتم العثور على رمز QR واضح في الصورة المرفقة. يمكنك التحقق يدوياً.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Save Scan
  const handleConfirmScan = () => {
    if (scannedResult) {
      onZoneScanned(scannedResult.zone.id, scanNotes);
      onClose();
    }
  };

  // Manual Check-in
  const handleManualCheckin = () => {
    const zone = zones.find((z) => z.id === manualZoneSelect);
    if (zone) {
      playBeep();
      setScannedResult({ zone, code: zone.code });
    }
  };

  // Setup / Teardown
  useEffect(() => {
    if (isOpen) {
      startCamera();
      if (targetZoneId) {
        setManualZoneSelect(targetZoneId);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setScannedResult(null);
      setScanNotes('');
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const targetZone = targetZoneId ? zones.find((z) => z.id === targetZoneId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ماسح كيو ار الجولة الأمنية</h3>
              <p className="text-[11px] text-slate-400">
                {targetZone ? `فحص محدد: ${targetZone.name}` : 'وجّه الكاميرا نحو كود المنطقة بيوتن'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Result Viewport */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {scannedResult ? (
            /* Scanned Success Confirmation Card */
            <div className="p-6 text-center w-full max-w-md animate-scale-up space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                  تم مسح الكيو ار بنجاح
                </span>
                <h4 className="text-xl font-black text-white">{scannedResult.zone.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">{scannedResult.zone.code}</p>
                <p className="text-xs text-slate-300 mt-1">{scannedResult.zone.description}</p>
              </div>

              {/* Quick Notes box */}
              <div className="text-right space-y-1">
                <label className="text-xs text-slate-300 font-medium">تدوين ملاحظة سريعة على الموقع (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: الموقع سليم، أو عطل بالإنارة، تسريب..."
                  value={scanNotes}
                  onChange={(e) => setScanNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  إعادة المسح
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScan}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  تأكيد واعتماد الموقع
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center bg-slate-950">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Reticle overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                  {/* Laser scan line animation */}
                  <div className="absolute inset-x-2 h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-bounce" />
                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-300 rounded-tr-lg" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-300 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-300 rounded-br-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-300 rounded-bl-lg" />
                </div>
              </div>

              {/* Torch Button */}
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  type="button"
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                    isTorchOn
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                  title="تشغيل كشاف الإضاءة"
                >
                  <Zap className="w-5 h-5" />
                </button>
              )}

              {/* Camera status error notice */}
              {hasCamera === false && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm text-slate-200">
                    لم نتمكن من فتح الكاميرا في المتصفح. يمكنك اختيار المنطقة يدوياً أو رفع صورة الكود.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة محاولة الاتصال بالكاميرا</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Options: File Upload & Manual Selection */}
        {!scannedResult && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>خيارات بديلة لتسجيل المرور:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Photo Upload */}
              <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors">
                <Image className="w-4 h-4 text-amber-400" />
                <span>رفع صورة كيو ار</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Manual Simulation Button */}
              <div className="flex gap-1.5">
                <select
                  value={manualZoneSelect}
                  onChange={(e) => setManualZoneSelect(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} {z.isScanned ? '✓' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleManualCheckin}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl whitespace-nowrap"
                  title="تسجيل وصول يدوي للمنطقة"
                >
                  مسح
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
