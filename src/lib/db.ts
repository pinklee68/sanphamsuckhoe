import { User, Tool, Category, Order, Coupon, GlobalSettings } from '../types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// Clean object for Firestore (removes undefined values)
const sanitizeForFirestore = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const notifyDbUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('skch_db_updated'));
  }
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-dinh-duong',
    name: 'AI Dinh Dưỡng',
    slug: 'ai-dinh-duong',
    icon: 'Utensils',
    color: '#10B981', // Emerald
    order: 1
  },
  {
    id: 'cat-luyen-tap',
    name: 'AI Luyện Tập',
    slug: 'ai-luyen-tap',
    icon: 'Dumbbell',
    color: '#3B82F6', // Blue
    order: 2
  },
  {
    id: 'cat-tam-tri',
    name: 'AI Tâm Trí',
    slug: 'ai-tam-tri',
    icon: 'Sparkles',
    color: '#8B5CF6', // Purple
    order: 3
  },
  {
    id: 'cat-phong-cach-song',
    name: 'AI Lối Sống',
    slug: 'ai-phong-cach-song',
    icon: 'Heart',
    color: '#EC4899', // Pink
    order: 4
  }
];

// Default tools with vertical thumbnail 9:16 and horizontal banner
const DEFAULT_TOOLS: Tool[] = [
  {
    id: 'tool-tra-thanh-nhiet-thai-binh',
    name: 'Trà Thanh Nhiệt Thái Bình',
    slug: 'tra-thanh-nhiet-thai-binh',
    thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=450&h=800&fit=crop',
    banner: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Trà túi lọc giải độc, mát gan, làm mát cơ thể, thấu hiểu sức khỏe từ thiên nhiên.',
    longDescription: `### Trà Túi Lọc Giải Độc Thanh Nhiệt Thái Bình
    
Trà túi lọc thảo dược thiên nhiên giúp thanh lọc cơ thể, giải độc gan và mát huyết.

#### Công dụng nổi bật:
- **Thanh nhiệt, giải độc**: Làm mát cơ thể, hỗ trợ đào thải độc tố tích tụ lâu ngày.
- **Bảo vệ tế bào gan**: Hỗ trợ giúp mát gan, hạ men gan và tăng cường chức năng gan.
- **Làm đẹp da**: Giảm mụn nhọt, thâm sạm do nóng trong người, mang lại làn da tươi trẻ.
- **Thư giãn tinh thần**: Mùi thơm dịu nhẹ từ thảo mộc giúp giải tỏa căng thẳng sau giờ làm việc.`,
    priceOriginal: 100000,
    priceSale: 77000,
    rating: 5,
    reviewCount: 42,
    purchaseCount: 156,
    copyCount: 380,
    categoryId: 'cat-phong-cach-song',
    tags: ['Trà thảo dược', 'Thanh nhiệt', 'Giải độc gan', 'Trà túi lọc'],
    isHot: true,
    isNew: false,
    isFree: false,
    version: 'v1.0',
    lastUpdated: '2026-07-20T08:00:00Z',
    changelog: [
      { version: 'v1.0', date: '2026-07-20T08:00:00Z', content: 'Phát hành chính thức Trà Túi Lọc Thanh Nhiệt Thái Bình.' }
    ],
    secretData: {
      targetLink: 'https://zalo.me/0396989814',
      prompt: `Cảm ơn bạn đã đặt mua Trà Túi Lọc Giải Độc Thanh Nhiệt Thái Bình. Hướng dẫn pha trà: Pha 1-2 túi lọc với 200ml nước sôi ngâm 3-5 phút.`,
      instructions: `Hotline/Zalo hỗ trợ: 0396989814.`
    },
    faq: [
      { question: 'Uống trà thanh nhiệt hàng ngày có tốt không?', answer: 'Trà được chế biến từ 100% thảo mộc tự nhiên lành tính, có thể uống thay nước lọc hàng ngày rất tốt cho sức khỏe.' }
    ],
    seo: {
      title: 'Trà Thanh Nhiệt Thái Bình',
      description: 'Trà túi lọc giải độc thanh nhiệt Thái Bình mát gan giải độc.',
      keywords: 'tra thanh nhiet, tra thai binh'
    }
  },
  {
    id: 'tool-tra-xuyen-tam-lien',
    name: 'Xuyên Tâm Liên',
    slug: 'xuyen-tam-lien',
    thumbnail: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=450&h=800&fit=crop',
    banner: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Hỗ trợ sức khỏe hệ miễn dịch, thanh nhiệt giải độc, bảo vệ chức năng gan.',
    longDescription: `### Trà Túi Lọc Xuyên Tâm Liên
    
Xuyên tâm liên là vị thuốc dân gian quý giá giúp bảo vệ đường hô hấp và nâng cao hệ miễn dịch tự nhiên của cơ thể.

#### Công dụng nổi bật:
- **Tăng cường đề kháng**: Hỗ trợ cơ thể chống lại các tác nhân gây bệnh hô hấp thông thường.
- **Thanh nhiệt giải độc**: Giúp làm mát cơ thể, giảm các triệu chứng nóng trong, nhiệt miệng.
- **Hỗ trợ chức năng gan**: Tăng cường bảo vệ gan và nâng cao thể trạng tổng thể.`,
    priceOriginal: 90000,
    priceSale: 70000,
    rating: 5,
    reviewCount: 31,
    purchaseCount: 98,
    copyCount: 212,
    categoryId: 'cat-phong-cach-song',
    tags: ['Xuyên tâm liên', 'Đề kháng', 'Bảo vệ hô hấp'],
    isHot: false,
    isNew: true,
    isFree: false,
    version: 'v1.0',
    lastUpdated: '2026-07-20T08:00:00Z',
    changelog: [
      { version: 'v1.0', date: '2026-07-20T08:00:00Z', content: 'Phát hành chính thức Trà Xuyên Tâm Liên.' }
    ],
    secretData: {
      targetLink: 'https://zalo.me/0396989814',
      prompt: `Cảm ơn bạn đã chọn mua Trà Xuyên Tâm Liên.`,
      instructions: `Hotline hỗ trợ: 0396989814.`
    },
    faq: [
      { question: 'Thời điểm nào uống tốt nhất?', answer: 'Nên uống sau bữa ăn 30 phút.' }
    ],
    seo: {
      title: 'Trà Xuyên Tâm Liên',
      description: 'Trà túi lọc Xuyên Tâm Liên.',
      keywords: 'xuyen tam lien'
    }
  },
  {
    id: 'tool-tra-day-thia-canh-linh-chi',
    name: 'Trà Dây Thìa Canh Linh Chi',
    slug: 'tra-day-thia-canh-linh-chi',
    thumbnail: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=450&h=800&fit=crop',
    banner: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Hỗ trợ ổn định đường huyết, hạ mỡ máu, cải thiện tuần hoàn và giảm nguy cơ biến chứng.',
    longDescription: `### Trà Dây Thìa Canh Linh Chi
    
Sự kết hợp hoàn hảo giữa Dây Thìa Canh và Nấm Linh Chi cao cấp giúp hỗ trợ sức khỏe đường huyết.`,
    priceOriginal: 110000,
    priceSale: 80000,
    rating: 5,
    reviewCount: 68,
    purchaseCount: 350,
    copyCount: 789,
    categoryId: 'cat-phong-cach-song',
    tags: ['Dây thìa canh', 'Linh chi', 'Đường huyết'],
    isHot: true,
    isNew: false,
    isFree: false,
    version: 'v1.0',
    lastUpdated: '2026-07-20T08:00:00Z',
    changelog: [
      { version: 'v1.0', date: '2026-07-20T08:00:00Z', content: 'Phát hành chính thức Trà Dây Thìa Canh Linh Chi.' }
    ],
    secretData: {
      targetLink: 'https://zalo.me/0396989814',
      prompt: `Cảm ơn bạn đã chọn Trà Dây Thìa Canh Linh Chi.`,
      instructions: `Hotline hỗ trợ: 0396989814.`
    },
    faq: [
      { question: 'Uống bao nhiêu túi một ngày?', answer: 'Dùng 1-2 túi hãm nước ấm dùng thay nước lọc hàng ngày.' }
    ],
    seo: {
      title: 'Trà Dây Thìa Canh Linh Chi',
      description: 'Trà Dây Thìa Canh Linh Chi.',
      keywords: 'day thia canh, linh chi'
    }
  },
  {
    id: 'tool-tra-tia-to',
    name: 'Trà Tía Tô',
    slug: 'tra-tia-to',
    thumbnail: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=450&h=800&fit=crop',
    banner: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Thanh nhiệt, giải độc, hỗ trợ tiêu hóa, dưỡng da tươi trẻ và hỗ trợ người gặp vấn đề đường huyết & gút.',
    longDescription: `### Trà Tía Tô Thảo Dược
    
Tía tô là thảo mộc tự nhiên hỗ trợ giải cảm, tiêu hóa tốt và làm đẹp da.`,
    priceOriginal: 100000,
    priceSale: 80000,
    rating: 5,
    reviewCount: 25,
    purchaseCount: 0,
    copyCount: 190,
    categoryId: 'cat-phong-cach-song',
    tags: ['Tía tô', 'Tiêu hóa', 'Dưỡng da'],
    isHot: false,
    isNew: true,
    isFree: false,
    version: 'v1.0',
    lastUpdated: '2026-07-20T08:00:00Z',
    changelog: [
      { version: 'v1.0', date: '2026-07-20T08:00:00Z', content: 'Phát hành chính thức Trà Tía Tô.' }
    ],
    secretData: {
      targetLink: 'https://zalo.me/0396989814',
      prompt: `Cảm ơn bạn đã mua Trà Tía Tô.`,
      instructions: `Hotline hỗ trợ: 0396989814.`
    },
    faq: [
      { question: 'Trà tía tô dùng có dịu dạ dày không?', answer: 'Rất dịu nhẹ và tốt cho tiêu hóa.' }
    ],
    seo: {
      title: 'Trà Tía Tô',
      description: 'Trà Tía Tô Thảo Dược.',
      keywords: 'tra tia to'
    }
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'AI2026',
    type: 'percent',
    value: 20, // 20% off
    maxUses: 100,
    usedCount: 15,
    expiryDate: '2026-12-31T23:59:59Z'
  },
  {
    id: 'coupon-2',
    code: 'HONGKHOE',
    type: 'fixed',
    value: 50000, // 50,000 VND off
    maxUses: 200,
    usedCount: 34,
    expiryDate: '2026-12-31T23:59:59Z'
  }
];

