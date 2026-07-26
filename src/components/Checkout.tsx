import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order, GlobalSettings } from '../types';
import { DatabaseService } from '../lib/db';
import { CheckCircle2, Clipboard, ShieldCheck, Clock, ArrowLeft, RefreshCw, Smartphone, Sparkles } from 'lucide-react';

interface CheckoutProps {
  order: Order;
  globalSettings: GlobalSettings;
  onBackToCatalog: () => void;
  onGoToOrderHistory: () => void;
}

export default function Checkout({
  order,
  globalSettings,
  onBackToCatalog,
  onGoToOrderHistory
}: CheckoutProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [successStatus, setSuccessStatus] = useState<'pending' | 'paid' | 'cancelled'>(order.status || 'pending');
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  const { accountHolder, bankName, accountNumber } = globalSettings.paymentInfo;

  // Trigger fireworks confetti animation
  const triggerFireworks = () => {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        zIndex: 10000,
        particleCount,
        origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.5 + 0.1 }
      });
    }, 250);
  };

  const handleQrScannedSuccess = () => {
    DatabaseService.updateOrderStatus(order.id, 'paid', 'system');
    setSuccessStatus('paid');
    setShowThankYouModal(true);
    setHasFiredConfetti(true);
    triggerFireworks();
  };

  // Map common bank names to VietQR slugs
  const getBankSlug = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('acb')) return 'acb';
    if (lower.includes('tp') || lower.includes('tienphong')) return 'tpbank';
    if (lower.includes('vietcom') || lower.includes('vcb')) return 'vietcombank';
    if (lower.includes('techcom') || lower.includes('tcb')) return 'techcombank';
    if (lower.includes('mb') || lower.includes('quan doi')) return 'mbbank';
    if (lower.includes('vietin')) return 'vietinbank';
    if (lower.includes('bidv')) return 'bidv';
    return 'acb'; // Fallback
  };

  const bankSlug = getBankSlug(bankName);
  
  // Format QR Code URL using VietQR API
  const qrCodeUrl = `https://img.vietqr.io/image/${bankSlug}-${accountNumber}-compact2.jpg?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.transferContent)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Simulate passive payment checking
  const handleCheckPayment = () => {
    setCheckingPayment(true);
    setTimeout(() => {
      setCheckingPayment(false);
      // Fetch latest order status from database in case it was approved by Admin
      const freshOrder = DatabaseService.listOrders().find(o => o.id === order.id);
      if (freshOrder) {
        if (freshOrder.status === 'paid' && successStatus !== 'paid') {
          handleQrScannedSuccess();
        } else {
          setSuccessStatus(freshOrder.status);
        }
      }
    }, 1500);
  };

  // Check order status periodically in background
  useEffect(() => {
    const timer = setInterval(() => {
      const freshOrder = DatabaseService.listOrders().find(o => o.id === order.id);
      if (freshOrder && freshOrder.status !== successStatus) {
        setSuccessStatus(freshOrder.status);
        if (freshOrder.status === 'paid' && !hasFiredConfetti) {
          setShowThankYouModal(true);
          setHasFiredConfetti(true);
          triggerFireworks();
        }
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [order.id, successStatus, hasFiredConfetti]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Thank You Modal Popup with Fireworks */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#111827] border-2 border-purple-500/40 p-8 text-center space-y-6 shadow-2xl shadow-purple-950/80 overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Floating Sparkles Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-emerald-400 text-white shadow-xl shadow-purple-500/30 animate-bounce">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            {/* Main requested text */}
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Thanh Toán QR Thành Công 🎉
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white uppercase tracking-tight leading-tight">
                CẢM ƠN BẠN ĐÃ GHÉ THĂM CỬA HÀNG CỦA CHÚNG TÔI
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Đơn hàng <span className="font-mono text-purple-400 font-bold">{order.id}</span> đã được ghi nhận thanh toán thành công!
              </p>
            </div>

            {/* Order details summary */}
            <div className="p-4 bg-[#030712] rounded-2xl border border-white/10 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Mã đơn hàng:</span>
                <span className="text-white font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tổng tiền:</span>
                <span className="text-emerald-400 font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Nội dung chuyển:</span>
                <span className="text-purple-300">{order.transferContent}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowThankYouModal(false);
                  onBackToCatalog();
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                Trở về Cửa Hàng
              </button>
              <button
                onClick={() => {
                  setShowThankYouModal(false);
                  onGoToOrderHistory();
                }}
                className="flex-1 rounded-xl bg-white/10 border border-white/15 py-3 text-sm font-bold text-gray-200 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                Xem Lịch Sử Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {successStatus === 'paid' ? (
        /* SUCCESS SCREEN IF PAID */
        <div className="rounded-2xl bg-[#111827] border border-emerald-500/20 p-8 text-center space-y-6 premium-glow">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-black text-white">Thanh Toán Thành Công!</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Đơn hàng <span className="font-mono text-purple-400 font-bold">{order.id}</span> đã được quản trị viên phê duyệt. Toàn bộ các sản phẩm trong hóa đơn đã được xác nhận.
            </p>
          </div>

          <div className="p-4 bg-[#030712] rounded-xl border border-white/5 inline-block text-left text-xs text-gray-400 space-y-1.5 font-mono">
            <div>Mã đơn hàng: <span className="text-white">{order.id}</span></div>
            <div>Số tiền: <span className="text-emerald-400 font-bold">{formatPrice(order.totalAmount)}</span></div>
            <div>Trạng thái: <span className="text-emerald-400">Đã kích hoạt</span></div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => {
                triggerFireworks();
                setShowThankYouModal(true);
              }}
              className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-5 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Xem Lại Thông Báo Cảm Ơn</span>
            </button>
            <button
              onClick={onBackToCatalog}
              className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all cursor-pointer"
            >
              Quay về Cửa Hàng Sản Phẩm
            </button>
            <button
              onClick={onGoToOrderHistory}
              className="rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Lịch sử đơn hàng
            </button>
          </div>
        </div>
      ) : (
        /* MAIN CHECKOUT/PAYMENT INSTRUCTIONS */
        <div className="space-y-8 animate-fade-in">
          
          {/* Header info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <button
                onClick={onBackToCatalog}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Tiếp tục mua sắm</span>
              </button>
              <h1 className="font-display text-2xl font-extrabold text-white">Thanh toán đơn hàng {order.id}</h1>
              <p className="text-xs text-gray-400 mt-1">Đơn hàng khởi tạo ở trạng thái <span className="text-amber-400 font-medium">Chờ duyệt chuyển khoản</span></p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#111827] border border-white/5 rounded-xl px-4 py-3 shrink-0">
              <Clock className="h-5 w-5 text-purple-400" />
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">Số tiền cần chuyển</span>
                <span className="font-mono text-base font-black text-white">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Grid info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Left Box: Transfer info (3/5 width) */}
            <div className="md:col-span-3 space-y-6">
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-5 shadow-xl">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <ShieldCheck className="h-4.5 w-4.5 text-purple-400" />
                  <span>Thông Tin Chuyển Khoản</span>
                </h3>

                {/* Transfer fields */}
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#030712] border border-white/5">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Ngân hàng</span>
                      <span className="text-sm font-bold text-white">{bankName}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(bankName, 'bank')}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#030712] border border-white/5">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Số tài khoản</span>
                      <span className="text-sm font-bold text-white font-mono tracking-wider">{accountNumber}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(accountNumber, 'num')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      <span>{copiedField === 'num' ? 'Đã copy' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Account Holder */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#030712] border border-white/5">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Chủ tài khoản</span>
                      <span className="text-sm font-bold text-white uppercase">{accountHolder}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(accountHolder, 'holder')}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Amount to transfer */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#030712] border border-white/5">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Số tiền chuyển khoản</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(String(order.totalAmount), 'amount')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      <span>{copiedField === 'amount' ? 'Đã copy' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Message/Content */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <div>
                      <span className="block text-[10px] text-purple-400 uppercase font-bold">Nội dung ghi chú chuyển khoản</span>
                      <span className="text-sm font-black text-purple-300 font-mono tracking-wider">{order.transferContent}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(order.transferContent, 'content')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors border border-purple-500/20 cursor-pointer"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      <span>{copiedField === 'content' ? 'Đã copy' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Important notice */}
                <div className="p-3.5 rounded-xl bg-[#030712] border border-white/5 text-xs text-gray-400 space-y-1">
                  <span className="block font-bold text-amber-500 uppercase tracking-wide">⚠️ Lưu ý cực kỳ quan trọng:</span>
                  <p className="leading-relaxed">
                    Bạn phải điền <span className="text-white font-bold underline font-mono">{order.transferContent}</span> chính xác vào mục Nội dung ghi chú chuyển tiền để hệ thống đối soát duyệt tự động chính xác nhất.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Box: VietQR Code (2/5 width) */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 shadow-xl text-center space-y-4">
                <h3 className="font-display text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-purple-400" />
                  <span>Quét Mã QR VietQR</span>
                </h3>

                {/* QR code image frame */}
                <div className="mx-auto max-w-[220px] aspect-square rounded-xl bg-white p-2.5 border border-white/5 flex items-center justify-center shadow-lg shadow-black/40">
                  <img
                    src={qrCodeUrl}
                    alt="VietQR Transfer Scan"
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs text-gray-400 leading-relaxed">
                  Mở ứng dụng Mobile Banking của bạn, quét mã QR trên để tự động điền đầy đủ thông tin: số tài khoản, số tiền và nội dung chuyển khoản.
                </div>

                {/* QR Scan Success button */}
                <button
                  onClick={handleQrScannedSuccess}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Xác Nhận Đã Quét QR & Thanh Toán</span>
                </button>

                {/* Simulated check transaction button */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={handleCheckPayment}
                    disabled={checkingPayment}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white/5 hover:bg-white/10 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 border border-white/5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${checkingPayment ? 'animate-spin text-purple-400' : ''}`} />
                    <span>{checkingPayment ? 'Đang kiểm tra giao dịch...' : 'Kiểm tra trạng thái đơn'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Notification Alert Box */}
          <div className="rounded-2xl bg-purple-500/5 border border-purple-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 leading-relaxed text-center md:text-left">
              <span className="block font-bold text-white mb-1">Đơn hàng đang trong hàng chờ duyệt</span>
              Hệ thống đang chờ lệnh chuyển khoản. Vui lòng giữ nguyên giao diện này hoặc kiểm tra trang <span className="text-white underline cursor-pointer" onClick={onGoToOrderHistory}>Lịch sử đơn hàng</span> sau 3-5 phút khi giao dịch hoàn tất.
            </div>
            
            <button
              onClick={onGoToOrderHistory}
              className="px-5 py-2.5 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Xem Lịch Sử Đơn Hàng
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

