import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Compass, Play, RotateCcw, Maximize2, Minimize2, CheckCircle2, History } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { db } from '../../../services/db';
import { Student } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

export const WheelOfFortunePage: React.FC = () => {
  const { activeClassId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Student | null>(null);
  const [history, setHistory] = useState<Student[]>([]);
  const [excludeSelected, setExcludeSelected] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const list = db.getStudents(activeClassId);
    setStudents(list);
  }, [activeClassId]);

  const availableStudents = excludeSelected
    ? students.filter(s => !history.some(h => h.id === s.id))
    : students;

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    const items = availableStudents.length > 0 ? availableStudents : students;
    const sliceAngle = (2 * Math.PI) / items.length;

    const colors = [
      '#2563EB', '#7C3AED', '#16A34A', '#F59E0B',
      '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6',
      '#10B981', '#3B82F6', '#F97316', '#6366F1'
    ];

    items.forEach((st, idx) => {
      const startAngle = angle + idx * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(st.fullName, radius - 20, 4);
      ctx.restore();
    });

    // Center pin circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QUAY', centerX, centerY + 4);
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [availableStudents]);

  const spinWheel = () => {
    if (spinning || availableStudents.length === 0) return;

    setSpinning(true);
    setSelectedWinner(null);

    const fullSpins = 5 + Math.random() * 5;
    const totalRotation = fullSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 4000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * ease;
      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Determine winner: top pointer is at angle -PI/2 (or 3PI/2)
        const normalizedAngle = (currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / availableStudents.length;
        // Pointer is at 0 rad (right), let's calculate based on right edge (or top)
        const pointerAngle = (2 * Math.PI - (normalizedAngle % (2 * Math.PI))) % (2 * Math.PI);
        const winnerIndex = Math.floor(pointerAngle / sliceAngle) % availableStudents.length;
        const winner = availableStudents[winnerIndex];

        setSelectedWinner(winner);
        setHistory(prev => [winner, ...prev]);

        // Launch celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className={`space-y-5 ${isFullscreen ? 'bg-slate-900 p-8 min-h-screen text-white' : ''}`}>
      {!isFullscreen && (
        <PageHeader
          breadcrumbItems={[
            { label: 'Tiện ích lớp học', href: '/teacher/tools' },
            { label: 'Vòng quay may mắn' },
          ]}
          title="Vòng quay gọi tên ngẫu nhiên"
          action={
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-[#041527] border border-[#0e3d54] hover:bg-[#072540] text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Toàn màn hình máy chiếu</span>
            </button>
          }
        />
      )}

      {/* Main Wheel View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col items-center justify-center relative shadow-xs">
          {/* Wheel Pointer Indicator */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-0 h-0 border-y-[14px] border-y-transparent border-r-[24px] border-r-slate-900 drop-shadow-md" />

          <canvas
            ref={canvasRef}
            width={440}
            height={440}
            className="max-w-full h-auto cursor-pointer"
            onClick={spinWheel}
          />

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={spinWheel}
              disabled={spinning || availableStudents.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{spinning ? 'Đang quay...' : 'QUAY NGAY'}</span>
            </button>
            <button
              onClick={() => {
                setHistory([]);
                setSelectedWinner(null);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại lượt</span>
            </button>
          </div>

          {/* Winner Banner */}
          {selectedWinner && (
            <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95 duration-150">
              <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                Chúc mừng học sinh được chọn
              </span>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">
                {selectedWinner.rollNumber}. {selectedWinner.fullName}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {selectedWinner.studentCode} · {selectedWinner.team}
              </div>
            </div>
          )}
        </div>

        {/* Right Settings & History */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tùy chọn vòng quay</h3>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeSelected}
                onChange={e => setExcludeSelected(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Tránh gọi lặp (loại trừ đã gọi)</span>
            </label>
            <div className="text-[11px] text-slate-400 mt-2">
              Còn lại: <strong className="text-slate-800 tabular-nums">{availableStudents.length}</strong> / {students.length} học sinh
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <History className="w-4 h-4 text-slate-400" />
                <span>Lịch sử đã gọi ({history.length})</span>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Xóa
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                Chưa có học sinh nào được gọi trong phiên này.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {history.map((st, i) => (
                  <div
                    key={`${st.id}_${i}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {i + 1}. {st.fullName}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">{st.studentCode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
