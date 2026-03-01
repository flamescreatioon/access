import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Edit2, Trash2, Search, CheckCircle2, X } from 'lucide-react';

export default function MenuManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '', description: '', category: '', price: '', image_url: '', is_available: true
    });

    const fetchItems = async () => {
        try {
            const res = await api.get('/cafe');
            setItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await api.put(`/cafe/${currentItem.id}`, formData);
            } else {
                await api.post('/cafe', formData);
            }
            setIsEditing(false);
            setCurrentItem(null);
            fetchItems();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/cafe/${id}`);
            fetchItems();
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-surface-800/50 p-4 rounded-[2rem] border border-surface-200 dark:border-surface-700/50">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search items or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-100 dark:bg-surface-800 pl-10 pr-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    />
                </div>
                <button
                    onClick={() => {
                        setCurrentItem(null);
                        setFormData({ name: '', description: '', category: '', price: '', image_url: '', is_available: true });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 flex-1 overflow-y-auto no-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black">{currentItem ? 'Edit Item' : 'New Menu Item'}</h2>
                                    <p className="text-surface-500 font-medium text-sm mt-1">Fill in the details for the cafe menu.</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-surface-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1.5 block">Item Name</label>
                                    <input required type="text" className="w-full bg-surface-50 dark:bg-surface-800 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700/50 focus:ring-2 focus:ring-primary-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1.5 block">Category</label>
                                        <input required type="text" placeholder="e.g. Drinks, Snacks" className="w-full bg-surface-50 dark:bg-surface-800 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700/50 focus:ring-2 focus:ring-primary-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1.5 block">Price (₦)</label>
                                        <input required type="number" min="0" step="0.01" className="w-full bg-surface-50 dark:bg-surface-800 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700/50 focus:ring-2 focus:ring-primary-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1.5 block">Description</label>
                                    <textarea rows={3} className="w-full bg-surface-50 dark:bg-surface-800 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700/50 focus:ring-2 focus:ring-primary-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1.5 block">Image URL (Optional)</label>
                                    <input type="url" placeholder="https://" className="w-full bg-surface-50 dark:bg-surface-800 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700/50 focus:ring-2 focus:ring-primary-500" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-10 h-6 bg-surface-200 dark:bg-surface-700 rounded-full relative cursor-pointer" onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}>
                                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${formData.is_available ? 'bg-success-500 translate-x-4' : 'bg-surface-400'}`} />
                                    </div>
                                    <span className="text-sm font-bold">Item Available</span>
                                </div>

                                <div className="pt-6 border-t border-surface-100 dark:border-surface-800 flex gap-3">
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-colors">Save Item</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-surface-800/80 rounded-[2rem] border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-50 dark:bg-surface-900/50">
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Item</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Category</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Price</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Status</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-sm text-surface-900 dark:text-surface-50">{item.name}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-surface-500">{item.category}</td>
                                    <td className="py-4 px-6 text-sm font-black text-primary-600 dark:text-primary-400">₦{parseFloat(item.price).toLocaleString()}</td>
                                    <td className="py-4 px-6">
                                        {item.is_available ? (
                                            <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-success-500/20 text-success-600 bg-success-500/10"><CheckCircle2 className="w-3 h-3" /> Active</span>
                                        ) : (
                                            <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-surface-500/20 text-surface-500 bg-surface-500/10">Disabled</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setCurrentItem(item); setFormData(item); setIsEditing(true); }} className="p-2 text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-surface-500 font-medium">No menu items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
