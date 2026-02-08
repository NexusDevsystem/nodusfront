import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ExternalLink, DollarSign, Tag, Upload, X, Pencil, FolderPlus, Folder, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
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
    const [editingProductId, setEditingProductId] = useState<string | null>(null); // For inline edit? Or usage of modal? 
    // Actually reusing the "Add" mode for specific collections
    const [addingToCollection, setAddingToCollection] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});

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
        // Just adding it to the list visually? 
        // We don't have a "Collection" entity, only products with collection tags.
        // So we can't "create" an empty collection unless we store it somewhere.
        // BUT, the user wants to "add items by collection".
        // Solution: We can create an empty placeholder? No, that's messy.
        // "Empty Collection" visualization is tricky without a separate entity.
        // HACK: We will just allow adding a product TO a new collection immediately.
        // OR: We enter a "Draft Collection" mode where the first product added defines it.

        // Let's rely on "Add Product" to define the collection.
        // But user asked to "Create a collection". 
        // Let's treating "Adding a collection" as "Opening a generic 'New Collection' form that requires at least one product"?
        // Or we can just add a dummy product? No.

        // Better: Just add the name to `collections` list in local state? 
        // If I create a collection "Summer", and it has no products, it disappears on save.
        // That's acceptable for now? Or I can persist empty collections in `products` list? No.

        setAddingToCollection(newCollectionName);
        setNewCollectionName('');
        setIsAddingCollection(false);
        // And auto-expand?
    };

    // Actually, to make "Empty Collection" persist, we might need a dummy item or just accept it disappears.
    // For this UI, let's make "Add Collection" immediately prompt to add the first product?
    // "Create Collection" -> Type Name -> Opens "Add Product" form for that collection.

    const handleAddProduct = (collectionName: string) => {
        if (!newProduct.name || !newProduct.url) return;

        const image = newProduct.image || 'https://placehold.co/200x200?text=No+Image';

        const product: Product = {
            id: crypto.randomUUID(),
            name: newProduct.name as string,
            url: newProduct.url as string,
            image,
            clicks: 0,
            collection: collectionName, // Set the collection!
            price: newProduct.price,
            discountCode: newProduct.discountCode
        };

        onChange([...products, product]);
        setNewProduct({});
        setAddingToCollection(null);

        // Auto-expand the collection
        if (!expandedCollections.includes(collectionName)) {
            setExpandedCollections(prev => [...prev, collectionName]);
        }
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            onChange(products.filter(p => p.id !== id));
        }
    };

    const updateProduct = (id: string, field: keyof Product, value: string) => {
        onChange(products.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleRenameCollection = (oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) return;
        onChange(products.map(p =>
            p.collection === oldName ? { ...p, collection: newName } : p
        ));
    };

    const handleDeleteCollection = (name: string) => {
        if (confirm(`Excluir coleção "${name}" e todos os seus produtos?`)) {
            onChange(products.filter(p => p.collection !== name));
        }
    };

    // Render a Product Row
    const renderProduct = (product: Product) => (
        <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex gap-3 items-start">
            <div className="cursor-move text-slate-300 hover:text-slate-500 mt-2">
                <GripVertical size={16} />
            </div>

            <div className="relative group/edit shrink-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity rounded-lg">
                    <Pencil size={12} className="text-white" />
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

            <div className="flex-1 min-w-0 space-y-1.5">
                <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    className="w-full font-semibold text-slate-800 bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1 text-sm"
                    placeholder="Nome do produto"
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ExternalLink size={12} />
                    <input
                        type="text"
                        value={product.url}
                        onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                        className="flex-1 bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1 truncate"
                        placeholder="Link (https://...)"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <DollarSign size={10} />
                        <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1"
                            placeholder="Preço"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                title="Excluir"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    // Render "Add Product" Form
    const renderAddForm = (collectionName: string) => (
        <div className="bg-slate-50 p-4 rounded-xl border border-brand-200 animate-fade-in ring-2 ring-brand-50 mt-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Novo Produto em "{collectionName}"</h4>
            <div className="space-y-3">
                {/* Inputs reused from previous implementation but more compact */}
                <div>
                    <input
                        type="text"
                        placeholder="Nome do Produto"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-500 text-sm outline-none"
                        value={newProduct.name || ''}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        type="url"
                        placeholder="URL de destino"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-500 text-sm outline-none"
                        value={newProduct.url || ''}
                        onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Preço (Opcional)"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-500 text-sm outline-none"
                        value={newProduct.price || ''}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Cupom (Opcional)"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-500 text-sm outline-none"
                        value={newProduct.discountCode || ''}
                        onChange={e => setNewProduct({ ...newProduct, discountCode: e.target.value })}
                    />
                </div>

                {/* Image Upload Simplified */}
                <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-brand-400 transition">
                        {newProduct.image ? (
                            <img src={newProduct.image} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={20} className="text-slate-400" />
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
                    <p className="text-xs text-slate-400 flex-1">
                        Carregue uma imagem do seu dispositivo. 1:1 recomendado.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => { setAddingToCollection(null); setNewProduct({}); }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => handleAddProduct(collectionName)}
                        disabled={!newProduct.name || !newProduct.url}
                        className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 disabled:opacity-50"
                    >
                        Salvar Produto
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Sua Loja</h2>
                <button
                    onClick={() => setIsAddingCollection(true)}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full font-medium hover:bg-brand-700 transition shadow-sm text-sm"
                >
                    <FolderPlus size={18} />
                    Nova Coleção
                </button>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Organize seus produtos em coleções para exibir na aba "Loja".
                Produtos sem coleção aparecerão em "Geral".
            </p>

            {/* Add Collection Field */}
            {isAddingCollection && (
                <div className="flex gap-2 items-center animate-fade-in bg-white p-2 rounded-xl border border-brand-200 shadow-sm">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Nome da nova coleção (ex: Camisetas)"
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-100 text-sm"
                        value={newCollectionName}
                        onChange={e => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollection() }}
                    />
                    <button
                        onClick={handleAddCollection}
                        className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        onClick={() => setIsAddingCollection(false)}
                        className="text-slate-400 p-2 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {/* Temporary bucket for adding products to a new collection immediately? */}
                {addingToCollection && !collections.includes(addingToCollection) && (
                    <div className="border-l-4 border-brand-500 pl-4 py-2">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <Folder size={18} className="text-brand-500" />
                            {addingToCollection} (Nova)
                        </h3>
                        {renderAddForm(addingToCollection)}
                    </div>
                )}

                {/* Existing Collections */}
                {collections.map(collectionName => {
                    const colProducts = products.filter(p => p.collection === collectionName);
                    const isExpanded = expandedCollections.includes(collectionName);

                    return (
                        <div key={collectionName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
                                onClick={() => toggleCollection(collectionName)}
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm">{collectionName}</h3>
                                        <span className="text-xs text-slate-500">{colProducts.length} produtos</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setAddingToCollection(collectionName === addingToCollection ? null : collectionName)}
                                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-medium flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Produto
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCollection(collectionName)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {(isExpanded || addingToCollection === collectionName) && (
                                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                                    <div className="flex flex-col gap-3 mt-3">
                                        {colProducts.map(renderProduct)}
                                    </div>

                                    {addingToCollection === collectionName && renderAddForm(collectionName)}

                                    {!addingToCollection && colProducts.length === 0 && (
                                        <div className="text-center py-4 text-slate-400 text-xs italic">
                                            Nenhum produto nesta coleção.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Uncategorized Products */}
                {uncategorizedProducts.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed shadow-sm overflow-hidden opacity-90">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
                            onClick={() => toggleCollection('uncategorized')}
                        >
                            <div className="flex items-center gap-3">
                                <ChevronDown size={18} className="text-slate-400" />
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-slate-600 text-sm italic">Geral (Sem Coleção)</h3>
                                    <span className="text-xs text-slate-500">{uncategorizedProducts.length} produtos</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-3 mt-3">
                                {uncategorizedProducts.map(renderProduct)}
                            </div>
                            {/* Allow adding to uncategorized? Maybe not encouraged. */}
                        </div>
                    </div>
                )}

                {collections.length === 0 && uncategorizedProducts.length === 0 && !addingToCollection && (
                    <div className="text-center py-10 px-6">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Folder size={24} />
                        </div>
                        <h3 className="text-slate-900 font-medium text-sm">Nenhuma coleção criada</h3>
                        <p className="text-slate-500 text-xs mt-1">
                            Crie sua primeira coleção para começar a adicionar produtos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
