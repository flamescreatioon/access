import { useState, useEffect } from 'react';
import { X, Layers, Type, AlignLeft } from 'lucide-react';

export default function SpaceCategoryModal({ open, data, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Box'
    });

    useEffect(() => {
        if (data) setFormData(data);
        else setFormData({ name: '', description: '', icon: 'Box' });
    }, [data, open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 dark:border-surface-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">{data ? 'Edit Category' : 'New Space Category'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
                        <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="e.g. Studio, Lab, Office"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-surface-400" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[100px]"
                                placeholder="What kind of spaces belong here?"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3.5 rounded-2xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
                        >
                            {data ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
