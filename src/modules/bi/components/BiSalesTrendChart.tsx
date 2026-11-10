import React, { useState } from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import { BarChart3, Building2 } from 'lucide-react';

interface BiSalesTrendChartProps {
  data: BusinessIntelligenceData;
}

export const BiSalesTrendChart: React.FC<BiSalesTrendChartProps> = ({ data }) => {
  const { dailyTrend } = data;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxDaily = Math.max(...dailyTrend.map((d) => d.totalPesos), 100);
  const chartHeight = 160;
  const barWidth = 28;
  const gap = 16;
  const totalWidth = Math.max(dailyTrend.length * (barWidth + gap) + 40, 360);

  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Tendencia de Facturación Diaria por Sucursal
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1B5E91] border border-white" />
            LOCALES
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6] border border-white" />
            CARRERAS
          </span>
        </div>
      </div>

      <div className="p-4">
        {dailyTrend.length === 0 || maxDaily <= 100 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No hay registros de ventas en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <svg
              viewBox={`0 0 ${totalWidth} ${chartHeight + 50}`}
              className="w-full h-48 select-none"
              style={{ minWidth: `${totalWidth}px` }}
            >
              {/* Líneas de cuadrícula horizontal */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - ratio * (chartHeight - 20) + 10;
                const value = Math.round(maxDaily * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={30}
                      y1={y}
                      x2={totalWidth - 10}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <text
                      x={26}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      className="fill-slate-400 font-mono"
                    >
                      ${value >= 1000 ? `${Math.round(value / 1000)}k` : value}
                    </text>
                  </g>
                );
              })}

              {/* Barras por día */}
              {dailyTrend.map((day, idx) => {
                const x = 40 + idx * (barWidth + gap);
                const localesHeight =
                  maxDaily > 0 ? (day.localesPesos / maxDaily) * (chartHeight - 20) : 0;
                const carrerasHeight =
                  maxDaily > 0 ? (day.carrerasPesos / maxDaily) * (chartHeight - 20) : 0;
                const totalHeight = localesHeight + carrerasHeight;
                const isHovered = hoveredIndex === idx;

                const localesY = chartHeight - localesHeight + 10;
                const carrerasY = localesY - carrerasHeight;

                return (
                  <g
                    key={day.date}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-opacity"
                    opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
                  >
                    {/* Barra de fondo de hover */}
                    {isHovered && (
                      <rect
                        x={x - 4}
                        y={5}
                        width={barWidth + 8}
                        height={chartHeight + 15}
                        rx="4"
                        className="fill-blue-50/50 dark:fill-blue-900/20"
                      />
                    )}

                    {/* Barra LOCALES */}
                    <rect
                      x={x}
                      y={localesY}
                      width={barWidth}
                      height={Math.max(localesHeight, 0)}
                      rx="2"
                      className="fill-[#1B5E91] transition-all"
                    />

                    {/* Barra CARRERAS (apilada sobre LOCALES) */}
                    <rect
                      x={x}
                      y={carrerasY}
                      width={barWidth}
                      height={Math.max(carrerasHeight, 0)}
                      rx="2"
                      className="fill-[#8B5CF6] transition-all"
                    />

                    {/* Etiqueta del eje X (Día) */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 28}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      className={
                        isHovered
                          ? 'fill-[#1B5E91] dark:fill-sky-300 font-bold'
                          : 'fill-slate-500 dark:fill-slate-400'
                      }
                    >
                      {day.label}
                    </text>

                    {/* Monto total encima de la barra si > 0 */}
                    {day.totalPesos > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(carrerasY - 4, 12)}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="bold"
                        className="fill-slate-700 dark:fill-slate-300 font-mono"
                      >
                        ${day.totalPesos >= 1000
                          ? `${Math.round(day.totalPesos / 1000)}k`
                          : Math.round(day.totalPesos)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Detalle en vivo del día seleccionado (Tooltip inferior) */}
        {hoveredIndex !== null && dailyTrend[hoveredIndex] && (
          <div className="mt-2 rounded border border-[#9CC2E5] bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#1B5E91] dark:text-sky-300">
                {dailyTrend[hoveredIndex].label} ({dailyTrend[hoveredIndex].date}):
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                ${dailyTrend[hoveredIndex].totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                ({dailyTrend[hoveredIndex].transactions} ventas)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-[#1B5E91] dark:text-sky-300 font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                LOCALES: ${dailyTrend[hoveredIndex].localesPesos.toLocaleString('es-AR')}
              </span>
              <span className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                CARRERAS: ${dailyTrend[hoveredIndex].carrerasPesos.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
