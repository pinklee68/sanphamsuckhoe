import { Tool, Category, User } from '../types';
import { Star, ShoppingCart, Bookmark, Flame, Zap, Check, Heart } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  category: Category | undefined;
  currentUser: User | null;
  onSelect: () => void;
  onToggleBookmark: (toolId: string) => void;
  isBookmarked: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  isInCart: boolean;
  hasPurchased: boolean;
}

export default function ToolCard({
  tool,
  category,
  currentUser,
  onSelect,
  onToggleBookmark,
  isBookmarked,
  onAddToCart,
  isInCart,
  hasPurchased
}: ToolCardProps) {
  
  // Currency formatter
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(tool.id);
  };

  return (
    <div 
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#111827] border border-white/5 transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/5 cursor-pointer premium-glow"
    >
      {/* 9:16 Ratio Thumbnail Frame */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-950">
        <img
          src={tool.thumbnail}
          alt={tool.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent" />

        {/* Floating Actions/Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {tool.isHot && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              <Flame className="h-3 w-3 fill-white" />
              HOT
            </span>
          )}
          {tool.isNew && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              NEW
            </span>
          )}
          {tool.isFree && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              MIỄN PHÍ
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 text-gray-300 hover:text-white backdrop-blur-sm transition-all"
        >
          <Heart className={`h-4 w-4 transition-colors ${isBookmarked ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        {/* Title, rating and category overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end">
          {/* Category Tag */}
          {category && (
            <span 
              className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: category.color }}
            >
              {category.name}
            </span>
          )}

          {/* Tool Name */}
          <h3 className="font-display text-base font-bold text-white tracking-tight leading-tight group-hover:text-purple-400 transition-colors">
            {tool.name}
          </h3>

          {/* Ratings & Purchases */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="font-semibold text-white">{tool.rating}</span>
            </div>
            <span className="text-gray-600">•</span>
            <span>Đã sở hữu: {tool.purchaseCount}</span>
          </div>

          {/* Pricing Row */}
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              {tool.isFree ? (
                <span className="text-sm font-bold text-emerald-400">Miễn Phí</span>
              ) : (
                <div className="flex flex-col">
                  {tool.priceOriginal > tool.priceSale && (
                    <span className="text-[10px] text-gray-500 line-through font-mono">
                      {formatPrice(tool.priceOriginal)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-white font-mono">
                    {formatPrice(tool.priceSale)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Purchase/Own Action */}
            {hasPurchased ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                <Check className="h-3.5 w-3.5" />
                Đã mở khóa
              </span>
            ) : tool.isFree ? (
              <button
                type="button"
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                Trải nghiệm
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(e);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isInCart
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-purple-500/15 hover:border-purple-500/20 hover:text-white'
                }`}
              >
                {isInCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
