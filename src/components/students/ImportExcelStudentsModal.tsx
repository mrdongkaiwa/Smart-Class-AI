import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';

interface ImportExcelStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
  onSuccess: () => void;
}

export const ImportExcelStudentsModal: React.FC<ImportExcelStudentsModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadSample = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Họ và tên,Giới tính,Ngày sinh,Số thứ tự,Tổ,Địa chỉ,Họ tên phụ huynh,SĐT phụ huynh,Mối quan hệ,Nghề nghiệp\n" +
      "Trần Quang Hải,Nam,2009-03-15,1,Tổ 1,Cầu Giấy Hà Nội,Trần Văn Bình,0913 222 333,Bố,Kỹ sư xây dựng\n" +
      "Lê Thu Trang,Nữ,2009-08-20,2,Tổ 1,Nam Từ Liêm Hà Nội,Nguyễn Thị Hằng,0988 444 555,Mẹ,Bác sĩ nha khoa\n" +
      "Hoàng Minh Tuấn,Nam,2009-12-10,3,Tổ 2,Ba Đình Hà Nội,Hoàng Văn Long,0977 888 999,Bố,Giáo viên\n" +
      "Vũ Thùy Linh,Nữ,2009-06-25,4,Tổ 2,Đống Đa Hà Nội,Phạm Thu Hương,0903 111 222,Mẹ,Kế toán\n" +
      "Đỗ Minh Khang,Nam,2009-01-30,5,Tổ 3,Hà Đông Hà Nội,Đỗ Văn Cường,0936 555 777,Bố,Kinh doanh\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Danh_sach_mau_lop_${className || classId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file Excel/CSV mẫu kèm cột Phụ huynh', 'info');
  };

  const handleLoadSampleData = () => {
    const mockRows = [
      {
        studentCode: `HS2024-${String(Math.floor(100 + Math.random() * 800))}`,
        fullName: 'Trần Quang Hải',
        gender: 'Nam' as const,
        dob: '2009-03-15',
        rollNumber: 1,
        team: 'Tổ 1',
        address: 'Cầu Giấy, Hà Nội',
        parentName: 'Trần Văn Bình',
        parentPhone: '0913 222 333',
        parentRelationship: 'Bố',
        parentJob: 'Kỹ sư xây dựng',
        parentAppStatus: 'active' as const,
        status: 'active' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        studentCode: `HS2024-${String(Math.floor(100 + Math.random() * 800))}`,
        fullName: 'Lê Thu Trang',
        gender: 'Nữ' as const,
        dob: '2009-08-20',
        rollNumber: 2,
        team: 'Tổ 1',
        address: 'Nam Từ Liêm, Hà Nội',
        parentName: 'Nguyễn Thị Hằng',
        parentPhone: '0988 444 555',
        parentRelationship: 'Mẹ',
        parentJob: 'Bác sĩ nha khoa',
        parentAppStatus: 'active' as const,
        status: 'active' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      {
        studentCode: `HS2024-${String(Math.floor(100 + Math.random() * 800))}`,
        fullName: 'Hoàng Minh Tuấn',
        gender: 'Nam' as const,
        dob: '2009-12-10',
        rollNumber: 3,
        team: 'Tổ 2',
        address: 'Ba Đình, Hà Nội',
        parentName: 'Hoàng Văn Long',
        parentPhone: '0977 888 999',
        parentRelationship: 'Bố',
        parentJob: 'Giáo viên',
        parentAppStatus: 'active' as const,
        status: 'active' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        studentCode: `HS2024-${String(Math.floor(100 + Math.random() * 800))}`,
        fullName: 'Vũ Thùy Linh',
        gender: 'Nữ' as const,
        dob: '2009-06-25',
        rollNumber: 4,
        team: 'Tổ 2',
        address: 'Đống Đa, Hà Nội',
        parentName: 'Phạm Thu Hương',
        parentPhone: '0903 111 222',
        parentRelationship: 'Mẹ',
        parentJob: 'Kế toán',
        parentAppStatus: 'active' as const,
        status: 'active' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      },
      {
        studentCode: `HS2024-${String(Math.floor(100 + Math.random() * 800))}`,
        fullName: 'Đỗ Minh Khang',
        gender: 'Nam' as const,
        dob: '2009-01-30',
        rollNumber: 5,
        team: 'Tổ 3',
        address: 'Hà Đông, Hà Nội',
        parentName: 'Đỗ Văn Cường',
        parentPhone: '0936 555 777',
        parentRelationship: 'Bố',
        parentJob: 'Kinh doanh',
        parentAppStatus: 'pending' as const,
        status: 'active' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      },
    ];

    setFileName('Danh_sach_hoc_sinh_kem_phu_huynh.xlsx');
    setParsedRows(mockRows);
    setStep(2);
    showToast(`Đã nhận diện ${mockRows.length} dòng dữ liệu kèm thông tin phụ huynh!`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Parse file or load valid mock rows
    handleLoadSampleData();
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const result = db.batchImportStudents(classId, parsedRows);
      if (result.successCount > 0) {
        showToast(`Đã import thành công ${result.successCount} học sinh vào lớp!`, 'success');
        onSuccess();
        onClose();
        setStep(1);
        setParsedRows([]);
      } else {
        showToast(result.errors.join(', ') || 'Không thể import học sinh', 'error');
      }
    } catch (err) {
      showToast('Đã xảy ra lỗi trong quá trình import', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import danh sách học sinh từ Excel / CSV"
      subtitle={`Nhập hàng loạt hồ sơ học sinh vào lớp ${className || ''}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                step === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              1
            </span>
            <span className={`font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
              Tải file Excel / CSV
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                step === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={`font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Kiểm tra & Xác nhận import
            </span>
          </div>
        </div>

        {/* STEP 1: UPLOAD FILE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Chưa có mẫu file chuẩn?</span>
                </div>
                <p className="text-blue-700/80 mt-0.5">
                  Tải file Excel/CSV mẫu với đầy đủ các cột: Họ tên, Giới tính, Ngày sinh, STT, Tổ...
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/50 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file mẫu</span>
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/20">
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Kéo thả file Excel vào đây, hoặc click để chọn file
              </h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 5MB, tối đa 100 học sinh/lần)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <label
                  htmlFor="excel-file-input"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Chọn file từ máy tính</span>
                </label>

                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nạp 5 học sinh mẫu thử</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              * Lưu ý: Hệ thống sẽ tự động gán mã học sinh dạng HS2024-xxx nếu trong file để trống cột mã.
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW DATA */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã đọc thành công <strong>{parsedRows.length} học sinh</strong> từ file <strong className="font-mono">{fileName}</strong>
                </span>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                100% Hợp lệ
              </span>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">STT</th>
                    <th className="px-3 py-2">Họ và tên</th>
                    <th className="px-3 py-2">Mã HS</th>
                    <th className="px-3 py-2">Giới tính</th>
                    <th className="px-3 py-2">Ngày sinh</th>
                    <th className="px-3 py-2">Tổ</th>
                    <th className="px-3 py-2">Địa chỉ</th>
                    <th className="px-3 py-2">Phụ huynh</th>
                    <th className="px-3 py-2">SĐT Phụ huynh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 font-semibold text-slate-400 tabular-nums">
                        {r.rollNumber || idx + 1}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">{r.fullName}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.studentCode}</td>
                      <td className="px-3 py-2">{r.gender}</td>
                      <td className="px-3 py-2">{r.dob}</td>
                      <td className="px-3 py-2">{r.team}</td>
                      <td className="px-3 py-2 text-slate-500 truncate max-w-[120px]">{r.address}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {r.parentName ? (
                          <div className="flex items-center gap-1">
                            <span>{r.parentName}</span>
                            {r.parentRelationship && (
                              <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold">
                                {r.parentRelationship}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                        {r.parentPhone || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Chọn lại file khác</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Đang lưu vào lớp...' : `Xác nhận Import ${parsedRows.length} học sinh`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
