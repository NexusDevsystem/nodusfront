import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ExternalLink, DollarSign, Tag, Upload, X, Pencil, FolderPlus, Folder, ChevronDown, ChevronRight, Edit2, ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../utils/imageUtils';

interface ShopEditorProps {
    products: Product[];
    onChange: (products: Product[]) => void;
    pendingCollection?: string | null;
    onPendingCollectionConsumed?: () => void;
    userProfile?: any;
}

export default function ShopEditor({ products, onChange, pendingCollection, onPendingCollectionConsumed, userProfile }: ShopEditorProps) {
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

    // Auto-open form for pending collection if provided
    React.useEffect(() => {
        if (pendingCollection) {
            setAddingToCollection(pendingCollection);
            if (onPendingCollectionConsumed) {
                onPendingCollectionConsumed();
            }
        }
    }, [pendingCollection]);

    // Grouping
    const collections = Array.from(new Set(products.map(p => p.collection).filter(Boolean) as string[])).sort();
    const uncategorizedProducts = products.filter(p => !p.collection);

    const toggleCollection = (name: string) => {
        setExpandedCollections(prev =>
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const isFree = userProfile?.planType === 'free' || !userProfile?.planType;

    const handleAddCollection = () => {
        if (!newCollectionName.trim()) return;

        if (isFree && collections.length >= 2) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }

        setAddingToCollection(newCollectionName);
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
            discountCode: newProduct.discountCode
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
        <div key={product.clientId || product.id} className="relative bg-white p-2.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group flex gap-2.5 items-center overflow-hidden mb-2.5">
            <div className="cursor-move text-black hover:text-[#97cd7a] shrink-0">
                <GripVertical size={18} strokeWidth={3} />
            </div>

            <div className="relative group/edit shrink-0">
                <div className="w-10 h-10 border border-black bg-white overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" strokeWidth={3} />
                </div>
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={async (e) => {
                        if (e.target.files?.[0]) {
                            try {
                                const base64 = await compressImage(e.target.files[0], 400, 0.8);
                                updateProduct(product.id, 'image', base64);
                            } catch (err) {
                                console.error('Error uploading image:', err);
                            }
                        }
                    }}
                />
            </div>

            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Nome</label>
                    <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        className="w-full bg-white border border-black py-1 px-2.5 text-[11px] font-black uppercase tracking-widest text-black focus:bg-[#f1f1f1] outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Nome do produto"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Link</label>
                    <div className="flex items-center bg-white border border-black px-2.5 focus-within:bg-[#f1f1f1] transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <ExternalLink size={10} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.url}
                            onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-bold uppercase tracking-widest text-black outline-none truncate placeholder:text-black/30 placeholder:uppercase"
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Preço</label>
                    <div className="flex items-center bg-white border-2 border-black px-3 focus-within:bg-[#f1f1f1] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <DollarSign size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-bold uppercase tracking-widest text-black outline-none placeholder:text-black/30 placeholder:uppercase"
                            placeholder="Ex: R$ 99,90"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Cupom</label>
                    <div className="flex items-center bg-white border-2 border-black px-3 focus-within:bg-[#f1f1f1] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Tag size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.discountCode || ''}
                            onChange={(e) => updateProduct(product.id, 'discountCode', e.target.value)}
                            className="w-full bg-transparent py-2 text-xs font-bold uppercase tracking-widest text-black outline-none placeholder:text-black/30 placeholder:uppercase"
                            placeholder="Ex: SAVE10"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setDeletingProductId(product.id)}
                className="p-2 bg-white text-black border border-black hover:text-white hover:bg-red-500 hover:translate-x-[0.5px] hover:translate-y-[0.5px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ml-2"
                title="Excluir"
            >
                <Trash2 size={16} strokeWidth={3} />
            </button>

            {/* Product Deletion Confirm Panel */}
            <AnimatePresence>
                {deletingProductId === product.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 z-20 bg-[#97cd7a] border-t-2 border-black overflow-hidden"
                    >
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-black">
                                <AlertCircle size={20} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Excluir produto?</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeletingProductId(null)}
                                    className="px-4 py-2 bg-white border-2 border-black text-[9px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-4 py-2 bg-red-400 border-2 border-black text-black text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderAddForm = (collectionName: string) => (
        <div className="bg-[#f8f8f8] p-6 border-2 border-black border-dashed mt-4 animate-fade-in space-y-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black border-b border-black/10 pb-3">
                <Plus size={18} strokeWidth={3} />
                <span>Adicionar Novo Produto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Nome do Produto</label>
                    <input
                        type="text"
                        placeholder="Ex: Camiseta Nodus Edition"
                        className="w-full px-4 py-3 bg-white border-2 border-black text-xs font-black uppercase tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30 placeholder:font-bold"
                        value={newProduct.name || ''}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">URL de Destino</label>
                    <input
                        type="url"
                        placeholder="https://minhaloja.com/produto"
                        className="w-full px-4 py-3 bg-white border-2 border-black text-xs font-bold tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30 placeholder:uppercase"
                        value={newProduct.url || ''}
                        onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Preço (Opcional)</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-3 bg-white border-2 border-black text-xs font-bold tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                        value={newProduct.price || ''}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 block px-1">Cupom (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ex: NODUS10"
                        className="w-full px-4 py-3 bg-white border-2 border-black text-xs font-bold uppercase tracking-widest outline-none focus:bg-[#f1f1f1] transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                        value={newProduct.discountCode || ''}
                        onChange={e => setNewProduct({ ...newProduct, discountCode: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border-4 border-black border-dashed">
                <div className="relative w-24 h-24 border-2 border-black bg-white flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:bg-[#ffdf00] transition group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                    {newProduct.image ? (
                        <img src={newProduct.image} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={32} strokeWidth={3} className="text-black group-hover:text-black transition" />
                    )}
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const base64 = await compressImage(e.target.files[0], 400, 0.8);
                                setNewProduct({ ...newProduct, image: base64 });
                            }
                        }}
                    />
                </div>
                <div className="flex-1 space-y-2 py-2">
                    <p className="text-sm font-black text-black uppercase tracking-widest">Miniatura do Produto</p>
                    <p className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-widest max-w-sm">
                        Recomendamos imagem quadrada (1:1). Clique no quadro para enviar.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-black/10">
                <button
                    onClick={() => { setAddingToCollection(null); setNewProduct({}); }}
                    className="px-6 py-2.5 bg-white border-2 border-black text-[9px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => handleAddProduct(collectionName)}
                    disabled={!newProduct.name || !newProduct.url}
                    className="px-6 py-2.5 bg-[#97cd7a] border-2 border-black text-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-[#97cd7a] disabled:opacity-50 disabled:grayscale transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                    Salvar Produto
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-none border-[1.5px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-black pb-2.5">
                    <div className="flex items-center gap-2.5">
                        <ShoppingBag size={18} strokeWidth={3} className="text-black" />
                        <h2 className="text-base font-black uppercase tracking-widest text-black">Configurar Vitrine</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingCollection(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-[#97cd7a] hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none text-[9px] font-black uppercase tracking-widest transition-all"
                        title="Nova Coleção"
                    >
                        <FolderPlus size={18} strokeWidth={3} />
                        <span className="hidden sm:inline">NOVA CATEGORIA</span>
                    </button>
                </div>

                <p className="text-[10px] md:text-xs text-black/60 font-bold bg-[#f1f1f1] p-4 border-l-4 border-[#97cd7a] leading-relaxed mb-6 uppercase tracking-[0.1em]">
                    Mantenha sua vitrine organizada agrupando produtos por categorias.
                    Produtos sem categoria serão listados automaticamente em uma seção geral.
                </p>

                {isAddingCollection && (
                    <div className="animate-fade-in bg-[#ffdf00] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Folder size={20} strokeWidth={3} className="text-black shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ex: Lançamentos 2024"
                                    className="flex-1 min-w-0 bg-white border-2 border-black px-4 py-2 text-sm font-bold text-black outline-none placeholder:text-black/30 transition-all focus:border-black focus:ring-0"
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollection() }}
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end sm:justify-start">
                                <button
                                    onClick={handleAddCollection}
                                    className="flex-1 sm:flex-none whitespace-nowrap bg-black text-[#97cd7a] px-6 py-2 border-2 border-black hover:text-white font-black text-[10px] transition-all uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    CRIAR
                                </button>
                                <button
                                    onClick={() => setIsAddingCollection(false)}
                                    className="p-2 text-black hover:text-red-600 transition-all shrink-0"
                                >
                                    <X size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <Folder size={20} strokeWidth={3} className="text-black" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-black">Suas Categorias</span>
                </div>

                {addingToCollection && !collections.includes(addingToCollection) && (
                    <div className="bg-white rounded-lg border border-[#32a800]/20 p-6 shadow-sm border-l-4 border-l-[#32a800]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#32a800]/5 text-[#32a800] rounded-md">
                                <Folder size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                                {addingToCollection} <span className="text-[10px] text-[#32a800] ml-2">(NOVA)</span>
                            </h3>
                        </div>
                        {renderAddForm(addingToCollection)}
                    </div>
                )}

                {collections.map(collectionName => {
                    const colProducts = products.filter(p => p.collection === collectionName);
                    const isExpanded = expandedCollections.includes(collectionName);

                    return (
                        <div key={collectionName} className="bg-white border border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all">
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition border-b border-transparent"
                                onClick={() => toggleCollection(collectionName)}
                                style={{ borderBottomColor: isExpanded ? 'black' : 'transparent' }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-black" strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-black text-sm uppercase tracking-tight">{collectionName}</h3>
                                        <span className="text-[9px] font-bold text-black/60 uppercase tracking-widest">{colProducts.length} itens cadastrados</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => {
                                            const colProducts = products.filter(p => p.collection === collectionName);
                                            if (isFree && colProducts.length >= 4 && addingToCollection !== collectionName) {
                                                window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                                return;
                                            }
                                            setAddingToCollection(collectionName === addingToCollection ? null : collectionName);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black hover:bg-[#ffdf00] text-[10px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                    >
                                        <PlusCircle size={14} strokeWidth={3} /> PRODUTO
                                    </button>
                                    <button
                                        onClick={() => setDeletingCollection(collectionName)}
                                        className="p-2 bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
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
                                        className="bg-[#97cd7a] border-t-2 border-black overflow-hidden"
                                    >
                                        <div className="p-4 px-6 flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-black">
                                                    <Trash2 size={16} strokeWidth={3} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Excluir Categoria?</span>
                                                </div>
                                                <span className="text-[10px] text-black/70 font-bold uppercase tracking-widest mt-1">Todos os produtos desta categoria serão removidos.</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setDeletingCollection(null)}
                                                    className="px-4 py-2 bg-white border-2 border-black text-[9px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCollection(collectionName)}
                                                    className="px-4 py-2 bg-red-400 border-2 border-black text-black text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                                >
                                                    Confirmar
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {(isExpanded || addingToCollection === collectionName) && (
                                <div className="p-6 bg-slate-50/20">
                                    <div className="space-y-4">
                                        {colProducts.map(renderProduct)}
                                    </div>

                                    {addingToCollection === collectionName && renderAddForm(collectionName)}

                                    {!addingToCollection && colProducts.length === 0 && (
                                        <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400 font-medium italic">Nenhum produto cadastrado nesta categoria.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {uncategorizedProducts.length > 0 && (
                    <div className="bg-white border-2 border-dashed border-black opacity-80 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#ffdf00] transition-colors"
                            onClick={() => toggleCollection('uncategorized')}
                        >
                            <div className="flex items-center gap-4">
                                <ChevronDown size={24} strokeWidth={3} className="text-black" />
                                <div className="flex flex-col">
                                    <h3 className="font-black text-black text-sm uppercase tracking-widest">Produtos sem Categoria</h3>
                                    <span className="text-[10px] font-bold text-black/70 uppercase tracking-widest">{uncategorizedProducts.length} itens</span>
                                </div>
                            </div>
                        </div>

                        {expandedCollections.includes('uncategorized') && (
                            <div className="p-6 bg-slate-50 border-t-2 border-black border-dashed">
                                <div className="space-y-4">
                                    {uncategorizedProducts.map(renderProduct)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {collections.length === 0 && uncategorizedProducts.length === 0 && !addingToCollection && (
                    <div className="text-center py-16 px-6 bg-white border-4 border-dashed border-black">
                        <div className="w-16 h-16 bg-[#ffdf00] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={28} strokeWidth={3} />
                        </div>
                        <h3 className="text-black font-black text-xl uppercase tracking-wider mb-2">Sua vitrine está vazia</h3>
                        <p className="text-black/60 text-sm font-bold max-w-xs mx-auto leading-relaxed">
                            Crie sua primeira categoria no botão acima para começar a expor seus produtos no seu perfil Nodus.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
