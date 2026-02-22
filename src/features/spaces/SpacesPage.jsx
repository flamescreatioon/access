import { useState, useEffect } from 'react';
import { useSpaceStore } from '../../stores/spaceStore';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Users, MapPin, ChevronRight, Star,
    Wifi, Monitor, Coffee, Zap, Shield, X,
    Building, Mic, Wrench, Calendar as CalIcon,
    Plus, Edit2, Trash2, CheckCircle2, LayoutGrid, List
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
    const cfg = typeConfig[space.type] || typeConfig.meeting_room;
    const Icon = cfg.icon;
    const amenities = Array.isArray(space.amenities) ? space.amenities : [];
    const tierName = space.MinTier?.name;
    const tierColor = space.MinTier?.color || '#6366f1';

    return (
        <Link to={`/spaces/${space.id}`}
            className="group bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            {/* Image/Gradient Header */}
            <div className="h-36 relative overflow-hidden" style={{
                background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}40)`,
            }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-16 h-16 opacity-20" style={{ color: cfg.color }} />
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: cfg.color }}>
                        {cfg.label}
                    </span>
                </div>
                {tierName && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-surface-800/90 backdrop-blur"
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
                <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {space.location}
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
                            <span className="font-bold">₦{space.hourly_rate}<span className="text-xs font-normal text-surface-500">/hr</span></span>
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
    const { spaces, loading, fetchSpaces, createSpace, updateSpace, deleteSpace } = useSpaceStore();
    const { user } = useAuthStore();
    const { tiers, fetchTiers } = useMembershipStore();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [modal, setModal] = useState({ open: false, data: null });
    const [toast, setToast] = useState(null);

    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;

    useEffect(() => {
        fetchSpaces();
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
            showToast('Error saving space');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this space? This cannot be undone.')) return;
        try {
            await deleteSpace(id);
            showToast('Space deleted');
        } catch (error) {
            showToast('Error deleting space');
        }
    };

    const filtered = spaces.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase()) ||
            s.location?.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || s.type === typeFilter;
        return matchesSearch && matchesType;
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{isManageMode ? 'Space Management' : 'Spaces'}</h1>
                    <p className="text-surface-500 mt-1">
                        {isManageMode
                            ? 'Administer hub spaces and session resources'
                            : 'Browse and book workspaces, meeting rooms & more'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setIsManageMode(!isManageMode)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all ${isManageMode
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                                }`}
                        >
                            {isManageMode ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                            {isManageMode ? 'Member View' : 'Manage Spaces'}
                        </button>
                    )}
                    {isManageMode && (
                        <button
                            onClick={() => setModal({ open: true, data: null })}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success-500 text-white font-bold hover:bg-success-600 transition-all shadow-lg shadow-success-500/20"
                        >
                            <Plus className="w-5 h-5" /> New Space
                        </button>
                    )}
                </div>
            </div>

            {/* toolbar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={isManageMode ? "Search by name or location..." : "Search spaces..."}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                {!isManageMode && (
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                        ${showFilters
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white dark:bg-surface-800/50 border-surface-200 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                )}
            </div>

            {/* Filter Pills */}
            {!isManageMode && showFilters && (
                <div className="flex gap-2 flex-wrap animate-in slide-in-from-top-2">
                    <button onClick={() => setTypeFilter('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                        ${!typeFilter ? 'bg-primary-500 text-white' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700'}`}>
                        All Types
                    </button>
                    {typeGroups.map(type => {
                        const cfg = typeConfig[type] || {};
                        return (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                                ${typeFilter === type
                                        ? 'text-white shadow-md'
                                        : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700'}`}
                                style={typeFilter === type ? { backgroundColor: cfg.color } : {}}>
                                {cfg.label || type}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* View Switching Logic */}
            {isManageMode ? (
                /* Management List View */
                <div className="grid gap-4">
                    {filtered.length > 0 ? (
                        filtered.map(space => (
                            <div key={space.id} className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-surface-900 dark:text-white truncate">{space.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <p className="text-xs text-surface-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {space.location || 'No location set'}
                                            </p>
                                            <p className="text-xs text-surface-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> Capacity: {space.capacity}
                                            </p>
                                            <span className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-700 text-[10px] font-bold text-surface-600 dark:text-surface-400 uppercase tracking-wider">
                                                {space.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-surface-100 dark:border-surface-700">
                                    <button
                                        onClick={() => setModal({ open: true, data: space })}
                                        className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-500 transition-all focus:ring-2 ring-primary-500/20"
                                        title="Edit Space"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(space.id)}
                                        className="p-2.5 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-900/10 text-surface-500 hover:text-danger-500 transition-all focus:ring-2 ring-danger-500/20"
                                        title="Delete Space"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-surface-800/50 rounded-2xl border border-dashed border-surface-300 dark:border-surface-700">
                            <Building className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white">No spaces found</h3>
                            <p className="text-surface-500 mt-1 max-w-xs mx-auto">Try adjusting your search or add a new space to get started.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Member Grid View */
                <>
                    <p className="text-xs text-surface-400">{filtered.length} space{filtered.length !== 1 ? 's' : ''} available</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(space => (
                            <SpaceCard key={space.id} space={space} />
                        ))}
                    </div>
                </>
            )}

            {filtered.length === 0 && !isManageMode && (
                <div className="text-center py-16 text-surface-500">
                    <Building className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg font-medium">No spaces found</p>
                    <p className="text-sm mt-1">{search || typeFilter ? 'Try adjusting your filters' : 'No spaces are currently available'}</p>
                </div>
            )}

            {/* Modal */}
            {modal.open && (
                <SpaceModal
                    space={modal.data}
                    tiers={tiers}
                    onClose={() => setModal({ open: false, data: null })}
                    onSave={handleSave}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-surface-900 dark:bg-white text-white dark:text-surface-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-surface-100/10">
                        <CheckCircle2 className="w-5 h-5 text-success-500" />
                        <span className="text-sm font-bold">{toast}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function SpaceModal({ space, tiers, onClose, onSave }) {
    const [formData, setFormData] = useState(space || {
        name: '',
        description: '',
        type: 'meeting_room',
        capacity: 1,
        location: '',
        floor: '',
        min_tier_id: null,
        hourly_rate: 0,
        max_booking_hours: 4,
        amenities: [],
        is_active: true
    });

    const isEdit = !!space;

    const handleAmenityToggle = (amenity) => {
        const current = formData.amenities || [];
        if (current.includes(amenity)) {
            setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, amenities: [...current, amenity] });
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
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Space Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            >
                                {spaceTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
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

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Location / Building</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="e.g. Innovation Hub"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Floor / Section</label>
                            <input
                                type="text"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="e.g. 2nd Floor"
                            />
                        </div>
                    </div>

                    {/* Pricing & Access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5 ml-1">Hourly Rate (₦)</label>
                            <input
                                type="number"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            />
                        </div>
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
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-3 ml-1">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {['High-speed WiFi', 'Whiteboard', '4K TV/Monitor', 'Projector', 'Coffee/Tea', 'Air Conditioning', 'Power Outlets', 'Ergonomic Chairs'].map(amenity => (
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
