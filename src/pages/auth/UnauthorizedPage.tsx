import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const handleReturnHome = () => {
    if (currentRole === 'ADMIN') navigate('/admin/dashboard');
    else if (currentRole === 'STUDENT') navigate('/student/dashboard');
    else if (currentRole === 'PARENT') navigate('/parent/dashboard');
    else navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-xs">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">403 - Không có quyền truy cập</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Tài khoản hiện tại của bạn ({currentRole}) không có quyền truy cập trang hoặc tài nguyên này theo chính sách Row Level Security (RLS).
        </p>
        <button
          onClick={handleReturnHome}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ của tôi</span>
        </button>
      </div>
    </div>
  );
};
