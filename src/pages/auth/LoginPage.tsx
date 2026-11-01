import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle, ShieldAlert, KeyRound, UserPlus, LogIn, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('teacher@smartclass.edu.vn');
  const [password, setPassword] = useState('123456');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('TEACHER');

  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'TEACHER' as UserRole,
      title: 'Giáo viên Chủ nhiệm',
      name: 'Cô Nguyễn Thị Mai',
      desc: 'Quản lý lớp 10A1, điểm danh, chấm bài, nhập điểm, AI hỗ trợ',
      email: 'teacher@smartclass.edu.vn',
      path: '/teacher/dashboard',
      color: 'border-cyan-800/80 hover:border-cyan-400 bg-[#041527]',
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Quản trị viên (Admin)',
      name: 'Thầy Trần Minh Đức',
      desc: 'Quản lý toàn trường, phân quyền, môn học, audit log, sao lưu',
      email: 'admin@smartclass.edu.vn',
      path: '/admin/dashboard',
      color: 'border-purple-800/80 hover:border-purple-400 bg-[#041527]',
    },
    {
      role: 'STUDENT' as UserRole,
      title: 'Học sinh',
      name: 'Nguyễn Hoàng Nam',
      desc: 'Xem lịch học, nộp bài tập toán, làm quiz trắc nghiệm, xem điểm',
      email: 'student@smartclass.edu.vn',
      path: '/student/dashboard',
      color: 'border-emerald-800/80 hover:border-emerald-400 bg-[#041527]',
    },
    {
      role: 'PARENT' as UserRole,
      title: 'Phụ huynh',
      name: 'Nguyễn Văn Hùng',
      desc: 'Theo dõi con Hoàng Nam, xem chuyên cần, bài tập, nhắn tin với GV',
      email: 'parent@smartclass.edu.vn',
      path: '/parent/dashboard',
      color: 'border-amber-800/80 hover:border-amber-400 bg-[#041527]',
    },
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    switchRole(acc.role);
    showToast(`Đăng nhập thành công với vai trò ${acc.title}`, 'success');
    navigate(acc.path);
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      showToast('Đăng nhập thành công!', 'success');
      navigate('/');
    } else {
      showToast(result.error || 'Đăng nhập thất bại.', 'error');
    }
  };

  const handleFormRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPass) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    setLoading(true);
    const result = await register(regFullName, regEmail, regPassword, regConfirmPass, regRole);
    setLoading(false);
    if (result.success) {
      showToast('Đăng ký tài khoản thành công!', 'success');
      navigate('/');
    } else {
      showToast(result.error || 'Đăng ký thất bại.', 'error');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      showToast('Đăng nhập Google thành công!', 'success');
      navigate('/');
    } else {
      showToast(result.error || 'Đăng nhập Google thất bại.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020f1c] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
          SMART CLASS 4.0
        </h2>
        <p className="mt-1 text-sm text-cyan-400/80">
          Nền tảng Quản lý Lớp học Thông minh Toàn diện
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        {/* Quick 1-click test roles grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Chọn vai trò trải nghiệm ngay (1-Click Demo)
            </span>
            <span className="text-xs text-slate-400">Không cần gõ mật khẩu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => handleQuickLogin(acc)}
                className={`text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between group cursor-pointer shadow-sm ${acc.color}`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-400">{acc.title}</div>
                  <div className="font-bold text-white text-sm mt-0.5 group-hover:text-cyan-300 transition-colors">
                    {acc.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {acc.desc}
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-[#0e3d54] flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Vào cổng ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Box with Tabs */}
        <div className="bg-[#041527] py-8 px-6 shadow-xl border border-[#0e3d54] rounded-2xl sm:px-10 max-w-md mx-auto">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#020e1a] p-1 mb-6 border border-[#0e3d54]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-[#0284c7] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'register' ? 'bg-[#0284c7] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Đăng ký tài khoản
            </button>
          </div>

          {/* Google Sign In button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full mb-6 flex items-center justify-center gap-3 py-2.5 px-4 border border-[#0e3d54] rounded-xl text-sm font-semibold text-white bg-[#020e1a] hover:bg-[#062038] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
            </svg>
            Tiếp tục với tài khoản Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0e3d54]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#041527] px-2 text-slate-400">Hoặc email hệ thống</span>
            </div>
          </div>

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleFormLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-300">Email tài khoản</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="email@smartclass.edu.vn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Mật khẩu</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" defaultChecked className="rounded border-[#0e3d54] bg-[#020e1a] text-cyan-500" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <span className="text-cyan-400 hover:underline cursor-pointer">Quên mật khẩu?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-cyan-500/40 rounded-xl shadow-sm text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập hệ thống'}
              </button>
            </form>
          ) : (
            <form className="space-y-3.5" onSubmit={handleFormRegister}>
              <div>
                <label className="block text-xs font-semibold text-slate-300">Họ và tên</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Email đăng ký</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="email@smartclass.edu.vn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Vai trò</label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                >
                  <option value="TEACHER">Giáo viên</option>
                  <option value="STUDENT">Học sinh</option>
                  <option value="PARENT">Phụ huynh</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Lưu ý: Không thể tự đăng ký quyền Admin trực tuyến.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Mật khẩu</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Xác nhận mật khẩu</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={regConfirmPass}
                    onChange={e => setRegConfirmPass(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 border border-[#0e3d54] rounded-xl text-sm text-white bg-[#020e1a] focus:outline-none focus:border-cyan-400"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-cyan-500/40 rounded-xl shadow-sm text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] focus:outline-none transition-colors cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-[#0e3d54] pt-4 text-center text-xs text-slate-500">
            Hệ thống bảo mật xác thực Firebase Auth & Cloud Firestore.
          </div>
        </div>
      </div>
    </div>
  );
};
