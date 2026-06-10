import React from 'react';
import { Sparkline } from './Sparkline';
import { AnimatedCount } from './AnimatedCount';

// Composant Widget Bento avec style néo-brutaliste, animations staggered et count-up
export function BentoWidget({
  label,
  value,
  color,
  icon: Icon,
  trend,
  loading,
  index
}: {
  label: string;
  value: number;
  color: string;
  icon: any;
  trend: number[];
  loading: boolean;
  index: number;
}) {
  return (
    <div
      className="border-2 border-black rounded-[18px] p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden animate-fade-slide-up hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000000] transition-all duration-200 motion-reduce:animate-none motion-reduce:transition-none"
      style={{
        backgroundColor: color,
        animationDelay: `${index * 80}ms`
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Label écrit en minuscules/capitalisation normale pour éviter l'automatisme IA */}
          <p className="font-sans font-bold text-xs text-black/80 lowercase tracking-wide mb-1">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-black/10 rounded animate-pulse" />
          ) : (
            <p className="font-mono font-extrabold text-3xl text-black tracking-tight">
              <AnimatedCount value={value} />
            </p>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
          <Icon size={16} className="text-black" />
        </div>
      </div>

      {/* Tendance sur les 7 derniers jours */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/15">
        <span className="text-[10px] font-mono text-black/60 font-medium">7 derniers jours</span>
        <div className="opacity-90">
          <Sparkline points={trend} color="#000000" />
        </div>
      </div>
    </div>
  );
}