import React, { useState } from 'react';
import { Product, Store } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ExternalLink, DollarSign, Tag, Upload, X, Pencil, FolderPlus, Folder, ChevronDown, ChevronRight, Edit2, ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { compressImage, blobToDataURL } from '../utils/imageUtils';
import ImageCropperModal from './tools/ImageCropperModal';
import { apiClient } from '../services/apiClient';
import Tooltip from './Tooltip';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};

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
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
        return stores.length > 0 ? stores[0].id : null;
    });
    
    // Ensure we have a selection if stores exist
    React.useEffect(() => {
        if (!selectedStoreId && stores.length > 0) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores]);

    const selectedStore = stores.find(s => s.id === selectedStoreId);
    const storeProducts = products.filter(p => p.storeId === selectedStoreId);

    const [isAddingStore, setIsAddingStore] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');

    const [isAddingCollection, setIsAddingCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

    // Product Editing State
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [addingToCollection, setAddingToCollection] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});

    // Deletion states
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [deletingCollection, setDeletingCollection] = useState<string | null>(null);

    // Cropper State
    const [cropper, setCropper] = useState<{
        isOpen: boolean;
        image: string;
        targetProductId?: string;
        isNewProduct?: boolean;
    }>({
        isOpen: false,
        image: ''
    });

    // Auto-open form for pending collection if provided
    React.useEffect(() => {
        if (pendingCollection) {
            setAddingToCollection(pendingCollection);
            if (onPendingCollectionConsumed) {
                onPendingCollectionConsumed();
            }
        }
    }, [pendingCollection]);

    // Grouping for SELECTED STORE
    const collections = Array.from(new Set(storeProducts.map(p => p.collection).filter(Boolean) as string[])).sort();
    const uncategorizedProducts = storeProducts.filter(p => !p.collection);

    const toggleCollection = (name: string) => {
        setExpandedCollections(prev =>
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const isFree = !userProfile?.planType || userProfile?.planType === 'free';
    const maxStores = isFree ? 1 : 10;
    const maxCollectionsPerStore = isFree ? 2 : 20;

    const handleAddStore = () => {
        if (!newStoreName.trim()) return;
        
        if (stores.length >= maxStores) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }
        
        const newStore: Store = {
            id: crypto.randomUUID(),
            name: newStoreName.trim(),
            position: stores.length,
            isActive: true
        };

        onStoresChange([...stores, newStore]);
        setNewStoreName('');
        setIsAddingStore(false);
        setSelectedStoreId(newStore.id);
    };

    const handleDeleteStore = (id: string) => {
        onStoresChange(stores.filter(s => s.id !== id));
        onChange(products.filter(p => p.storeId !== id)); // Delete items from that store too
        if (selectedStoreId === id) {
            setSelectedStoreId(stores.length > 1 ? stores[0].id : null);
        }
    };

    const handleAddCollection = () => {
        if (!newCollectionName.trim()) return;

        if (collections.length >= maxCollectionsPerStore) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }

        setAddingToCollection(newCollectionName.trim());
        setNewCollectionName('');
        setIsAddingCollection(false);
    };

    const handleAddProduct = (collectionName: string) => {
        if (!newProduct.name || !newProduct.url) return;

        const colProducts = products.filter(p => p.collection === collectionName);
        if (isFree && colProducts.length >= 4) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }

        const image = newProduct.image || 'https://placehold.co/200x200?text=No+Image';

        const product: Product = {
            id: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            name: newProduct.name as string,
            url: newProduct.url as string,
            image,
            clicks: 0,
            collection: collectionName,
            price: newProduct.price,
            discountCode: newProduct.discountCode,
            storeId: selectedStoreId || undefined
        };

        onChange([...products, product]);
        setNewProduct({});
        setAddingToCollection(null);

        if (!expandedCollections.includes(collectionName)) {
            setExpandedCollections(prev => [...prev, collectionName]);
        }
    };

    const handleDeleteProduct = (id: string) => {
        onChange(products.filter(p => p.id !== id));
        setDeletingProductId(null);
    };

    const updateProduct = (id: string, field: keyof Product, value: string) => {
        onChange(products.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleDeleteCollection = (name: string) => {
        onChange(products.filter(p => p.collection !== name));
        setDeletingCollection(null);
    };

    const renderProduct = (product: Product) => (
        <div key={product.clientId || product.id} className="relative bg-white p-2.5 border border-[#1a1a1a] shadow-[0_1px_0_0_#1a1a1a] hover:translate-y-[0.5px] hover:shadow-none transition-all group flex gap-2.5 items-center overflow-hidden mb-2.5 rounded-xl">
            <div className="cursor-move text-black hover:text-[#97cd7a] shrink-0">
                <GripVertical size={18} strokeWidth={3} />
            </div>

            <div className="relative group/edit shrink-0">
                <div className="w-10 h-10 border border-[#1a1a1a] bg-white overflow-hidden shadow-[0_1px_0_0_#1a1a1a] rounded-lg">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="absolute inset-0 bg-[#1a1a1a]/40 flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" strokeWidth={3} />
                </div>
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={async (e) => {
                        if (e.target.files?.[0]) {
                            const dataUrl = await fileToDataURL(e.target.files[0]);
                            setCropper({
                                isOpen: true,
                                image: dataUrl,
                                targetProductId: product.id,
                                isNewProduct: false
                            });
                            e.target.value = '';
                        }
                    }}
                />
            </div>

            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.nameLabel')}</label>
                    <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        className="w-full bg-white border border-[#1a1a1a] py-1 px-2.5 text-[11px] font-medium uppercase tracking-widest text-black focus:bg-[#f1f1f1] outline-none transition-all shadow-[0_1px_0_0_#1a1a1a] rounded-lg"
                        placeholder={t('shop.productNamePlaceholder')}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.linkLabel')}</label>
                    <div className="flex items-center bg-white border border-[#1a1a1a] px-2.5 focus-within:bg-[#f1f1f1] transition-all shadow-[0_1px_0_0_#1a1a1a] rounded-lg">
                        <ExternalLink size={10} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.url}
                            onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-normal uppercase tracking-widest text-black outline-none truncate placeholder:text-black/30 placeholder:uppercase"
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.priceLabel')}</label>
                    <div className="flex items-center bg-white border-2 border-[#1a1a1a] px-3 focus-within:bg-[#f1f1f1] transition-all shadow-[0_2px_0_0_#1a1a1a]">
                        <DollarSign size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-normal uppercase tracking-widest text-black outline-none placeholder:text-black/30 placeholder:uppercase"
                            placeholder={t('shop.pricePlaceholder')}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.couponLabel')}</label>
                    <div className="flex items-center bg-white border-2 border-[#1a1a1a] px-3 focus-within:bg-[#f1f1f1] transition-all shadow-[0_2px_0_0_#1a1a1a]">
                        <Tag size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.discountCode || ''}
                            onChange={(e) => updateProduct(product.id, 'discountCode', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-normal uppercase tracking-widest text-black outline-none placeholder:text-black/30 placeholder:uppercase"
                            placeholder={t('shop.couponPlaceholder')}
                        />
                    </div>
                </div>
            </div>

            <Tooltip text={t('common.delete')} position="top">
                <button
                    onClick={() => setDeletingProductId(product.id)}
                    className="p-2 bg-white text-black border border-[#1a1a1a] hover:text-white hover:bg-red-500 hover:translate-y-[0.5px] shadow-[0_1px_0_0_#1a1a1a] hover:shadow-none transition-all ml-2 rounded-lg"
                >
                    <Trash2 size={16} strokeWidth={3} />
                </button>
            </Tooltip>

            {/* Product Deletion Confirm Panel */}
            <AnimatePresence>
                {deletingProductId === product.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 z-20 bg-[#97cd7a] border-t-2 border-[#1a1a1a] overflow-hidden"
                    >
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-black">
                                <AlertCircle size={20} strokeWidth={3} />
                                <span className="text-[10px] font-medium uppercase tracking-[0.2em]">{t('shop.deleteProduct')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeletingProductId(null)}
                                    className="px-4 py-2 bg-white border-2 border-[#1a1a1a] text-[9px] font-medium uppercase tracking-widest text-black hover:bg-[#97cd7a] hover:text-white transition shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-4 py-2 bg-red-400 border-2 border-[#1a1a1a] text-black text-[9px] font-medium uppercase tracking-widest hover:bg-red-500 transition shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    {t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderAddForm = (collectionName: string) => (
        <div className="bg-[#f8f8f8] p-6 border-2 border-[#1a1a1a] border-dashed mt-4 animate-fade-in space-y-6 shadow-[0_2px_0_0_#1a1a1a] rounded-2xl">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black border-b border-[#1a1a1a]/10 pb-3">
                <Plus size={18} strokeWidth={3} />
                <span>{t('shop.addProduct')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.productName')}</label>
                    <input
                        type="text"
                        placeholder={t('shop.productNamePlaceholder')}
                        className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-medium uppercase tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[0_2px_0_0_#1a1a1a] placeholder:text-black/30 placeholder:font-normal"
                        value={newProduct.name || ''}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.destinationUrl')}</label>
                    <input
                        type="url"
                        placeholder={t('shop.destinationUrlPlaceholder')}
                        className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-normal tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[0_2px_0_0_#1a1a1a] placeholder:text-black/30 placeholder:uppercase"
                        value={newProduct.url || ''}
                        onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.priceOptional')}</label>
                    <input
                        type="text"
                        placeholder={t('shop.pricePlaceholder')}
                        className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-normal tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[0_2px_0_0_#1a1a1a] placeholder:text-black/30"
                        value={newProduct.price || ''}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('shop.couponOptional')}</label>
                    <input
                        type="text"
                        placeholder={t('shop.couponPlaceholder')}
                        className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-normal uppercase tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[0_2px_0_0_#1a1a1a] placeholder:text-black/30"
                        value={newProduct.discountCode || ''}
                        onChange={e => setNewProduct({ ...newProduct, discountCode: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border-4 border-[#1a1a1a] border-dashed">
                <div className="relative w-24 h-24 border-2 border-[#1a1a1a] bg-white flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:bg-[#ffdf00] transition group shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none">
                    {newProduct.image ? (
                        <img src={newProduct.image} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                        <ImageIcon size={32} strokeWidth={3} className="text-black group-hover:text-black transition" />
                    )}
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const dataUrl = await fileToDataURL(e.target.files[0]);
                                setCropper({
                                    isOpen: true,
                                    image: dataUrl,
                                    isNewProduct: true
                                });
                                e.target.value = '';
                            }
                        }}
                    />
                </div>
                <div className="flex-1 space-y-2 py-2">
                    <p className="text-sm font-medium text-black uppercase tracking-widest">{t('shop.productThumbnail')}</p>
                    <p className="text-xs font-normal text-black/60 leading-relaxed uppercase tracking-widest max-w-sm">
                        {t('shop.thumbnailDesc')}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#1a1a1a]/10">
                <button
                    onClick={() => { setAddingToCollection(null); setNewProduct({}); }}
                    className="px-6 py-2.5 bg-white border-2 border-[#1a1a1a] text-[9px] font-medium uppercase tracking-widest text-black hover:bg-[#97cd7a] hover:text-white transition shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => handleAddProduct(collectionName)}
                    disabled={!newProduct.name || !newProduct.url}
                    className="px-6 py-2.5 bg-[#97cd7a] border-2 border-[#1a1a1a] text-black text-[9px] font-medium uppercase tracking-widest hover:bg-[#97cd7a] hover:text-[#97cd7a] disabled:opacity-50 disabled:grayscale transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none"
                >
                    {t('shop.saveProduct')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* STORES MANAGEMENT SECTION */}
            <div className="bg-white p-6 rounded-3xl border-[2.5px] border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] mb-8">
                <div className="flex items-center justify-between gap-4 mb-6 border-b-2 border-[#1a1a1a] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} className="text-[#1a1a1a]" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-[#1a1a1a] leading-none">{t('shop.title')}</h2>
                            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-1">{stores.length} {isPT ? 'LOJAS ATIVAS' : 'ACTIVE STORES'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddingStore(true)}
                        className="flex items-center gap-2.5 px-6 py-3 bg-[#97cd7a] text-[#1a1a1a] border-[2.5px] border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl group"
                    >
                        <PlusCircle size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        <span className="hidden sm:inline">{isPT ? 'NOVA LOJA' : 'NEW STORE'}</span>
                    </button>
                </div>

                {/* HORIZONTAL STORE SELECTOR */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
                    {stores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => setSelectedStoreId(store.id)}
                            className={`min-w-[140px] px-5 py-4 border-[2.5px] border-[#1a1a1a] rounded-2xl flex flex-col gap-2 transition-all relative ${
                                selectedStoreId === store.id 
                                ? "bg-[#ffdf00] shadow-none translate-y-[4px]" 
                                : "bg-white shadow-[0_4px_0_0_#1a1a1a] opacity-60 hover:opacity-100 hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#1a1a1a]"
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full text-left">{store.name}</span>
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[8px] font-black text-black/40 uppercase">
                                    {products.filter(p => p.storeId === store.id).length} {isPT ? 'ITENS' : 'ITEMS'}
                                </span>
                                {selectedStoreId === store.id && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteStore(store.id); }}
                                        className="p-1 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={12} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                            {selectedStoreId === store.id && (
                                <div className="absolute -top-2 -right-2 bg-black text-[#ffdf00] py-1 px-2 border-2 border-black rounded-lg text-[7px] font-black uppercase shadow-[0_2px_0_0_#1a1a1a]">
                                    {isPT ? 'EDITANDO' : 'EDITING'}
                                </div>
                            )}
                        </button>
                    ))}
                    {stores.length === 0 && (
                        <div className="w-full py-8 border-4 border-dashed border-black/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                            <AlertCircle size={32} className="text-black/10" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">{isPT ? 'Nenhuma loja criada' : 'No stores created'}</p>
                        </div>
                    )}
                </div>

                {/* ADD STORE MODAL/PANEL */}
                <AnimatePresence>
                    {isAddingStore && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <div className="bg-[#ffdf00] w-full max-w-md border-[4px] border-[#1a1a1a] shadow-[0_12px_0_0_#1a1a1a] rounded-[32px] overflow-hidden">
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1a1a1a]">{isPT ? 'CRIAR NOVA LOJA' : 'CREATE NEW STORE'}</h3>
                                        <button onClick={() => setIsAddingStore(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                                            <X size={24} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] ml-1">{isPT ? 'Nome da Loja' : 'Store Name'}</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                className="w-full bg-white border-[3px] border-[#1a1a1a] rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest text-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] outline-none"
                                                placeholder="MINHA LOJA NODUS"
                                                value={newStoreName}
                                                onChange={e => setNewStoreName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddStore() }}
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button 
                                                onClick={() => setIsAddingStore(false)}
                                                className="flex-1 px-6 py-4 bg-white border-[3px] border-[#1a1a1a] rounded-2xl shadow-[0_4px_0_0_#1a1a1a] text-[10px] font-black uppercase tracking-widest hover:translate-y-[2px] hover:shadow-none transition-all"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button 
                                                onClick={handleAddStore}
                                                className="flex-1 px-6 py-4 bg-black text-[#ffdf00] border-[3px] border-[#1a1a1a] rounded-2xl shadow-[0_4px_0_0_#1a1a1a] text-[10px] font-black uppercase tracking-widest hover:translate-y-[2px] hover:shadow-none transition-all"
                                            >
                                                {isPT ? 'CRIAR' : 'CREATE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {selectedStore && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-50 border-2 border-dashed border-[#1a1a1a]/20 p-8 rounded-[40px] mb-8 relative overflow-hidden group">
                        <div className="hidden lg:block absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700">
                             <ShoppingBag size={240} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Folder size={24} className="text-black" strokeWidth={3} />
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1a1a1a]">
                                    {isPT ? 'Coleções de' : 'Collections of'} <span className="text-[#97cd7a]">{selectedStore.name}</span>
                                </h3>
                            </div>
                            <p className="text-[10px] font-normal uppercase tracking-widest text-[#1a1a1a]/60 leading-relaxed max-w-sm mb-6">
                                {isPT ? 'Crie categorias específicas para seus produtos dentro desta loja para facilitar a navegação do cliente.' : 'Create specific categories for your products within this store to make customer navigation easier.'}
                            </p>
                            
                            <Tooltip text={t('shop.newCategory')} position="bottom">
                                <button
                                    onClick={() => setIsAddingCollection(true)}
                                    className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-black border-[2.5px] border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl"
                                >
                                    <FolderPlus size={18} strokeWidth={3} />
                                    <span>{t('shop.newCategory')}</span>
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {isAddingCollection && (
                        <div className="animate-fade-in bg-[#ffdf00] p-6 border-[3px] border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] mb-8 rounded-[32px]">
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[0_2px_0_0_#1a1a1a]">
                                        <Folder size={18} strokeWidth={3} className="text-black shrink-0" />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder={t('shop.categoryPlaceholder')}
                                        className="flex-1 min-w-0 bg-white border-[2.5px] border-[#1a1a1a] px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-black outline-none placeholder:text-black/30 transition-all focus:bg-white focus:shadow-[0_2px_0_0_#1a1a1a]"
                                        value={newCollectionName}
                                        onChange={e => setNewCollectionName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollection() }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 justify-end sm:justify-start">
                                    <button
                                        onClick={handleAddCollection}
                                        className="flex-1 sm:flex-none whitespace-nowrap bg-black text-[#97cd7a] px-8 py-3.5 border-[2.5px] border-[#1a1a1a] font-black text-[11px] transition-all uppercase tracking-widest shadow-[0_1px_0_0_#1a1a1a] rounded-2xl hover:translate-y-[1px] hover:shadow-none"
                                    >
                                        {t('shop.create')}
                                    </button>
                                    <button
                                        onClick={() => setIsAddingCollection(false)}
                                        className="w-12 h-12 flex items-center justify-center bg-white text-black border-2 border-black rounded-xl hover:text-red-600 transition-all shrink-0 shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8 pb-12">
                        {addingToCollection && !collections.includes(addingToCollection) && (
                            <div className="bg-white rounded-[32px] border-[2.5px] border-[#1a1a1a] p-8 shadow-[0_4px_0_0_#1a1a1a] relative overflow-hidden">
                                <div className="absolute top-0 right-0 py-2 px-6 bg-[#97cd7a] border-b-2 border-l-2 border-black text-[8px] font-black uppercase tracking-widest">
                                    {isPT ? 'NOVA CATEGORIA' : 'NEW CATEGORY'}
                                </div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-[#f1f1f1] border-2 border-black rounded-xl flex items-center justify-center">
                                        <Folder size={18} className="text-black" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-[#1a1a1a]">
                                        {addingToCollection}
                                    </h3>
                                </div>
                                {renderAddForm(addingToCollection)}
                            </div>
                        )}

                        {collections.map(collectionName => {
                            const colProducts = storeProducts.filter(p => p.collection === collectionName);
                            const isExpanded = expandedCollections.includes(collectionName);

                            return (
                                <div key={collectionName} className="bg-white border-[2.5px] border-[#1a1a1a] overflow-hidden shadow-[0_4px_0_0_#1a1a1a] rounded-[32px] transition-all">
                                    <div
                                        className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-slate-50 transition border-b-2 border-transparent"
                                        onClick={() => toggleCollection(collectionName)}
                                        style={{ borderBottomColor: isExpanded ? 'black' : 'transparent' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 border-2 border-black flex items-center justify-center rounded-xl transition-all duration-300 ${isExpanded ? 'bg-[#ffdf00] rotate-180' : 'bg-white'}`}>
                                                <ChevronDown size={20} className="text-black" strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-black text-black text-base uppercase tracking-tight">{collectionName}</h3>
                                                <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">{colProducts.length} {t('shop.itemsRegistered')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    const colProducts = storeProducts.filter(p => p.collection === collectionName);
                                                    if (isFree && colProducts.length >= 4 && addingToCollection !== collectionName) {
                                                        window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                                        return;
                                                    }
                                                    setAddingToCollection(collectionName === addingToCollection ? null : collectionName);
                                                }}
                                                className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-[#1a1a1a] hover:bg-[#ffdf00] text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-2xl"
                                            >
                                                <PlusCircle size={14} strokeWidth={3} /> {t('shop.addItem')}
                                            </button>
                                            <button
                                                onClick={() => setDeletingCollection(collectionName)}
                                                className="w-11 h-11 flex items-center justify-center bg-white text-black border-2 border-[#1a1a1a] hover:bg-red-500 hover:text-white transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-2xl"
                                            >
                                                <Trash2 size={18} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {deletingCollection === collectionName && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-[#97cd7a] border-t-2 border-[#1a1a1a] overflow-hidden"
                                            >
                                                <div className="p-6 px-8 flex items-center justify-between gap-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-3 text-black">
                                                            <AlertCircle size={20} strokeWidth={3} />
                                                            <span className="text-[11px] font-black uppercase tracking-widest">{t('shop.deleteCategory')}</span>
                                                        </div>
                                                        <span className="text-[9px] text-black/60 font-medium uppercase tracking-widest mt-1 ml-8">{t('shop.deleteCategoryWarning')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setDeletingCollection(null)}
                                                            className="px-6 py-3 bg-white border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] hover:bg-slate-100 transition rounded-2xl"
                                                        >
                                                            {t('common.cancel')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCollection(collectionName)}
                                                            className="px-6 py-3 bg-red-400 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition shadow-[0_4px_0_0_#000] rounded-2xl active:translate-y-[1px] active:shadow-none"
                                                        >
                                                            {t('common.confirm')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {(isExpanded || addingToCollection === collectionName) && (
                                        <div className="p-8 bg-slate-50/10">
                                            <div className="space-y-4">
                                                {colProducts.map(renderProduct)}
                                            </div>

                                            {addingToCollection === collectionName && renderAddForm(collectionName)}

                                            {!addingToCollection && colProducts.length === 0 && (
                                                <div className="text-center py-12 bg-white border-4 border-dashed border-black/5 rounded-[24px]">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                                        <Tag size={20} className="text-black" />
                                                    </div>
                                                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest italic">{t('shop.noProductsInCategory')}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {uncategorizedProducts.length > 0 && (
                             <div className="bg-white border-2 border-dashed border-[#1a1a1a] opacity-80 overflow-hidden shadow-[0_4px_0_0_#1a1a1a] rounded-[40px]">
                                <div
                                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#ffdf00] transition-colors"
                                    onClick={() => toggleCollection('uncategorized')}
                                >
                                    <div className="flex items-center gap-4">
                                        <ChevronDown size={24} strokeWidth={3} className="text-black" />
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-black text-sm uppercase tracking-widest">{t('shop.uncategorized')}</h3>
                                            <span className="text-[10px] font-normal text-black/70 uppercase tracking-widest">{uncategorizedProducts.length} {t('shop.items')}</span>
                                        </div>
                                    </div>
                                </div>

                                {expandedCollections.includes('uncategorized') && (
                                    <div className="p-8 bg-white border-t-2 border-[#1a1a1a] border-dashed">
                                        <div className="space-y-4">
                                            {uncategorizedProducts.map(renderProduct)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {collections.length === 0 && uncategorizedProducts.length === 0 && !addingToCollection && (
                             <div className="text-center py-20 px-10 bg-white border-4 border-dashed border-[#1a1a1a]/10 rounded-[48px] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-20 h-20 bg-[#97cd7a]/10 rounded-br-full" />
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ffdf00]/10 rounded-tl-full" />
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-[#ffdf00] text-black border-[3px] border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-3">
                                        <Tag size={32} strokeWidth={3} />
                                    </div>
                                    <h3 className="text-[#1a1a1a] font-black text-2xl uppercase tracking-tighter mb-4 italic leading-none">{isPT ? 'Sua Loja está Vazia' : 'Your store is empty'}</h3>
                                    <p className="text-[#1a1a1a]/40 text-xs font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                        {isPT ? 'Clique no botão acima para começar a adicionar produtos e categorias.' : 'Click the button above to start adding products and categories.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!selectedStore && stores.length > 0 && (
                <div className="text-center py-32 px-10 bg-white border-[3px] border-[#1a1a1a] rounded-[48px] shadow-[0_8px_0_0_#1a1a1a]">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-dashed border-black/10">
                         <ShoppingBag size={40} className="text-black/10" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1a1a1a] mb-2">{isPT ? 'SELECIONE UMA LOJA' : 'SELECT A STORE'}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/30 italic">{isPT ? 'Escolha uma loja acima para começar a gerenciar seus produtos' : 'Choose a store above to start managing your products'}</p>
                </div>
            )}

            {stores.length === 0 && (
                <div className="text-center py-40 px-10 bg-slate-50 border-[3px] border-dashed border-black/20 rounded-[48px] animate-pulse">
                     <div className="w-24 h-24 bg-white border-2 border-black/5 rounded-full flex items-center justify-center mx-auto mb-8">
                         <ShoppingBag size={40} className="text-black/5" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-black/20 mb-4">{isPT ? 'COMECE CRIANDO SUA PRIMEIRA LOJA' : 'START BY CREATING YOUR FIRST STORE'}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/10 italic">{isPT ? 'Clique no botão "Nova Loja" acima' : 'Click the "New Store" button above'}</p>
                </div>
            )}

            <ImageCropperModal
                isOpen={cropper.isOpen}
                image={cropper.image}
                aspectRatio={1}
                title={t('shop.cropImage') || 'Recortar Imagem do Produto'}
                onClose={() => setCropper(prev => ({ ...prev, isOpen: false }))}
                onCropComplete={async (blob) => {
                    try {
                        const file = new File([blob], 'product.jpg', { type: 'image/jpeg' });
                        const uploadRes = await apiClient.uploadInternalAsset(file);

                        let imageUrl = '';
                        if (uploadRes.success && uploadRes.file?.url) {
                            imageUrl = uploadRes.file.url;
                        } else {
                            // Fallback to Base64 if upload fails, though less desirable
                            imageUrl = await blobToDataURL(blob);
                        }

                        if (cropper.isNewProduct) {
                            setNewProduct({ ...newProduct, image: imageUrl });
                        } else if (cropper.targetProductId) {
                            updateProduct(cropper.targetProductId, 'image', imageUrl);
                        }
                    } catch (error) {
                        console.error('Error uploading product image:', error);
                    }
                    setCropper(prev => ({ ...prev, isOpen: false }));
                }}
            />
        </div>
    );
}
