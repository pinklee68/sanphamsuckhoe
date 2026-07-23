import { Order, Tool } from '../types';
import { DatabaseService } from '../lib/db';
import { Clock, CheckCircle2, XCircle, ShoppingBag, ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onSelectTool: (toolId: string) => void;
}

export default function OrderHistory({
  orders,
  onSelectOrder,
  onSelectTool
}: OrderHistoryProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status: 'pending' | 'paid' | 'cancelled') => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đã thanh toán (Mở khóa)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Đã hủy đơn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-3.5 w-3.5" />
            Chờ duyệt CK
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-display text-2xl font-extrabold text-white">Lịch Sử Mua Hàng</h1>
        <p className="text-xs text-gray-400 mt-1">Quản lý và xem tiến trình phê duyệt của các đơn hàng mua trợ lý AI.</p>
      </div>

      {/* Orders log list */}
      {orders.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gray-500">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-gray-300">Bạn chưa có đơn hàng nào</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Hãy khám phá các Trợ lý AI dinh dưỡng, luyện tập và tâm trí trên trang chủ để sở hữu công cụ hữu ích nhất.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden shadow-xl"
            >
              {/* Order Header bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0B0F19] border-b border-white/5 text-xs">
                <div className="space-y-1">
                  <span className="block text-gray-500 uppercase font-mono">Mã Đơn Hàng</span>
                  <span className="text-sm font-bold text-white font-mono">{order.id}</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-gray-500 uppercase">Ngày Khởi Tạo</span>
                  <span className="text-sm font-semibold text-gray-300">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block text-gray-500 uppercase">Tổng Thanh Toán</span>
                  <span className="text-sm font-black text-white font-mono">{formatPrice(order.totalAmount)}</span>
                </div>

                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items list */}
              <div className="p-5 space-y-3.5">
                {order.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between gap-4 text-xs text-gray-300 border-b border-white/5 last:border-none pb-3 last:pb-0"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block mb-1">{item.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">ID: {item.toolId}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono">{formatPrice(item.price)}</span>
                      
                      {order.status === 'paid' && (
                        <button
                          onClick={() => onSelectTool(item.toolId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-bold transition-all border border-purple-500/20"
                        >
                          <span>Sử dụng ngay</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer bar actions */}
              {order.status === 'pending' && (
                <div className="flex justify-end p-4 bg-[#030712]/50 border-t border-white/5">
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                  >
                    <span>Xem mã QR & Chuyển tiền</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
