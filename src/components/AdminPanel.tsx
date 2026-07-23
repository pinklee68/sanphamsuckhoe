import { useState, useRef, useEffect } from 'react';
import { Tool, Category, Order, Coupon, GlobalSettings, FAQItem, ChangelogItem } from '../types';
import { DatabaseService } from '../lib/db';
import { 
  BarChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Key, FolderOpen, Tag, Settings, Plus, Trash2, 
  Check, X, Edit2, ShieldAlert, Sparkles, Upload, Eye, Info, RefreshCw, AlertCircle,
  HelpCircle
} from 'lucide-react';
import LucideIcon from './LucideIcon';

interface AdminPanelProps {
  currentUser: any;
  onClose: () => void;
  onRefreshData: () => void;
}

export default function AdminPanel({
  currentUser,
  onClose,
  onRefreshData
}: AdminPanelProps) {
  const [activeMenu, setActiveMenu] = useState<'overview' | 'orders' | 'tools' | 'categories' | 'coupons' | 'settings'>('overview');
  
  // Local copies of db states for quick reactivity
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DatabaseService.getSettings());

  // Reload admin state
  const loadData = () => {
    setTools(DatabaseService.listTools());
    setCategories(DatabaseService.listCategories());
    setOrders(DatabaseService.listOrders());
    setCoupons(DatabaseService.listCoupons());
    setGlobalSettings(DatabaseService.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // ==========================================
  // MENU 1: OVERVIEW ANALYTICS LOGIC
  // ==========================================
  const getOverviewStats = () => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const totalCopies = tools.reduce((sum, t) => sum + (t.copyCount || 0), 0);
    const totalMembers = DatabaseService.listUsers().length || 12; // fallback baseline members count

    return {
      totalRevenue,
      pendingCount,
      totalCopies,
      totalMembers
    };
  };

  const getChartData = () => {
    // Generate standard 7 days earnings from existing orders + baseline mockup
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const earnings = [450000, 300000, 750000, 150000, 600000, 900000, 1200000];

    // Read real orders in localStorage and append
    const paidOrders = orders.filter(o => o.status === 'paid');
    
    // Distribute recent paid orders onto the current week
    paidOrders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      const dayIndex = (orderDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0..Sunday=6
      earnings[dayIndex] += o.totalAmount;
    });

    return days.map((day, idx) => ({
      name: day,
      'Doanh thu (VND)': earnings[idx],
    }));
  };

  const stats = getOverviewStats();
  const chartData = getChartData();

  // ==========================================
  // MENU 2: ORDER APPROVAL LOGIC
  // ==========================================
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleApproveOrder = (orderId: string) => {
    DatabaseService.updateOrderStatus(orderId, 'paid', currentUser?.uid || 'admin');
    loadData();
    onRefreshData();
  };

  const handleCancelOrder = (orderId: string) => {
    DatabaseService.updateOrderStatus(orderId, 'cancelled', currentUser?.uid || 'admin');
    loadData();
    onRefreshData();
  };

  // ==========================================
  // MENU 3: CRUD TOOLS LOGIC
  // ==========================================
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showToolForm, setShowToolForm] = useState(false);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form Fields State
  const [toolName, setToolName] = useState('');
  const [toolSlug, setToolSlug] = useState('');
  const [toolShortDesc, setToolShortDesc] = useState('');
  const [toolLongDesc, setToolLongDesc] = useState('');
  const [toolCategory, setToolCategory] = useState('');
  const [toolTags, setToolTags] = useState('');
  const [toolOriginalPrice, setToolOriginalPrice] = useState(0);
  const [toolSalePrice, setToolSalePrice] = useState(0);
  const [toolHot, setToolHot] = useState(false);
  const [toolNew, setToolNew] = useState(false);
  const [toolFree, setToolFree] = useState(false);
  const [toolVersion, setToolVersion] = useState('v1.0');
  const [toolThumbnailUrl, setToolThumbnailUrl] = useState('');
  const [toolBannerUrl, setToolBannerUrl] = useState('');
  const [toolVideoUrl, setToolVideoUrl] = useState('');
  const [toolSecretLink, setToolSecretLink] = useState('');
  const [toolSecretPrompt, setToolSecretPrompt] = useState('');
  const [toolSecretInstructions, setToolSecretInstructions] = useState('');
  
  // Changelog & FAQ Form arrays
  const [toolFaqs, setToolFaqs] = useState<FAQItem[]>([]);
  const [toolChangelogs, setToolChangelogs] = useState<ChangelogItem[]>([]);

  // Trigger Slug auto-creation from name
  const updateSlugFromName = (name: string) => {
    setToolName(name);
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setToolSlug(slug);
  };

  // File Upload Handlers (Resizes vertical thumbnail to exactly 450x800 px)
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Prepare canvas to force 9:16 crop & resizing to exactly 450x800
        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw image matching coordinates perfectly
          ctx.drawImage(img, 0, 0, 450, 800);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setToolThumbnailUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEditToolClick = (tool: Tool) => {
    setEditingTool(tool);
    setToolName(tool.name);
    setToolSlug(tool.slug);
    setToolShortDesc(tool.shortDescription);
    setToolLongDesc(tool.longDescription);
    setToolCategory(tool.categoryId);
    setToolTags(tool.tags.join(', '));
    setToolOriginalPrice(tool.priceOriginal);
    setToolSalePrice(tool.priceSale);
    setToolHot(tool.isHot);
    setToolNew(tool.isNew);
    setToolFree(tool.isFree);
    setToolVersion(tool.version);
    setToolThumbnailUrl(tool.thumbnail);
    setToolBannerUrl(tool.banner);
    setToolVideoUrl(tool.videoDemo || '');
    setToolSecretLink(tool.secretData?.targetLink || '');
    setToolSecretPrompt(tool.secretData?.prompt || '');
    setToolSecretInstructions(tool.secretData?.instructions || '');
    setToolFaqs(tool.faq || []);
    setToolChangelogs(tool.changelog || []);
    setShowToolForm(true);
  };

  const handleAddNewToolClick = () => {
    setEditingTool(null);
    setToolName('');
    setToolSlug('');
    setToolShortDesc('');
    setToolLongDesc('');
    setToolCategory(categories[0]?.id || '');
    setToolTags('');
    setToolOriginalPrice(0);
    setToolSalePrice(0);
    setToolHot(false);
    setToolNew(true);
    setToolFree(false);
    setToolVersion('v1.0');
    setToolThumbnailUrl('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=450&h=800&fit=crop');
    setToolBannerUrl('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&h=400&fit=crop');
    setToolVideoUrl('');
    setToolSecretLink('');
    setToolSecretPrompt('');
    setToolSecretInstructions('');
    setToolFaqs([]);
    setToolChangelogs([]);
    setShowToolForm(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !toolSlug) return;

    const savedTool: Tool = {
      id: editingTool?.id || 'tool-' + Math.random().toString(36).substr(2, 9),
      name: toolName,
      slug: toolSlug,
      thumbnail: toolThumbnailUrl,
      banner: toolBannerUrl,
      videoDemo: toolVideoUrl,
      shortDescription: toolShortDesc,
      longDescription: toolLongDesc,
      priceOriginal: Number(toolOriginalPrice),
      priceSale: toolFree ? 0 : Number(toolSalePrice),
      rating: editingTool?.rating || 5,
      reviewCount: editingTool?.reviewCount || 0,
      purchaseCount: editingTool?.purchaseCount || 0,
      copyCount: editingTool?.copyCount || 0,
      categoryId: toolCategory,
      tags: toolTags.split(',').map(t => t.trim()).filter(Boolean),
      isHot: toolHot,
      isNew: toolNew,
      isFree: toolFree,
      version: toolVersion,
      lastUpdated: new Date().toISOString(),
      changelog: toolChangelogs,
      faq: toolFaqs,
      secretData: {
        targetLink: toolSecretLink,
        prompt: toolSecretPrompt,
        instructions: toolSecretInstructions
      },
      seo: {
        title: `${toolName} - Sống Khoẻ Cùng Hồng`,
        description: toolShortDesc,
        keywords: toolTags
      }
    };

    DatabaseService.saveTool(savedTool);
    setShowToolForm(false);
    setEditingTool(null);
    loadData();
    onRefreshData();
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa công cụ này?')) {
      DatabaseService.deleteTool(id);
      loadData();
      onRefreshData();
    }
  };

  // FAQ Add Row helper
  const handleAddFaqRow = () => {
    setToolFaqs([...toolFaqs, { question: '', answer: '' }]);
  };

  const handleFaqRowChange = (index: number, key: 'question' | 'answer', val: string) => {
    const updated = [...toolFaqs];
    updated[index][key] = val;
    setToolFaqs(updated);
  };

  const handleRemoveFaqRow = (index: number) => {
    setToolFaqs(toolFaqs.filter((_, i) => i !== index));
  };

  // Changelog Add Row helper
  const handleAddChangelogRow = () => {
    setToolChangelogs([...toolChangelogs, { version: '', date: new Date().toISOString(), content: '' }]);
  };

  const handleChangelogRowChange = (index: number, key: 'version' | 'content', val: string) => {
    const updated = [...toolChangelogs];
    updated[index][key] = val;
    setToolChangelogs(updated);
  };

  const handleRemoveChangelogRow = (index: number) => {
    setToolChangelogs(toolChangelogs.filter((_, i) => i !== index));
  };


  // ==========================================
  // MENU 4: CRUD CATEGORIES LOGIC
  // ==========================================
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('Sparkles');
  const [catColor, setCatColor] = useState('#10B981');
  const [catOrder, setCatOrder] = useState(1);

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCatOrder(cat.order);
    setShowCategoryForm(true);
  };

  const handleAddNewCategoryClick = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatIcon('Sparkles');
    setCatColor('#8B5CF6');
    setCatOrder(categories.length + 1);
    setShowCategoryForm(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;

    const savedCategory: Category = {
      id: editingCategory?.id || 'cat-' + Math.random().toString(36).substr(2, 9),
      name: catName,
      slug: catSlug,
      icon: catIcon,
      color: catColor,
      order: Number(catOrder)
    };

    DatabaseService.saveCategory(savedCategory);
    setShowCategoryForm(false);
    setEditingCategory(null);
    loadData();
    onRefreshData();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Toàn bộ sản phẩm thuộc danh mục có thể bị ảnh hưởng.')) {
      DatabaseService.deleteCategory(id);
      loadData();
      onRefreshData();
    }
  };

  // ==========================================
  // MENU 5: CRUD COUPON LOGIC
  // ==========================================
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCodeField, setCouponCodeField] = useState('');
  const [couponTypeField, setCouponTypeField] = useState<'percent' | 'fixed'>('percent');
  const [couponValueField, setCouponValueField] = useState(0);
  const [couponMaxUsesField, setCouponMaxUsesField] = useState(100);
  const [couponExpiryField, setCouponExpiryField] = useState('2026-12-31');

  const handleAddNewCouponClick = () => {
    setEditingCoupon(null);
    setCouponCodeField('');
    setCouponTypeField('percent');
    setCouponValueField(10);
    setCouponMaxUsesField(100);
    setCouponExpiryField('2026-12-31');
    setShowCouponForm(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeField) return;

    const savedCoupon: Coupon = {
      id: editingCoupon?.id || 'coupon-' + Math.random().toString(36).substr(2, 9),
      code: couponCodeField.toUpperCase().trim(),
      type: couponTypeField,
      value: Number(couponValueField),
      maxUses: Number(couponMaxUsesField),
      usedCount: editingCoupon?.usedCount || 0,
      expiryDate: new Date(couponExpiryField).toISOString()
    };

    DatabaseService.saveCoupon(savedCoupon);
    setShowCouponForm(false);
    setEditingCoupon(null);
    loadData();
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      DatabaseService.deleteCoupon(id);
      loadData();
    }
  };

  // ==========================================
  // MENU 6: GLOBAL CONFIG/SETTINGS LOGIC
  // ==========================================
  const [settingsWebsiteName, setSettingsWebsiteName] = useState(globalSettings.websiteName);
  const [settingsLogoUrl, setSettingsLogoUrl] = useState(globalSettings.logoUrl);
  const [settingsFaviconUrl, setSettingsFaviconUrl] = useState(globalSettings.faviconUrl);
  const [settingsHotline, setSettingsHotline] = useState(globalSettings.hotline);
  
  const [settingsFacebook, setSettingsFacebook] = useState(globalSettings.socialLinks.facebook || '');
  const [settingsYoutube, setSettingsYoutube] = useState(globalSettings.socialLinks.youtube || '');
  const [settingsTiktok, setSettingsTiktok] = useState(globalSettings.socialLinks.tiktok || '');

  const [settingsAccountHolder, setSettingsAccountHolder] = useState(globalSettings.paymentInfo.accountHolder);
  const [settingsBankName, setSettingsBankName] = useState(globalSettings.paymentInfo.bankName);
  const [settingsAccountNumber, setSettingsAccountNumber] = useState(globalSettings.paymentInfo.accountNumber);

  const [settingsSeoTitle, setSettingsSeoTitle] = useState(globalSettings.seoGlobal.metaTitle);
  const [settingsSeoDesc, setSettingsSeoDesc] = useState(globalSettings.seoGlobal.metaDescription);
  const [settingsSeoGaId, setSettingsSeoGaId] = useState(globalSettings.seoGlobal.googleAnalyticsId);

  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: GlobalSettings = {
      websiteName: settingsWebsiteName,
      logoUrl: settingsLogoUrl,
      faviconUrl: settingsFaviconUrl,
      hotline: settingsHotline,
      socialLinks: {
        facebook: settingsFacebook,
        youtube: settingsYoutube,
        tiktok: settingsTiktok
      },
      paymentInfo: {
        accountHolder: settingsAccountHolder,
        bankName: settingsBankName,
        accountNumber: settingsAccountNumber
      },
      seoGlobal: {
        metaTitle: settingsSeoTitle,
        metaDescription: settingsSeoDesc,
        googleAnalyticsId: settingsSeoGaId
      }
    };

    DatabaseService.updateSettings(updatedSettings);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3000);
    loadData();
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#030712] text-gray-300 font-sans">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-64 bg-[#0B0F19] border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-sm font-black text-white uppercase tracking-wider block">Admin Panel</span>
              <span className="text-[10px] text-gray-500 font-mono">Sống Khoẻ Cùng Hồng</span>
            </div>
          </div>

          {/* Menus List */}
          <nav className="p-3.5 space-y-1">
            {/* Menu: Overview */}
            <button
              onClick={() => { setActiveMenu('overview'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Tổng quan Analytics</span>
            </button>

            {/* Menu: Orders Verification */}
            <button
              onClick={() => { setActiveMenu('orders'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'orders'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4.5 w-4.5" />
                <span>Quản lý Đơn hàng</span>
              </div>
              {stats.pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {stats.pendingCount}
                </span>
              )}
            </button>

            {/* Menu: CRUD Tools */}
            <button
              onClick={() => { setActiveMenu('tools'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'tools'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Key className="h-4.5 w-4.5" />
              <span>Quản lý Sản phẩm</span>
            </button>

            {/* Menu: CRUD Categories */}
            <button
              onClick={() => { setActiveMenu('categories'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'categories'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderOpen className="h-4.5 w-4.5" />
              <span>Quản lý Danh mục</span>
            </button>

            {/* Menu: Coupons */}
            <button
              onClick={() => { setActiveMenu('coupons'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'coupons'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="h-4.5 w-4.5" />
              <span>Mã Giảm Giá (Coupons)</span>
            </button>

            {/* Menu: System config */}
            <button
              onClick={() => { setActiveMenu('settings'); setShowToolForm(false); setShowCategoryForm(false); setShowCouponForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'settings'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Cấu hình Hệ Thống</span>
            </button>
          </nav>
        </div>

        {/* Exit Admin Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full text-center py-2 text-xs font-bold bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 rounded-xl transition-all cursor-pointer"
          >
            Thoát Chế Độ Quản Trị
          </button>
        </div>
      </aside>

      {/* 2. Right Workspace Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#030712]">
        
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0B0F19]/45 shrink-0">
          <h2 className="font-display text-lg font-bold text-white capitalize">
            {activeMenu === 'overview' && 'Bảng điều khiển tổng quan'}
            {activeMenu === 'orders' && 'Đối soát chuyển khoản đơn hàng'}
            {activeMenu === 'tools' && 'Danh mục các công cụ trợ lý AI'}
            {activeMenu === 'categories' && 'Quản lý danh mục sản phẩm'}
            {activeMenu === 'coupons' && 'Hệ thống quản lý Coupon ưu đãi'}
            {activeMenu === 'settings' && 'Cài đặt toàn cục hệ thống'}
          </h2>
          
          <div className="flex items-center gap-2.5 text-xs">
            <span className="text-gray-500">Đăng nhập:</span>
            <span className="font-mono text-white font-semibold">{currentUser?.email}</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase tracking-widest text-[10px]">ADMIN</span>
          </div>
        </header>

        {/* Workspace Body container scroll */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ========================================================= */}
          {/* SUBMENU 1: OVERVIEW ANALYTICS */}
          {/* ========================================================= */}
          {activeMenu === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Bento cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Revenue card */}
                <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 shadow-lg space-y-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Tổng Doanh Thu</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{formatCurrency(stats.totalRevenue)}</span>
                  <span className="block text-[10px] text-gray-500">Từ các đơn hàng được duyệt thanh toán</span>
                </div>

                {/* Pending orders card */}
                <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 shadow-lg space-y-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Chờ Duyệt CK</span>
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">{stats.pendingCount} đơn hàng</span>
                  <span className="block text-[10px] text-gray-500">Cần admin đối soát duyệt cấp quyền</span>
                </div>

                {/* Members counts card */}
                <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 shadow-lg space-y-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Tổng số lượt Copy</span>
                  <span className="text-2xl font-black text-purple-400 font-mono tracking-tight">{stats.totalCopies} lần</span>
                  <span className="block text-[10px] text-gray-500">Khách hàng sao chép Prompt mẫu</span>
                </div>

                {/* Members count */}
                <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 shadow-lg space-y-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Thành viên mới</span>
                  <span className="text-2xl font-black text-indigo-400 font-mono tracking-tight">{stats.totalMembers} tài khoản</span>
                  <span className="block text-[10px] text-gray-500">Đăng ký trải nghiệm portal health</span>
                </div>
              </div>

              {/* Chart section */}
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white">Biểu đồ doanh thu tuần này</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Thống kê doanh thu chuyển khoản theo từng thứ trong tuần.</p>
                </div>

                <div className="h-80 w-full font-mono text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        itemStyle={{ color: '#F3F4F6' }}
                      />
                      <Area type="monotone" dataKey="Doanh thu (VND)" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMENU 2: ORDER VERIFICATION */}
          {/* ========================================================= */}
          {activeMenu === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              {/* Order filter tabs */}
              <div className="flex border-b border-white/5 gap-2 pb-px">
                {(['all', 'pending', 'paid', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                      orderFilter === status
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {status === 'all' && 'Tất cả'}
                    {status === 'pending' && 'Đang chờ duyệt'}
                    {status === 'paid' && 'Đã duyệt thanh toán'}
                    {status === 'cancelled' && 'Đã hủy đơn'}
                  </button>
                ))}
              </div>

              {/* Orders table list */}
              {filteredOrders.length === 0 ? (
                <div className="p-8 bg-[#111827] rounded-2xl text-center border border-white/5 text-gray-500 text-sm">
                  Không tìm thấy đơn hàng nào tương ứng.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827] shadow-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0B0F19]/45 border-b border-white/5 text-gray-500 font-semibold uppercase font-mono">
                        <th className="p-4">Mã Đơn</th>
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4 text-right">Tổng tiền</th>
                        <th className="p-4">Nội Dung CK Đối Soát</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{ord.id}</td>
                          <td className="p-4">
                            <span className="block font-medium text-white">{ord.userEmail}</span>
                            <span className="block text-[10px] text-gray-500 font-mono">ID: {ord.userId}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 max-w-[200px]">
                              {ord.items.map((it, i) => (
                                <span key={i} className="block truncate font-medium text-gray-300">
                                  - {it.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-white">{formatCurrency(ord.totalAmount)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono tracking-wider font-bold">
                              {ord.transferContent}
                            </span>
                          </td>
                          <td className="p-4">
                            {ord.status === 'paid' && <span className="text-emerald-400 font-semibold">● Đã thanh toán</span>}
                            {ord.status === 'cancelled' && <span className="text-red-400 font-semibold">● Đã hủy</span>}
                            {ord.status === 'pending' && <span className="text-amber-400 font-semibold animate-pulse">● Đang chờ duyệt</span>}
                          </td>
                          <td className="p-4 text-center">
                            {ord.status === 'pending' ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleApproveOrder(ord.id)}
                                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1 font-bold"
                                  title="Phê duyệt đơn hàng"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Duyệt CK</span>
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(ord.id)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1 font-bold"
                                  title="Hủy đơn"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Hủy đơn</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-[10px] font-mono">
                                Approved: {ord.approvedAt ? new Date(ord.approvedAt).toLocaleDateString() : 'N/A'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMENU 3: CRUD PRODUCTS */}
          {/* ========================================================= */}
          {activeMenu === 'tools' && (
            <div className="space-y-6 animate-fade-in">
              {!showToolForm ? (
                /* MAIN LIST TOOLS VIEW */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Danh mục gồm {tools.length} sản phẩm</span>
                    <button
                      onClick={handleAddNewToolClick}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm sản phẩm mới</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827] shadow-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0B0F19]/45 border-b border-white/5 text-gray-500 font-semibold uppercase font-mono">
                          <th className="p-4">Hình dọc (9:16)</th>
                          <th className="p-4">Tên sản phẩm</th>
                          <th className="p-4">Danh mục</th>
                          <th className="p-4 text-right">Mức giá</th>
                          <th className="p-4 text-center">Đã bán</th>
                          <th className="p-4 text-center">Trạng thái</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {tools.map((t) => (
                          <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <img
                                src={t.thumbnail}
                                alt={t.name}
                                className="h-14 w-9 rounded-lg object-cover bg-gray-950 border border-white/5"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="p-4">
                              <span className="block font-bold text-white text-sm">{t.name}</span>
                              <span className="block text-[10px] text-gray-500 font-mono">Slug: {t.slug} | Version: {t.version}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-gray-300">
                                {categories.find(c => c.id === t.categoryId)?.name || 'Chưa phân loại'}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-white">
                              {t.isFree ? (
                                <span className="text-emerald-400 font-bold">Free</span>
                              ) : (
                                <>
                                  <span className="block font-black">{formatCurrency(t.priceSale)}</span>
                                  {t.priceOriginal > t.priceSale && (
                                    <span className="block text-[10px] text-gray-500 line-through">{formatCurrency(t.priceOriginal)}</span>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="block text-gray-300 font-bold">{t.purchaseCount} sở hữu</span>
                              <span className="block text-[10px] text-gray-500 font-mono">{t.copyCount || 0} copy prompt</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-wrap justify-center gap-1">
                                {t.isHot && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase">HOT</span>}
                                {t.isNew && <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase">NEW</span>}
                                {t.isFree && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">FREE</span>}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditToolClick(t)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 border border-white/5 transition-colors cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTool(t.id)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                                  title="Xóa bỏ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* CRUD FORM TOOL ADD/EDIT */
                <form onSubmit={handleSaveTool} className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-6 shadow-xl animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h3 className="font-display text-base font-bold text-white">
                      {editingTool ? `Chỉnh sửa sản phẩm: ${editingTool.name}` : 'Thêm sản phẩm mới'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowToolForm(false)}
                      className="text-xs text-gray-500 hover:text-white"
                    >
                      Quay lại danh sách sản phẩm
                    </button>
                  </div>

                  {/* Form fields layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1">1. Thông tin cơ bản</h4>
                      
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Tên sản phẩm</label>
                        <input
                          type="text"
                          value={toolName}
                          onChange={(e) => updateSlugFromName(e.target.value)}
                          placeholder="Nhập tên hiển thị..."
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Slug URL (Tự sinh)</label>
                        <input
                          type="text"
                          value={toolSlug}
                          onChange={(e) => setToolSlug(e.target.value)}
                          placeholder="ai-thuc-don-7-ngay"
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Danh mục</label>
                          <select
                            value={toolCategory}
                            onChange={(e) => setToolCategory(e.target.value)}
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Phiên bản</label>
                          <input
                            type="text"
                            value={toolVersion}
                            onChange={(e) => setToolVersion(e.target.value)}
                            placeholder="v1.0"
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Mô tả ngắn</label>
                        <textarea
                          value={toolShortDesc}
                          onChange={(e) => setToolShortDesc(e.target.value)}
                          placeholder="Mô tả tóm tắt tính năng..."
                          rows={2}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Mô tả chi tiết (Hỗ trợ Markdown)</label>
                        <textarea
                          value={toolLongDesc}
                          onChange={(e) => setToolLongDesc(e.target.value)}
                          placeholder="Nhập mô tả chi tiết bằng Markdown..."
                          rows={6}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Tags (Phân tách bằng dấu phẩy)</label>
                        <input
                          type="text"
                          value={toolTags}
                          onChange={(e) => setToolTags(e.target.value)}
                          placeholder="Dinh duong, Thể hình, Sức khỏe"
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Price and settings */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1">2. Thiết lập giá & Huy hiệu</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Giá gốc (VND)</label>
                          <input
                            type="number"
                            value={toolOriginalPrice}
                            onChange={(e) => setToolOriginalPrice(Number(e.target.value))}
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Giá khuyến mãi (VND)</label>
                          <input
                            type="number"
                            value={toolSalePrice}
                            onChange={(e) => setToolSalePrice(Number(e.target.value))}
                            disabled={toolFree}
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Trạng thái sản phẩm (Huy hiệu)</label>
                        <select
                          value={toolFree ? 'free' : toolHot ? 'hot' : toolNew ? 'new' : 'normal'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'hot') {
                              setToolHot(true);
                              setToolNew(false);
                              setToolFree(false);
                            } else if (val === 'new') {
                              setToolHot(false);
                              setToolNew(true);
                              setToolFree(false);
                            } else if (val === 'free') {
                              setToolHot(false);
                              setToolNew(false);
                              setToolFree(true);
                              setToolSalePrice(0);
                            } else {
                              setToolHot(false);
                              setToolNew(false);
                              setToolFree(false);
                            }
                          }}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-sans"
                        >
                          <option value="normal">Mặc định (Bình thường / Không huy hiệu)</option>
                          <option value="hot">HOT 🔥 (Trạng thái nổi bật)</option>
                          <option value="new">NEW ⚡ (Trạng thái sản phẩm mới)</option>
                          <option value="free">FREE 🎁 (Trạng thái miễn phí)</option>
                        </select>
                      </div>

                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 pt-4">3. Thiết lập hình ảnh & Video</h4>
                      
                      {/* Thumbnail Resizing / Upload section */}
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Ảnh đại diện dọc 9:16 (Resize tự động về 450x800px)</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={toolThumbnailUrl}
                            onChange={(e) => setToolThumbnailUrl(e.target.value)}
                            placeholder="URL ảnh dọc..."
                            className="flex-1 rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                          />
                          <div className="relative shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              id="thumbnail-upload"
                              onChange={handleThumbnailUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="thumbnail-upload"
                              className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2.5 text-xs font-semibold text-purple-400 border border-purple-500/20 transition-all cursor-pointer"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Tải ảnh dọc</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Banner ngang (1200x400px)</label>
                        <input
                          type="text"
                          value={toolBannerUrl}
                          onChange={(e) => setToolBannerUrl(e.target.value)}
                          placeholder="URL ảnh banner ngang..."
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Video Clip Hướng Dẫn (YouTube URL)</label>
                        <input
                          type="text"
                          value={toolVideoUrl}
                          onChange={(e) => setToolVideoUrl(e.target.value)}
                          placeholder="Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECRET DATA AREA */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-red-400" />
                      <span>4. Dữ liệu Bảo mật & VIP (Chỉ lộ diện khi đã sở hữu)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Link / Nguồn sản phẩm gốc (Website hoặc Drive)</label>
                          <input
                            type="text"
                            value={toolSecretLink}
                            onChange={(e) => setToolSecretLink(e.target.value)}
                            placeholder="https://chatgpt.com/g/g-xxxxx..."
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 font-medium mb-1">Hướng dẫn sử dụng VIP</label>
                          <textarea
                            value={toolSecretInstructions}
                            onChange={(e) => setToolSecretInstructions(e.target.value)}
                            placeholder="Các bước thực hiện..."
                            rows={4}
                            className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-sans"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Khung Prompt Mẫu Ẩn (Sẽ kích hoạt tính năng sao chép nhanh)</label>
                        <textarea
                          value={toolSecretPrompt}
                          onChange={(e) => setToolSecretPrompt(e.target.value)}
                          placeholder="Hãy đóng vai là chuyên gia dinh dưỡng..."
                          rows={7}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono leading-relaxed"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* FAQ & CHANGELOG DYNAMIC MANAGERS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    {/* FAQ Manager */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                          <HelpCircle className="h-4 w-4" />
                          <span>5. FAQ Manager</span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddFaqRow}
                          className="text-[10px] font-bold text-purple-400 hover:underline"
                        >
                          + Thêm dòng
                        </button>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {toolFaqs.map((faq, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#030712] border border-white/5 space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveFaqRow(idx)}
                              className="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-xs"
                            >
                              ✕
                            </button>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleFaqRowChange(idx, 'question', e.target.value)}
                              placeholder="Câu hỏi..."
                              className="w-[90%] rounded-lg bg-[#111827] border border-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                            <textarea
                              value={faq.answer}
                              onChange={(e) => handleFaqRowChange(idx, 'answer', e.target.value)}
                              placeholder="Câu trả lời..."
                              rows={2}
                              className="w-full rounded-lg bg-[#111827] border border-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Changelog Manager */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>6. Changelog Manager</span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddChangelogRow}
                          className="text-[10px] font-bold text-purple-400 hover:underline"
                        >
                          + Thêm dòng
                        </button>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {toolChangelogs.map((cl, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#030712] border border-white/5 space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveChangelogRow(idx)}
                              className="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-xs"
                            >
                              ✕
                            </button>
                            <input
                              type="text"
                              value={cl.version}
                              onChange={(e) => handleChangelogRowChange(idx, 'version', e.target.value)}
                              placeholder="Version (ví dụ v1.1)..."
                              className="w-[90%] rounded-lg bg-[#111827] border border-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                            />
                            <textarea
                              value={cl.content}
                              onChange={(e) => handleChangelogRowChange(idx, 'content', e.target.value)}
                              placeholder="Nội dung cập nhật..."
                              rows={2}
                              className="w-full rounded-lg bg-[#111827] border border-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Action buttons */}
                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowToolForm(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      Lưu thông tin trợ lý
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMENU 4: CRUD CATEGORIES */}
          {/* ========================================================= */}
          {activeMenu === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              {!showCategoryForm ? (
                /* CATEGORIES LIST VIEW */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Tổng cộng {categories.length} danh mục chính</span>
                    <button
                      onClick={handleAddNewCategoryClick}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm danh mục mới</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827] shadow-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0B0F19]/45 border-b border-white/5 text-gray-500 font-semibold uppercase font-mono">
                          <th className="p-4">Icon đại diện</th>
                          <th className="p-4">Tên danh mục</th>
                          <th className="p-4">Slug URL</th>
                          <th className="p-4">Mã màu nhận diện</th>
                          <th className="p-4 text-center">Thứ tự hiển thị</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {categories.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div 
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5"
                                style={{ backgroundColor: `${c.color}15`, borderColor: `${c.color}20` }}
                              >
                                <LucideIcon name={c.icon} color={c.color} size={18} />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-white text-sm">{c.name}</td>
                            <td className="p-4 font-mono text-gray-400">{c.slug}</td>
                            <td className="p-4 font-mono font-bold" style={{ color: c.color }}>{c.color}</td>
                            <td className="p-4 text-center font-bold text-white">{c.order}</td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditCategoryClick(c)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 border border-white/5 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(c.id)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ADD/EDIT CATEGORY FORM */
                <form onSubmit={handleSaveCategory} className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-6 shadow-xl max-w-lg animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h3 className="font-display text-base font-bold text-white">
                      {editingCategory ? `Chỉnh sửa danh mục: ${editingCategory.name}` : 'Thêm mới danh mục'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-1">Tên danh mục chính</label>
                      <input
                        type="text"
                        value={catName}
                        onChange={(e) => {
                          setCatName(e.target.value);
                          setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                        }}
                        placeholder="Ví dụ: AI Sức Khỏe Làn Da..."
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-1">Slug URL</label>
                      <input
                        type="text"
                        value={catSlug}
                        onChange={(e) => setCatSlug(e.target.value)}
                        placeholder="ai-suc-khoe-lan-da"
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Tên Lucide Icon đại diện</label>
                        <select
                          value={catIcon}
                          onChange={(e) => setCatIcon(e.target.value)}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        >
                          <option value="Utensils">Utensils (Dinh dưỡng)</option>
                          <option value="Dumbbell">Dumbbell (Thể thao)</option>
                          <option value="Sparkles">Sparkles (Tâm linh/AI)</option>
                          <option value="Heart">Heart (Yêu thương/Lối sống)</option>
                          <option value="Activity">Activity (Y tế)</option>
                          <option value="Brain">Brain (Trí óc)</option>
                          <option value="Flower">Flower (Thiền/Chữa lành)</option>
                          <option value="Apple">Apple (Ăn kiêng)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Thứ tự hiển thị (Order)</label>
                        <input
                          type="number"
                          value={catOrder}
                          onChange={(e) => setCatOrder(Number(e.target.value))}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-1">Mã màu nhận diện HEX (đại diện cho bối cảnh UI)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={catColor}
                          onChange={(e) => setCatColor(e.target.value)}
                          className="h-10 w-12 rounded-lg bg-[#030712] border border-white/10 p-1 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={catColor}
                          onChange={(e) => setCatColor(e.target.value)}
                          className="flex-1 rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      Lưu thông tin danh mục
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMENU 5: CRUD COUPON */}
          {/* ========================================================= */}
          {activeMenu === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              {!showCouponForm ? (
                /* COUPONS LIST VIEW */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Mã giảm giá áp dụng giỏ hàng ({coupons.length})</span>
                    <button
                      onClick={handleAddNewCouponClick}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm mã Coupon mới</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827] shadow-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0B0F19]/45 border-b border-white/5 text-gray-500 font-semibold uppercase font-mono">
                          <th className="p-4">Mã Coupon Code</th>
                          <th className="p-4">Loại hình giảm</th>
                          <th className="p-4 text-right">Giá trị giảm</th>
                          <th className="p-4 text-center">Giới hạn sử dụng</th>
                          <th className="p-4">Ngày hết hạn</th>
                          <th className="p-4 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono font-bold text-white text-sm tracking-wider uppercase">{c.code}</td>
                            <td className="p-4">
                              {c.type === 'percent' ? (
                                <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">Theo phần trăm (%)</span>
                              ) : (
                                <span className="px-2 py-1 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">Số tiền cố định (VND)</span>
                              )}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-white">
                              {c.type === 'percent' ? `${c.value}%` : formatCurrency(c.value)}
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-gray-300 font-mono">{c.usedCount} / {c.maxUses}</span>
                            </td>
                            <td className="p-4 font-mono text-gray-400">
                              {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteCoupon(c.id)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ADD NEW COUPON FORM */
                <form onSubmit={handleSaveCoupon} className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-6 shadow-xl max-w-lg animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h3 className="font-display text-base font-bold text-white">
                      Thêm mã giảm giá mới
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-medium mb-1">Mã Coupon (Ví dụ: GIAM30)</label>
                      <input
                        type="text"
                        value={couponCodeField}
                        onChange={(e) => setCouponCodeField(e.target.value)}
                        placeholder="GIAM30"
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 uppercase font-mono tracking-wider"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Loại giảm giá</label>
                        <select
                          value={couponTypeField}
                          onChange={(e) => setCouponTypeField(e.target.value as 'percent' | 'fixed')}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        >
                          <option value="percent">Giảm theo %</option>
                          <option value="fixed">Giảm số tiền cố định (VND)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Giá trị giảm</label>
                        <input
                          type="number"
                          value={couponValueField}
                          onChange={(e) => setCouponValueField(Number(e.target.value))}
                          placeholder={couponTypeField === 'percent' ? '10' : '50000'}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Số lượt dùng tối đa</label>
                        <input
                          type="number"
                          value={couponMaxUsesField}
                          onChange={(e) => setCouponMaxUsesField(Number(e.target.value))}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Ngày hết hạn đơn</label>
                        <input
                          type="date"
                          value={couponExpiryField}
                          onChange={(e) => setCouponExpiryField(e.target.value)}
                          className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCouponForm(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                      Lưu Coupon
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMENU 6: GLOBAL CONFIG/SETTINGS */}
          {/* ========================================================= */}
          {activeMenu === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Website Info (Box Left) */}
                <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-4 shadow-xl">
                  <h3 className="font-display text-sm font-bold text-white border-b border-white/5 pb-2">Website Settings</h3>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tên Website</label>
                    <input
                      type="text"
                      value={settingsWebsiteName}
                      onChange={(e) => setSettingsWebsiteName(e.target.value)}
                      className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={settingsLogoUrl}
                      onChange={(e) => setSettingsLogoUrl(e.target.value)}
                      className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Favicon URL</label>
                    <input
                      type="text"
                      value={settingsFaviconUrl}
                      onChange={(e) => setSettingsFaviconUrl(e.target.value)}
                      className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Hotline Liên hệ</label>
                    <input
                      type="text"
                      value={settingsHotline}
                      onChange={(e) => setSettingsHotline(e.target.value)}
                      className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs text-gray-400 mb-1 font-bold">Mạng xã hội (Social Links)</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Link Facebook..."
                        value={settingsFacebook}
                        onChange={(e) => setSettingsFacebook(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Link YouTube..."
                        value={settingsYoutube}
                        onChange={(e) => setSettingsYoutube(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Link TikTok..."
                        value={settingsTiktok}
                        onChange={(e) => setSettingsTiktok(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Payment config (Box Right) */}
                <div className="space-y-6">
                  {/* Bank info */}
                  <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-4 shadow-xl">
                    <h3 className="font-display text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <ShoppingCart className="h-4 w-4 text-purple-400" />
                      <span>Cấu Hình Thanh Toán Chuyển Khoản</span>
                    </h3>

                    <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-gray-400 leading-relaxed mb-1">
                      Các sửa đổi về thông tin tài khoản ngân hàng tại đây sẽ được <span className="text-white font-bold">tự động đồng bộ hóa</span> tới trang hiển thị QR Code Checkout của người mua!
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tên ngân hàng (ví dụ: ACB Bank, TPBank)</label>
                      <input
                        type="text"
                        value={settingsBankName}
                        onChange={(e) => setSettingsBankName(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Số tài khoản ngân hàng</label>
                      <input
                        type="text"
                        value={settingsAccountNumber}
                        onChange={(e) => setSettingsAccountNumber(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono tracking-wider font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tên chủ tài khoản thụ hưởng</label>
                      <input
                        type="text"
                        value={settingsAccountHolder}
                        onChange={(e) => setSettingsAccountHolder(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-bold uppercase"
                        required
                      />
                    </div>
                  </div>

                  {/* SEO Setup */}
                  <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-4 shadow-xl">
                    <h3 className="font-display text-sm font-bold text-white border-b border-white/5 pb-2">SEO Global Configurations</h3>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Meta Title mặc định</label>
                      <input
                        type="text"
                        value={settingsSeoTitle}
                        onChange={(e) => setSettingsSeoTitle(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                      <textarea
                        value={settingsSeoDesc}
                        onChange={(e) => setSettingsSeoDesc(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Google Analytics Tracking ID</label>
                      <input
                        type="text"
                        value={settingsSeoGaId}
                        placeholder="G-XXXXXX"
                        onChange={(e) => setSettingsSeoGaId(e.target.value)}
                        className="w-full rounded-lg bg-[#030712] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Saved success banners */}
              {settingsSavedSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Đã đồng bộ hóa và lưu toàn bộ cấu hình hệ thống thành công!</span>
                </div>
              )}

              {/* Submit button settings */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Lưu cấu hình hệ thống
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

    </div>
  );
}
