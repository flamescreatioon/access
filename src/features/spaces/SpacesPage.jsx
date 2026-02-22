import { useState, useEffect } from 'react';
import { useSpaceStore } from '../../stores/spaceStore';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { Link } from 'react-router-dom';
import SpaceCategoryModal from './SpaceCategoryModal';
import AmenityModal from './AmenityModal';
import {
    Search, Filter, Users, MapPin, ChevronRight, Star,
    Wifi, Monitor, Coffee, Zap, Shield, X,
    Building, Mic, Wrench, Calendar as CalIcon,
    Plus, Edit2, Trash2, CheckCircle2, LayoutGrid, List,
    Settings, Sparkles, Layers
} from 'lucide-react';
import { ROLES } from '../../lib/mockData';

const typeConfig = {
    meeting_room: { label: 'Meeting Room', icon: Building, color: '#6366f1' },
    coworking: { label: 'Coworking', icon: Wifi, color: '#06b6d4' },
    studio: { label: 'Studio', icon: Mic, color: '#ec4899' },
    lab: { label: 'Maker Lab', icon: Wrench, color: '#f59e0b' },
    event_space: { label: 'Event Space', icon: Star, color: '#8b5cf6' },
    private_office: { label: 'Private Office', icon: Shield, color: '#10b981' },
};

const spaceTypes = [
    { value: 'meeting_room', label: 'Meeting Room' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'studio', label: 'Studio' },
    { value: 'lab', label: 'Maker Lab' },
    { value: 'event_space', label: 'Event Space' },
    { value: 'private_office', label: 'Private Office' }
];

