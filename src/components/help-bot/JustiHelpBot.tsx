import React, { useState, useMemo } from 'react';
import { useBranding } from '../../context/BrandingContext';
import {
  ActiveScreen,
  MasterTab,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { HELP_TOPICS, HelpTopic } from './help-content';
import {
  Bot,
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Building2,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';

interface JustiHelpBotProps {
  user: UserProfile;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab | MasterTab) => void;
}

export const JustiHelpBot: React.FC<JustiHelpBotProps> = ({
  user,
  onNavigate,
}) => {
  const { branding } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [showAllRoles, setShowAllRoles] = useState(false);

  // Filtrar temas según el rol del usuario o búsqueda
  const filteredTopics = useMemo(() => {
    let list = HELP_TOPICS;

    // Si no marcó "Ver todos los roles", mostrar los temas de su rol
    if (!showAllRoles) {
      list = list.filter((topic) => topic.roles.includes(user.role));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.question.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.steps.some((s) => s.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [user.role, showAllRoles, searchQuery]);

  const handleSelectTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
  };

  const handleBackToList = () => {
    setSelectedTopic(null);
  };

  const handleActionClick = (topic: HelpTopic) => {
    if (topic.targetScreen) {
      onNavigate(topic.targetScreen, topic.targetTab);
      setIsOpen(false);
      setSelectedTopic(null);
    }
  };

  return (
    <>
      {/* Botón Flotante (FAB) para abrir el Asistente */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 right-3 sm:bottom-4 sm:right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1B5E91] to-[#2563EB] text-white px-3.5 py-2.5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all select-none group border border-white/20"
          title="Abrir Asistente de Ayuda JustiBot"
          aria-label="Asistente de Ayuda JustiBot"
        >
          <div className="relative">
            <Bot className="h-5 w-5 text-amber-300 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide drop-shadow-xs">
            Ayuda JustiBot
          </span>
        </button>
      )}

      {/* Ventana Asistente Modal / Drawer Flotante */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96 sm:max-h-[620px] h-full sm:h-[620px] z-50 flex flex-col bg-white dark:bg-slate-900 sm:rounded-xl shadow-2xl border border-[#80AED8] dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera del Asistente */}
          <div className="bg-gradient-to-r from-[#1B5E91] to-[#2563EB] text-white p-3.5 flex items-center justify-between select-none shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-white/15 p-1.5 border border-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">
                    JustiBot Copiloto
                  </h3>
                  <span className="bg-emerald-400 text-slate-900 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                    Offline
                  </span>
                </div>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span>{branding.companyName || 'JustiMobile POS'}</span>
                  <span>•</span>
                  <span className="font-semibold text-amber-200">
                    Rol: {user.role}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedTopic(null);
                }}
                className="rounded-full p-1.5 hover:bg-white/20 text-white transition active:scale-90"
                title="Cerrar asistente"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subbarra de Contexto del Operador */}
          <div className="bg-[#EBF4FC] dark:bg-slate-800/80 px-3.5 py-1.5 border-b border-[#B8D7F5] dark:border-slate-700 text-[11px] flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="truncate font-semibold">
              ¡Hola, {user.fullName.split(' ')[0]}!
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#1B5E91] dark:text-sky-300 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-[#9CC2E5] dark:border-slate-600">
              <Building2 className="h-3 w-3" />
              {user.branch || 'LOCALES'}
            </span>
          </div>

          {/* CUERPO: VISTA DETALLE DE PREGUNTA O VISTA LISTA */}
          {selectedTopic ? (
            /* Vista Detalle de la Pregunta / Respuesta Guiada */
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1B5E91] dark:text-sky-300 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a la lista de temas
              </button>

              <div>
                <span className="inline-block rounded bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-sky-300 border border-[#9CC2E5] dark:border-slate-700 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                  {selectedTopic.category}
                </span>
                <h4 className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {selectedTopic.question}
                </h4>
              </div>

              {/* Resumen */}
              <div className="rounded border-l-4 border-[#1B5E91] bg-blue-50/60 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedTopic.summary}
              </div>

              {/* Paso a Paso Guiado */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Procedimiento Paso a Paso:
                </h5>
                <ol className="space-y-2 text-xs">
                  {selectedTopic.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 bg-[#F8FAFD] dark:bg-slate-800/40 p-2 rounded border border-slate-200 dark:border-slate-700/60"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#1B5E91] text-white font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Consejos Adicionales */}
              {selectedTopic.tips && selectedTopic.tips.length > 0 && (
                <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-[11px] block">
                      Consejo Práctico:
                    </span>
                    {selectedTopic.tips.map((tip, idx) => (
                      <p key={idx} className="text-[11px]">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de Acción Directa (Navegación Asistida) */}
              {selectedTopic.targetScreen && selectedTopic.actionButtonText && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleActionClick(selectedTopic)}
                    className="w-full flex items-center justify-center gap-2 rounded bg-gradient-to-r from-[#1B5E91] to-[#2563EB] text-white py-2 px-3 text-xs font-extrabold shadow hover:from-[#174D77] hover:to-[#1D4ED8] active:scale-[0.98] transition"
                  >
                    <span>{selectedTopic.actionButtonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Vista Lista de Preguntas / Buscador */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Buscador de Ayuda */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFD] dark:bg-slate-900/60 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar tema, arqueo, QR, precios..."
                    className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E91]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtro de rol */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[#1B5E91]" />
                    {showAllRoles ? 'Todos los Roles' : `Guías para ${user.role}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllRoles(!showAllRoles)}
                    className="text-[#1B5E91] dark:text-sky-300 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Layers className="h-3 w-3" />
                    {showAllRoles ? 'Solo mi rol' : 'Ver todos los roles'}
                  </button>
                </div>
              </div>

              {/* Lista Scrollable de Preguntas */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
                {filteredTopics.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                    <HelpCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-bold">No se encontraron temas coincidentes.</p>
                    <p className="text-[11px]">
                      Intente buscar por "caja", "arqueo", "descuento", "precios" o "offline".
                    </p>
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-[#EBF4FC] dark:hover:bg-slate-700/50 hover:border-[#9CC2E5] transition active:scale-[0.99] flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="space-y-1 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block rounded bg-[#DCEAF7] dark:bg-slate-700 text-[#1B5E91] dark:text-sky-300 text-[9px] font-extrabold uppercase px-1.5 py-0.2">
                            {topic.category}
                          </span>
                          {showAllRoles && (
                            <span className="text-[9px] font-bold text-slate-400">
                              [{topic.roles.join(', ')}]
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1B5E91] dark:group-hover:text-sky-300 text-xs leading-snug">
                          {topic.question}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {topic.summary}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#1B5E91] dark:group-hover:text-sky-300 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pie del Asistente */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-center text-[10px] text-slate-500 dark:text-slate-400 select-none">
            JustiBot v2.0 • {branding.companyName || 'SaaS Multi-Tenant'} • Soporte 100% Offline
          </div>
        </div>
      )}
    </>
  );
};
