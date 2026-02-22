import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import EquipmentModal from './EquipmentModal';
import CategoryModal from './CategoryModal';
import {
    Search, Filter, Wrench, ShieldCheck, Clock, MapPin,
    AlertCircle, ChevronRight, CheckCircle2, Info, Timer,
    Plus, Settings, LayoutGrid, List, Edit2, Trash2, Layers,
    ChevronDown, ChevronUp, Box
} from 'lucide-react';

function EquipmentCard({ item }) {
    const minTier = item.MinTier?.name;
    const tierColor = item.MinTier?.color || '#6366f1';

    const statusConfig = {
        available: { label: 'Available', color: 'bg-success-500', icon: CheckCircle2 },
        in_use: { label: 'In Use', color: 'bg-warning-500', icon: Timer },
        maintenance: { label: 'Maintenance', color: 'bg-danger-500', icon: AlertCircle },
    };

    const status = statusConfig[item.status] || statusConfig.available;

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

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider">
                    <div className={`w-1.5 h-1.5 rounded-full ${status.color} animate-pulse`} />
                    {status.label}
                </div>

                {item.requires_certification && (
                    <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 dark:bg-surface-800/90 text-primary-500 shadow-sm" title="Certification Required">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-primary-500 tracking-wider font-mono">{item.Category?.name || 'Uncategorized'}</span>
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
                            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">₦{item.hourly_cost}<span className="text-[10px] font-normal text-surface-500">/hr</span></span>
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
    const {
        equipment, categories, loading,
        fetchEquipment, fetchCategories,
        createEquipment, updateEquipment, deleteEquipment,
        createCategory, updateCategory, deleteCategory
    } = useEquipmentStore();
    const { user } = useAuthStore();
    const { tiers, fetchTiers } = useMembershipStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [managementTab, setManagementTab] = useState('equipment'); // 'equipment' | 'categories'

    const [eqModal, setEqModal] = useState({ open: false, data: null });
    const [catModal, setCatModal] = useState({ open: false, data: null });
    const [toast, setToast] = useState(null);

    const isAuthorized = user?.role === 'Admin' || user?.role === 'Hub Manager';
    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        fetchEquipment({
            category: selectedCategory === 'All' ? null : selectedCategory
        });
        fetchCategories();
        if (isAuthorized) fetchTiers();
    }, [selectedCategory, fetchEquipment, fetchCategories, fetchTiers, isAuthorized]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveEquipment = async (data) => {
        const result = data.id
            ? await updateEquipment(data.id, data)
            : await createEquipment(data);

        if (result.success) {
            showToast(data.id ? 'Equipment updated' : 'Equipment added');
            setEqModal({ open: false, data: null });
        } else {
            showToast(result.error);
        }
    };

    const handleDeleteEquipment = async (id) => {
        if (!window.confirm('Are you sure you want to remove this equipment?')) return;
        const result = await deleteEquipment(id);
        if (result.success) showToast('Equipment removed');
        else showToast(result.error);
    };

    const handleSaveCategory = async (data) => {
        const result = data.id
            ? await updateCategory(data.id, data)
            : await createCategory(data);

        if (result.success) {
            showToast(data.id ? 'Category updated' : 'Category created');
            setCatModal({ open: false, data: null });
            fetchCategories(); // Refresh list
        } else {
            showToast(result.error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? It will fail if equipment is assigned to it.')) return;
        const result = await deleteCategory(id);
        if (result.success) {
            showToast('Category deleted');
            if (selectedCategory === id) setSelectedCategory('All');
        } else {
            showToast(result.error);
        }
    };

    const filtered = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-xl">
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        {isAdminMode ? 'Equipment Management' : 'Creative Tools'}
                    </h1>
                    <p className="text-surface-500 mt-2 text-lg">
                        {isAdminMode
                            ? 'Administer library of tools, electronics, and machines.'
                            : 'Book high-end manufacturing and creative equipment for your projects.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {isAuthorized && (
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg
                            ${isAdminMode
                                    ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-surface-500/10'
                                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 shadow-sm hover:border-primary-500/50'}`}
                        >
                            {isAdminMode ? <LayoutGrid className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                            {isAdminMode ? 'Member View' : 'Manage Equipment'}
                        </button>
                    )}
                    {!isAdminMode && (
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search equipment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-2xl pl-10 pr-4 py-2.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>

            {isAdminMode ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Management Tabs */}
                    <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-700/50">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setManagementTab('equipment')}
                                className={`pb-4 text-sm font-bold transition-all relative
                                ${managementTab === 'equipment' ? 'text-primary-500' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                <span className="flex items-center gap-2"><Box className="w-4 h-4" /> Equipment</span>
                                {managementTab === 'equipment' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setManagementTab('categories')}
                                className={`pb-4 text-sm font-bold transition-all relative
                                ${managementTab === 'categories' ? 'text-primary-500' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Categories</span>
                                {managementTab === 'categories' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
                            </button>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => managementTab === 'equipment' ? setEqModal({ open: true, data: null }) : setCatModal({ open: true, data: null })}
                                className="mb-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                            >
                                <Plus className="w-4 h-4" /> Add {managementTab === 'equipment' ? 'Tool' : 'Category'}
                            </button>
                        )}
                    </div>

                    {/* Table View */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                        {managementTab === 'equipment' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-50 dark:bg-surface-900/30 text-[10px] font-black uppercase text-surface-500 tracking-wider">
                                        <th className="px-6 py-4">Tool</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Access</th>
                                        {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                    {equipment.map(item => (
                                        <tr key={item.id} className="group hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 overflow-hidden">
                                                        {item.photo ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" /> : <Wrench className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{item.name}</p>
                                                        <p className="text-[10px] text-surface-500 font-medium">{item.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-surface-600 dark:text-surface-400">{item.Category?.name || 'Unset'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                                                    ${item.status === 'available' ? 'bg-success-500/10 text-success-600' : item.status === 'in_use' ? 'bg-warning-500/10 text-warning-600' : 'bg-danger-500/10 text-danger-600'}`}>
                                                    <div className={`w-1 h-1 rounded-full ${item.status === 'available' ? 'bg-success-500' : item.status === 'in_use' ? 'bg-warning-500' : 'bg-danger-500'}`} />
                                                    {item.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.MinTier && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white" style={{ backgroundColor: item.MinTier.color }}>
                                                            {item.MinTier.name}
                                                        </span>
                                                    )}
                                                    {item.requires_certification && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                                            CERT REQ
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEqModal({ open: true, data: item })}
                                                            className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg text-surface-400 hover:text-primary-500 transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEquipment(item.id)}
                                                            className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg text-surface-400 hover:text-danger-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-50 dark:bg-surface-900/30 text-[10px] font-black uppercase text-surface-500 tracking-wider">
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Description</th>
                                        {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="group hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-500/5 flex items-center justify-center text-primary-500">
                                                        <Layers className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-bold text-sm tracking-tight">{cat.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-surface-500 max-w-xs truncate">{cat.description || 'No description provided'}</p>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setCatModal({ open: true, data: cat })}
                                                            className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg text-surface-400 hover:text-primary-500 transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg text-surface-400 hover:text-danger-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {loading && (
                            <div className="p-12 text-center text-surface-400 italic text-sm">Loading details...</div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-5 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all
                            ${selectedCategory === 'All'
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-white dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700/50 hover:border-primary-500/50'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all
                                ${selectedCategory === cat.id
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-white dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700/50 hover:border-primary-500/50'}`}
                            >
                                {cat.name}
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
                            <p className="text-surface-500 max-w-sm mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
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
                </>
            )}

            {/* Modals */}
            <EquipmentModal
                open={eqModal.open}
                data={eqModal.data}
                categories={categories}
                tiers={tiers}
                onClose={() => setEqModal({ open: false, data: null })}
                onSave={handleSaveEquipment}
            />
            <CategoryModal
                open={catModal.open}
                data={catModal.data}
                onClose={() => setCatModal({ open: false, data: null })}
                onSave={handleSaveCategory}
            />

            {/* Toast Notifications */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[120] bg-surface-900 dark:bg-white text-white dark:text-surface-900 px-8 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom-4 duraiton-300">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    {toast}
                </div>
            )}
        </div>
    );
}
