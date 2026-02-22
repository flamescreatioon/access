import { useState, useEffect } from 'react';
import { X, Wrench, ShieldCheck, MapPin, Clock, Zap, Timer, Layout, Image as ImageIcon } from 'lucide-react';

export default function EquipmentModal({ open, data, categories, tiers, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        description: '',
        location: '',
        status: 'available',
        photo: '',
        safety_guidelines: '',
        requires_certification: false,
        certification_name: '',
        hourly_cost: 0,
        max_session_hours: 4,
        daily_limit_hours: 8,
        min_tier_id: '',
    });

    useEffect(() => {
        if (data) {
            setFormData({
                ...data,
                category_id: data.category_id || '',
                min_tier_id: data.min_tier_id || '',
            });
        } else {
            setFormData({
                name: '',
                category_id: categories[0]?.id || '',
                description: '',
                location: '',
                status: 'available',
                photo: '',
                safety_guidelines: '',
                requires_certification: false,
                certification_name: '',
                hourly_cost: 0,
                max_session_hours: 4,
                daily_limit_hours: 8,
                min_tier_id: tiers[0]?.id || '',
            });
        }
    }, [data, categories, tiers]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-surface-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
                <div className="flex items-center justify-between p-8 border-b border-surface-100 dark:border-surface-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{data ? 'Edit Equipment' : 'Add New Tool'}</h2>
                            <p className="text-sm text-surface-500 font-medium">Configure tool details and access rules</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-2xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4 md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-surface-500 ml-1">Tool Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold"
                                        placeholder="e.g. Ender 3 V2"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-surface-500 ml-1">Category</label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Location / Zone</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold"
                                    placeholder="e.g. Workshop B"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold appearance-none"
                            >
                                <option value="available">Available</option>
                                <option value="in_use">In Use</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        {/* Access & Cost */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Minimum Tier</label>
                            <select
                                value={formData.min_tier_id}
                                onChange={e => setFormData({ ...formData, min_tier_id: e.target.value })}
                                className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold appearance-none"
                            >
                                <option value="">No Minimum Tier</option>
                                {tiers.map(tier => (
                                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Hourly Cost ($)</label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.hourly_cost}
                                    onChange={e => setFormData({ ...formData, hourly_cost: e.target.value })}
                                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Max Session (Hrs)</label>
                            <div className="relative">
                                <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="number"
                                    value={formData.max_session_hours}
                                    onChange={e => setFormData({ ...formData, max_session_hours: e.target.value })}
                                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-surface-500 ml-1">Daily Limit (Hrs)</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="number"
                                    value={formData.daily_limit_hours}
                                    onChange={e => setFormData({ ...formData, daily_limit_hours: e.target.value })}
                                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="md:col-span-2 p-6 rounded-[2rem] bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                                    <span className="font-bold text-sm">Certification Requirement</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_certification}
                                        onChange={e => setFormData({ ...formData, requires_certification: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                            {formData.requires_certification && (
                                <div className="animate-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        value={formData.certification_name}
                                        onChange={e => setFormData({ ...formData, certification_name: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold text-sm"
                                        placeholder="Name of required certification..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Description & Photo */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase text-surface-500 ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-medium text-sm min-h-[100px]"
                                    placeholder="Explain what this tool does and its main features..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase text-surface-500 ml-1">Photo URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        value={formData.photo}
                                        onChange={e => setFormData({ ...formData, photo: e.target.value })}
                                        className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 focus:border-primary-500 outline-none transition-all font-bold text-sm"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-12">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-4 rounded-3xl border-2 border-surface-100 dark:border-surface-700/50 text-sm font-bold hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-4 rounded-3xl bg-primary-500 text-white text-sm font-black hover:bg-primary-600 shadow-xl shadow-primary-500/25 transition-all"
                        >
                            {data ? 'Save Changes' : 'Create Tool'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
