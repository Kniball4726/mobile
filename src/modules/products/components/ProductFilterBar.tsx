import React from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { CategoryItem } from '../../../types/domain.types';

interface ProductFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: CategoryItem[];
  includeInactive: boolean;
  setIncludeInactive: (val: boolean) => void;
  loading: boolean;
  onRefresh: () => void;
  onNewProduct: () => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  includeInactive,
  setIncludeInactive,
  loading,
  onRefresh,
  onNewProduct,
}) => {
  return (
    <div className="justi-filter-bar flex flex-col md:flex-row md:items-center justify-between gap-2.5 rounded-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2 text-xs">
        {/* Buscador */}
        <div className="relative col-span-1 sm:col-span-2 md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, SKU o Código..."
            className="w-full rounded border border-slate-400 bg-white pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B5E91]"
          />
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Selector de Categoría */}
        <label className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
            Categoría:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded border border-slate-400 bg-white px-2 py-1 text-xs text-slate-800"
          >
            <option value="ALL">(Todas las categorías)</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Checkbox Inactivos */}
        <label className="flex items-center gap-1.5 cursor-pointer bg-white/20 px-2 py-1 rounded text-[11px]">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          <span>Ver Inactivos</span>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          title="Refrescar catálogo"
          className="justi-btn-primary py-1.5 px-2 text-xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onNewProduct}
          className="justi-btn-primary py-1.5 px-3 text-xs font-bold whitespace-nowrap"
        >
          <Plus className="mr-1 h-3.5 w-3.5 inline" />
          Nuevo Producto
        </button>
      </div>
    </div>
  );
};
