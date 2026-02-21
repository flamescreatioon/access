import { useState, useEffect } from 'react';
import { useSpaceStore } from '../../stores/spaceStore';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Users, MapPin, ChevronRight, Star,
    Wifi, Monitor, Coffee, Zap, Shield, X,
    Building, Mic, Wrench, Calendar as CalIcon
} from 'lucide-react';

const typeConfig = {
    meeting_room: { label: 'Meeting Room', icon: Building, color: '#6366f1' },
    coworking: { label: 'Coworking', icon: Wifi, color: '#06b6d4' },
    studio: { label: 'Studio', icon: Mic, color: '#ec4899' },
    lab: { label: 'Maker Lab', icon: Wrench, color: '#f59e0b' },
    event_space: { label: 'Event Space', icon: Star, color: '#8b5cf6' },
    private_office: { label: 'Private Office', icon: Shield, color: '#10b981' },
};

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
                            <span className="font-bold">${space.hourly_rate}<span className="text-xs font-normal text-surface-500">/hr</span></span>
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
    const { spaces, loading, fetchSpaces } = useSpaceStore();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => { fetchSpaces(); }, []);

    const filtered = spaces.filter(s => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
            !s.description?.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter && s.type !== typeFilter) return false;
        return true;
    });

    const typeGroups = [...new Set(spaces.map(s => s.type))];

    if (loading) {
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
                    <h1 className="text-2xl md:text-3xl font-bold">Spaces</h1>
                    <p className="text-surface-500 mt-1">Browse and book workspaces, meeting rooms & more</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search spaces..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                    ${showFilters
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-white dark:bg-surface-800/50 border-surface-200 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Filter Pills */}
            {showFilters && (
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

            {/* Results count */}
            <p className="text-xs text-surface-400">{filtered.length} space{filtered.length !== 1 ? 's' : ''} available</p>

            {/* Space Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(space => (
                    <SpaceCard key={space.id} space={space} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-surface-500">
                    <Building className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg font-medium">No spaces found</p>
                    <p className="text-sm mt-1">{search || typeFilter ? 'Try adjusting your filters' : 'No spaces are currently available'}</p>
                </div>
            )}
        </div>
    );
}
