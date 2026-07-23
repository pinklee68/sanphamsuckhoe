import { User, Tool, Category, Order, Coupon, GlobalSettings } from '../types';

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
    id: 'tool-thuc-don-7-ngay',
    name: 'AI Thực Đơn Cá Nhân Hóa 7 Ngày',
    slug: 'ai-thuc-don-7-ngay',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=450&h=800&fit=crop', // Vertical meal-prep
    banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Lên kế hoạch thực đơn ăn uống khoa học, tính toán chi tiết Calo và Macro dành riêng cho thể trạng và mục tiêu của bạn.',
    longDescription: `### Đột phá công nghệ dinh dưỡng cùng AI

Công cụ AI chuyên sâu được tối ưu bởi đội ngũ chuyên gia dinh dưỡng **Sống Khoẻ Cùng Hồng**. Hệ thống sử dụng mô hình ngôn ngữ lớn tiên tiến nhất để phân tích chi tiết các chỉ số thể trạng và mục tiêu sức khỏe của bạn.

#### Các tính năng chính:
- **Cá nhân hóa tuyệt đối**: Phân tích chiều cao, cân nặng, tỷ lệ mỡ, cường độ vận động và các hạn chế bệnh lý (nếu có).
- **Tính toán Macro chuẩn xác**: Tự động chia tỷ lệ tinh bột (Carbs), đạm (Protein) và chất béo (Fats) tối ưu nhất cho mục tiêu của bạn.
- **Danh sách đi chợ tiện lợi**: Tự động tổng hợp và quy đổi trọng lượng thực phẩm cần mua cho cả tuần.
- **Linh hoạt thay đổi món ăn**: Cho phép đổi món tương đương nếu không thích hoặc dị ứng.

#### Cách sử dụng vô cùng đơn giản:
1. Nhấp vào **Mở Tool** sau khi sở hữu thành công.
2. Sao chép mẫu prompt được cung cấp sẵn ở tab VIP.
3. Thay thế các thông số cá nhân của bạn (tuổi, cân nặng, mục tiêu tăng cơ/giảm mỡ).
4. Gửi cho AI và nhận thực đơn hoàn hảo ngay lập tức.`,
    priceOriginal: 299000,
    priceSale: 149000,
    rating: 5,
    reviewCount: 42,
    purchaseCount: 156,
    copyCount: 380,
    categoryId: 'cat-dinh-duong',
    tags: ['Dinh dưỡng', 'Giảm cân', 'Thực đơn'],
    isHot: true,
    isNew: false,
    isFree: false,
    version: 'v1.2',
    lastUpdated: '2026-07-15T08:00:00Z',
    changelog: [
      { version: 'v1.2', date: '2026-07-15T08:00:00Z', content: 'Tối ưu thuật toán tính toán lượng xơ cho thực đơn Keto và Eat Clean.' },
      { version: 'v1.1', date: '2026-06-20T08:00:00Z', content: 'Thêm tính năng tự động xuất danh sách mua sắm nguyên liệu thông minh.' },
      { version: 'v1.0', date: '2026-05-01T08:00:00Z', content: 'Phát hành phiên bản đầu tiên của Trợ lý Thực đơn Dinh dưỡng AI.' }
    ],
    secretData: {
      targetLink: 'https://chatgpt.com/g/g-674cb3ba663c8191a3c6b245-chuyen-gia-dinh-duong-ca-nhan-hoa',
      prompt: `Chào bạn, bạn là một chuyên gia dinh dưỡng đẳng cấp quốc tế. Tôi muốn thiết kế thực đơn ăn uống lành mạnh trong vòng 7 ngày. Sau đây là thông tin cá nhân của tôi:
- Tuổi: [Nhập tuổi của bạn]
- Chiều cao: [Nhập chiều cao cm]
- Cân nặng: [Nhập cân nặng kg]
- Mục tiêu: [Ví dụ: Giảm mỡ thừa / Tăng cơ nách / Ăn uống healthy trị mụn]
- Sở thích / Kiêng kị: [Ví dụ: Ăn được hải sản, không ăn hành tây, hạn chế đồ cay]
- Ngân sách / Phong cách: [Ví dụ: Bình dân, món ăn Việt Nam truyền thống dễ làm]

Hãy xây dựng cho tôi bảng thực đơn 7 ngày chi tiết từng bữa sáng, trưa, tối và bữa phụ, đồng thời cung cấp danh sách nguyên liệu tổng hợp cần chuẩn bị.`,
      instructions: `Bước 1: Bấm nút "Mở Tool" ở phía trên để chuyển tới GPTs chuyên biệt.
Bước 2: Sao chép đoạn Prompt mẫu ở khung phía dưới.
Bước 3: Thay thế các thông tin trong ngoặc vuông [] bằng chỉ số thực tế của bạn.
Bước 4: Gửi cho trợ lý AI và làm theo hướng dẫn nấu ăn chi tiết!`
    },
    faq: [
      { question: 'Thực đơn AI có khó làm và tốn kém không?', answer: 'Hoàn toàn không. Trợ lý AI được huấn luyện để ưu tiên các món ăn Việt Nam gần gũi, nguyên liệu phổ thông dễ mua tại chợ hoặc siêu thị với mức ngân sách bình dân.' },
      { question: 'Tôi có bị giới hạn số lần tạo thực đơn không?', answer: 'Bạn sở hữu vĩnh viễn và có thể tạo lại thực đơn vô hạn số lần bất cứ khi nào cân nặng hoặc mục tiêu của bạn thay đổi.' }
    ],
    seo: {
      title: 'AI Thực Đơn Cá Nhân Hóa 7 Ngày - Sống Khoẻ Cùng Hồng',
      description: 'Lên thực đơn ăn uống khoa học cá nhân hóa với trợ lý AI chuyên nghiệp. Tự động chia calo macro chuẩn gym.',
      keywords: 'thực đơn ai, thực đơn giảm cân, dinh dưỡng 7 ngày, tính calo, eat clean'
    }
  },
  {
    id: 'tool-hlv-ca-nhan',
    name: 'AI Huấn Luyện Viên Thể Hình Tại Nhà',
    slug: 'ai-hlv-ca-nhan',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=450&h=800&fit=crop', // Vertical gym/fitness
    banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Thiết kế giáo án tập luyện tại nhà cá nhân hóa không cần dụng cụ, tối ưu hóa theo thể lực và nhóm cơ mong muốn.',
    longDescription: `### Tập luyện chuẩn khoa học ngay tại nhà cùng AI Coach

Không cần tốn hàng triệu đồng mua thẻ tập gym hay thuê PT đắt đỏ. Trợ lý **AI Huấn Luyện Viên Cá Nhân** sẽ đồng hành và xây dựng riêng cho bạn một lịch trình rèn luyện thể lực tối ưu nhất ngay tại phòng khách của bạn.

#### Điểm vượt trội của công cụ:
- **Tập trung nhóm cơ mục tiêu**: Lựa chọn tập toàn thân, bụng sáu múi, mông đùi săn chắc hoặc cải thiện tư thế vai gáy.
- **Không cần dụng cụ phức tạp**: 95% bài tập là Bodyweight (sử dụng chính trọng lượng cơ thể), dễ dàng thực hiện ở bất kỳ đâu.
- **Điều chỉnh theo cấp độ**: Từ người mới bắt đầu (Beginner) chưa từng vận động đến người đã tập luyện lâu năm.
- **Thời gian linh hoạt**: Giáo án tự động điều chỉnh độ dài buổi tập từ 15 phút, 30 phút đến 45 phút phù hợp lịch trình của bạn.`,
    priceOriginal: 399000,
    priceSale: 199000,
    rating: 5,
    reviewCount: 31,
    purchaseCount: 98,
    copyCount: 212,
    categoryId: 'cat-luyen-tap',
    tags: ['Thể hình', 'Tập tại nhà', 'Workout', 'Fitness'],
    isHot: false,
    isNew: true,
    isFree: false,
    version: 'v1.3',
    lastUpdated: '2026-07-10T09:00:00Z',
    changelog: [
      { version: 'v1.3', date: '2026-07-10T09:00:00Z', content: 'Tích hợp thêm giáo án giãn cơ sâu phục hồi cơ bắp giảm nhức mỏi xương khớp.' },
      { version: 'v1.2', date: '2026-05-18T09:00:00Z', content: 'Nâng cấp khả năng đề xuất bài tập thay thế tránh đau khớp gối cho người béo phì.' }
    ],
    secretData: {
      targetLink: 'https://chatgpt.com/g/g-fitness-coach-simulation',
      prompt: `Hãy đóng vai là một Huấn luyện viên thể hình chuyên nghiệp (PT). Thiết kế cho tôi một giáo trình tập luyện 4 tuần tại nhà với các tiêu chí sau:
- Giới tính: [Nam/Nữ]
- Cấp độ thể lực: [Yếu / Trung bình / Khá tốt]
- Nhóm cơ muốn ưu tiên cải thiện: [Ví dụ: Cơ bụng, mông đùi, giảm mỡ bắp tay]
- Thời gian tập luyện mỗi ngày có thể dành ra: [Ví dụ: 30 phút buổi chiều tối]
- Vấn đề sức khỏe cần lưu ý: [Ví dụ: Đau nhẹ thắt lưng, hay mỏi vai gáy]

Hãy xuất ra lịch tập 4 tuần cụ thể, số reps, số sets cho từng bài tập kèm mô tả động tác trực quan.`,
      instructions: `Bước 1: Bấm nút "Mở Tool" để chuyển hướng sang GPT chuyên gia.
Bước 2: Copy mẫu prompt bên dưới, sửa đổi giới tính, thể lực và mục tiêu của bạn.
Bước 3: Nhận lịch tập 4 tuần và bắt đầu thay đổi vóc dáng ngay hôm nay!`
    },
    faq: [
      { question: 'Tôi bị đau khớp gối có tập được không?', answer: 'Được chứ! Khi nhập thông tin vào prompt, bạn chỉ cần điền phần lưu ý về sức khỏe là "Đau khớp gối", AI sẽ tự động loại bỏ các bài gây áp lực lên gối như Squat nặng, Jump Lunge... và thay bằng bài tập an toàn.' },
      { question: 'Có cần mua tạ hay thảm tập không?', answer: 'Bạn chỉ cần một khoảng không gian trống khoảng 2m vuông và chiếc thảm tập mỏng (nếu có để êm lưng). Toàn bộ giáo án tập trung vào chuyển động tự nhiên.' }
    ],
    seo: {
      title: 'AI PT Huấn Luyện Viên Thể Hình Tại Nhà - Sống Khoẻ Cùng Hồng',
      description: 'Lập giáo trình thể hình, HIIT, Cardio giảm cân tại nhà tự động cùng HLV AI chuyên nghiệp.',
      keywords: 'hlv ai, pt online, tap gym tai nha, workout, cardio giam mo'
    }
  },
  {
    id: 'tool-nhat-ky-chua-lanh',
    name: 'AI Trị Liệu & Viết Nhật Ký Chữa Lành Tâm Hồn',
    slug: 'ai-nhat-ky-chua-lanh',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=450&h=800&fit=crop', // Vertical meditation/mindfulness
    banner: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&h=400&fit=crop',
    videoDemo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shortDescription: 'Lắng nghe không phán xét, thấu hiểu cảm xúc sâu kín và đồng hành cùng bạn viết nhật ký phục hồi năng lượng tinh thần.',
    longDescription: `### Nơi tâm hồn bạn được lắng nghe và vỗ về

Áp lực công việc, mối quan hệ đổ vỡ hay những lo toan cuộc sống khiến bạn kiệt sức? Hãy để **AI Trị Liệu & Viết Nhật Ký Chữa Lành** là người bạn tri kỷ, lắng nghe mọi tâm sự của bạn bất kể ngày đêm, không một lời phán xét hay chỉ trích.

#### Những giá trị tinh thần bạn nhận được:
- **Liệu pháp Viết (Journaling Therapy)**: AI dẫn dắt bạn qua những câu hỏi mở nhẹ nhàng để bạn tự tháo gỡ nút thắt trong lòng.
- **Nhận diện cảm xúc tiêu cực**: Phân tích trạng thái lo âu, stress, trầm cảm nhẹ và đưa ra các bài tập thở, bài thiền ngắn phù hợp.
- **Bảo mật tuyệt đối**: Cuộc trò chuyện của bạn là riêng tư, là nơi bạn thoải mái bộc lộ cái tôi chân thật nhất mà không sợ bị phơi bày.
- **Hoàn toàn miễn phí**: Đồng hành cùng sứ mệnh "Sống Khoẻ Cùng Hồng", công cụ này được thiết kế phi lợi nhuận để lan tỏa năng lượng tích cực đến cộng đồng.`,
    priceOriginal: 199000,
    priceSale: 0,
    rating: 5,
    reviewCount: 68,
    purchaseCount: 350,
    copyCount: 789,
    categoryId: 'cat-tam-tri',
    tags: ['Chữa lành', 'Sức khỏe tinh thần', 'Mindfulness', 'Thiền'],
    isHot: true,
    isNew: false,
    isFree: true,
    version: 'v1.0',
    lastUpdated: '2026-04-01T10:00:00Z',
    changelog: [
      { version: 'v1.0', date: '2026-04-01T10:00:00Z', content: 'Phát hành chính thức công cụ viết nhật ký đồng hành chữa lành tâm trí miễn phí.' }
    ],
    secretData: {
      targetLink: 'https://chatgpt.com/g/g-mindfulness-journal-helper',
      prompt: `Chào bạn, hôm nay tôi muốn viết nhật ký chia sẻ cảm xúc. Hãy đóng vai là một chuyên gia tâm lý trị liệu tinh tế, nhẹ nhàng và ấm áp. Hãy lắng nghe câu chuyện của tôi dưới đây, sau đó phản hồi bằng sự thấu cảm cao nhất, hỏi tôi những câu hỏi gợi mở sâu sắc và đề xuất cho tôi 1 bài tập thở giải tỏa căng thẳng:
  
[Cảm xúc của bạn hôm nay là gì? Chuyện gì vừa xảy ra khiến bạn phiền lòng hoặc vui vẻ?]`,
      instructions: `Bước 1: Bấm nút "Mở Tool" để bắt đầu phiên chia sẻ riêng tư.
Bước 2: Bạn có thể copy mẫu prompt ở dưới để AI bắt đầu định hướng trị liệu chuyên sâu, hoặc chỉ cần tự do nhắn tin kể về ngày hôm nay của bạn.`
    },
    faq: [
      { question: 'Thông tin tâm sự của tôi có bị lộ ra ngoài không?', answer: 'Không. Toàn bộ hội thoại được thực hiện trên tài khoản cá nhân của bạn trên nền tảng AI và tuân thủ chính sách bảo mật dữ liệu tuyệt đối. Không ai ngoài bạn có quyền đọc được.' },
      { question: 'Công cụ có thay thế được bác sĩ tâm lý không?', answer: 'AI hỗ trợ giải tỏa cảm xúc, lắng nghe và đưa ra bài tập thư giãn hỗ trợ đắc lực cho các trạng thái mệt mỏi thông thường. Đối với các bệnh lý trầm cảm nặng hoặc sang chấn tâm lý kéo dài, bạn rất nên tham khảo ý kiến chuyên khoa y tế.' }
    ],
    seo: {
      title: 'AI Viết Nhật Ký Chữa Lành & Trị Liệu Tâm Hồn - Sống Khoẻ Cùng Hồng',
      description: 'Lắng nghe, thấu cảm, hướng dẫn thực hành chánh niệm chánh tư duy giải tỏa trầm cảm, lo âu miễn phí.',
      keywords: 'nhật ký chữa lành, giải tỏa lo âu, thiền định chánh niệm, stress tâm lý, viết trị liệu'
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

// Simulated State Managers
export class DatabaseService {
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
    // Merge defaults to ensure no keys are missing
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  public static updateSettings(settings: GlobalSettings): void {
    setStored('skch_settings', settings);
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
  }

  public static deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    setStored('skch_categories', list);
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
  }

  public static deleteTool(id: string): void {
    const list = this.getTools().filter(t => t.id !== id);
    setStored('skch_tools', list);
  }

  // Increment Copy Count
  public static incrementCopyCount(toolId: string): void {
    const list = this.getTools();
    const idx = list.findIndex(t => t.id === toolId);
    if (idx >= 0) {
      list[idx].copyCount += 1;
      setStored('skch_tools', list);
    }
  }

  // User Actions
  public static getUser(uid: string): User | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  public static saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      list[idx] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStored('skch_users', list);
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

    // If a coupon was used, increment its count
    if (couponCode) {
      const coupons = this.getCoupons();
      const cIdx = coupons.findIndex(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (cIdx >= 0) {
        coupons[cIdx].usedCount += 1;
        setStored('skch_coupons', coupons);
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

      // If approved, increment purchaseCount for each tool in the order
      if (status === 'paid') {
        const tools = this.getTools();
        order.items.forEach(item => {
          const tIdx = tools.findIndex(t => t.id === item.toolId);
          if (tIdx >= 0) {
            tools[tIdx].purchaseCount += 1;
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
  }

  public static deleteCoupon(id: string): void {
    const list = this.getCoupons().filter(c => c.id !== id);
    setStored('skch_coupons', list);
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
