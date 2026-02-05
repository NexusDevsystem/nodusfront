import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ExternalLink, DollarSign, Tag } from 'lucide-react';

interface ShopEditorProps {
    products: Product[];
    onChange: (products: Product[]) => void;
}

export default function ShopEditor({ products, onChange }: ShopEditorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});

    const handleAdd = () => {
        if (!newProduct.name || !newProduct.url) return;

        // Use a placeholder if no image provided
        const image = newProduct.image || 'https://placehold.co/200x200?text=No+Image';

        const product: Product = {
            id: crypto.randomUUID(),
            name: newProduct.name,
            url: newProduct.url,
            image,
            clicks: 0
        };

        onChange([...products, product]);
        setNewProduct({});
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            onChange(products.filter(p => p.id !== id));
        }
    };

    const updateProduct = (id: string, field: keyof Product, value: string) => {
        onChange(products.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Seus Produtos</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full font-medium hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    Adicionar Produto
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-lg animate-fade-in ring-4 ring-brand-50">
                    <h3 className="font-semibold text-slate-700 mb-4">Novo Produto</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Produto</label>
                            <input
                                type="text"
                                placeholder="Ex: Caneca Personalizada"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                                value={newProduct.name || ''}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Link de Redirecionamento</label>
                            <div className="flex gap-2">
                                <div className="flex items-center justify-center w-10 bg-slate-100 rounded-lg border border-slate-200">
                                    <ExternalLink size={16} className="text-slate-500" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://sualoja.com/produto"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                                    value={newProduct.url || ''}
                                    onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Preço (Opcional)</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center w-10 bg-slate-100 rounded-lg border border-slate-200">
                                        <DollarSign size={16} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ex: R$ 99,90"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                                        value={newProduct.price || ''}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Cupom de Desconto (Opcional)</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center w-10 bg-slate-100 rounded-lg border border-slate-200">
                                        <Tag size={16} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ex: DESC10"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                                        value={newProduct.discountCode || ''}
                                        onChange={e => setNewProduct({ ...newProduct, discountCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">URL da Imagem</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center w-10 bg-slate-100 rounded-lg border border-slate-200">
                                        <ImageIcon size={16} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                                        value={newProduct.image || ''}
                                        onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    />
                                </div>
                                {newProduct.image && (
                                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!newProduct.name || !newProduct.url}
                                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                        <div className="flex gap-4 items-start">
                            <div className="cursor-move text-slate-300 hover:text-slate-500 mt-2">
                                <GripVertical size={20} />
                            </div>

                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                    className="w-full font-semibold text-slate-800 bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1"
                                />
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <ExternalLink size={14} />
                                    <input
                                        type="text"
                                        value={product.url}
                                        onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                                        className="flex-1 bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1 truncate"
                                        placeholder="Link"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex items-center gap-2 text-xs text-slate-500">
                                        <DollarSign size={12} />
                                        <input
                                            type="text"
                                            value={product.price || ''}
                                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1"
                                            placeholder="Preço"
                                        />
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 text-xs text-slate-500">
                                        <Tag size={12} />
                                        <input
                                            type="text"
                                            value={product.discountCode || ''}
                                            onChange={(e) => updateProduct(product.id, 'discountCode', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-brand-300 hover:border-slate-200 outline-none transition px-1"
                                            placeholder="Cupom"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && !isAdding && (
                    <div className="text-center py-10 px-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ImageIcon size={24} />
                        </div>
                        <h3 className="text-slate-900 font-medium">Sua loja está vazia</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-4">Adicione produtos para seus visitantes verem.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-brand-600 font-medium text-sm hover:underline"
                        >
                            Começar a adicionar
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
