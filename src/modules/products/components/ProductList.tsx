import React from 'react';
import { DollarSign, Edit2, Power } from 'lucide-react';
import { ProductItem } from '../../../types/domain.types';

interface ProductListProps {
  products: ProductItem[];
  categoriesMap: Map<string, string>;
  loading: boolean;
  onOpenQuickPrice: (product: ProductItem) => void;
  onOpenEditProduct: (product: ProductItem) => void;
  onToggleActive: (product: ProductItem) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categoriesMap,
  loading,
  onOpenQuickPrice,
  onOpenEditProduct,
  onToggleActive,
}) => {
  return (
    <>
      {/* Encabezado Azul de Resultados */}
      <div className="bg-[#4E8EC2] px-3 py-1.5 text-white flex items-center justify-between text-xs rounded-t-sm">
        <span>
          {products.length} producto{products.length === 1 ? '' : 's'}{' '}
          encontrado{products.length === 1 ? '' : 's'}
        </span>
        <span className="text-[11px] text-white/90">
          Haga clic en <strong>"Modificar Precio"</strong> para actualizar el
          valor de venta instantáneamente
        </span>
      </div>

      {/* Vista Móvil (< md): Tarjetas de Productos */}
      <div className="md:hidden space-y-2">
        {loading && products.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 bg-white border border-[#9CC2E5] rounded">
            Cargando catálogo de productos...
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 bg-white border border-[#9CC2E5] rounded">
            No se encontraron productos con ese criterio.
          </div>
        ) : (
          products.map((p, idx) => {
            const displayPrice =
              p.priceCents > 0 ? p.priceCents / 100 : p.price || 0;
            return (
              <div
                key={p._id}
                className={`rounded border border-[#80AED8] p-3 text-xs shadow-sm ${
                  !p.isActive
                    ? 'bg-slate-100 opacity-60'
                    : idx % 2 === 0
                      ? 'bg-[#E5E5F7]'
                      : 'bg-[#F4F4FB]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 border border-slate-300 rounded">
                        SKU: {p.sku}
                      </span>
                      <span className="text-[10px] text-[#1B5E91] font-semibold">
                        {categoriesMap.get(p.categoryId) || 'General'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {p.name}
                    </h3>
                    {p.barcode && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        EAN: {p.barcode}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="block text-base font-black text-emerald-800">
                      $
                      {displayPrice.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-300/80 flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-600">
                    Stock: <strong>{p.stock}</strong> u.
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenQuickPrice(p)}
                      className="justi-btn-primary py-1 px-2.5 text-xs font-bold flex items-center gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      Precio
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenEditProduct(p)}
                      className="justi-btn-primary py-1 px-2 text-xs"
                      title="Editar datos completos"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(p)}
                      className={`p-1 rounded border text-xs ${
                        p.isActive
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={p.isActive ? 'Desactivar' : 'Reactivar'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vista Tabla Desktop (>= md) */}
      <div className="hidden md:block border border-[#80AED8] bg-white overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
              <th className="py-2 px-2.5 text-center w-28">Acciones</th>
              <th className="py-2 px-2">SKU</th>
              <th className="py-2 px-2">Código Barras</th>
              <th className="py-2 px-3">Descripción / Producto</th>
              <th className="py-2 px-2">Categoría</th>
              <th className="py-2 px-3 text-right">Precio Venta ($)</th>
              <th className="py-2 px-2 text-right">Costo ($)</th>
              <th className="py-2 px-2 text-center">Stock</th>
              <th className="py-2 px-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Cargando productos de MongoDB Atlas...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No se encontraron productos coincidentes.
                </td>
              </tr>
            ) : (
              products.map((p, idx) => {
                const displayPrice =
                  p.priceCents > 0 ? p.priceCents / 100 : p.price || 0;
                const displayCost =
                  (p.costCents || 0) > 0 ? (p.costCents || 0) / 100 : 0;
                return (
                  <tr
                    key={p._id}
                    className={`border-b border-slate-200 transition-colors ${
                      !p.isActive
                        ? 'bg-slate-100 opacity-60'
                        : idx % 2 === 0
                          ? 'justi-table-row-even'
                          : 'justi-table-row-odd'
                    } hover:bg-[#D3E7F8]`}
                  >
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenQuickPrice(p)}
                          title="Modificar Precio Rápido"
                          className="inline-flex items-center gap-0.5 rounded border border-[#80AED8] bg-[#E8F2FC] px-1.5 py-0.5 text-[11px] font-bold text-[#1B5E91] hover:bg-[#CBE3FA]"
                        >
                          <DollarSign className="h-3 w-3" />
                          Precio
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditProduct(p)}
                          title="Editar Datos"
                          className="rounded border border-[#80AED8] bg-[#E8F2FC] p-1 text-[#1B5E91] hover:bg-[#CBE3FA]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleActive(p)}
                          title={
                            p.isActive
                              ? 'Desactivar producto'
                              : 'Reactivar producto'
                          }
                          className={`rounded border p-1 ${
                            p.isActive
                              ? 'border-red-300 text-red-700 hover:bg-red-100'
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-800">
                      {p.sku}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-[11px]">
                      {p.barcode || '-'}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-1.5 px-2 text-slate-700">
                      {categoriesMap.get(p.categoryId) || 'General'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-black text-sm text-emerald-800">
                      $
                      {displayPrice.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                      $
                      {displayCost.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={`font-semibold ${
                          p.stock <= (p.minStockAlert || 5)
                            ? 'text-amber-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {p.stock} {p.unit || 'u.'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