const DEFAULT_SETTINGS: GlobalSettings = {
  websiteName: 'Sống Khoẻ Cùng Hồng',
  logoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&h=150&fit=crop', // Yoga floral logo look
  faviconUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=32&h=32&fit=crop',
  hotline: '0396989814',
  socialLinks: {
    facebook: 'https://facebook.com/songkhoe.lunghong',
    youtube: 'https://youtube.com/c/songkhoecunghong',
    tiktok: 'https://tiktok.com/@songkhoecunghong'
  },
  paymentInfo: {
    accountHolder: 'Lê Thị Hồng',
    bankName: 'ACB Bank',
    accountNumber: '38408687'
  },
  seoGlobal: {
    metaTitle: 'Sống Khoẻ Cùng Hồng - Nền tảng Trợ Lý Sức Khỏe AI Toàn Diện',
    metaDescription: 'Khám phá và sở hữu hệ sinh thái công cụ trí tuệ nhân tạo chuyên sâu về dinh dưỡng, huấn luyện viên thể thao cá nhân và chánh niệm.',
    googleAnalyticsId: 'G-HKCH9999'
  }
};

// Initial state helpers
const getStored = <T>(key: string, def: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return def;
  try {
    return JSON.parse(data);
  } catch (e) {
    return def;
  }
};

