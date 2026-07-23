import { useState, useEffect } from 'react';
import { Tool, Category, User } from '../types';
import { DatabaseService } from '../lib/db';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, Star, ShoppingCart, Check, Heart, Play, Copy, 
  Lock, KeyRound, ExternalLink, Calendar, HelpCircle, 
  Sparkles, CheckCircle2, MessageSquare, Info
} from 'lucide-react';

interface ToolDetailProps {
  tool: Tool;
  category: Category | undefined;
  currentUser: User | null;
  hasPurchased: boolean;
  isBookmarked: boolean;
  isInCart: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onAddToCart: () => void;
  onDirectBuy: () => void;
}

export default function ToolDetail({
  tool,
  category,
  currentUser,
  hasPurchased,
  isBookmarked,
  isInCart,
  onBack,
  onToggleBookmark,
  onAddToCart,
  onDirectBuy
}: ToolDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'vip' | 'faq' | 'changelog'>('info');
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Force Tab to 'vip' if purchased and hasn't visited yet, or just default to info
  useEffect(() => {
    if (hasPurchased) {
      setActiveTab('vip');
    } else {
      setActiveTab('info');
    }
  }, [hasPurchased, tool.id]);

  const handleCopyPrompt = () => {
    if (tool.secretData?.prompt) {
      navigator.clipboard.writeText(tool.secretData.prompt);
      setCopied(true);
      DatabaseService.incrementCopyCount(tool.id);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenTool = () => {
    if (tool.secretData?.targetLink) {
      window.open(tool.secretData.targetLink, '_blank');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#030712] pb-16">
      {/* 1. Header Banner */}
      <div className="relative h-60 sm:h-80 w-full overflow-hidden bg-gray-950">
        <img
          src={tool.banner}
          alt={tool.name}
          className="h-full w-full object-cover object-center brightness-[0.45]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent" />
        
        {/* Navigation overlay */}
        <div className="absolute top-6 left-4 sm:left-8 z-10 flex items-center justify-between w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl bg-black/45 border border-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/60 backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
          
          <button
            onClick={onToggleBookmark}
            className="p-3 rounded-xl bg-black/45 border border-white/5 text-gray-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-pink-500 text-pink-500' : ''}`} />
          </button>
        </div>

        {/* Title Overlay Info */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            {category && (
              <span 
                className="inline-block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: category.color }}
              >
                {category.name}
              </span>
            )}
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {tool.name}
            </h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="font-semibold text-white">{tool.rating}</span>
                <span className="text-gray-500">({tool.reviewCount} đánh giá)</span>
              </div>
              <span className="text-gray-600">•</span>
              <span>Đã bán: {tool.purchaseCount}</span>
              <span className="text-gray-600">•</span>
              <span>Lượt sao chép: {tool.copyCount}</span>
              <span className="text-gray-600">•</span>
              <span className="font-mono text-purple-400">Phiên bản: {tool.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Page Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main info panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-white/5 gap-1 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === 'info'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Giới Thiệu Chi Tiết
              </button>
              
              <button
                onClick={() => setActiveTab('vip')}
                className={`relative px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'vip'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {!hasPurchased && <Lock className="h-3.5 w-3.5 text-gray-500" />}
                <span>Dữ Liệu VIP (Trợ Lý AI)</span>
                {hasPurchased && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('faq')}
                className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === 'faq'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Câu Hỏi Thường Gặp (FAQ)
              </button>

              <button
                onClick={() => setActiveTab('changelog')}
                className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === 'changelog'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Lịch Sử Cập Nhật
              </button>
            </div>

            {/* TAB CONTENT: INTRO */}
            {activeTab === 'info' && (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8 space-y-6">
                <div className="markdown-body">
                  <ReactMarkdown>{tool.longDescription}</ReactMarkdown>
                </div>

                {/* Tags */}
                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Thẻ từ khóa</h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VIP CONTENT (HIDDEN/SHOWN DYNAMICALLY) */}
            {activeTab === 'vip' && (
              <div className="space-y-6">
                {!hasPurchased ? (
                  /* LOCKED VIP PREVIEW */
                  <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-white/5 p-8 text-center premium-glow">
                    {/* Blurred background content */}
                    <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-tr from-purple-500 to-pink-500 filter blur-xl scale-125" />
                    
                    <div className="relative z-10 max-w-md mx-auto space-y-4 py-8">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <KeyRound className="h-6 w-6" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-white">Nội dung này đã được khóa lại</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Bạn chưa sở hữu sản phẩm này. Vui lòng tiến hành thanh toán đơn hàng để nhận được Link / Nguồn Gốc, tài liệu đi kèm và Video hướng dẫn.
                      </p>
                      
                      <div className="pt-4">
                        <button
                          onClick={onDirectBuy}
                          className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Sở Hữu Ngay Chỉ {formatPrice(tool.priceSale)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* UNLOCKED VIP CONTAINER */
                  <div className="space-y-6">
                    {/* Warning banner of success */}
                    <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <div className="text-sm">
                        <span className="font-bold">Đã mở khóa thành công!</span> Tài khoản của bạn được cấp quyền sử dụng sản phẩm này trọn đời.
                      </div>
                    </div>

                    {/* VIP Action block */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Open original tool button */}
                      <button
                        onClick={handleOpenTool}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#111827] hover:bg-[#111827]/80 border border-purple-500/20 hover:border-purple-500/40 transition-all text-center group cursor-pointer"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                          <ExternalLink className="h-5.5 w-5.5" />
                        </div>
                        <span className="font-display text-sm font-bold text-white mb-1">Mở Sản Phẩm Gốc</span>
                        <span className="text-[11px] text-gray-400">Truy cập liên kết nguồn sản phẩm</span>
                      </button>

                      {/* Copy Prompt Template button */}
                      <button
                        onClick={handleCopyPrompt}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#111827] hover:bg-[#111827]/80 border border-pink-500/20 hover:border-pink-500/40 transition-all text-center group cursor-pointer"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                          {copied ? <Check className="h-5.5 w-5.5" /> : <Copy className="h-5.5 w-5.5" />}
                        </div>
                        <span className="font-display text-sm font-bold text-white mb-1">
                          {copied ? 'Đã sao chép!' : 'Sao chép Prompt Mẫu'}
                        </span>
                        <span className="text-[11px] text-gray-400">Copy cấu trúc prompt ẩn</span>
                      </button>

                      {/* Video Quick play indicator */}
                      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#111827] border border-white/5 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                          <Play className="h-5.5 w-5.5 fill-indigo-400/20" />
                        </div>
                        <span className="font-display text-sm font-bold text-white mb-1">Xem Clip Guide</span>
                        <span className="text-[11px] text-gray-400">Phát video hướng dẫn bên dưới</span>
                      </div>
                    </div>

                    {/* Secret Instructions */}
                    <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8 space-y-4">
                      <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                        <Info className="h-4.5 w-4.5 text-purple-400" />
                        <span>Hướng dẫn sử dụng chi tiết</span>
                      </h3>
                      <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
                        {tool.secretData?.instructions}
                      </p>
                    </div>

                    {/* Secret Prompt Showcase */}
                    <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-bold text-white">
                          Khung Prompt Ẩn
                        </h3>
                        <button
                          onClick={handleCopyPrompt}
                          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copied ? 'Đã copy' : 'Sao chép prompt'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-xl bg-[#030712] border border-white/5 p-4 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                        {tool.secretData?.prompt}
                      </div>
                    </div>

                    {/* Embedded Video Demo */}
                    {tool.videoDemo && (
                      <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8 space-y-4">
                        <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                          <Play className="h-4.5 w-4.5 text-purple-400 fill-purple-400/10" />
                          <span>Video hướng dẫn kích hoạt</span>
                        </h3>
                        
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl">
                          <iframe
                            src={getEmbedVideoUrl(tool.videoDemo)}
                            title={`Hướng dẫn sử dụng ${tool.name}`}
                            className="absolute inset-0 h-full w-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FAQ */}
            {activeTab === 'faq' && (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-lg font-bold text-white mb-4">
                  Giải đáp thắc mắc khách hàng
                </h3>
                
                {tool.faq.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có câu hỏi thường gặp nào.</p>
                ) : (
                  <div className="space-y-3">
                    {tool.faq.map((item, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div 
                          key={idx}
                          className="rounded-xl bg-[#030712] border border-white/5 overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-left font-display text-sm font-semibold text-white hover:text-purple-400 transition-colors"
                          >
                            <span>{item.question}</span>
                            <span className="text-gray-500">{isOpen ? '−' : '+'}</span>
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4 text-sm text-gray-400 border-t border-white/5 pt-3 leading-relaxed">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: CHANGELOG */}
            {activeTab === 'changelog' && (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-white mb-6">
                  Lịch sử cập nhật phiên bản
                </h3>

                {tool.changelog.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có lịch sử cập nhật.</p>
                ) : (
                  <div className="relative border-l-2 border-white/5 pl-6 ml-2 space-y-8 py-2">
                    {tool.changelog.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 ring-4 ring-[#111827]" />
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-sm font-bold text-purple-400">{item.version}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Pricing / CTA Sidebar */}
          <div className="space-y-6">
            
            {/* Purchase CTA Card */}
            <div className="sticky top-24 rounded-2xl bg-[#111827] border border-white/5 p-6 shadow-xl space-y-6">
              
              {/* Product mini-thumbnail (Optional layout) */}
              <div className="aspect-[9/16] w-full rounded-xl overflow-hidden bg-gray-950 border border-white/5 hidden md:block">
                <img
                  src={tool.thumbnail}
                  alt={tool.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Price Details */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Mức giá sở hữu</span>
                {tool.isFree ? (
                  <span className="text-3xl font-extrabold text-emerald-400">Miễn Phí</span>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white font-mono">
                      {formatPrice(tool.priceSale)}
                    </span>
                    {tool.priceOriginal > tool.priceSale && (
                      <span className="text-sm font-mono text-gray-500 line-through">
                        {formatPrice(tool.priceOriginal)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="space-y-3 pt-3 border-t border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Kích hoạt tự động, dùng vĩnh viễn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Được cập nhật tất cả bản v1.x miễn phí</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Cam kết hoàn tiền nếu không hài lòng</span>
                </div>
              </div>

              {/* Dynamic Buttons depending on Purchase status */}
              {hasPurchased ? (
                <button
                  onClick={() => setActiveTab('vip')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500/20 border border-purple-500/40 py-3.5 text-sm font-bold text-purple-300 hover:bg-purple-500/30 transition-colors cursor-pointer"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Sử Dụng Trợ Lý AI</span>
                </button>
              ) : tool.isFree ? (
                <button
                  onClick={() => window.open(tool.secretData?.targetLink, '_blank')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Sử Dụng Ngay (Free)</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={onDirectBuy}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Mua Ngay</span>
                  </button>
                  
                  <button
                    onClick={onAddToCart}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors cursor-pointer ${
                      isInCart
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                        : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Đã có trong giỏ hàng</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Thêm vào giỏ hàng</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* Floating success copied toast notification */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-2xl animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>✨ Đã sao chép prompt mẫu vào bộ nhớ tạm!</span>
        </div>
      )}
    </div>
  );
}
