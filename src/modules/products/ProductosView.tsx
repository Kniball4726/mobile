import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CategoryItem,
  CreateProductInput,
  ProductItem,
  UpdateProductInput,
} from '../../types/domain.types';
import { CatalogApi } from '../../services/api.service';
import {
  DollarSign,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
  X,
  CheckCircle2,
  AlertTriangle,
  Power,
} from 'lucide-react';

interface ProductosViewProps {
  token: string;
  onProductUpdated?: () => void;
}

export const ProductosView: React.FC<ProductosViewProps> = ({
  token,
  onProductUpdated,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal para edición rápida de precio
  const [quickPriceProduct, setQuickPriceProduct] =
    useState<ProductItem | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [quickCostValue, setQuickCostValue] = useState<string>('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Modal para creación o edición completa
  const [fullModalOpen, setFullModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formUnit, setFormUnit] = useState<'UNIT' | 'KG' | 'LITER'>('UNIT');
  const [savingFull, setSavingFull] = useState(false);

  // Cargar categorías y productos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        CatalogApi.listCategories(token),
        CatalogApi.listProducts(token, {
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: search.trim() || undefined,
          includeInactive,
        }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al consultar productos del catálogo.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  // Manejo de Edición Rápida de Precio
  const openQuickPriceModal = (product: ProductItem) => {
    setQuickPriceProduct(product);
    const priceInPesos =
      product.priceCents > 0
        ? (product.priceCents / 100).toFixed(2)
        : String(product.price || 0);
    const costInPesos =
      (product.costCents || 0) > 0
        ? ((product.costCents || 0) / 100).toFixed(2)
        : '0.00';
    setQuickPriceValue(priceInPesos);
    setQuickCostValue(costInPesos);
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceProduct) return;

    const parsedPrice = parseFloat(quickPriceValue);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Por favor ingrese un precio válido.');
      return;
    }

    const priceCents = Math.round(parsedPrice * 100);
    const costCents = Math.round((parseFloat(quickCostValue) || 0) * 100);

    setSavingPrice(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await CatalogApi.updateProduct(token, quickPriceProduct._id, {
        priceCents,
        costCents,
      });

      setSuccessMsg(
        `Precio de "${quickPriceProduct.name}" actualizado a $${parsedPrice.toLocaleString(
          'es-AR',
          { minimumFractionDigits: 2 },
        )} correctamente.`,
      );
      setQuickPriceProduct(null);
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar el precio del producto.',
      );
    } finally {
      setSavingPrice(false);
    }
  };

  // Manejo de Creación / Edición Completa
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormBarcode('');
    setFormCategoryId(categories[0]?._id || '');
    setFormPrice('');
    setFormCost('');
    setFormStock('0');
    setFormMinStock('5');
    setFormUnit('UNIT');
    setFullModalOpen(true);
  };

  const openEditProductModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormCategoryId(product.categoryId);
    setFormPrice(
      product.priceCents > 0
        ? (product.priceCents / 100).toFixed(2)
        : String(product.price || 0),
    );
    setFormCost(
      (product.costCents || 0) > 0
        ? ((product.costCents || 0) / 100).toFixed(2)
        : '0.00',
    );
    setFormStock(String(product.stock || 0));
    setFormMinStock(String(product.minStockAlert || 5));
    setFormUnit(product.unit || 'UNIT');
    setFullModalOpen(true);
  };

  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryId) {
      setError('Debe seleccionar una categoría para el producto.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a cero.');
      return;
    }

    const priceCents = Math.round(priceNum * 100);
    const costCents = Math.round((parseFloat(formCost) || 0) * 100);
    const stockNum = Math.max(0, parseInt(formStock, 10) || 0);
    const minStockNum = Math.max(0, parseInt(formMinStock, 10) || 5);

    setSavingFull(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingProduct) {
        const updatePayload: UpdateProductInput = {
          name: formName.trim(),
          sku: formSku.trim().toUpperCase(),
          barcode: formBarcode.trim() || null,
          categoryId: formCategoryId,
          priceCents,
          costCents,
          stock: stockNum,
          minStockAlert: minStockNum,
        };
        await CatalogApi.updateProduct(token, editingProduct._id, updatePayload);
        setSuccessMsg(`Producto "${formName}" actualizado exitosamente.`);
      } else {
        const createPayload: CreateProductInput = {
          name: formName.trim(),
          sku: formSku.trim().toUpperCase(),
          barcode: formBarcode.trim() || null,
          categoryId: formCategoryId,
          priceCents,
          costCents,
          initialStock: stockNum,
          minStockAlert: minStockNum,
          unit: formUnit,
        };
        await CatalogApi.createProduct(token, createPayload);
        setSuccessMsg(
          `Producto "${formName}" creado y habilitado en catálogo.`,
        );
      }
      setFullModalOpen(false);
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al guardar el producto en el catálogo.',
      );
    } finally {
      setSavingFull(false);
    }
  };

  // Toggle de Estado Activo / Inactivo
  const handleToggleActive = async (product: ProductItem) => {
    const nextState = !product.isActive;
    const confirmText = nextState
      ? `¿Desea reactivar el producto "${product.name}"?`
      : `¿Desea desactivar el producto "${product.name}"? No aparecerá en las ventas de POS.`;

    if (!window.confirm(confirmText)) return;

    setError(null);
    setSuccessMsg(null);
    try {
      await CatalogApi.updateProduct(token, product._id, {
        isActive: nextState,
      });
      setSuccessMsg(
        `Producto "${product.name}" ${
          nextState ? 'reactivado' : 'desactivado'
        } correctamente.`,
      );
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar el estado del producto.',
      );
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip flex items-center justify-between">
        <span>Gestión de Catálogo y Modificación de Precios</span>
        <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
          Acceso exclusivo Administrador / Master
        </span>
      </div>

      <div className="p-2 sm:p-4 space-y-3 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {successMsg && <div className="justi-alert-success">{successMsg}</div>}

        {/* Barra de Filtros y Acciones */}
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
              onClick={loadData}
              title="Refrescar catálogo"
              className="justi-btn-primary py-1.5 px-2 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={openNewProductModal}
              className="justi-btn-primary py-1.5 px-3 text-xs font-bold whitespace-nowrap"
            >
              <Plus className="mr-1 h-3.5 w-3.5 inline" />
              Nuevo Producto
            </button>
          </div>
        </div>

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
                        onClick={() => openQuickPriceModal(p)}
                        className="justi-btn-primary py-1 px-2.5 text-xs font-bold flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        Precio
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditProductModal(p)}
                        className="justi-btn-primary py-1 px-2 text-xs"
                        title="Editar datos completos"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
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
                            onClick={() => openQuickPriceModal(p)}
                            title="Modificar Precio Rápido"
                            className="inline-flex items-center gap-0.5 rounded border border-[#80AED8] bg-[#E8F2FC] px-1.5 py-0.5 text-[11px] font-bold text-[#1B5E91] hover:bg-[#CBE3FA]"
                          >
                            <DollarSign className="h-3 w-3" />
                            Precio
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            title="Editar Datos"
                            className="rounded border border-[#80AED8] bg-[#E8F2FC] p-1 text-[#1B5E91] hover:bg-[#CBE3FA]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
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
      </div>

      {/* MODAL 1: MODIFICACIÓN RÁPIDA DE PRECIO */}
      {quickPriceProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="w-full max-w-sm rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl overflow-hidden">
            <div className="bg-[#4E8EC2] px-4 py-2.5 text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Modificar Precio de Venta
              </span>
              <button
                type="button"
                onClick={() => setQuickPriceProduct(null)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="p-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  SKU: {quickPriceProduct.sku}
                </span>
                <h4 className="text-sm font-extrabold text-[#1B5E91]">
                  {quickPriceProduct.name}
                </h4>
              </div>

              <div className="border-t border-slate-300 pt-3 space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nuevo Precio de Venta ($ ARS) *:
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-sm font-bold text-slate-600">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      autoFocus
                      value={quickPriceValue}
                      onChange={(e) => setQuickPriceValue(e.target.value)}
                      placeholder="0.00"
                      className="justi-input w-full pl-7 pr-3 text-right font-black text-lg text-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Costo de Adquisición ($ ARS) - Opcional:
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quickCostValue}
                      onChange={(e) => setQuickCostValue(e.target.value)}
                      placeholder="0.00"
                      className="justi-input w-full pl-7 pr-3 text-right text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#9CC2E5] bg-[#DCEAF7] p-2 text-[11px] text-[#1B5E91] leading-snug">
                El nuevo precio impactará de inmediato en el cobro del POS y en
                la base de datos de MongoDB Atlas.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="justi-btn-primary py-2 font-bold"
                >
                  {savingPrice ? 'Guardando...' : 'Guardar Precio'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPriceProduct(null)}
                  className="justi-btn-primary py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREACIÓN / EDICIÓN COMPLETA */}
      {fullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 overflow-y-auto">
          <div className="w-full max-w-lg rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl overflow-hidden my-4">
            <div className="bg-[#4E8EC2] px-4 py-2.5 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingProduct
                  ? `Editar Producto: ${editingProduct.sku}`
                  : 'Nuevo Producto en Catálogo'}
              </span>
              <button
                type="button"
                onClick={() => setFullModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFullProduct} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                  Nombre / Descripción del Artículo *:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: CREATINA MONOHIDRATO 300G"
                  className="justi-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Código SKU *:
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="Ej: 301 o CREA-300"
                    className="justi-input w-full uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Código de Barras (EAN):
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="7798123456789"
                    className="justi-input w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Categoría *:
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="justi-select w-full"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Unidad de Medida:
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) =>
                      setFormUnit(e.target.value as 'UNIT' | 'KG' | 'LITER')
                    }
                    className="justi-select w-full"
                  >
                    <option value="UNIT">Unidad (UNIT)</option>
                    <option value="KG">Kilogramo (KG)</option>
                    <option value="LITER">Litro (LITER)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Precio Venta ($ ARS) *:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className="justi-input w-full font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Costo ($ ARS):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="0.00"
                    className="justi-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    {editingProduct ? 'Stock Actual:' : 'Stock Inicial:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="justi-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                    Alerta Stock Mínimo:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="justi-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="submit"
                  disabled={savingFull}
                  className="justi-btn-primary py-2 font-bold"
                >
                  {savingFull ? 'Guardando...' : 'Guardar Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => setFullModalOpen(false)}
                  className="justi-btn-primary py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
