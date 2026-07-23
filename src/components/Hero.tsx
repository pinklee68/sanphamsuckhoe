import { Category } from '../types';
import { Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import LucideIcon from './LucideIcon';

interface HeroProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalToolsCount: number;
}

export default function Hero({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  totalToolsCount
}: HeroProps) {
  return (
    <div className="relative isolate overflow-hidden bg-[#030712] pb-8 pt-12 sm:pb-12 sm:pt-16">
      {/* Background ambient lighting */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400 mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nền Tảng Quản Lý & Cung Cấp Sản Phẩm Sức Khỏe</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-gradient-to-b from-white via-gray-100 to-gray-500 bg-clip-text text-transparent">
            SỐNG KHỎE CÙNG HỒNG
          </h1>
          
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto">
            Khám phá và sở hữu hệ sinh thái sản phẩm chuyên sâu giúp bạn tự động hóa việc lên thực đơn dinh dưỡng, bài tập thể hình và nuôi dưỡng tâm trí.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative rounded-xl bg-white/5 border border-white/5 shadow-2xl focus-within:border-purple-500 transition-colors p-1 flex items-center">
              <Search className="h-5 w-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm (ví dụ: Thực đơn, Tập luyện...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white px-3 py-2.5 focus:outline-none placeholder-gray-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-500 hover:text-white px-2.5 py-1 rounded bg-white/5 mr-1"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>

          {/* Features checkmark quick highlights */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Bản quyền trọn đời</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sản phẩm chất lượng cao</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Duyệt đơn tức thì</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-400" />
              <span>Phân Loại Sản Phẩm ({totalToolsCount})</span>
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-medium text-purple-400 hover:text-purple-300"
              >
                Xem tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* "Tất cả" category item */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-[#111827] border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10'
                  : 'bg-[#0B0F19] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <span>Tất cả</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#111827] text-white shadow-lg'
                      : 'bg-[#0B0F19] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                  }`}
                  style={isSelected ? { borderColor: cat.color, boxShadow: `0 10px 15px -3px ${cat.color}20` } : {}}
                >
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <LucideIcon name={cat.icon} size={16} color={cat.color} />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
