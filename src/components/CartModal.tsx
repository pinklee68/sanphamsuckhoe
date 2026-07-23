import { useState } from 'react';
import { Tool, Coupon } from '../types';
import { DatabaseService } from '../lib/db';
import { X, Trash2, Tag, Percent, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Tool[];
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: (discountAmount: number, couponCode: string) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onProceedToCheckout
}: CartModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Compute Subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.priceSale, 0);

  // Handle Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!couponCode) {
      setErrorMsg('Vui lòng nhập mã giảm giá');
      return;
    }

    const coupon = DatabaseService.getCouponByCode(couponCode);
    if (!coupon) {
      setErrorMsg('Mã giảm giá không tồn tại hoặc đã hết hạn');
      setAppliedCoupon(null);
      return;
    }

    // Verify expiry date
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      setErrorMsg('Mã giảm giá này đã hết hạn sử dụng');
      setAppliedCoupon(null);
      return;
    }

    // Verify limit usage
    if (coupon.usedCount >= coupon.maxUses) {
      setErrorMsg('Mã giảm giá đã đạt giới hạn sử dụng tối đa');
      setAppliedCoupon(null);
      return;
    }

    // Valid coupon
    setAppliedCoupon(coupon);
    if (coupon.type === 'percent') {
      setSuccessMsg(`Áp dụng thành công! Giảm ${coupon.value}% tổng hóa đơn.`);
    } else {
      setSuccessMsg(`Áp dụng thành công! Giảm ${formatCurrency(coupon.value)}.`);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') {
      return (subtotal * appliedCoupon.value) / 100;
    } else {
      return Math.min(appliedCoupon.value, subtotal);
    }
  };

  const discountAmount = calculateDiscount();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  const handleCheckoutClick = () => {
    onProceedToCheckout(discountAmount, appliedCoupon?.code || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      {/* Overlay Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative h-full w-full max-w-md bg-[#111827] border-l border-white/5 flex flex-col shadow-2xl animate-slide-left">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-400" />
            <h3 className="font-display text-lg font-bold text-white">Giỏ hàng của bạn</h3>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400 font-bold">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h4 className="font-display text-base font-bold text-gray-300">Giỏ hàng của bạn trống</h4>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Quay lại Cửa hàng AI, lựa chọn trợ lý phù hợp để thêm vào giỏ hàng và thanh toán.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-bold text-purple-400 hover:underline"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-3 rounded-xl bg-[#030712] border border-white/5 group"
              >
                {/* 9:16 Mini Preview */}
                <div className="h-16 w-9 rounded-lg overflow-hidden shrink-0 bg-gray-950">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate leading-tight mb-1">
                    {item.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {formatCurrency(item.priceSale)}
                    </span>
                    {item.priceOriginal > item.priceSale && (
                      <span className="text-[10px] text-gray-500 line-through font-mono">
                        {formatCurrency(item.priceOriginal)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 rounded-lg bg-white/0 hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Area with Calculation */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-white/5 bg-[#0B0F19] space-y-4">
            
            {/* Coupon form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-medium text-gray-400">Áp dụng mã giảm giá (Coupon)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Ví dụ: AI2026, HONGKHOE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-lg bg-[#030712] border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-500/10 hover:bg-purple-500/20 px-4 text-xs font-semibold text-purple-400 border border-purple-500/20 transition-all cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              {errorMsg && <p className="text-[10px] text-red-400 font-medium">{errorMsg}</p>}
              {successMsg && <p className="text-[10px] text-emerald-400 font-medium">{successMsg}</p>}
            </form>

            {/* Price breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Tạm tính</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Mã giảm giá ({appliedCoupon?.code})
                  </span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                <span>Tổng tiền thanh toán</span>
                <span className="font-mono text-purple-400 text-base">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Action Checkout button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
