import { useState, useMemo } from 'react';
import { useCafeStore } from '../../../stores/cafeStore';
import { Plus, Search, Coffee, Image as ImageIcon } from 'lucide-react';

export default function MenuGrid() {
    const { items, isLoading, addToCart } = useCafeStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.category));
        return ['All', ...Array.from(cats)].sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [items, activeCategory, searchQuery]);

    if (isLoading && items.length === 0) {
        return (
            <div className="flex col-span-full items-center justify-center p-12 animate-pulse">
                <Coffee className="w-8 h-8 text-primary-500 animate-bounce" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-surface-800/50 p-4 rounded-[2rem] border border-surface-200 dark:border-surface-700/50">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all
                                ${activeCategory === category
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-100 dark:bg-surface-800 pl-10 pr-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary-500 text-sm font-medium transition-all"
                    />
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="bg-surface-50 dark:bg-surface-800/20 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-[2rem] p-12 text-center">
                    <Coffee className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-surface-900 dark:text-surface-100">No items found</h3>
                    <p className="text-surface-500 mt-2 font-medium">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-surface-800/80 rounded-[2rem] overflow-hidden border border-surface-200 dark:border-surface-700/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all group flex flex-col">
                            <div className="h-48 bg-surface-100 dark:bg-surface-800 relative overflow-hidden flex items-center justify-center">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`absolute inset-0 flex items-center justify-center bg-surface-200 dark:bg-surface-800 ${item.image_url ? 'hidden' : ''}`}>
                                    <ImageIcon className="w-10 h-10 text-surface-400 opacity-50" />
                                </div>
                                {!item.is_available && (
                                    <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center">
                                        <span className="bg-surface-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            Unavailable
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="font-black text-lg text-surface-900 dark:text-surface-50 leading-tight">
                                        {item.name}
                                    </h3>
                                    <span className="font-black text-primary-600 dark:text-primary-400 whitespace-nowrap">
                                        ₦{parseFloat(item.price).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-surface-500 font-medium line-clamp-2 mb-6 flex-1">
                                    {item.description}
                                </p>

                                <button
                                    onClick={() => addToCart(item)}
                                    disabled={!item.is_available}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                                        bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 
                                        hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface-100 disabled:hover:text-surface-500"
                                >
                                    <Plus className="w-4 h-4" /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
