import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ExternalLink, DollarSign, Tag, Upload, X, Pencil, FolderPlus, Folder, ChevronDown, ChevronRight, Edit2, ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../utils/imageUtils';

interface ShopEditorProps {
    products: Product[];
    onChange: (products: Product[]) => void;
}

export default function ShopEditor({ products, onChange }: ShopEditorProps) {
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

    // Grouping
    const collections = Array.from(new Set(products.map(p => p.collection).filter(Boolean) as string[])).sort();
    const uncategorizedProducts = products.filter(p => !p.collection);

    const toggleCollection = (name: string) => {
        setExpandedCollections(prev =>
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const handleAddCollection = () => {
        if (!newCollectionName.trim()) return;
        setAddingToCollection(newCollectionName);
        setNewCollectionName('');
        setIsAddingCollection(false);
    };

    const handleAddProduct = (collectionName: string) => {
        if (!newProduct.name || !newProduct.url) return;

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
        <div key={product.clientId || product.id} className="relative bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all group flex gap-4 items-center overflow-hidden">
            <div className="cursor-move text-slate-300 hover:text-slate-400 shrink-0">
                <GripVertical size={16} />
            </div>

            <div className="relative group/edit shrink-0">
                <div className="w-14 h-14 rounded-md overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity rounded-md">
                    <Upload size={14} className="text-white" />
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

            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Nome</label>
                    <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-md py-1.5 px-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:border-slate-300 outline-none transition"
                        placeholder="Nome do produto"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Link</label>
                    <div className="flex items-center bg-slate-50/50 border border-slate-100 rounded-md px-2.5 focus-within:bg-white focus-within:border-slate-300 transition">
                        <ExternalLink size={12} className="text-slate-300 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.url}
                            onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                            className="w-full bg-transparent py-1.5 text-sm font-medium text-slate-700 outline-none truncate"
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Preço</label>
                    <div className="flex items-center bg-slate-50/50 border border-slate-100 rounded-md px-2.5 focus-within:bg-white focus-within:border-slate-300 transition">
                        <DollarSign size={12} className="text-slate-300 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="w-full bg-transparent py-1.5 text-sm font-medium text-slate-700 outline-none"
                            placeholder="Ex: R$ 99,90"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Cupom</label>
                    <div className="flex items-center bg-slate-50/50 border border-slate-100 rounded-md px-2.5 focus-within:bg-white focus-within:border-slate-300 transition">
                        <Tag size={12} className="text-slate-300 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={product.discountCode || ''}
                            onChange={(e) => updateProduct(product.id, 'discountCode', e.target.value)}
                            className="w-full bg-transparent py-1.5 text-sm font-medium text-slate-700 outline-none"
                            placeholder="Ex: SAVE10"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setDeletingProductId(product.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Excluir"
            >
                <Trash2 size={18} />
            </button>

            {/* Product Deletion Confirm Panel */}
            <AnimatePresence>
                {deletingProductId === product.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 z-20 bg-white border-t border-red-100 overflow-hidden"
                    >
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle size={16} />
                                <span className="text-xs font-bold">Excluir produto?</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDeletingProductId(null)}
                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-4 py-1.5 bg-red-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition shadow-sm"
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
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-4 animate-fade-in space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <Plus size={14} />
                <span>Adicionar Novo Produto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Nome do Produto</label>
                    <input
                        type="text"
                        placeholder="Ex: Camiseta Nodus Edition"
                        className="w-full px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-medium outline-none focus:border-[#32a800] transition"
                        value={newProduct.name || ''}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">URL de Destino</label>
                    <input
                        type="url"
                        placeholder="https://minhaloja.com/produto"
                        className="w-full px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-medium outline-none focus:border-[#32a800] transition"
                        value={newProduct.url || ''}
                        onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Preço (Opcional)</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        className="w-full px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-medium outline-none focus:border-[#32a800] transition"
                        value={newProduct.price || ''}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Cupom (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ex: NODUS10"
                        className="w-full px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-medium outline-none focus:border-[#32a800] transition"
                        value={newProduct.discountCode || ''}
                        onChange={e => setNewProduct({ ...newProduct, discountCode: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-lg">
                <div className="relative w-20 h-20 rounded-md border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#32a800] transition group">
                    {newProduct.image ? (
                        <img src={newProduct.image} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={24} className="text-slate-300 group-hover:text-[#32a800] transition" />
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
                <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-slate-700">Miniatura do Produto</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Recomendamos uma imagem quadrada (1:1). Clique no quadro para carregar.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => { setAddingToCollection(null); setNewProduct({}); }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => handleAddProduct(collectionName)}
                    disabled={!newProduct.name || !newProduct.url}
                    className="px-6 py-2 bg-[#1a1a1a] text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black disabled:opacity-30 transition-all shadow-md"
                >
                    Salvar Produto
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={18} className="text-slate-500" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Configurar Vitrine</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingCollection(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-[#32a800] hover:text-white rounded-md text-xs font-bold transition-all border border-slate-100"
                        title="Nova Coleção"
                    >
                        <FolderPlus size={16} />
                        <span className="hidden sm:inline">NOVA CATEGORIA</span>
                    </button>
                </div>

                <p className="text-xs md:text-sm text-slate-400 bg-slate-50/70 p-4 rounded-md border border-slate-100 leading-relaxed font-medium mb-6">
                    Mantenha sua vitrine organizada agrupando produtos por categorias.
                    Produtos sem categoria serão listados automaticamente em uma seção geral.
                </p>

                {isAddingCollection && (
                    <div className="animate-fade-in bg-slate-50 p-3 sm:p-4 rounded-md border border-slate-200 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Folder size={18} className="text-slate-400 shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ex: Lançamentos 2024"
                                    className="flex-1 min-w-0 bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-medium outline-none focus:border-[#32a800] transition"
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollection() }}
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end sm:justify-start">
                                <button
                                    onClick={handleAddCollection}
                                    className="flex-1 sm:flex-none whitespace-nowrap bg-[#32a800] text-white px-5 py-2 rounded-md hover:bg-[#32a800]/90 font-bold text-xs transition-all uppercase tracking-widest shadow-sm"
                                >
                                    CRIAR
                                </button>
                                <button
                                    onClick={() => setIsAddingCollection(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 transition-all shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <Folder size={16} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Suas Categorias</span>
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
                        <div key={collectionName} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition border-b border-transparent"
                                onClick={() => toggleCollection(collectionName)}
                                style={{ borderBottomColor: isExpanded ? '#f1f5f9' : 'transparent' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-300" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{collectionName}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{colProducts.length} itens cadastrados</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setAddingToCollection(collectionName === addingToCollection ? null : collectionName)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[#32a800] hover:bg-[#32a800]/5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <PlusCircle size={14} strokeWidth={2.5} /> PRODUTO
                                    </button>
                                    <button
                                        onClick={() => setDeletingCollection(collectionName)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {deletingCollection === collectionName && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-red-50/50 border-t border-red-100 overflow-hidden"
                                    >
                                        <div className="p-4 px-6 flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <Trash2 size={14} />
                                                    <span className="text-xs font-bold uppercase tracking-tight">Excluir Categoria?</span>
                                                </div>
                                                <span className="text-[10px] text-red-600/60 font-medium">Todos os produtos desta categoria serão removidos.</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setDeletingCollection(null)}
                                                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCollection(collectionName)}
                                                    className="px-5 py-2 bg-red-500 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition shadow-sm"
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
                    <div className="bg-white rounded-lg border border-slate-200 border-dashed opacity-80 overflow-hidden shadow-sm">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition"
                            onClick={() => toggleCollection('uncategorized')}
                        >
                            <div className="flex items-center gap-4">
                                <ChevronDown size={18} className="text-slate-300" />
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-slate-400 text-sm uppercase italic tracking-tight">Produtos sem Categoria</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uncategorizedProducts.length} itens</span>
                                </div>
                            </div>
                        </div>

                        {expandedCollections.includes('uncategorized') && (
                            <div className="p-6 bg-slate-50/10">
                                <div className="space-y-4">
                                    {uncategorizedProducts.map(renderProduct)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {collections.length === 0 && uncategorizedProducts.length === 0 && !addingToCollection && (
                    <div className="text-center py-16 px-6 bg-white border border-dashed border-slate-200 rounded-lg">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-slate-800 font-bold text-sm uppercase tracking-wider mb-2">Sua vitrine está vazia</h3>
                        <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                            Crie sua primeira categoria no botão acima para começar a expor seus produtos no seu perfil Nodus.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