function SpaceCard({ space }) {
    const Icon = Building;
    const amenities = Array.isArray(space.amenities) ? space.amenities : [];
    const tierName = space.MinTier?.name;
    const tierColor = space.MinTier?.color || '#6366f1';
    const zoneColor = space.zone === 'Annex' ? '#ec4899' : space.zone === 'Right Wing' ? '#6366f1' : '#10b981';

    return (
        <Link to={`/spaces/${space.id}`}
            className="group bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            {/* Image/Gradient Header */}
            <div className="h-36 relative overflow-hidden" style={{
                background: `linear-gradient(135deg, ${zoneColor}20, ${zoneColor}40)`,
            }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-16 h-16 opacity-20" style={{ color: zoneColor }} />
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-white"
                        style={{ backgroundColor: zoneColor }}>
                        {space.zone || 'Main'}
                    </span>
                    {space.Category && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-surface-900/40 backdrop-blur text-white">
                            {space.Category.name}
                        </span>
                    )}
                </div>
                {tierName && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white/90 dark:bg-surface-800/90 backdrop-blur"
                        style={{ color: tierColor }}>
                        {tierName}+
                    </div>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur text-white text-xs">
                    <Users className="w-3 h-3" />
                    {space.capacity}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-base group-hover:text-primary-500 transition-colors">{space.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 mt-1 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {space.location} · {space.zone}
                </div>

                <p className="text-xs text-surface-500 mt-2 line-clamp-2">{space.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700/50 rounded-md text-[10px] font-medium text-surface-600 dark:text-surface-400">
                            {a}
                        </span>
                    ))}
                    {amenities.length > 4 && (
                        <span className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700/50 rounded-md text-[10px] font-medium text-surface-400">
                            +{amenities.length - 4} more
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                    <div className="text-sm">
                        {parseFloat(space.hourly_rate) > 0 ? (
                            <span className="font-bold">₦{space.hourly_rate}<span className="text-xs font-normal text-surface-500">/{space.pricing_model === 'hourly' ? 'hr' : 'day'}</span></span>
                        ) : (
                            <span className="font-semibold text-success-500">Free</span>
                        )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-primary-500 font-medium group-hover:gap-2 transition-all">
                        View & Book <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function SpacesPage() {
    const {
        spaces, categories, amenities, loading,
        fetchSpaces, fetchCategories, fetchAmenities,
        createSpace, updateSpace, deleteSpace
    } = useSpaceStore();
    const { user } = useAuthStore();
    const { tiers, fetchTiers } = useMembershipStore();

    const [search, setSearch] = useState('');
    const [zoneFilter, setZoneFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [managementTab, setManagementTab] = useState('spaces'); // 'spaces' | 'categories' | 'amenities'
    const [modal, setModal] = useState({ open: false, data: null });
    const [catModal, setCatModal] = useState({ open: false, data: null });
    const [amenityModal, setAmenityModal] = useState({ open: false, data: null });
    const [toast, setToast] = useState(null);

    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;
    const canManageSpaces = user?.role === ROLES.ADMIN;

    useEffect(() => {
        fetchSpaces();
        fetchCategories();
        fetchAmenities();
        if (isAdmin) fetchTiers();
    }, [isAdmin]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await updateSpace(formData.id, formData);
                showToast('Space updated successfully');
            } else {
                await createSpace(formData);
                showToast('Space created successfully');
            }
            setModal({ open: false, data: null });
        } catch (error) {
            console.error('Save error:', error);
            showToast('Error saving space');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this space?')) {
            try {
                await deleteSpace(id);
                showToast('Space deleted successfully');
            } catch (error) {
                showToast('Error deleting space');
            }
        }
    };

    const {
        createCategory, updateCategory, deleteCategory,
        createAmenity, updateAmenity, deleteAmenity
    } = useSpaceStore();

    const handleSaveCategory = async (data) => {
        try {
            if (data.id) await updateCategory(data.id, data);
            else await createCategory(data);
            showToast(data.id ? 'Category updated' : 'Category created');
            setCatModal({ open: false, data: null });
        } catch (error) { showToast('Error saving category'); }
    };

    const handleSaveAmenity = async (data) => {
        try {
            if (data.id) await updateAmenity(data.id, data);
            else await createAmenity(data);
            showToast(data.id ? 'Amenity updated' : 'Amenity created');
            setAmenityModal({ open: false, data: null });
        } catch (error) { showToast('Error saving amenity'); }
    };

    const filtered = spaces.filter(s => {
        const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesZone = !zoneFilter || s.zone === zoneFilter;
        const matchesCategory = !categoryFilter || s.category_id === parseInt(categoryFilter);
        return matchesSearch && matchesZone && matchesCategory;
    });

    const typeGroups = [...new Set(spaces.map(s => s.type))];

    if (loading && spaces.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-xl">
                    <h1 className="text-3xl font-black md:text-5xl tracking-tight">
                        {isManageMode ? 'Space Management' : 'Creative Spaces'}
                    </h1>
                    <p className="text-surface-500 mt-2 text-lg font-medium">
                        {isManageMode
                            ? 'Configure building zones, categories, and space details.'
                            : 'Reserve professional labs, studios and collaboration zones.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {isAdmin && (
                        <button
                            onClick={() => setIsManageMode(!isManageMode)}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg
                            ${isManageMode
                                    ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-surface-500/10'
                                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 shadow-sm hover:border-primary-500/50'}`}
                        >
                            {isManageMode ? <LayoutGrid className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                            {isManageMode ? 'Member View' : 'Manage Spaces'}
                        </button>
                    )}
                    {!isManageMode && (
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search spaces..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold"
                            />
                        </div>
                    )}
                </div>
            </div>

            {isManageMode ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Management Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-100 dark:border-surface-700 pb-2">
                        <div className="flex gap-6">
                            {[
                                { id: 'spaces', label: 'Spaces', icon: Building },
                                { id: 'categories', label: 'Categories', icon: Layers },
                                { id: 'amenities', label: 'Amenities', icon: Sparkles },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setManagementTab(tab.id)}
                                    className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2
                                    ${managementTab === tab.id ? 'text-primary-500' : 'text-surface-500 hover:text-surface-700'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {managementTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                        {canManageSpaces && (
                            <button
                                onClick={() => {
                                    if (managementTab === 'spaces') setModal({ open: true, data: null });
                                    else if (managementTab === 'categories') setCatModal({ open: true, data: null });
                                    else setAmenityModal({ open: true, data: null });
                                }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                Add {managementTab === 'spaces' ? 'Space' : managementTab === 'categories' ? 'Category' : 'Amenity'}
                            </button>
                        )}
                    </div>

                    {/* Management Lists */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 overflow-hidden shadow-sm">
                        {managementTab === 'spaces' && (
                            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                {spaces.length > 0 ? spaces.map(s => (
                                    <div key={s.id} className="p-5 flex items-center justify-between group hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400">
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">{s.name}</span>
                                                    <span className="px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase">{s.zone}</span>
                                                </div>
                                                <p className="text-xs text-surface-500 mt-0.5">{s.Category?.name || 'Uncategorized'} · ₦{s.hourly_rate}/{s.pricing_model === 'hourly' ? 'hr' : 'day'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setModal({ open: true, data: s })} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-primary-500 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-danger-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-surface-400 italic">No spaces configured yet.</div>
                                )}
                            </div>
                        )}

                        {managementTab === 'categories' && (
                            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                {categories.length > 0 ? categories.map(c => (
                                    <div key={c.id} className="p-5 flex items-center justify-between group hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{c.name}</p>
                                                <p className="text-xs text-surface-500 mt-0.5 line-clamp-1 max-w-xs">{c.description || 'No description'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCatModal({ open: true, data: c })} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-primary-500 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { if (window.confirm('Delete category?')) deleteCategory(c.id); }} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-danger-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-surface-400 italic">No categories created yet.</div>
                                )}
                            </div>
                        )}

                        {managementTab === 'amenities' && (
                            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                {amenities.length > 0 ? amenities.map(a => (
                                    <div key={a.id} className="p-5 flex items-center justify-between group hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{a.name}</p>
                                                <p className="text-xs text-surface-500 mt-0.5">{a.description || 'No description'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setAmenityModal({ open: true, data: a })} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-primary-500 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { if (window.confirm('Delete amenity?')) deleteAmenity(a.id); }} className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-400 hover:text-danger-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-surface-400 italic">No amenities created yet.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => { setZoneFilter(''); setCategoryFilter(''); }}
                            className={`px-5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border
                            ${!zoneFilter && !categoryFilter
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-white dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-500/50'}`}
                        >
                            All Spaces
                        </button>

                        {/* Zone Filter Chips */}
                        {['Annex', 'Right Wing', 'Left Wing'].map(zone => (
                            <button
                                key={zone}
                                onClick={() => setZoneFilter(zoneFilter === zone ? '' : zone)}
                                className={`px-5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border
                                ${zoneFilter === zone
                                        ? 'bg-surface-900 dark:bg-white border-surface-900 dark:border-white text-white dark:text-surface-900 shadow-xl'
                                        : 'bg-white dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-500/50'}`}
                            >
                                {zone}
                            </button>
                        ))}

                        {/* Category Toggle */}
                        <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 my-auto mx-2" />

                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setCategoryFilter(categoryFilter === String(c.id) ? '' : String(c.id))}
                                className={`px-5 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border
                                ${categoryFilter === String(c.id)
                                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-white dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-500/50'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    {/* Spaces Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">Loading Spaces...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(space => (
                                <SpaceCard key={space.id} space={space} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-surface-50 dark:bg-surface-800/30 rounded-[2.5rem] border-2 border-dashed border-surface-200 dark:border-surface-700/50">
                            <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-surface-300">
                                <Search className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">No Match Found</h2>
                            <p className="text-surface-500 max-w-sm mx-auto font-medium">Try adjusting your filters or search term to find a studio or lab.</p>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <SpaceModal
                open={modal.open}
                space={modal.data}
                tiers={tiers}
                onClose={() => setModal({ open: false, data: null })}
                onSave={handleSave}
            />
            <SpaceCategoryModal
                open={catModal.open}
                data={catModal.data}
                onClose={() => setCatModal({ open: false, data: null })}
                onSave={handleSaveCategory}
            />
            <AmenityModal
                open={amenityModal.open}
                data={amenityModal.data}
                onClose={() => setAmenityModal({ open: false, data: null })}
                onSave={handleSaveAmenity}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[120] bg-surface-900 dark:bg-white text-white dark:text-surface-900 px-8 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom-4">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    {toast}
                </div>
            )}
        </div>
    );
}

function SpaceModal({ open, space, tiers, onClose, onSave }) {
    const { categories, amenities: globalAmenities } = useSpaceStore();
    const [formData, setFormData] = useState(space || {
        name: '',
        description: '',
        type: 'meeting_room',
        category_id: null,
        capacity: 1,
        location: '',
        zone: 'Annex',
        min_tier_id: null,
        hourly_rate: 0,
        pricing_model: 'hourly',
        max_booking_hours: 4,
        amenities: [],
        is_active: true
    });

    if (!open) return null;

    const isEdit = !!space;

    const handleAmenityToggle = (amenityName) => {
        const current = formData.amenities || [];
        if (current.includes(amenityName)) {
            setFormData({ ...formData, amenities: current.filter(a => a !== amenityName) });
        } else {
            setFormData({ ...formData, amenities: [...current, amenityName] });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 dark:border-surface-700 flex items-center justify-between bg-white dark:bg-surface-800 sticky top-0 z-10">
                    <h2 className="text-xl font-bold">{isEdit ? 'Edit Space' : 'Add New Space'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Space Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="e.g. Conference Room A"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[80px]"
                                placeholder="Details about this space..."
                            />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                            <select
                                value={formData.category_id || ''}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {/* Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Building Wing / Zone</label>
                            <select
                                value={formData.zone || 'Annex'}
                                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            >
                                <option value="Annex">Annex</option>
                                <option value="Right Wing">Right Wing</option>
                                <option value="Left Wing">Left Wing</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Location Detail</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="e.g. Near Food Lab"
                            />
                        </div>
                    </div>

                    {/* Pricing Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Pricing Model</label>
                            <div className="flex gap-2">
                                {['hourly', 'daily'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, pricing_model: m })}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${formData.pricing_model === m
                                            ? 'bg-primary-500 border-primary-500 text-white'
                                            : 'bg-surface-50 dark:bg-surface-900 border-transparent text-surface-600 dark:text-surface-400'
                                            }`}
                                    >
                                        {m.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Price (₦ / {formData.pricing_model === 'hourly' ? 'hr' : 'day'})</label>
                            <input
                                type="number"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    {/* Access */}
                    <div>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Minimum Access Tier</label>
                        <select
                            value={formData.min_tier_id || ''}
                            onChange={(e) => setFormData({ ...formData, min_tier_id: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                        >
                            <option value="">No restriction</option>
                            {tiers.map(tier => (
                                <option key={tier.id} value={tier.id}>{tier.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Booking Status Toggle */}
                    <div className="bg-surface-50 dark:bg-surface-900 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-surface-900 dark:text-white">Allow Bookings</p>
                            <p className="text-xs text-surface-500">Enable or disable booking for this space</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.is_active ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-3 ml-1">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {(globalAmenities.length > 0 ? globalAmenities.map(a => a.name) : ['WiFi', 'Air Conditioning', 'Power', 'Whiteboard', 'Monitor']).map(amenity => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => handleAmenityToggle(amenity)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${formData.amenities?.includes(amenity)
                                        ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                                        : 'bg-surface-50 dark:bg-surface-900 border-transparent text-surface-600 dark:text-surface-400'
                                        }`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-surface-50 dark:bg-surface-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl font-bold bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:shadow-md transition-all border border-surface-200 dark:border-surface-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-[2] py-4 rounded-2xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
                    >
                        {isEdit ? 'Update Space' : 'Create Space'}
                    </button>
                </div>
            </div>
        </div>
    );
}
