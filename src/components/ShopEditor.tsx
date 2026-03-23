import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Product, Store } from '../types';
import { Plus, Trash2, Pencil, GripVertical, Image as ImageIcon, ExternalLink, Tag, Upload, X, FolderPlus, Folder, ChevronDown, ChevronRight, ShoppingBag, PlusCircle, AlertCircle, Store as StoreIcon, Package, LayoutGrid, Info, Loader2, BarChart2, FolderInput, FolderHeart, Archive, RotateCcw, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { compressImage, blobToDataURL } from '../utils/imageUtils';
import { apiClient } from '../services/apiClient';

interface ShopEditorProps {
    products: Product[];
    onChange: (products: Product[]) => void;
    stores: Store[];
    onStoresChange: (stores: Store[]) => void;
    pendingCollection?: string | null;
    onPendingCollectionConsumed?: () => void;
    userProfile?: any;
}

export default function ShopEditor({
    products,
    onChange,
    stores,
    onStoresChange,
    pendingCollection,
    onPendingCollectionConsumed,
    userProfile
}: ShopEditorProps) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'pt';
    const isPT = lang.startsWith('pt');

    const [isAddingStore, setIsAddingStore] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreLogo, setNewStoreLogo] = useState<string | null>(null);
    const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

    const [isAddingCollection, setIsAddingCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

    const [addingToCollection, setAddingToCollection] = useState<{ storeId: string, colName: string } | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});

    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [deletingCollection, setDeletingCollection] = useState<{ storeId: string, name: string } | null>(null);
    const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [moveModalProductId, setMoveModalProductId] = useState<string | null>(null);
    const [editingCollection, setEditingCollection] = useState<{ storeId: string, oldName: string, newName: string } | null>(null);
    const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
    const [showArchive, setShowArchive] = useState(false);

    const handleFileUpload = async (file: File, target: 'NEW_PRODUCT' | 'NEW_STORE_LOGO' | string) => {
        setUploadingTarget(target);
        try {
            let fileToUpload = file;
            
            // Compress if image (except GIF)
            if (file.type.startsWith('image/') && !file.type.includes('gif')) {
                try {
                    const compressedBase64 = await compressImage(file, 1024, 0.7);
                    const response = await fetch(compressedBase64);
                    const blob = await response.blob();
                    fileToUpload = new File([blob], file.name, { type: 'image/jpeg' });
                } catch (err) {
                    console.warn('Compression failed, using original file', err);
                }
            }

            const res = await apiClient.uploadInternalAsset(fileToUpload);
            if (res.success && res.file?.url) {
                const url = res.file.url;
                if (target === 'NEW_PRODUCT') setNewProduct(prev => ({ ...prev, image: url }));
                else if (target === 'NEW_STORE_LOGO') setNewStoreLogo(url);
                else if (target.startsWith('STORE_LOGO:')) {
                    const sid = target.split(':')[1];
                    onStoresChange(stores.map(s => s.id === sid ? { ...s, imageUrl: url } : s));
                } else {
                    updateProductField(target, 'image', url);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingTarget(null);
        }
    };

    const isFree = !userProfile?.planType || userProfile?.planType === 'free';
    const maxStores = isFree ? 1 : 10;
    const maxCollectionsPerStore = isFree ? 2 : 20;

    const handleToggleStore = (id: string) => {
        setExpandedStoreId(expandedStoreId === id ? null : id);
    };

    const toggleCollection = (storeId: string, colName: string) => {
        const key = `${storeId}:${colName}`;
        setExpandedCollections(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    const handleAddStore = () => {
        if (!newStoreName.trim()) return;
        if (stores.length >= maxStores) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }
        const newStore: Store = {
            id: crypto.randomUUID(),
            name: newStoreName.trim(),
            imageUrl: newStoreLogo || undefined,
            position: stores.length,
            isActive: true
        };
        onStoresChange([...stores, newStore]);

        setNewStoreName('');
        setNewStoreLogo(null);
        setIsAddingStore(false);
        setExpandedStoreId(newStore.id);
    };

    const handleReorderStores = (newStores: Store[]) => {
        // Update positions based on the new array order
        const reordered = newStores.map((s, idx) => ({ ...s, position: idx }));
        onStoresChange(reordered);
    };

    const handleDeleteStore = (id: string) => {
        onStoresChange(stores.filter(s => s.id !== id));
        // We no longer delete products when a store is deleted.
        // Instead, we keep them, but remove their storeId so they can be recovered or reassigned later. 
        onChange(products.map(p => p.storeId === id ? { ...p, storeId: undefined } : p));
        setDeletingStoreId(null);
        if (expandedStoreId === id) setExpandedStoreId(null);
    };

    const handleAddCollection = (storeId: string) => {
        if (!newCollectionName.trim()) return;

        const store = stores.find(s => s.id === storeId);
        if (store) {
            const trimmedName = newCollectionName.trim();
            const currentCols = store.collections || [];
            if (!currentCols.includes(trimmedName)) {
                const updatedCols = [...currentCols, trimmedName];
                onStoresChange(stores.map(s => s.id === storeId ? { ...s, collections: updatedCols } : s));

                // Auto-expand the newly created collection
                const key = `${storeId}:${trimmedName}`;
                if (!expandedCollections.includes(key)) {
                    setExpandedCollections(prev => [...prev, key]);
                }
            }
        }
        setAddingToCollection(null);
        setIsAddingCollection(null);
        setNewCollectionName('');
    };

    const handleReorderCollections = (storeId: string, newCols: string[]) => {
        onStoresChange(stores.map(s => s.id === storeId ? { ...s, collections: newCols } : s));
    };

    const handleAddProduct = (storeId: string, collectionName: string) => {
        if (!newProduct.name || !newProduct.url) return;
        const storeProducts = products.filter(p => p.storeId === storeId);
        const colProducts = storeProducts.filter(p => p.collection === (collectionName === 'uncategorized' ? undefined : collectionName));
        if (isFree && colProducts.length >= 4) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }
        const product: Product = {
            id: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            name: newProduct.name as string,
            url: newProduct.url as string,
            image: newProduct.image || 'https://placehold.co/200x200?text=No+Image',
            clicks: 0,
            collection: collectionName === 'uncategorized' ? undefined : collectionName,
            price: newProduct.price,
            discountCode: newProduct.discountCode,
            storeId,
            isActive: true,
            position: colProducts.length
        };
        onChange([...products, product]);
        setNewProduct({});
        setAddingToCollection(null);
        const key = `${storeId}:${collectionName}`;
        if (!expandedCollections.includes(key)) setExpandedCollections(prev => [...prev, key]);
    };

    const handleReorderProducts = (storeId: string, colName: string, reorderedSubset: Product[]) => {
        const otherProducts = products.filter(p => p.storeId !== storeId || p.collection !== (colName === 'uncategorized' ? undefined : colName));
        const updatedSubset = reorderedSubset.map((p, idx) => ({ ...p, position: idx }));
        onChange([...otherProducts, ...updatedSubset]);
    };

    const handleRenameCollection = (storeId: string, oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) {
            setEditingCollection(null);
            return;
        }
        onChange(products.map(p =>
            (p.storeId === storeId && p.collection === oldName)
                ? { ...p, collection: newName.trim() }
                : p
        ));

        // Update expanded collections if needed
        const oldKey = `${storeId}:${oldName}`;
        const newKey = `${storeId}:${newName.trim()}`;
        if (expandedCollections.includes(oldKey)) {
            setExpandedCollections(prev => prev.map(k => k === oldKey ? newKey : k));
        }

        setEditingCollection(null);
    };

    function updateProductField(id: string, field: keyof Product, value: any) {
        onChange(products.map(p => (p.id === id || (p.clientId && p.clientId === id)) ? { ...p, [field]: value } : p));
    }

    const handleSaveEdit = (editedProduct: Partial<Product>) => {
        const id = editedProduct.id || (editedProduct as any).clientId;
        if (!id) return;
        onChange(products.map(p => (p.id === id || (p.clientId && p.clientId === id)) ? { ...p, ...editedProduct } as Product : p));
        setEditingProductId(null);
    };

    const renderProduct = (product: Product) => (
        <ProductItem
            key={product.clientId || product.id}
            product={product}
            isEditing={editingProductId === product.id}
            setEditingProductId={setEditingProductId}
            uploadingTarget={uploadingTarget}
            isPT={isPT}
            updateProductField={updateProductField}
            setDeletingProductId={setDeletingProductId}
            renderAddForm={renderAddForm}
        />
    );

    const renderAddForm = (storeId: string, collectionName: string, existingProduct?: Product) => {
        const isEditing = !!existingProduct;
        const targetProduct = isEditing ? existingProduct : newProduct;

        return (
            <div className={`space-y-6 sm:space-y-8 relative overflow-hidden`}>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 relative z-10">
                    {/* Image Section - Made More Compact */}
                    <div className="shrink-0 flex sm:flex-col items-center gap-4">
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 border-2 border-black bg-black flex items-center justify-center rounded-md overflow-hidden group shadow-[0_4px_0_0_#000] transition-all cursor-pointer">
                            {targetProduct.image ? (
                                <img src={targetProduct.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-white/20">
                                    <ImageIcon size={24} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{isPT ? 'SEM FOTO' : 'NO IMAGE'}</span>
                                </div>
                            )}
                            
                            {uploadingTarget === (isEditing ? existingProduct.id : 'NEW_PRODUCT') && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                    <Loader2 className="w-6 h-6 text-[#ffdf00] animate-spin" />
                                </div>
                            )}

                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleFileUpload(e.target.files[0], isEditing ? existingProduct.id : 'NEW_PRODUCT');
                                        e.target.value = '';
                                    }
                                }}
                            />
                            
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center pointer-events-none">
                                <Plus size={20} className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{isPT ? 'IMAGEM' : 'IMAGE'}</span>
                            <span className="text-[8px] font-bold text-black/20 italic">{isPT ? 'FORMATO 1:1 RECOMENDADO' : '1:1 FORMAT RECOMMENDED'}</span>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 grid grid-cols-1 gap-4 sm:gap-5">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'Nome do Produto' : 'Product Name'}</label>
                                <input
                                    type="text"
                                    placeholder="EX: TÊNIS ESPORTIVO XYZ"
                                    className="w-full bg-slate-50 border-2 border-black px-5 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-[12px] font-black uppercase tracking-tight rounded-md sm:rounded-sm outline-none shadow-[0_3px_0_0_#000] transition-all placeholder:text-black/5"
                                    value={targetProduct.name || ''}
                                    onChange={e => isEditing
                                        ? updateProductField(existingProduct.id, 'name', e.target.value)
                                        : setNewProduct({ ...newProduct, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'Link de Compra' : 'Product Link'}</label>
                                <input
                                    type="text"
                                    placeholder="https://loja.com/produto"
                                    className="w-full bg-slate-50 border-2 border-black px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-medium rounded-md sm:rounded-sm outline-none shadow-[0_3px_0_0_#000] focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/5 italic"
                                    value={targetProduct.url || ''}
                                    onChange={e => isEditing
                                        ? updateProductField(existingProduct.id, 'url', e.target.value)
                                        : setNewProduct({ ...newProduct, url: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'Preço (Opcional)' : 'Price (Optional)'}</label>
                                <div className="relative group/price">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] sm:text-[12px] font-black text-black/20 group-focus-within/price:text-black transition-colors">
                                        {isPT ? 'R$' : '$'}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="0,00"
                                        className="w-full bg-slate-50 border-2 border-black pl-12 pr-6 py-3 sm:py-4 text-[11px] sm:text-[12px] font-black rounded-md sm:rounded-sm outline-none shadow-[0_3px_0_0_#000] focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/10"
                                        value={String(targetProduct.price || '').replace(/[^\d,.]/g, '')}
                                        onChange={e => {
                                            const val = e.target.value.replace(/[^\d,.]/g, '');
                                            if (isEditing) {
                                                updateProductField(existingProduct.id, 'price', val);
                                            } else {
                                                setNewProduct({ ...newProduct, price: val });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'Cupom de Desconto' : 'Discount Code'}</label>
                                <div className="relative">
                                    <Tag size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                                    <input
                                        type="text"
                                        placeholder="EX: PROMO10"
                                        className="w-full bg-slate-50 border-2 border-black pl-12 pr-6 py-3 sm:py-4 text-[11px] sm:text-[12px] font-black uppercase rounded-md sm:rounded-sm outline-none shadow-[0_3px_0_0_#000] focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/5"
                                        value={targetProduct.discountCode || ''}
                                        onChange={e => isEditing
                                            ? updateProductField(existingProduct.id, 'discountCode', e.target.value)
                                            : setNewProduct({ ...newProduct, discountCode: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-10 mt-10 border-t-2 border-[#1a1a1a] border-dashed gap-4">
                        <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-[10px] sm:shrink-0">
                            <BarChart2 size={16} strokeWidth={3} className="text-black/20" />
                            <span>{existingProduct?.clicks || 0} {isPT ? 'CLICKS NO TOTAL' : 'TOTAL CLICKS'}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setMoveModalProductId(existingProduct?.id || null)}
                                className="flex-1 sm:flex-none px-4 sm:px-6 h-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white border-2 border-[#1a1a1a] text-black hover:bg-[#ffdf00] transition-all shadow-[0_3px_0_0_#1a1a1a] cursor-pointer active:scale-95 active:shadow-none translate-y-0 active:translate-y-[1px]"
                            >
                                {isPT ? 'MOVER PARA...' : 'MOVE TO...'}
                            </button>
                            <button
                                onClick={() => updateProductField(existingProduct?.id || '', 'isArchived', !existingProduct?.isArchived)}
                                className={`flex-1 sm:flex-none px-4 sm:px-6 h-10 border-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 active:shadow-none translate-y-0 active:translate-y-[1px] flex items-center justify-center gap-2 ${existingProduct?.isArchived ? 'bg-[#ffdf00] border-[#1a1a1a] text-black shadow-[0_3px_0_0_#1a1a1a]' : 'bg-white border-[#1a1a1a] text-black hover:bg-[#ffdf00] shadow-[0_3px_0_0_#1a1a1a]'}`}
                            >
                                {existingProduct?.isArchived ? <RefreshCw size={14} strokeWidth={3} className="transition-transform group-hover:rotate-180 duration-500" /> : null}
                                {existingProduct?.isArchived ? (isPT ? 'RESTAURAR' : 'RESTORE') : (isPT ? 'ARQUIVAR' : 'ARCHIVE')}
                            </button>
                            <button
                                onClick={() => setDeletingProductId(existingProduct?.id || null)}
                                className="flex-1 sm:flex-none px-4 sm:px-6 h-10 border-2 border-[#1a1a1a] text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-red-500 hover:text-white transition-all shadow-[0_3px_0_0_#1a1a1a] cursor-pointer active:scale-95 active:shadow-none translate-y-0 active:translate-y-[1px]"
                            >
                                {isPT ? 'EXCLUIR' : 'DELETE'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-10 sm:pt-14 items-center pb-8 sm:pb-12 px-2">
                    <button
                        onClick={() => isEditing ? setEditingProductId(null) : setAddingToCollection(null)}
                        className="px-6 py-2.5 bg-white border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:border-black transition-all shadow-[0_4px_0_0_#000]"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={() => isEditing ? setEditingProductId(null) : handleAddProduct(storeId, collectionName)}
                        className="flex-1 sm:flex-none px-10 py-2.5 bg-[#97cd7a] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest text-black hover:bg-[#86b96c] transition-all shadow-[0_4px_0_0_#1d3d1d] flex items-center justify-center gap-2"
                    >
                        {isEditing ? (isPT ? 'SALVAR ALTERAÇÕES' : 'SAVE CHANGES') : (isPT ? 'ADICIONAR PRODUTO' : 'ADD PRODUCT')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-24">
            <div className="bg-white rounded-md border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] sm:shadow-[0_8px_0_0_#1a1a1a] relative overflow-hidden transition-all duration-300">
                {/* Header Section */}
                <div className="p-4 sm:p-6 border-b-2 border-[#1a1a1a]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-[#1a1a1a] leading-none mb-1">
                                {isPT ? 'MINHAS VITRINES' : 'MY SHOWCASES'}
                            </h2>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/30">
                                {isPT ? 'GERENCIE SUAS LOJAS E PRODUTOS' : 'MANAGE YOUR STORES AND PRODUCTS'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddingStore(!isAddingStore)}
                                className={`w-10 h-10 flex items-center justify-center border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] transition-all rounded-md cursor-pointer active:scale-95 active:shadow-none ${isAddingStore ? 'bg-white text-red-500' : 'bg-[#ffdf00] text-black'}`}
                            >
                                <PlusCircle size={20} className={isAddingStore ? 'rotate-45' : ''} />
                            </button>
                        </div>
                    </div>

                    {isAddingStore && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            className="mt-8 space-y-6 pt-6 border-t-2 border-[#1a1a1a] border-dashed"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 bg-black border-2 border-black rounded-sm overflow-hidden flex items-center justify-center shadow-[0_4px_0_0_#000] relative group">
                                        {newStoreLogo ? (
                                            <img src={newStoreLogo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="bg-white absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                                <StoreIcon size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload size={20} className="text-white" />
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'NEW_STORE_LOGO')} />
                                        </div>
                                        {uploadingTarget === 'NEW_STORE_LOGO' && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-[22px]">
                                                <Loader2 size={24} className="text-[#ffdf00] animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'Nome da Vitrine' : 'Showcase Name'}</label>
                                        <input
                                            type="text" value={newStoreName} onChange={e => setNewStoreName(e.target.value)}
                                            placeholder={isPT ? 'Ex: Minha Loja Gamer' : 'Ex: My Gamer Store'}
                                            className="w-full bg-slate-50 border-2 border-black px-6 py-4 text-sm font-black rounded-sm outline-none shadow-[0_4px_0_0_#000] transition-all uppercase placeholder:italic placeholder:text-black/5"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={() => setIsAddingStore(false)} className="px-6 py-3 bg-white border-2 border-black font-black uppercase tracking-widest rounded-md text-[10px] shadow-[0_3px_0_0_#000] transition-all">{t('common.cancel')}</button>
                                        <button onClick={handleAddStore} className="px-8 py-3 bg-[#97cd7a] border-2 border-black font-black uppercase tracking-widest rounded-md text-[10px] shadow-[0_3px_0_0_#1a1a1a] transition-all">{isPT ? 'CRIAR LOJA' : 'CREATE STORE'}</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="p-1 sm:p-2 space-y-3">
                    {stores.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-black/10 text-black/20 text-black/10">
                                <StoreIcon size={32} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-black/20 italic">
                                {isPT ? 'Nenhuma vitrine criada' : 'No showcases created'}
                            </p>
                        </div>
                    ) : (
                        <Reorder.Group 
                            axis="y" 
                            values={stores.sort((a, b) => (a.position - b.position))} 
                            onReorder={handleReorderStores} 
                            className="space-y-3"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        >
                            {stores.sort((a, b) => (a.position - b.position)).map(store => (
                                <StoreItem 
                                    key={store.id}
                                    store={store}
                                    products={products}
                                    stores={stores}
                                    onStoresChange={onStoresChange}
                                    onChange={onChange}
                                    expandedStoreId={expandedStoreId}
                                    handleToggleStore={handleToggleStore}
                                    setDeletingStoreId={setDeletingStoreId}
                                    handleFileUpload={handleFileUpload}
                                    uploadingTarget={uploadingTarget}
                                    renderAddForm={renderAddForm}
                                    renderProduct={renderProduct}
                                    setIsAddingCollection={setIsAddingCollection}
                                    isAddingCollection={isAddingCollection}
                                    newCollectionName={newCollectionName}
                                    setNewCollectionName={setNewCollectionName}
                                    handleAddCollection={handleAddCollection}
                                    addingToCollection={addingToCollection}
                                    setAddingToCollection={setAddingToCollection}
                                    setShowArchive={setShowArchive}
                                    expandedCollections={expandedCollections}
                                    toggleCollection={toggleCollection}
                                    editingCollection={editingCollection}
                                    setEditingCollection={setEditingCollection}
                                    handleRenameCollection={handleRenameCollection}
                                    setExpandedCollections={setExpandedCollections}
                                    isPT={isPT}
                                    setDeletingCollection={setDeletingCollection}
                                    handleReorderProducts={handleReorderProducts}
                                    handleReorderCollections={handleReorderCollections}
                                />
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </div>

            {/* Unlinked Products */}
            {products.some(p => !p.storeId || !stores.some(s => s.id === p.storeId)) && (
                <div className="bg-slate-100 rounded-[40px] border-2 border-black border-dashed p-10 text-center">
                    <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{isPT ? 'PRODUTOS DESVINCULADOS' : 'UNLINKED PRODUCTS'}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-8 max-w-sm mx-auto">{isPT ? 'Estes itens não pertencem a nenhuma loja. Vincule-os abaixo.' : 'These items do not belong to any store. Link them below.'}</p>
                    <div className="space-y-3 mb-8">{products.filter(p => !p.storeId || !stores.some(s => s.id === p.storeId)).map(renderProduct)}</div>
                    {stores.length > 0 && (
                        <button onClick={() => onChange(products.map(p => (!p.storeId || !stores.some(s => s.id === p.storeId)) ? { ...p, storeId: stores[0].id } : p))} className="px-8 py-4 bg-black text-[#ffdf00] border-2 border-black rounded-sm text-[10px] font-black uppercase tracking-widest shadow-[0_5px_0_0_rgba(0,0,0,0.1)] transition-all">
                            {isPT ? 'VINCULAR AO PRIMEIRO' : 'LINK TO FIRST'}
                        </button>
                    )}
                </div>
            )}

                    {/* Modals Section */}
            {createPortal(
                <AnimatePresence>
                    {deletingStoreId && (
                        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white border-2 border-black p-10 rounded-md max-w-md w-full shadow-[0_20px_0_0_#000]">
                                <h4 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter">{isPT ? 'EXCLUIR LOJA?' : 'DELETE STORE?'}</h4>
                                <div className="flex gap-4">
                                    <button onClick={() => setDeletingStoreId(null)} className="flex-1 py-4 bg-slate-100 rounded-sm font-black uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
                                    <button onClick={() => handleDeleteStore(deletingStoreId!)} className="flex-1 py-4 bg-red-500 border-2 border-black text-white rounded-sm font-black uppercase text-[10px] tracking-widest shadow-[0_5px_0_0_#000] transition-all">{isPT ? 'EXCLUIR' : 'DELETE'}</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {deletingCollection && (
                        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white border-2 border-black p-10 rounded-md max-w-sm w-full shadow-[0_15px_0_0_#000]">
                                <h4 className="text-2xl font-black uppercase text-center mb-8 tracking-tighter">{isPT ? 'EXCLUIR CATEGORIA?' : 'DELETE FOLDER?'}</h4>
                                <div className="flex gap-4">
                                    <button onClick={() => setDeletingCollection(null)} className="flex-1 py-3 bg-slate-100 rounded-md font-black uppercase text-[9px] tracking-widest">{t('common.cancel')}</button>
                                    <button onClick={() => {
                                        const store = stores.find(s => s.id === deletingCollection!.storeId);
                                        if (store) {
                                            const updatedCols = (store.collections || []).filter(c => c !== deletingCollection!.name);
                                            onStoresChange(stores.map(s => s.id === store.id ? { ...s, collections: updatedCols } : s));
                                        }
                                        onChange(products.filter(p => !(p.storeId === deletingCollection!.storeId && p.collection === deletingCollection!.name)));
                                        setDeletingCollection(null);
                                    }} className="flex-1 py-3 bg-red-500 text-white border-2 border-black rounded-md font-black uppercase text-[9px] tracking-widest shadow-[0_4px_0_0_#000] transition-all">{isPT ? 'EXCLUIR' : 'DELETE'}</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {deletingProductId && (
                        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white border-2 border-black p-10 rounded-md max-w-sm w-full shadow-[0_15px_0_0_#000]">
                                <h4 className="text-2xl font-black uppercase text-center mb-4 tracking-tighter">{isPT ? 'EXCLUIR PRODUTO?' : 'DELETE PRODUCT?'}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 text-center mb-8">{isPT ? 'ESSA AÇÃO NÃO PODE SER DESFEITA' : 'THIS ACTION CANNOT BE UNDONE'}</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setDeletingProductId(null)} className="flex-1 py-4 bg-slate-100 rounded-sm font-black uppercase text-[9px] tracking-widest">{t('common.cancel')}</button>
                                    <button onClick={() => {
                                        onChange(products.filter(p => p.id !== deletingProductId));
                                        setDeletingProductId(null);
                                    }} className="flex-1 py-4 bg-red-500 text-white border-2 border-black rounded-sm font-black uppercase text-[9px] tracking-widest shadow-[0_4px_0_0_#000] transition-all">{isPT ? 'EXCLUIR' : 'DELETE'}</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {moveModalProductId && (
                        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setMoveModalProductId(null)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white w-full max-w-sm p-6 rounded-md border-2 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] overflow-hidden"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-black">{isPT ? 'MOVER PARA...' : 'MOVE TO...'}</h3>
                                    <button onClick={() => setMoveModalProductId(null)} className="p-1.5 bg-white text-black border-2 border-[#1a1a1a] hover:bg-[#ffdf00] transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-sm">
                                        <X size={18} strokeWidth={4} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const productToMove = products.find(p => p.id === moveModalProductId || (p.clientId && p.clientId === moveModalProductId));
                                        const productStore = stores.find(s => s.id === productToMove?.storeId);
                                        const storeProducts = products.filter(p => p.storeId === productStore?.id);
                                        const productCollections = Array.from(new Set([
                                            ...(productStore?.collections || []),
                                            ...storeProducts.map(p => p.collection).filter(Boolean) as string[]
                                        ]));
                                        
                                        return (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        updateProductField(moveModalProductId!, 'collection', '');
                                                        setMoveModalProductId(null);
                                                    }}
                                                    className="w-full text-left flex items-center gap-4 p-5 bg-white border-2 border-[#1a1a1a] hover:bg-[#ffdf00] transition-all font-black uppercase tracking-widest text-[11px] shadow-[0_4px_0_0_#1a1a1a] group"
                                                >
                                                    <Folder size={20} strokeWidth={3} className="text-black transition-transform" />
                                                    {isPT ? 'MINHA VITRINE (RAIZ)' : 'MY SHOWCASE (ROOT)'}
                                                </button>

                                                <div className="pt-2">
                                                    <p className="text-[10px] font-black uppercase text-black/30 mb-4 tracking-[0.2em] px-1">{isPT ? 'MOVER PARA COLEÇÃO' : 'MOVE TO COLLECTION'}</p>
                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                                        {productCollections.length > 0 ? (
                                                            productCollections.map(c => (
                                                                <button
                                                                    key={c}
                                                                    onClick={() => {
                                                                        updateProductField(moveModalProductId!, 'collection', c);
                                                                        setMoveModalProductId(null);
                                                                    }}
                                                                    className="w-full text-left flex items-center gap-4 p-5 bg-white border-2 border-[#1a1a1a] hover:bg-[#97cd7a] transition-all font-black uppercase tracking-widest text-[11px] shadow-[0_4px_0_0_#1a1a1a] group"
                                                                >
                                                                    <FolderHeart size={20} strokeWidth={3} className="text-black transition-transform" />
                                                                    {c.toUpperCase()}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 border-2 border-dashed border-[#1a1a1a]/10 flex flex-col items-center justify-center text-center">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-black/20">{isPT ? 'NENHUMA COLEÇÃO NESTA LOJA' : 'NO COLLECTIONS IN THIS STORE'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Archive Modal */}
            {showArchive && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowArchive(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-2xl p-6 sm:p-10 rounded-md border-4 border-black shadow-[0_20px_0_0_#000] overflow-hidden flex flex-col max-h-[85vh] z-10"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#ffdf00] border-2 border-black rounded-md flex items-center justify-center shadow-[0_4px_0_0_#000]">
                                    <Archive size={28} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter text-black">
                                        {isPT ? 'ARQUIVADOS' : 'ARCHIVED'}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-1">{isPT ? 'ITENS INATIVOS' : 'INACTIVE ITEMS'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowArchive(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white text-black border-2 border-black hover:bg-red-400 transition-all shadow-[0_4px_0_0_#000] rounded-md cursor-pointer active:scale-95 active:shadow-none"
                            >
                                <X size={24} strokeWidth={4} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide min-h-[300px]">
                            {products.filter(p => p.isArchived).length > 0 ? (
                                products.filter(p => p.isArchived).map(product => (
                                    <div key={product.id} className="group flex items-center gap-5 p-5 bg-white border-2 border-black rounded-md shadow-[0_6px_0_0_#000] transition-all cursor-pointer">
                                        <div className="shrink-0 w-16 h-16 border-2 border-black bg-slate-50 rounded-md overflow-hidden relative shadow-sm">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="bg-white absolute inset-0 flex items-center justify-center">
                                                    <ImageIcon size={24} className="text-black/10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-black uppercase tracking-tight text-black truncate">{product.name}</h4>
                                            <p className="text-[11px] font-bold text-black/30 truncate uppercase tracking-widest">{product.collection || (isPT ? 'SEM CATEGORIA' : 'NO CATEGORY')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateProductField(product.id, 'isArchived', false)}
                                                className="px-4 h-12 flex items-center justify-center gap-2 bg-[#97cd7a] text-black border-2 border-black rounded-md shadow-[0_4px_0_0_#000] transition-all cursor-pointer active:scale-95 active:shadow-none font-black text-[10px] tracking-widest"
                                            >
                                                <RotateCcw size={18} strokeWidth={3} />
                                                {isPT ? 'RESTAURAR' : 'RESTORE'}
                                            </button>
                                            <button
                                                onClick={() => { setDeletingProductId(product.id); setShowArchive(false); }}
                                                className="w-12 h-12 flex items-center justify-center bg-red-400 text-black border-2 border-black rounded-md shadow-[0_4px_0_0_#000] transition-all cursor-pointer active:scale-95 active:shadow-none"
                                            >
                                                <Trash2 size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-slate-50 border-2 border-black border-dashed rounded-full flex items-center justify-center mb-6 opacity-30">
                                        <Archive size={40} strokeWidth={1} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-black/20">{isPT ? 'NADA POR AQUI' : 'NOTHING HERE'}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );

}

interface ProductItemProps {
    product: Product;
    isEditing: boolean;
    setEditingProductId: (id: string | null) => void;
    uploadingTarget: string | null;
    isPT: boolean;
    updateProductField: (id: string, field: keyof Product, value: any) => void;
    setDeletingProductId: (id: string | null) => void;
    renderAddForm: (storeId: string, collectionName: string, existingProduct?: Product) => React.ReactNode;
}

const ProductItem: React.FC<ProductItemProps> = ({
    product, isEditing, setEditingProductId, uploadingTarget, isPT,
    updateProductField, setDeletingProductId, renderAddForm
}) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={product}
            dragListener={false}
            dragControls={dragControls}
            layout
            whileDrag={{ zIndex: 50, borderRadius: '6px' }}
            className={`group relative select-none border-2 border-[#1a1a1a] rounded-md overflow-hidden mb-3 transition-colors duration-300 ${isEditing ? 'bg-[#fefcbf] shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white shadow-[0_4px_0_0_#1a1a1a]'}`}
        >
            <div className="flex items-stretch min-h-[82px]">
                {/* Drag Handle Area */}
                <div 
                    className="w-10 sm:w-12 shrink-0 flex items-center justify-center border-r-[1.5px] border-black/10 group-hover:border-black/30 transition-colors bg-white cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <GripVertical size={16} className="text-black/15 group-hover:text-black/40" />
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Main Content Area */}
                    <div
                        onClick={() => setEditingProductId(isEditing ? null : product.id)}
                        className="flex-1 min-w-0 pr-4 py-4 px-3 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            {/* Product Image Thumbnail */}
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 border-2 border-black bg-black rounded-md overflow-hidden relative shadow-[0_3px_0_0_#000]">
                                {product.image ? (
                                    <img src={product.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="bg-white absolute inset-0 flex flex-col items-center justify-center">
                                        <ImageIcon size={20} className="text-black/10" />
                                    </div>
                                )}

                                {uploadingTarget === product.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 transition-all rounded-[10px]">
                                        <Loader2 size={18} className="text-[#ffdf00] animate-spin" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                                <h4 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tight text-black truncate flex items-center gap-2">
                                    {product.name}
                                    <Pencil size={12} className="sm:size-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                                </h4>
                                
                                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-3 sm:mt-4">
                                    <div className="flex items-center gap-2 group/stat">
                                        <div className="p-1.5 sm:p-2 bg-black/5 rounded-md text-black/20 group-hover/stat:bg-[#e5414d]/10 group-hover/stat:text-[#e5414d] transition-all">
                                            <BarChart2 size={12} strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[12px] sm:text-[14px] font-black tracking-tight leading-none text-black">{product.clicks || 0}</span>
                                            <span className="text-[8px] sm:text-[9px] font-black text-black/20 uppercase tracking-widest mt-1">{isPT ? 'CLIQUES' : 'CLICKS'}</span>
                                        </div>
                                    </div>

                                    {product.price && (
                                        <div className="flex items-center gap-2 group/stat">
                                            <div className="p-1.5 sm:p-2 bg-black/5 rounded-md text-black/20 group-hover/stat:bg-[#97cd7a]/15 group-hover/stat:text-[#97cd7a] transition-all">
                                                <Tag size={12} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[12px] sm:text-[14px] font-black tracking-tight leading-none text-black">
                                                    {(() => {
                                                        const raw = String(product.price || '');
                                                        const clean = raw.replace(/[^\d,.]/g, '').replace(',', '.');
                                                        const val = parseFloat(clean);
                                                        if (isNaN(val)) return '';
                                                        return new Intl.NumberFormat(isPT ? 'pt-BR' : 'en-US', { 
                                                            style: 'currency', 
                                                            currency: isPT ? 'BRL' : 'USD' 
                                                        }).format(val);
                                                    })()}
                                                </span>
                                                <span className="text-[8px] sm:text-[9px] font-black text-black/20 uppercase tracking-widest mt-1">{isPT ? 'PREÇO' : 'PRICE'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Actions Block */}
                <div className="flex items-center gap-3 shrink-0 pr-2 sm:pr-4" onClick={(e) => e.stopPropagation()}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={product.isActive !== false} onChange={() => updateProductField(product.id, 'isActive', product.isActive === false)} className="sr-only peer" />
                                <div className="w-[42px] h-[22px] border-[2.5px] border-black bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[0_2px_0_0_#000] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:w-[13px] after:h-[13px] after:rounded-full after:transition-all peer-checked:after:translate-x-[20px]"></div>
                            </label>
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); setDeletingProductId(product.id); }}
                        className="p-1 sm:p-2 text-black/10 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t-2 border-[#1a1a1a] border-dashed overflow-hidden"
                    >
                        <div className="p-2 sm:p-4">
                            {renderAddForm(product.storeId || '', product.collection || 'uncategorized', product)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
};

interface StoreItemProps {
    store: Store;
    products: Product[];
    stores: Store[];
    onStoresChange: (stores: Store[]) => void;
    onChange: (products: Product[]) => void;
    expandedStoreId: string | null;
    handleToggleStore: (id: string) => void;
    setDeletingStoreId: (id: string | null) => void;
    handleFileUpload: (file: File, target: string) => Promise<void>;
    uploadingTarget: string | null;
    renderAddForm: (storeId: string, collectionName: string, existingProduct?: Product) => React.ReactNode;
    renderProduct: (product: Product) => React.ReactNode;
    setIsAddingCollection: (id: string | null) => void;
    isAddingCollection: string | null;
    newCollectionName: string;
    setNewCollectionName: (val: string) => void;
    handleAddCollection: (storeId: string) => void;
    addingToCollection: { storeId: string, colName: string } | null;
    setAddingToCollection: (val: { storeId: string, colName: string } | null) => void;
    setShowArchive: (val: boolean) => void;
    expandedCollections: string[];
    toggleCollection: (storeId: string, colName: string) => void;
    editingCollection: { storeId: string, oldName: string, newName: string } | null;
    setEditingCollection: (val: { storeId: string, oldName: string, newName: string } | null) => void;
    handleRenameCollection: (storeId: string, oldName: string, newName: string) => void;
    setExpandedCollections: React.Dispatch<React.SetStateAction<string[]>>;
    isPT: boolean;
    setDeletingCollection: (val: { storeId: string, name: string } | null) => void;
    handleReorderProducts: (storeId: string, colName: string, reorderedSubset: Product[]) => void;
    handleReorderCollections: (storeId: string, newCols: string[]) => void;
}
const StoreItem: React.FC<StoreItemProps> = ({
    store, products, stores, onStoresChange, onChange, expandedStoreId, handleToggleStore,
    setDeletingStoreId, handleFileUpload, uploadingTarget, renderAddForm, renderProduct,
    setIsAddingCollection, isAddingCollection, newCollectionName, setNewCollectionName,
    handleAddCollection, addingToCollection, setAddingToCollection, setShowArchive,
    expandedCollections, toggleCollection, editingCollection, setEditingCollection,
    handleRenameCollection, setExpandedCollections, isPT, setDeletingCollection,
    handleReorderProducts, handleReorderCollections
}) => {
    const dragControls = useDragControls();
    const storeProducts = products.filter(p => p.storeId === store.id && !p.isArchived);
    const storeCols = Array.from(new Set([
        ...(store.collections || []),
        ...storeProducts.map(p => p.collection).filter(Boolean) as string[]
    ]));
    const uncat = storeProducts.filter(p => !p.collection);
    const isExpanded = expandedStoreId === store.id;

    return (
        <Reorder.Item
            value={store}
            dragListener={false}
            dragControls={dragControls}
            layout
            whileDrag={{ zIndex: 50, borderRadius: '6px' }}
            className={`group relative select-none border-2 border-[#1a1a1a] rounded-md overflow-hidden transition-colors duration-300 ${isExpanded ? 'bg-[#fefcbf] shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white shadow-[0_4px_0_0_#1a1a1a]'}`}
        >
            <div className="flex items-stretch min-h-[80px]">
                {/* Drag Handle Area */}
                <div 
                    className="w-10 sm:w-12 shrink-0 flex items-center justify-center border-r-[1.5px] border-black/10 group-hover:border-black/30 transition-colors bg-white cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <GripVertical size={16} className="text-black/15 group-hover:text-black/40" />
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div
                        onClick={() => handleToggleStore(store.id)}
                        className="flex-1 flex items-center gap-1.5 sm:gap-3 p-4 sm:p-5 cursor-pointer h-full"
                    >
                        <div className="text-black/10 shrink-0">
                            {isExpanded ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                        </div>

                        <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 border-[1.5px] border-black bg-black rounded-md overflow-hidden relative shadow-[0_2px_0_0_#000]">
                            {store.imageUrl ? (
                                <img src={store.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="bg-white absolute inset-0 flex flex-col items-center justify-center text-black/10">
                                    <StoreIcon size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-col justify-center items-center sm:items-start h-full">
                                <h4 className="text-[14px] sm:text-[15px] font-black uppercase tracking-tight text-black truncate leading-tight w-full text-center sm:text-left">{store.name}</h4>
                                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1 text-[9.5px] sm:text-[10px] font-black text-black/30 uppercase tracking-[0.1em] w-full">
                                    <span>{storeProducts.length} {isPT ? 'ITENS' : 'ITEMS'}</span>
                                    <span className="w-1 h-1 bg-black/10 rounded-full" />
                                    <span>{storeCols.length} {isPT ? 'COLEÇÕES' : 'COLLECTIONS'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={store.isActive} onChange={() => onStoresChange(stores.map(s => s.id === store.id ? { ...s, isActive: !s.isActive } : s))} className="sr-only peer" />
                                <div className="w-[42px] h-[22px] border-[2.5px] border-black bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[0_2px_0_0_#000] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:w-[13px] after:h-[13px] after:rounded-full after:transition-all peer-checked:after:translate-x-[20px]"></div>
                            </label>

                            <button
                                onClick={(e) => { e.stopPropagation(); setDeletingStoreId(store.id); }}
                                className="p-1 sm:p-2 text-black/10 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t-2 border-[#1a1a1a] border-dashed overflow-hidden bg-white px-1 sm:px-2.5 py-6 space-y-8">
                        <div className="flex items-center gap-4 sm:gap-6 pb-8 border-b-2 border-black/5">
                            <div className="relative group shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black border-2 border-black rounded-md overflow-hidden shadow-[0_4px_0_0_#000] relative">
                                    {store.imageUrl ? <img src={store.imageUrl} className="w-full h-full object-cover" /> : <div className="bg-white w-full h-full flex items-center justify-center text-black/5"><StoreIcon /></div>}
                                    {uploadingTarget === `STORE_LOGO:${store.id}` && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 transition-all rounded-sm">
                                            <Loader2 size={24} className="text-[#ffdf00] animate-spin" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileUpload(e.target.files[0], `STORE_LOGO:${store.id}`);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#ffdf00] border-2 border-black rounded-sm flex items-center justify-center shadow-[0_2px_0_0_#000] pointer-events-none group-hover:scale-110 transition-transform">
                                    <Pencil size={12} strokeWidth={3} />
                                </div>
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 px-1">{isPT ? 'TÍTULO / RÓTULO' : 'TITLE / LABEL'}</label>
                                <input
                                    type="text"
                                    value={store.name}
                                    placeholder={isPT ? "MINHA VITRINE" : "MY SHOWCASE"}
                                    onChange={e => onStoresChange(stores.map(s => s.id === store.id ? { ...s, name: e.target.value } : s))}
                                    className="w-full bg-slate-50 border-2 border-black px-4 py-3 sm:py-4 text-[13px] sm:text-base font-black uppercase rounded-sm outline-none shadow-[0_4px_0_0_#000] focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/5"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-4 mb-4 sm:mb-2">
                                <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-black/40">{isPT ? 'Produtos e Categorias' : 'Products & Categories'}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:flex xl:items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => setAddingToCollection({ storeId: store.id, colName: 'uncategorized' })}
                                        className="flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-[#ffdf00] border-2 border-black rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-[0_3px_0_0_#000] transition-all cursor-pointer active:scale-95 active:shadow-none"
                                    >
                                        <Plus size={14} strokeWidth={3} /> {isPT ? 'PRODUTO' : 'PRODUCT'}
                                    </button>
                                    <button onClick={() => setIsAddingCollection(store.id)} className="flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-white border-2 border-black rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-[0_3px_0_0_#1a1a1a] transition-all cursor-pointer active:scale-95 active:shadow-none">
                                        <FolderPlus size={14} /> {isPT ? 'COLEÇÃO' : 'COLLECTION'}
                                    </button>
                                    <button onClick={() => setShowArchive(true)} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-white border-2 border-black rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-[0_3px_0_0_#1a1a1a] transition-all cursor-pointer active:scale-95 active:shadow-none">
                                        <Archive size={14} /> {isPT ? 'ARQUIVADOS' : 'ARCHIVED'} ({products.filter(p => p.isArchived).length})
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isAddingCollection === store.id && (
                                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-[#ffdf00] p-6 border-2 border-black rounded-md mb-8 flex flex-col sm:flex-row gap-4 shadow-[0_8px_0_0_#1a1a1a]">
                                        <input
                                            autoFocus type="text" placeholder={isPT ? "Ex: Lançamentos" : "Ex: New Arrivals"}
                                            className="flex-1 bg-white border-2 border-black rounded-md px-5 py-3 text-sm font-black uppercase shadow-[0_3px_0_0_#000] outline-none"
                                            value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddCollection(store.id)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAddCollection(store.id)} className="flex-1 sm:px-8 py-3 bg-black text-[#97cd7a] border-2 border-black rounded-md text-[10px] font-black uppercase tracking-widest shadow-[0_3px_0_0_rgba(0,0,0,0.2)] transition-all">{isPT ? 'CRIAR' : 'CREATE'}</button>
                                            <button onClick={() => setIsAddingCollection(null)} className="p-3 bg-white border-2 border-black rounded-md shadow-[0_3px_0_0_#000] transition-all"><X size={20} /></button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                {/* Root products (uncategorized) */}
                                {addingToCollection?.storeId === store.id && addingToCollection?.colName === 'uncategorized' && (
                                    <div className="bg-slate-50 p-6 rounded-md border-2 border-dashed border-black mb-6">
                                        {renderAddForm(store.id, 'uncategorized')}
                                    </div>
                                )}
                                
                                <Reorder.Group 
                                    axis="y" 
                                    values={uncat.sort((a, b) => (a.position - b.position))} 
                                    onReorder={(newUncat) => handleReorderProducts(store.id, 'uncategorized', newUncat)}
                                    className="space-y-3"
                                >
                                    {uncat.sort((a, b) => (a.position - b.position)).map(renderProduct)}
                                </Reorder.Group>

                                <Reorder.Group 
                                    axis="y" 
                                    values={storeCols} 
                                    onReorder={(newCols) => handleReorderCollections(store.id, newCols)}
                                    className="space-y-4"
                                >
                                    {storeCols.map(colName => {
                                        const colProducts = storeProducts.filter(p => p.collection === colName);
                                        const isAddingToCol = addingToCollection?.storeId === store.id && addingToCollection?.colName === colName;
                                        const colKey = `${store.id}:${colName}`;
                                        const isColExpanded = expandedCollections.includes(colKey);
                                        const colDragControls = useDragControls();

                                        return (
                                            <Reorder.Item 
                                                key={colName} 
                                                value={colName}
                                                dragListener={false}
                                                dragControls={colDragControls}
                                                layout
                                                whileDrag={{ zIndex: 50, borderRadius: '6px' }}
                                                className={`select-none border-2 border-black rounded-md overflow-hidden shadow-[0_4px_0_0_#000] bg-white transition-colors ${isColExpanded ? 'mb-4' : 'mb-3'}`}
                                            >
                                                <div
                                                    className="flex items-center min-h-[82px] transition-colors cursor-pointer hover:bg-slate-50"
                                                    onClick={() => toggleCollection(store.id, colName)}
                                                >
                                                    <div 
                                                        className="w-10 sm:w-12 shrink-0 flex items-center justify-center border-r-[1.5px] border-black/10 transition-colors bg-white cursor-grab active:cursor-grabbing touch-none"
                                                        onPointerDown={(e) => colDragControls.start(e)}
                                                    >
                                                        <GripVertical size={16} className="text-black/15 group-hover:text-black/40" />
                                                    </div>

                                                    <div className="flex-1 flex items-center gap-3 sm:gap-4 py-4 px-3 sm:px-4 overflow-hidden">
                                                        <div className="text-black/20 shrink-0">
                                                            {isColExpanded ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
                                                        </div>

                                                        <div className="hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 border-2 border-black rounded-md bg-white items-center justify-center shadow-[0_3px_0_0_#000] shrink-0">
                                                            <Folder className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                                                        </div>

                                                        <div className="flex-1 min-w-0 pr-2">
                                                            {editingCollection?.storeId === store.id && editingCollection?.oldName === colName ? (
                                                                <input autoFocus type="text" className="bg-white border-2 border-black rounded-md px-2 py-1 text-sm sm:text-base font-black uppercase outline-none shadow-[0_2px_0_0_#000] w-full" value={editingCollection.newName} onChange={e => setEditingCollection({ ...editingCollection, newName: e.target.value })} onBlur={() => handleRenameCollection(store.id, colName, editingCollection.newName)} onKeyDown={e => e.key === 'Enter' && handleRenameCollection(store.id, colName, editingCollection.newName)} onClick={e => e.stopPropagation()} />
                                                            ) : (
                                                                <div className="flex items-center gap-2 group/col-title">
                                                                    <h6 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tight truncate">{colName}</h6>
                                                                    <button onClick={(e) => { e.stopPropagation(); setEditingCollection({ storeId: store.id, oldName: colName, newName: colName }); }} className="opacity-0 group-hover/col-title:opacity-100 p-1 text-black/20 hover:text-black transition-all"><Pencil size={12} /></button>
                                                                </div>
                                                            )}
                                                            <p className="text-[10px] sm:text-[11px] font-black text-black/30 uppercase tracking-widest mt-1 truncate">
                                                                {colProducts.length} {colProducts.length === 1 ? (isPT ? 'ITEM CONFIGURADO' : 'ITEM CONFIGURED') : (isPT ? 'ITENS CONFIGURADOS' : 'ITEMS CONFIGURED')}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={e => e.stopPropagation()}>

                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={!(store.disabledCollections || []).includes(colName)} 
                                                                    onChange={() => {
                                                                        const disabled = store.disabledCollections || [];
                                                                        const updated = disabled.includes(colName) 
                                                                            ? disabled.filter(c => c !== colName) 
                                                                            : [...disabled, colName];
                                                                        onStoresChange(stores.map(s => s.id === store.id ? { ...s, disabledCollections: updated } : s));
                                                                    }} 
                                                                    className="sr-only peer" 
                                                                />
                                                                <div className="w-[42px] h-[22px] border-[2.5px] border-black bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[0_2px_0_0_#000] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:w-[13px] after:h-[13px] after:rounded-full after:transition-all peer-checked:after:translate-x-[20px]"></div>
                                                            </label>
                                                            <button onClick={() => setDeletingCollection({ storeId: store.id, name: colName })} className="p-1 sm:p-2 text-black/10 hover:text-red-500 transition-colors">
                                                                <Trash2 className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isColExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-[#fff9c4]/10 border-t border-black border-dashed"
                                                        >
                                                            <div className="p-1 sm:p-2 space-y-3">
                                                                {isAddingToCol && renderAddForm(store.id, colName)}
                                                                <Reorder.Group 
                                                                    axis="y" 
                                                                    values={colProducts.sort((a, b) => (a.position - b.position))} 
                                                                    onReorder={(newProds) => handleReorderProducts(store.id, colName, newProds)}
                                                                    className="space-y-3"
                                                                >
                                                                    {colProducts.sort((a, b) => (a.position - b.position)).map(renderProduct)}
                                                                </Reorder.Group>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}

