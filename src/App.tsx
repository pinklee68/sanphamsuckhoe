import { useState, useEffect } from 'react';
import { User, Tool, Category, Order, GlobalSettings } from './types';
import { DatabaseService, AuthService } from './lib/db';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolCard from './components/ToolCard';
import ToolDetail from './components/ToolDetail';
import CartModal from './components/CartModal';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import AdminPanel from './components/AdminPanel';
import { 
  Sparkles, ShieldCheck, Mail, Phone, ExternalLink, 
  Dumbbell, Utensils, Heart, Instagram, AlertTriangle 
} from 'lucide-react';
import LucideIcon from './components/LucideIcon';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App views: 'catalog' | 'detail' | 'checkout' | 'orders'
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState<Order | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState<Tool[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin Portal Open toggle
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Global settings loaded from DB
  const [settings, setSettings] = useState<GlobalSettings>(DatabaseService.getSettings());

  // Database core state lists (forces reactive re-renders when databases change)
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [toolsList, setToolsList] = useState<Tool[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);

  // Initialize and reload data
  const handleReloadDatabase = () => {
    setCategoriesList(DatabaseService.listCategories());
    setToolsList(DatabaseService.listTools());
    setOrdersList(DatabaseService.listOrders());
    setSettings(DatabaseService.getSettings());
  };

  useEffect(() => {
    // Authenticate automatically on mount (or retrieve session)
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    handleReloadDatabase();
  }, []);

  // Sync cart items with user specific states if needed, or maintain simple local
  const handleAddToCart = (tool: Tool) => {
    if (cartItems.some(item => item.id === tool.id)) {
      // Remove if already in cart
      setCartItems(cartItems.filter(item => item.id !== tool.id));
    } else {
      setCartItems([...cartItems, tool]);
    }
  };

  const handleRemoveFromCart = (toolId: string) => {
    setCartItems(cartItems.filter(item => item.id !== toolId));
  };

  const handleDirectBuy = (tool: Tool) => {
    // If not logged in, prompt sign in by clicking navbar login
    if (!currentUser) {
      alert('Vui lòng Đăng nhập tài khoản để thực hiện mua sản phẩm!');
      const loginBtn = document.querySelector('button[class*="bg-gradient-to-r from-indigo-500"]') as HTMLButtonElement;
      if (loginBtn) loginBtn.click();
      return;
    }

    const items = [{ toolId: tool.id, name: tool.name, price: tool.priceSale }];
    const newOrder = DatabaseService.createOrder(
      currentUser.uid,
      currentUser.email,
      items,
      tool.priceSale
    );

    setActiveCheckoutOrder(newOrder);
    setActiveTab('checkout');
    setIsCartOpen(false);
  };

  const handleProceedToCheckout = (discountAmount: number, couponCode: string) => {
    if (!currentUser) {
      alert('Vui lòng Đăng nhập tài khoản để thanh toán đơn hàng!');
      setIsCartOpen(false);
      const loginBtn = document.querySelector('button[class*="bg-gradient-to-r from-indigo-500"]') as HTMLButtonElement;
      if (loginBtn) loginBtn.click();
      return;
    }

    const orderItems = cartItems.map(item => ({
      toolId: item.id,
      name: item.name,
      price: item.priceSale
    }));

    const totalAmount = cartItems.reduce((acc, item) => acc + item.priceSale, 0) - discountAmount;

    const newOrder = DatabaseService.createOrder(
      currentUser.uid,
      currentUser.email,
      orderItems,
      Math.max(0, totalAmount),
      couponCode || undefined
    );

    // Empty cart on successful order
    setCartItems([]);
    setIsCartOpen(false);
    setActiveCheckoutOrder(newOrder);
    setActiveTab('checkout');
  };

  // Bookmark Toggle
  const handleToggleBookmark = (toolId: string) => {
    if (!currentUser) {
      alert('Vui lòng Đăng nhập tài khoản để đánh dấu yêu thích!');
      return;
    }
    const bookmarks = DatabaseService.toggleBookmark(currentUser.uid, toolId);
    setCurrentUser({ ...currentUser, bookmarks });
  };

  // Filter tools depending on category & search query query
  const filteredTools = toolsList.filter(tool => {
    const matchesCategory = selectedCategory === null || tool.categoryId === selectedCategory;
    
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = term === '' || 
      tool.name.toLowerCase().includes(term) || 
      tool.shortDescription.toLowerCase().includes(term) ||
      tool.tags.some(tag => tag.toLowerCase().includes(term));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-gray-300 font-sans flex flex-col justify-between selection:bg-purple-500/30 selection:text-white">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          handleReloadDatabase();
        }}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTool(null);
          setActiveCheckoutOrder(null);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Main content pages router */}
      <main className="flex-1">
        {activeTab === 'catalog' && !selectedTool && (
          <div className="space-y-6">
            {/* Hero banner filters */}
            <Hero
              categories={categoriesList}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalToolsCount={toolsList.length}
            />

            {/* Catalog Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
              {filteredTools.length === 0 ? (
                <div className="text-center py-16 bg-[#111827] border border-white/5 rounded-2xl p-8 space-y-2">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto animate-bounce" />
                  <h3 className="font-display text-base font-bold text-white">Không có sản phẩm nào phù hợp</h3>
                  <p className="text-xs text-gray-500">Thử tìm kiếm từ khóa khác hoặc xóa bộ lọc danh mục.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => {
                    const hasPurchased = currentUser ? DatabaseService.hasUserPurchased(currentUser.uid, tool.id) : false;
                    return (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        category={categoriesList.find(c => c.id === tool.categoryId)}
                        currentUser={currentUser}
                        onSelect={() => {
                          setSelectedTool(tool);
                          setActiveTab('detail');
                        }}
                        onToggleBookmark={handleToggleBookmark}
                        isBookmarked={currentUser?.bookmarks?.includes(tool.id) || false}
                        onAddToCart={(e) => handleAddToCart(tool)}
                        isInCart={cartItems.some(item => item.id === tool.id)}
                        hasPurchased={hasPurchased}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Details Screen */}
        {activeTab === 'detail' && selectedTool && (
          <ToolDetail
            tool={selectedTool}
            category={categoriesList.find(c => c.id === selectedTool.categoryId)}
            currentUser={currentUser}
            hasPurchased={currentUser ? DatabaseService.hasUserPurchased(currentUser.uid, selectedTool.id) : false}
            isBookmarked={currentUser?.bookmarks?.includes(selectedTool.id) || false}
            isInCart={cartItems.some(item => item.id === selectedTool.id)}
            onBack={() => {
              setActiveTab('catalog');
              setSelectedTool(null);
            }}
            onToggleBookmark={() => handleToggleBookmark(selectedTool.id)}
            onAddToCart={() => handleAddToCart(selectedTool)}
            onDirectBuy={() => handleDirectBuy(selectedTool)}
          />
        )}

        {/* View Checkout Screen */}
        {activeTab === 'checkout' && activeCheckoutOrder && (
          <Checkout
            order={activeCheckoutOrder}
            globalSettings={settings}
            onBackToCatalog={() => {
              setActiveTab('catalog');
              setActiveCheckoutOrder(null);
              setSelectedTool(null);
            }}
            onGoToOrderHistory={() => {
              setActiveTab('orders');
              setActiveCheckoutOrder(null);
              setSelectedTool(null);
            }}
          />
        )}

        {/* View Client Order History */}
        {activeTab === 'orders' && (
          <OrderHistory
            orders={ordersList.filter(o => o.userId === currentUser?.uid)}
            onSelectOrder={(ord) => {
              setActiveCheckoutOrder(ord);
              setActiveTab('checkout');
            }}
            onSelectTool={(toolId) => {
              const toolObj = toolsList.find(t => t.id === toolId);
              if (toolObj) {
                setSelectedTool(toolObj);
                setActiveTab('detail');
              }
            }}
          />
        )}
      </main>

      {/* 3. Global Footer bar */}
      <footer className="bg-[#0B0F19] border-t border-white/5 py-12 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 Brand */}
          <div className="space-y-4">
            <span className="font-display text-sm font-black text-white tracking-wider block uppercase">
              {settings.websiteName}
            </span>
            <p className="leading-relaxed">
              {settings.seoGlobal.metaDescription}
            </p>
            <div className="flex gap-4">
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              )}
              {settings.socialLinks.tiktok && (
                <a href={settings.socialLinks.tiktok} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  TikTok
                </a>
              )}
            </div>
          </div>

          {/* Col 2 Quick links */}
          <div className="space-y-3">
            <span className="text-white font-semibold">Khám phá</span>
            <ul className="space-y-2">
              {categoriesList.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={() => { setSelectedCategory(cat.id); setActiveTab('catalog'); setSelectedTool(null); }}
                    className="hover:text-white transition-colors text-left text-xs"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 Contacts info */}
          <div className="space-y-3">
            <span className="text-white font-semibold">Hỗ trợ & Hotline</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-mono text-white font-medium">{settings.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">support@songkhoecunghong.com</span>
              </div>
            </div>
            <div className="pt-2 text-[10px] text-gray-500 leading-relaxed">
              Khách hàng chuyển khoản vui lòng kiểm tra kỹ nội dung giao dịch. Đội ngũ admin duyệt thủ công tối đa 5-10 phút.
            </div>
          </div>

          {/* Col 4 Guarantee badge */}
          <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-2 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-purple-400" />
            <span className="block text-white font-bold text-[11px] uppercase tracking-wide">Bản quyền vĩnh viễn</span>
            <span className="block text-[10px] text-gray-500">Mọi sản phẩm mua một lần sở hữu trọn đời, cập nhật vĩnh viễn không phụ thu.</span>
          </div>
        </div>

        {/* copyright */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-600">
          <div>
            © 2026 {settings.websiteName}. Tất cả các quyền được bảo hộ. Công nghệ AI tối ưu bởi Lê Thị Hồng.
          </div>
          <div>
            Design & Engine by Astudio AI Portal v1.0
          </div>
        </div>
      </footer>

      {/* Cart side slide drawer */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Full control Admin Panel */}
      {isAdminOpen && currentUser?.role === 'admin' && (
        <AdminPanel
          currentUser={currentUser}
          onClose={() => setIsAdminOpen(false)}
          onRefreshData={handleReloadDatabase}
        />
      )}
    </div>
  );
}
