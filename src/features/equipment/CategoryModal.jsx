import { useState, useEffect } from 'react';
import { X, Layers, Layout, Palette, Tag } from 'lucide-react';

export default function CategoryModal({ open, data, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Wrench'
    });

    const iconOptions = ['Wrench', 'Printer', 'Zap', 'Cpu', 'Microchip', 'Video', 'Glasses', 'Box', 'Pocket', 'Hammer', 'Scissors'];

    useEffect(() => {
        if (data) {
            setFormData(data);
        } else {
            setFormData({
                name: '',
                description: '',
                icon: 'Wrench'
            });
        }
    }, [data, open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-surface-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
                <div className="flex items-center justify-between p-8 border-b border-surface-100 dark:border-surface-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary-500/10 rounded-2xl flex items-center justify-center text-secondary-500">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{data ? 'Edit Category' : 'New Category'}</h2>
                            <p className="text-sm text-surface-500 font-medium">Group equipment for easier discovery</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-2xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-surface-500 ml-1">Category Name</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-secondary-500 outline-none transition-all font-bold"
                                placeholder="e.g. 3D Printing"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-surface-500 ml-1">Icon Representation</label>
                        <div className="grid grid-cols-6 gap-2">
                            {iconOptions.map(iconName => (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: iconName })}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all border-2
                                    ${formData.icon === iconName
                                            ? 'bg-secondary-500 border-secondary-500 text-white shadow-lg shadow-secondary-500/20 scale-110'
                                            : 'bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-700 text-surface-400 hover:border-secondary-500/50'}`}
                                >
                                    <Palette className="w-5 h-5" /> {/* Note: Real icons would be better here but use Palette as placeholder */}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-surface-400 mt-2 italic">* Selection of UI icons for categorization</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-surface-500 ml-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-secondary-500 outline-none transition-all font-medium text-sm min-h-[100px]"
                            placeholder="Briefly describe what goes in this category..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-4 rounded-3xl border-2 border-surface-100 dark:border-surface-700/50 text-sm font-bold hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-4 rounded-3xl bg-secondary-500 text-white text-sm font-black hover:bg-primary-600 shadow-xl shadow-secondary-500/25 transition-all"
                        >
                            {data ? 'Update' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
