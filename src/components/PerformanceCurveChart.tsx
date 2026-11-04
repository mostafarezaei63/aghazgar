import { useState, useMemo } from 'react';
import { MetricDataPoint } from '../types';
import { TrendingUp, Calendar, ChevronDown, Activity, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../utils/persianDate';

type TimeHorizon = '1M' | '3M' | '6M' | '1Y';

type MetricParameter = 'punctualityRate' | 'avgDelayMinutes' | 'progressRate' | 'disciplineScore';

interface PerformanceCurveChartProps {
  historicalData: MetricDataPoint[];
}

export function PerformanceCurveChart({ historicalData }: PerformanceCurveChartProps) {
  const [horizon, setHorizon] = useState<TimeHorizon>('3M');
  const [metric, setMetric] = useState<MetricParameter>('punctualityRate');
  const [hoveredPoint, setHoveredPoint] = useState<MetricDataPoint | null>(null);

  // Filter data points by chosen time horizon
  const filteredData = useMemo(() => {
    const totalPoints = historicalData.length;
    let sliceCount = 4; // 1 month (~4 weeks)
    if (horizon === '3M') sliceCount = 12; // 3 months (~12 weeks)
    if (horizon === '6M') sliceCount = 26; // 6 months (~26 weeks)
    if (horizon === '1Y') sliceCount = totalPoints; // 1 year (all points)

    return historicalData.slice(Math.max(0, totalPoints - sliceCount));
  }, [historicalData, horizon]);

  const metricMeta: Record<
    MetricParameter,
    { label: string; unit: string; color: string; isGoodHigher: boolean; format: (val: number) => string }
  > = {
    punctualityRate: {
      label: 'نرخ شروع به موقع',
      unit: '٪',
      color: '#10b981', // emerald
      isGoodHigher: true,
      format: (v) => `${toPersianDigits(v)}٪`,
    },
    avgDelayMinutes: {
      label: 'میانگین اصطکاک و تأخیر در شروع',
      unit: 'دقیقه',
      color: '#f59e0b', // amber
      isGoodHigher: false,
      format: (v) => `${toPersianDigits(v)} د`,
    },
    progressRate: {
      label: 'درصد میانگین مراحل انجام‌شده',
      unit: '٪',
      color: '#3b82f6', // blue
      isGoodHigher: true,
      format: (v) => `${toPersianDigits(v)}٪`,
    },
    disciplineScore: {
      label: 'شاخص انضباط رفتاری کاربر',
      unit: 'امتیاز',
      color: '#8b5cf6', // purple
      isGoodHigher: true,
      format: (v) => `${toPersianDigits(v)}`,
    },
  };

  const currentMeta = metricMeta[metric];

  // Min and Max for scaling
  const values = filteredData.map((d) => d[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 30;

  // Generate coordinate points
  const points = useMemo(() => {
    if (filteredData.length < 2) return [];
    return filteredData.map((d, index) => {
      const x = paddingX + (index / (filteredData.length - 1)) * (svgWidth - 2 * paddingX);
      const val = d[metric];
      const y = svgHeight - paddingY - ((val - minVal) / valRange) * (svgHeight - 2 * paddingY);
      return { x, y, data: d };
    });
  }, [filteredData, metric, minVal, valRange]);

  // Generate smooth cubic bezier SVG curve
  const curvePath = useMemo(() => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  // Area path for gradient fill under the curve
  const areaPath = useMemo(() => {
    if (!curvePath || points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = svgHeight - paddingY;
    return `${curvePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [curvePath, points]);

  // Calculate overall improvement
  const firstVal = values[0] || 0;
  const lastVal = values[values.length - 1] || 0;
  const delta = lastVal - firstVal;
  const isImproved = currentMeta.isGoodHigher ? delta >= 0 : delta <= 0;

  return (
    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Parameter Selection & Horizon Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">تحلیل نموداری خط و منحنی عملکرد</h3>
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl text-[11px] font-medium font-mono">
            {(['1M', '3M', '6M', '1Y'] as TimeHorizon[]).map((h) => {
              const labelMap = { '1M': '۱ ماه', '3M': '۳ ماه', '6M': '۶ ماه', '1Y': '۱ سال' };
              return (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    horizon === h
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {labelMap[h]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {(Object.keys(metricMeta) as MetricParameter[]).map((key) => {
            const meta = metricMeta[key];
            const isSelected = metric === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setMetric(key);
                  setHoveredPoint(null);
                }}
                className={`p-2 rounded-xl text-right transition-all border text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-950/20 text-white font-bold ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{meta.label}</span>
                <span className="font-mono text-[11px] opacity-75 mt-0.5">
                  فعلی: {meta.format(historicalData[historicalData.length - 1][key])}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Highlight Summary */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">میانگین بازه انتخابی:</span>
          <span className="font-bold text-white font-mono text-sm">
            {currentMeta.format(Math.round(values.reduce((a, b) => a + b, 0) / values.length))}
          </span>
        </div>
        <div className={`font-mono text-xs font-semibold ${isImproved ? 'text-emerald-400' : 'text-rose-400'}`}>
          {delta >= 0 ? `+${toPersianDigits(delta)}` : toPersianDigits(delta)} {currentMeta.unit} (تغییر کل)
        </div>
      </div>

      {/* SVG Curve Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-2xl border border-slate-800/60 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentMeta.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={currentMeta.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = paddingY + pct * (svgHeight - 2 * paddingY);
            const valAtLine = Math.round(maxVal - pct * valRange);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <text
                  x={svgWidth - paddingX + 5}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  direction="ltr"
                >
                  {valAtLine}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          {areaPath && <path d={areaPath} fill={`url(#grad-${metric})`} />}

          {/* Smooth Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke={currentMeta.color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Data Points on Curve */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.timestamp === p.data.timestamp;
            return (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#ffffff' : currentMeta.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                  onMouseEnter={() => setHoveredPoint(p.data)}
                  onClick={() => setHoveredPoint(p.data)}
                />
              </g>
            );
          })}
        </svg>

        {/* Active Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-3 left-4 bg-slate-800/95 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl text-xs text-slate-200 pointer-events-none backdrop-blur-sm">
            <span className="text-[10px] text-slate-400 block">{hoveredPoint.date}</span>
            <span className="font-bold text-emerald-400 font-mono">
              {currentMeta.format(hoveredPoint[metric])}
            </span>
          </div>
        )}
      </div>

      {/* Behavioral Explanation for Horizon */}
      <p className="text-[11px] text-slate-400 leading-relaxed px-1">
        منحنی پیوسته فوق بر اساس داده‌های تجمیعی هفتگی شما در بازه {horizon === '1M' ? '۱ ماهه' : horizon === '3M' ? '۳ ماهه' : horizon === '6M' ? '۶ ماهه' : '۱ ساله گذشته'} ترسیم شده است. روند کاهش اصطکاک و تثبیت شروع به موقع نشان‌دهنده شکل‌گیری مدار عصبی پایدار در رفتار شماست.
      </p>
    </div>
  );
}
