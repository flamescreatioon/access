import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEquipmentStore } from '../../stores/equipmentStore';
import {
    Search, Filter, Wrench, ShieldCheck, Clock, MapPin,
    AlertCircle, ChevronRight, CheckCircle2, Info, Timer
} from 'lucide-react';

const categories = ['All', '3D Printer', 'Laser Cutter', 'CNC', 'Electronics', 'Media', 'VR/AR', 'Power Tools'];

function EquipmentCard({ item }) {
    const minTier = item.MinTier?.name;
    const tierColor = item.MinTier?.color || '#6366f1';

    const statusConfig = {
        available: { label: 'Available', color: 'bg-success-500', icon: CheckCircle2 },
        in_use: { label: 'In Use', color: 'bg-warning-500', icon: Timer },
        maintenance: { label: 'Maintenance', color: 'bg-danger-500', icon: AlertCircle },
    };

    const status = statusConfig[item.status] || statusConfig.available;
    const StatusIcon = status.icon;

    return (
        <Link to={`/equipment/${item.id}`}
            className="group block bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 overflow-hidden transition-all hover:shadow-xl hover:border-primary-500/50 hover:-translate-y-1">
            <div className="aspect-[16/10] relative overflow-hidden bg-surface-100 dark:bg-surface-800">
                {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-300">
                        <Wrench className="w-12 h-12" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider">
                    <div className={`w-1.5 h-1.5 rounded-full ${status.color} animate-pulse`} />
                    {status.label}
                </div>

                {/* Certification Badge */}
                {item.requires_certification && (
                    <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 dark:bg-surface-800/90 text-primary-500 shadow-sm" title="Certification Required">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-primary-500 tracking-wider font-mono">{item.category}</span>
                        <h3 className="font-bold text-lg group-hover:text-primary-500 transition-colors leading-tight">{item.name}</h3>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Max {item.max_session_hours}h session</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-700/50">
                    <div className="flex items-center gap-1.5">
                        {parseFloat(item.hourly_cost) > 0 ? (
                            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">${item.hourly_cost}<span className="text-[10px] font-normal text-surface-500">/hr</span></span>
                        ) : (
                            <span className="text-sm font-bold text-success-500">Free</span>
                        )}
                        {minTier && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: tierColor }}>
                                {minTier}
                            </span>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}

export default function EquipmentPage() {
    const { equipment, loading, fetchEquipment } = useEquipmentStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchEquipment({
            category: selectedCategory === 'All' ? null : selectedCategory
        });
    }, [selectedCategory]);

    const filtered = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-xl">
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Creative Tools</h1>
                    <p className="text-surface-500 mt-2 text-lg">Book high-end manufacturing and creative equipment for your projects.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-2xl pl-10 pr-4 py-2.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all
                        ${selectedCategory === cat
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700/50 hover:border-primary-500/50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content states */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-surface-500 font-medium">Fetching tools...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(item => (
                        <EquipmentCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-surface-50 dark:bg-surface-800/30 rounded-3xl border-2 border-dashed border-surface-200 dark:border-surface-700/50">
                    <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-surface-300" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No tools found</h2>
                    <p className="text-surface-500 max-w-sm mx-auto">Try adjusting your generic search or filter to find what you're looking for.</p>
                </div>
            )}

            {/* Certifications info alert */}
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8 text-primary-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-primary-900 dark:text-primary-100">Equipment Certifications</h4>
                    <p className="text-sm text-primary-700 dark:text-primary-300/80 mt-1">Some tools require safety training before use. Check your certifications in your profile or book a training session at the Hub front desk.</p>
                </div>
                <Link to="/profile" className="px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25">
                    View My Certs
                </Link>
            </div>
        </div>
    );
}