const setStored = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Simulated State Managers + Firestore Persistence
export class DatabaseService {
  private static isSyncInitialized = false;

  public static initRealtimeSync(): void {
    if (this.isSyncInitialized) return;
    this.isSyncInitialized = true;

    try {
      // 1. Sync Tools
      onSnapshot(collection(db, 'tools'), async (snapshot) => {
        if (snapshot.empty) {
          // Seed defaults to Firestore if empty
          for (const t of DEFAULT_TOOLS) {
            await setDoc(doc(db, 'tools', t.id), sanitizeForFirestore(t));
          }
        } else {
          const tools = snapshot.docs.map(doc => doc.data() as Tool);
          setStored('skch_tools', tools);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore tools sync error:', err));

      // 2. Sync Categories
      onSnapshot(collection(db, 'categories'), async (snapshot) => {
        if (snapshot.empty) {
          for (const c of DEFAULT_CATEGORIES) {
            await setDoc(doc(db, 'categories', c.id), sanitizeForFirestore(c));
          }
        } else {
          const categories = snapshot.docs.map(doc => doc.data() as Category);
          setStored('skch_categories', categories);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore categories sync error:', err));

      // 3. Sync Orders
      onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const orders = snapshot.docs.map(doc => doc.data() as Order);
          setStored('skch_orders', orders);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore orders sync error:', err));

      // 4. Sync Coupons
      onSnapshot(collection(db, 'coupons'), async (snapshot) => {
        if (snapshot.empty) {
          for (const cp of DEFAULT_COUPONS) {
            await setDoc(doc(db, 'coupons', cp.id), sanitizeForFirestore(cp));
          }
        } else {
          const coupons = snapshot.docs.map(doc => doc.data() as Coupon);
          setStored('skch_coupons', coupons);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore coupons sync error:', err));

      // 5. Sync Users
      onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const users = snapshot.docs.map(doc => doc.data() as User);
          setStored('skch_users', users);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore users sync error:', err));

      // 6. Sync Settings
      onSnapshot(doc(db, 'settings', 'global'), async (snapshotDoc) => {
        if (!snapshotDoc.exists()) {
          await setDoc(doc(db, 'settings', 'global'), sanitizeForFirestore(DEFAULT_SETTINGS));
        } else {
          const settingsData = snapshotDoc.data() as GlobalSettings;
          setStored('skch_settings', settingsData);
          notifyDbUpdated();
        }
      }, (err) => console.error('Firestore settings sync error:', err));

    } catch (e) {
      console.error('Failed to initialize Firestore realtime sync:', e);
    }
  }

  private static getCategories(): Category[] {
    const cats = getStored<Category[]>('skch_categories', []);
    if (cats.length === 0) {
      setStored('skch_categories', DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return cats;
  }

  private static getTools(): Tool[] {
    const tools = getStored<Tool[]>('skch_tools', []);
    if (tools.length === 0) {
      setStored('skch_tools', DEFAULT_TOOLS);
      return DEFAULT_TOOLS;
    }
    return tools;
  }

  private static getOrders(): Order[] {
    return getStored<Order[]>('skch_orders', []);
  }

  private static getCoupons(): Coupon[] {
    const coupons = getStored<Coupon[]>('skch_coupons', []);
    if (coupons.length === 0) {
      setStored('skch_coupons', DEFAULT_COUPONS);
      return DEFAULT_COUPONS;
    }
    return coupons;
  }

  private static getUsers(): User[] {
    return getStored<User[]>('skch_users', []);
  }

  public static getSettings(): GlobalSettings {
    const settings = getStored<GlobalSettings>('skch_settings', DEFAULT_SETTINGS);
    if (settings && (settings.hotline === '038.408.6877' || settings.hotline === '0384086877')) {
      settings.hotline = '0396989814';
      setStored('skch_settings', settings);
    }
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  public static updateSettings(settings: GlobalSettings): void {
    setStored('skch_settings', settings);
    setDoc(doc(db, 'settings', 'global'), sanitizeForFirestore(settings)).catch(err => console.error('Firestore updateSettings error:', err));
  }

  // Categories CRUD
  public static listCategories(): Category[] {
    return this.getCategories().sort((a, b) => a.order - b.order);
  }

  public static saveCategory(cat: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    setStored('skch_categories', list);
    setDoc(doc(db, 'categories', cat.id), sanitizeForFirestore(cat)).catch(err => console.error('Firestore saveCategory error:', err));
  }

  public static deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    setStored('skch_categories', list);
    deleteDoc(doc(db, 'categories', id)).catch(err => console.error('Firestore deleteCategory error:', err));
  }

  // Tools CRUD
  public static listTools(): Tool[] {
    return this.getTools();
  }

  public static getTool(id: string): Tool | undefined {
    return this.getTools().find(t => t.id === id);
  }

  public static saveTool(tool: Tool): void {
    const list = this.getTools();
    const idx = list.findIndex(t => t.id === tool.id);
    const updatedTool = { ...tool, lastUpdated: new Date().toISOString() };
    if (idx >= 0) {
      list[idx] = updatedTool;
    } else {
      list.push(updatedTool);
    }
    setStored('skch_tools', list);
    setDoc(doc(db, 'tools', tool.id), sanitizeForFirestore(updatedTool)).catch(err => console.error('Firestore saveTool error:', err));
  }

  public static deleteTool(id: string): void {
    const list = this.getTools().filter(t => t.id !== id);
    setStored('skch_tools', list);
    deleteDoc(doc(db, 'tools', id)).catch(err => console.error('Firestore deleteTool error:', err));
  }

  // Increment Copy Count
  public static incrementCopyCount(toolId: string): void {
    const list = this.getTools();
    const idx = list.findIndex(t => t.id === toolId);
    if (idx >= 0) {
      list[idx].copyCount += 1;
      const updatedTool = list[idx];
      setStored('skch_tools', list);
      setDoc(doc(db, 'tools', toolId), sanitizeForFirestore(updatedTool)).catch(err => console.error('Firestore incrementCopyCount error:', err));
    }
  }

  // User Actions
  public static getUser(uid: string): User | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  public static saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === user.uid);
    const updatedUser = idx >= 0 
      ? { ...user, updatedAt: new Date().toISOString() }
      : { ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      list[idx] = updatedUser;
    } else {
      list.push(updatedUser);
    }
    setStored('skch_users', list);
    setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(updatedUser)).catch(err => console.error('Firestore saveUser error:', err));
  }

  public static listUsers(): User[] {
    return this.getUsers();
  }

  public static toggleBookmark(uid: string, toolId: string): string[] {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      const user = list[idx];
      let bookmarks = [...(user.bookmarks || [])];
      if (bookmarks.includes(toolId)) {
        bookmarks = bookmarks.filter(id => id !== toolId);
      } else {
        bookmarks.push(toolId);
      }
      user.bookmarks = bookmarks;
      list[idx] = user;
      setStored('skch_users', list);
      return bookmarks;
    }
    return [];
  }

  // Orders Management
  public static listOrders(): Order[] {
    return this.getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static createOrder(userId: string, userEmail: string, items: { toolId: string, name: string, price: number }[], totalAmount: number, couponCode?: string): Order {
    const orders = this.getOrders();
    // Count orders to generate unique KHXXXX code
    const orderCount = orders.length + 1;
    const padStr = String(orderCount).padStart(4, '0');
    const orderId = `KH${padStr}`;
    
    // Generate simulated payment identifier (Transfer Content)
    const transferContent = `NAP TOOLAI ${orderId}`;

    const newOrder: Order = {
      id: orderId,
      userId,
      userEmail,
      items,
      totalAmount,
      couponUsed: couponCode,
      status: 'pending',
      paymentMethod: 'transfer',
      transferContent,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null
    };

    orders.push(newOrder);
    setStored('skch_orders', orders);
    setDoc(doc(db, 'orders', newOrder.id), sanitizeForFirestore(newOrder)).catch(err => console.error('Firestore createOrder error:', err));

    // If a coupon was used, increment its count
    if (couponCode) {
      const coupons = this.getCoupons();
      const cIdx = coupons.findIndex(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (cIdx >= 0) {
        coupons[cIdx].usedCount += 1;
        setStored('skch_coupons', coupons);
        setDoc(doc(db, 'coupons', coupons[cIdx].id), sanitizeForFirestore(coupons[cIdx])).catch(err => console.error('Firestore updateCoupon error:', err));
      }
    }

    return newOrder;
  }

  public static updateOrderStatus(orderId: string, status: 'paid' | 'cancelled', adminUid: string): Order | undefined {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      const order = orders[idx];
      order.status = status;
      order.approvedAt = status === 'paid' ? new Date().toISOString() : null;
      order.approvedBy = status === 'paid' ? adminUid : null;
      orders[idx] = order;
      setStored('skch_orders', orders);
      setDoc(doc(db, 'orders', order.id), sanitizeForFirestore(order)).catch(err => console.error('Firestore updateOrderStatus error:', err));

      // If approved, increment purchaseCount for each tool in the order
      if (status === 'paid') {
        const tools = this.getTools();
        order.items.forEach(item => {
          const tIdx = tools.findIndex(t => t.id === item.toolId);
          if (tIdx >= 0) {
            tools[tIdx].purchaseCount += 1;
            setDoc(doc(db, 'tools', tools[tIdx].id), sanitizeForFirestore(tools[tIdx])).catch(err => console.error('Firestore updateToolPurchase error:', err));
          }
        });
        setStored('skch_tools', tools);
      }

      return order;
    }
    return undefined;
  }

  // Coupon Operations
  public static listCoupons(): Coupon[] {
    return this.getCoupons();
  }

  public static getCouponByCode(code: string): Coupon | undefined {
    return this.getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase());
  }

  public static saveCoupon(coupon: Coupon): void {
    const list = this.getCoupons();
    const idx = list.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    setStored('skch_coupons', list);
    setDoc(doc(db, 'coupons', coupon.id), sanitizeForFirestore(coupon)).catch(err => console.error('Firestore saveCoupon error:', err));
  }

  public static deleteCoupon(id: string): void {
    const list = this.getCoupons().filter(c => c.id !== id);
    setStored('skch_coupons', list);
    deleteDoc(doc(db, 'coupons', id)).catch(err => console.error('Firestore deleteCoupon error:', err));
  }

  // Determine if a user owns a tool
  public static hasUserPurchased(userId: string, toolId: string): boolean {
    const tool = this.getTool(toolId);
    if (tool?.isFree) return true;

    const orders = this.getOrders();
    return orders.some(o => 
      o.userId === userId && 
      o.status === 'paid' && 
      o.items.some(item => item.toolId === toolId)
    );
  }
}

// Authentication Service Simulation
export class AuthService {
  public static getCurrentUser(): User | null {
    return getStored<User | null>('skch_current_user', null);
  }

  public static loginWithEmail(email: string): User {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Automatically detect lthongxanh@gmail.com as ADMIN as per standard setup
    const role = normalizedEmail === 'lthongxanh@gmail.com' ? 'admin' : 'user';
    const displayName = normalizedEmail.split('@')[0];
    
    // Create or retrieve user document
    const uid = 'uid_' + btoa(normalizedEmail).replace(/=/g, '');
    let user = DatabaseService.getUser(uid);

    if (!user) {
      user = {
        uid,
        email: normalizedEmail,
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookmarks: []
      };
      DatabaseService.saveUser(user);
    } else {
      // Force role 'admin' for lthongxanh@gmail.com even if previously saved as user
      if (normalizedEmail === 'lthongxanh@gmail.com' && user.role !== 'admin') {
        user.role = 'admin';
        DatabaseService.saveUser(user);
      }
    }

    setStored('skch_current_user', user);
    return user;
  }

  public static loginWithGoogle(userEmail?: string): User {
    let email = userEmail?.trim().toLowerCase();
    
    if (!email) {
      throw new Error('Vui lòng nhập địa chỉ Email Google của bạn!');
    }

    const normalizedEmail = email;
    const displayNameRaw = normalizedEmail.split('@')[0];
    const displayName = displayNameRaw.charAt(0).toUpperCase() + displayNameRaw.slice(1);
    
    // Automatically detect lthongxanh@gmail.com as ADMIN
    const role = normalizedEmail === 'lthongxanh@gmail.com' ? 'admin' : 'user';
    const uid = 'uid_gg_' + btoa(normalizedEmail).replace(/=/g, '');

    let user = DatabaseService.getUser(uid);

    if (!user) {
      user = {
        uid,
        email: normalizedEmail,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookmarks: []
      };
      DatabaseService.saveUser(user);
    } else {
      if (normalizedEmail === 'lthongxanh@gmail.com' && user.role !== 'admin') {
        user.role = 'admin';
        DatabaseService.saveUser(user);
      }
    }

    setStored('skch_current_user', user);
    return user;
  }

  public static logout(): void {
    localStorage.removeItem('skch_current_user');
  }

  public static simulateSwitchRole(role: 'user' | 'admin'): User | null {
    const user = this.getCurrentUser();
    if (user) {
      user.role = role;
      DatabaseService.saveUser(user);
      setStored('skch_current_user', user);
      return user;
    }
    return null;
  }
}
