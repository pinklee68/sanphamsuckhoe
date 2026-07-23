import { useState } from 'react';
import { User } from '../types';
import { AuthService } from '../lib/db';
import { ShoppingCart, LogIn, LogOut, User as UserIcon, ShieldAlert, BookOpen, Clock, Settings, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onOpenCart: () => void;
  cartCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
}

export default function Navbar({
  currentUser,
  onUserChange,
  onOpenCart,
  cartCount,
  activeTab,
  setActiveTab,
  onOpenAdmin
}: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Vui lòng nhập email');
      return;
    }
    try {
      const user = AuthService.loginWithEmail(emailInput);
      onUserChange(user);
      setShowAuthModal(false);
      setEmailInput('');
      setPasswordInput('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleGoogleLogin = () => {
    let emailToUse = emailInput.trim();
    if (!emailToUse) {
      const inputMail = window.prompt('Nhập địa chỉ Email Google của bạn:');
      if (!inputMail || !inputMail.trim()) {
        setErrorMsg('Vui lòng nhập Email Google để hoàn tất đăng nhập');
        return;
      }
      emailToUse = inputMail.trim();
    }
    try {
      const user = AuthService.loginWithGoogle(emailToUse);
      onUserChange(user);
      setShowAuthModal(false);
      setEmailInput('');
      setPasswordInput('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng nhập Google');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onUserChange(null);
    setActiveTab('catalog');
  };

  const handleSwitchRole = (role: 'user' | 'admin') => {
    if (currentUser) {
      const updated = AuthService.simulateSwitchRole(role);
      onUserChange(updated);
    } else {
      if (role === 'admin') {
        const user = AuthService.loginWithEmail('lthongxanh@gmail.com');
        onUserChange(user);
      } else {
        setShowAuthModal(true);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full premium-glass border-b border-white/5 bg-[#030712]/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#030712]">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Sống Khoẻ Cùng Hồng
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-purple-400 uppercase">
                AI Health Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Cửa Hàng AI
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  setActiveTab('orders');
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Lịch Sử Đơn Hàng
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border border-purple-500/10`}
              >
                <ShieldAlert className="h-4 w-4" />
                Quản Trị (Admin)
              </button>
            )}
          </nav>

          {/* Right Section Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Simulation Badge */}
            <div className="hidden lg:flex items-center gap-1 bg-[#111827] border border-white/5 rounded-full p-1 text-xs">
              <span className="text-gray-500 px-2 font-mono">Vai trò:</span>
              <button
                onClick={() => handleSwitchRole('user')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  currentUser && currentUser.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Khách Hàng
              </button>
              <button
                onClick={() => handleSwitchRole('admin')}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  currentUser && currentUser.role === 'admin'
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white ring-2 ring-[#030712]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {currentUser.role === 'admin' ? '🛡️ Admin' : '⭐ Thành viên'}
                  </div>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-1.5 focus:outline-none">
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-gray-800"
                    />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-[#111827] border border-white/5 p-1 shadow-xl ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <div className="px-3 py-2 text-xs border-b border-white/5 text-gray-400">
                      Đăng nhập: <span className="text-white block truncate">{currentUser.email}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Clock className="h-4 w-4" /> Lịch sử đơn hàng
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={onOpenAdmin}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      >
                        <ShieldAlert className="h-4 w-4" /> Bảng Quản Trị
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border-t border-white/5"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#111827] border border-white/5 p-6 shadow-2xl">
            {/* Background ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-purple-500/10 blur-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-white">
                {isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              Nhập email cá nhân của bạn để đăng nhập/đăng ký. (Đăng nhập với email <span className="text-purple-400 font-mono">lthongxanh@gmail.com</span> để có quyền Admin).
            </p>

            {/* Simulated Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email của bạn</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg bg-[#030712] border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-400">Mật khẩu</label>
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#030712] border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {isRegistering ? 'Đăng ký bằng Email' : 'Đăng nhập bằng Email'}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <hr className="border-white/5" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111827] px-3 text-[10px] font-mono text-gray-500 uppercase">
                Hoặc
              </span>
            </div>

            {/* Google Sign-in Simulation */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-white hover:bg-gray-100 py-2.5 text-sm font-semibold text-gray-900 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6 2.87-4.53 5.84-4.53z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-purple-400 hover:underline focus:outline-none"
              >
                {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
