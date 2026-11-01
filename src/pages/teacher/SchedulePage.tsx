import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pencil,
  Trash2,
  RotateCcw,
  RotateCw,
  FileSpreadsheet,
  Download,
  Check,
  Plus,
  Users,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  X,
  Info,
  Building2,
  Save,
  HelpCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';

// Day mapping following Vietnamese school standards (Thứ 2 -> Chủ Nhật)
const FULL_WEEK_DAYS = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ Nhật',
];

interface ScheduleRow {
  id: string;
  timeRange: string;
  cells: Record<string, string>; // columnId -> text content
}

interface ScheduleGridData {
  columns: string[]; // column IDs
  columnDays: Record<string, string>; // columnId -> day name e.g. "Thứ 2"
  rows: ScheduleRow[];
}

// Default 8-period times matching standard timetable
const DEFAULT_PERIOD_TIMES: string[] = [
  '07:00 - 07:45',
  '07:45 - 08:30',
  '08:30 - 09:15',
  '09:15 - 10:00',
  '10:35 - 11:20',
  '11:25 - 12:10',
  '12:15 - 13:00',
  '13:05 - 13:50',
];

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Create sample grid for Class 7A3 matching Image 1, 2, 3
function createSampleGridForClass7A3(): ScheduleGridData {
  const columns = ['col_thu2', 'col_thu3', 'col_thu4', 'col_thu5', 'col_thu6'];
  const columnDays: Record<string, string> = {
    col_thu2: 'Thứ 2',
    col_thu3: 'Thứ 3',
    col_thu4: 'Thứ 4',
    col_thu5: 'Thứ 5',
    col_thu6: 'Thứ 6',
  };

  // Sample data seen in user screenshots 1, 2, 3
  const sampleData: Record<number, Record<string, string>> = {
    0: { col_thu2: '', col_thu3: 'dsf', col_thu4: 'dsfsdf', col_thu5: 'dfsdf', col_thu6: '' },
    1: { col_thu2: '', col_thu3: 'dsfsdf', col_thu4: 'sdf', col_thu5: 'sdfsdf', col_thu6: '' },
    2: { col_thu2: 'fdsf', col_thu3: 'sdfsd', col_thu4: 'fdsfdsf', col_thu5: 'dsfsdf', col_thu6: '' },
    3: { col_thu2: 'dsfsdf', col_thu3: 'dsfsdf', col_thu4: 'sdfsdf', col_thu5: '', col_thu6: '' },
    4: { col_thu2: 'dsfsd', col_thu3: 'fsdf', col_thu4: 'ssdfsddf', col_thu5: '', col_thu6: '' },
    5: { col_thu2: 'dsfsdf', col_thu3: 'sdfsdf', col_thu4: 'sdfdsf', col_thu5: '', col_thu6: '' },
    6: { col_thu2: 'sdfsdf', col_thu3: 'sdf', col_thu4: 'sdfsdf', col_thu5: '', col_thu6: '' },
    7: { col_thu2: 'fsdf', col_thu3: 'dsfsdf', col_thu4: '', col_thu5: '', col_thu6: '' },
  };

  const rows: ScheduleRow[] = [];
  for (let i = 0; i < 8; i++) {
    const cells: Record<string, string> = {};
    columns.forEach((colId) => {
      cells[colId] = sampleData[i]?.[colId] || '';
    });
    rows.push({
      id: `row_${i + 1}`,
      timeRange: DEFAULT_PERIOD_TIMES[i] || '07:00 - 07:45',
      cells,
    });
  }

  return { columns, columnDays, rows };
}

// Generic default empty grid for any other class/teacher/room
function createDefaultGrid(): ScheduleGridData {
  const columns = ['col_thu2', 'col_thu3', 'col_thu4', 'col_thu5', 'col_thu6'];
  const columnDays: Record<string, string> = {
    col_thu2: 'Thứ 2',
    col_thu3: 'Thứ 3',
    col_thu4: 'Thứ 4',
    col_thu5: 'Thứ 5',
    col_thu6: 'Thứ 6',
  };

  const rows: ScheduleRow[] = [];
  for (let i = 0; i < 5; i++) {
    const cells: Record<string, string> = {};
    columns.forEach((colId) => {
      cells[colId] = '';
    });
    rows.push({
      id: makeId('row'),
      timeRange: DEFAULT_PERIOD_TIMES[i] || '07:00 - 07:45',
      cells,
    });
  }

  return { columns, columnDays, rows };
}

const CLASS_LIST = [
  { id: '7A3', name: 'Lớp 7A3' },
  { id: '6A1', name: 'Lớp 6A1' },
  { id: '6A2', name: 'Lớp 6A2' },
  { id: '7A1', name: 'Lớp 7A1' },
  { id: '7A2', name: 'Lớp 7A2' },
  { id: '8A1', name: 'Lớp 8A1' },
  { id: '9A1', name: 'Lớp 9A1' },
  { id: '10A1', name: 'Lớp 10A1' },
  { id: '10A2', name: 'Lớp 10A2' },
];

const TEACHER_LIST = [
  { id: 'gv_nam', name: 'Thầy Nguyễn Văn Nam (Toán)' },
  { id: 'gv_huong', name: 'Cô Trần Thị Hương (Văn)' },
  { id: 'gv_tuan', name: 'Thầy Lê Hoàng Tuấn (Anh)' },
  { id: 'gv_lan', name: 'Cô Vũ Mai Lan (Lý)' },
  { id: 'gv_minh', name: 'Thầy Phạm Quang Minh (Hóa)' },
];

const ROOM_LIST = [
  { id: 'p_101', name: 'Phòng 101 - Phòng học thường' },
  { id: 'p_tin', name: 'Phòng Tin học 1 (Lab Máy tính)' },
  { id: 'p_ly', name: 'Phòng Thực hành Vật lý - Hóa học' },
  { id: 'p_da_nang', name: 'Nhà thi đấu Đa năng' },
];

export const SchedulePage: React.FC = () => {
  const { showToast } = useToast();

  // Tabs: 'class' (Lịch lớp học) | 'teacher' (Lịch giáo viên) | 'room' (Lịch phòng học)
  const [scheduleTab, setScheduleTab] = useState<'class' | 'teacher' | 'room'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>('7A3');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('gv_nam');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('p_101');

  // Mode states (View mode by default)
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [showDeleteToast, setShowDeleteToast] = useState<boolean>(false);

  // Active cell being edited: { rowIndex: number, colId: string } | null
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colId: string } | null>(null);

  // Grid Data & History (Undo / Redo on draft)
  const [grid, setGrid] = useState<ScheduleGridData>(() => createSampleGridForClass7A3());
  const [savedGrid, setSavedGrid] = useState<ScheduleGridData>(() => createSampleGridForClass7A3());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const [undoStack, setUndoStack] = useState<ScheduleGridData[]>([]);
  const [redoStack, setRedoStack] = useState<ScheduleGridData[]>([]);

  // Modals
  const [showMaxDaysModal, setShowMaxDaysModal] = useState<boolean>(false);
  const [columnToDelete, setColumnToDelete] = useState<{ colId: string; dayName: string } | null>(null);
  const [rowToDelete, setRowToDelete] = useState<{ rowIndex: number; periodName: string } | null>(null);
  const [showUnsavedWarningModal, setShowUnsavedWarningModal] = useState<boolean>(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

  // Edit period time modal
  const [editingPeriodTime, setEditingPeriodTime] = useState<{ rowIndex: number; currentRange: string } | null>(null);
  const [tempStartTime, setTempStartTime] = useState<string>('07:00');
  const [tempEndTime, setTempEndTime] = useState<string>('07:45');

  // Excel Input Ref
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Target Storage Key
  const storageTarget =
    scheduleTab === 'class' ? selectedClassId : scheduleTab === 'teacher' ? selectedTeacherId : selectedRoomId;
  const currentStorageKey = `timetable_dark_v3_${scheduleTab}_${storageTarget}`;

  // Load schedule data when tab or target changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(currentStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.columns && parsed.rows) {
          // Normalize columnDays if not present
          if (!parsed.columnDays) {
            const cDays: Record<string, string> = {};
            parsed.columns.forEach((cId: string, idx: number) => {
              cDays[cId] = FULL_WEEK_DAYS[idx] || `Thứ ${idx + 2}`;
            });
            parsed.columnDays = cDays;
          }
          setGrid(parsed);
          setSavedGrid(parsed);
          setUndoStack([]);
          setRedoStack([]);
          setHasUnsavedChanges(false);
          setIsEditMode(false);
          setIsDeleteMode(false);
          return;
        }
      }
    } catch {
      // ignore JSON errors
    }

    // Default Seed: If 7A3, use screenshot sample data; otherwise default grid
    const initial =
      scheduleTab === 'class' && selectedClassId === '7A3'
        ? createSampleGridForClass7A3()
        : createDefaultGrid();

    setGrid(initial);
    setSavedGrid(initial);
    setUndoStack([]);
    setRedoStack([]);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setIsDeleteMode(false);
  }, [currentStorageKey, scheduleTab, selectedClassId, selectedTeacherId, selectedRoomId]);

  // Synchronize toast with delete mode
  useEffect(() => {
    if (isDeleteMode) {
      setShowDeleteToast(true);
    } else {
      setShowDeleteToast(false);
    }
  }, [isDeleteMode]);

  // Warn on browser beforeunload if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Push new state with Undo support
  const updateGridWithHistory = useCallback(
    (newGrid: ScheduleGridData) => {
      setUndoStack((prev) => [...prev.slice(-40), JSON.parse(JSON.stringify(grid))]);
      setRedoStack([]);
      setGrid(newGrid);
      setHasUnsavedChanges(true);
    },
    [grid]
  );

  // 1. UNDO logic (Ctrl+Z)
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(grid))]);
    setUndoStack(newUndoStack);
    setGrid(previous);
    setHasUnsavedChanges(true);
    showToast('Đã hoàn tác thao tác trước', 'info');
  }, [undoStack, grid, showToast]);

  // 2. REDO logic (Ctrl+Y)
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(grid))]);
    setRedoStack(newRedoStack);
    setGrid(next);
    setHasUnsavedChanges(true);
    showToast('Đã làm lại thao tác', 'info');
  }, [redoStack, grid, showToast]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === 's') {
          // Ctrl+S to save
          if (isEditMode) {
            e.preventDefault();
            handleSave();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, isEditMode]);

  // 3. EDIT MODE TOGGLE
  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Trying to exit edit mode while unsaved
      if (hasUnsavedChanges) {
        setPendingNavigationAction(() => () => {
          setIsEditMode(false);
          setIsDeleteMode(false);
          setEditingCell(null);
        });
        setShowUnsavedWarningModal(true);
      } else {
        setIsEditMode(false);
        setIsDeleteMode(false);
        setEditingCell(null);
      }
    } else {
      // Turn ON edit mode
      setIsEditMode(true);
      setIsDeleteMode(false);
    }
  };

  // 4. QUICK DELETE MODE TOGGLE (Hình 3)
  const handleToggleDeleteMode = () => {
    if (!isEditMode) {
      // "Nếu người dùng bấm Xóa từ chế độ xem thì tự vào chế độ chỉnh sửa và bật xóa nhanh ngay"
      setIsEditMode(true);
      setIsDeleteMode(true);
      setEditingCell(null);
      showToast('Đã vào Chế độ Chỉnh sửa và Bật Xóa nhanh', 'info');
    } else {
      // Toggle delete mode within edit mode
      setIsDeleteMode((prev) => !prev);
      setEditingCell(null);
    }
  };

  // 5. SAVE ACTION
  const handleSave = () => {
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(grid));
      setSavedGrid(JSON.parse(JSON.stringify(grid)));
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      setIsDeleteMode(false);
      setEditingCell(null);
      setShowUnsavedWarningModal(false);

      // Disable Undo/Redo after save
      setUndoStack([]);
      setRedoStack([]);

      showToast('Đã lưu thời khóa biểu thành công vào hệ thống!', 'success');
    } catch {
      showToast('Lỗi khi lưu thời khóa biểu!', 'error');
    }
  };

  // 6. DISCARD CHANGES
  const handleDiscardChanges = () => {
    setGrid(JSON.parse(JSON.stringify(savedGrid)));
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setIsDeleteMode(false);
    setEditingCell(null);
    setShowUnsavedWarningModal(false);
    setUndoStack([]);
    setRedoStack([]);
    if (pendingNavigationAction) {
      pendingNavigationAction();
      setPendingNavigationAction(null);
    }
    showToast('Đã hủy các thay đổi chưa lưu', 'info');
  };

  // 7. CELL EDITING INLINE (Enter creates \n, Tab to next cell, blur saves to draft)
  const handleSaveCellContent = (rowIndex: number, colId: string, text: string) => {
    const currentVal = grid.rows[rowIndex]?.cells[colId] || '';
    if (currentVal === text) {
      setEditingCell(null);
      return;
    }

    const newRows = grid.rows.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        return {
          ...r,
          cells: {
            ...r.cells,
            [colId]: text,
          },
        };
      }
      return r;
    });

    updateGridWithHistory({
      ...grid,
      rows: newRows,
    });
    setEditingCell(null);
  };

  // 8. QUICK DELETE CELL ACTION (When Quick Delete mode is ON - Hình 3)
  const handleQuickDeleteCell = (rowIndex: number, colId: string) => {
    const currentVal = grid.rows[rowIndex]?.cells[colId];
    // If already empty, do nothing
    if (!currentVal || currentVal.trim() === '') return;

    const newRows = grid.rows.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        return {
          ...r,
          cells: {
            ...r.cells,
            [colId]: '',
          },
        };
      }
      return r;
    });

    updateGridWithHistory({
      ...grid,
      rows: newRows,
    });
  };

  // 9. ADD DAY COLUMN LOGIC (Thêm cột ngày theo thứ tự Thứ 2 -> Chủ Nhật, tối đa 7 ngày)
  const handleAddColumn = () => {
    if (grid.columns.length >= 7) {
      // Exceeds 7 days: show exact requirement error popup "Lỗi: Tuần chỉ có 7 ngày."
      setShowMaxDaysModal(true);
      return;
    }

    // Find the next available day from FULL_WEEK_DAYS
    const currentDays = grid.columns.map((colId) => grid.columnDays[colId]);
    const nextDayName = FULL_WEEK_DAYS.find((d) => !currentDays.includes(d));

    if (!nextDayName) {
      setShowMaxDaysModal(true);
      return;
    }

    const newColId = makeId('col');
    // Find proper sorted position in FULL_WEEK_DAYS
    const targetDayIndex = FULL_WEEK_DAYS.indexOf(nextDayName);
    let insertIndex = grid.columns.length;

    for (let i = 0; i < grid.columns.length; i++) {
      const existingDay = grid.columnDays[grid.columns[i]];
      const existingDayIndex = FULL_WEEK_DAYS.indexOf(existingDay);
      if (existingDayIndex > targetDayIndex) {
        insertIndex = i;
        break;
      }
    }

    const newColumns = [...grid.columns];
    newColumns.splice(insertIndex, 0, newColId);

    const newColumnDays = {
      ...grid.columnDays,
      [newColId]: nextDayName,
    };

    const newRows = grid.rows.map((row) => ({
      ...row,
      cells: {
        ...row.cells,
        [newColId]: '',
      },
    }));

    updateGridWithHistory({
      columns: newColumns,
      columnDays: newColumnDays,
      rows: newRows,
    });

    showToast(`Đã thêm cột ${nextDayName} vào thời khóa biểu`, 'success');
  };

  // 10. DELETE COLUMN CONFIRMATION & EXECUTION
  const triggerDeleteColumn = (colId: string) => {
    if (grid.columns.length <= 1) {
      showToast('Không thể xóa vì thời khóa biểu phải có ít nhất 1 ngày!', 'warning');
      return;
    }
    const dayName = grid.columnDays[colId] || 'cột ngày';
    setColumnToDelete({ colId, dayName });
  };

  const confirmDeleteColumn = () => {
    if (!columnToDelete) return;
    const { colId } = columnToDelete;

    const newColumns = grid.columns.filter((c) => c !== colId);
    const newColumnDays = { ...grid.columnDays };
    delete newColumnDays[colId];

    const newRows = grid.rows.map((row) => {
      const updatedCells = { ...row.cells };
      delete updatedCells[colId];
      return {
        ...row,
        cells: updatedCells,
      };
    });

    updateGridWithHistory({
      columns: newColumns,
      columnDays: newColumnDays,
      rows: newRows,
    });

    showToast(`Đã xóa cột ${columnToDelete.dayName}`, 'info');
    setColumnToDelete(null);
  };

  // 11. ROW ACTIONS: ADD PERIOD & DELETE PERIOD
  const handleAddPeriodRow = () => {
    const nextIndex = grid.rows.length;
    let nextTime = DEFAULT_PERIOD_TIMES[nextIndex];
    if (!nextTime) {
      // Calculate 45 mins continuous after last row
      const lastRowTime = grid.rows[grid.rows.length - 1]?.timeRange;
      if (lastRowTime && lastRowTime.includes('-')) {
        const parts = lastRowTime.split('-').map((s) => s.trim());
        const [lastEndH, lastEndM] = (parts[1] || '11:20').split(':').map(Number);
        const startMins = lastEndH * 60 + lastEndM + 5; // 5 min interval
        const endMins = startMins + 45;
        const sh = String(Math.floor(startMins / 60)).padStart(2, '0');
        const sm = String(startMins % 60).padStart(2, '0');
        const eh = String(Math.floor(endMins / 60)).padStart(2, '0');
        const em = String(endMins % 60).padStart(2, '0');
        nextTime = `${sh}:${sm} - ${eh}:${em}`;
      } else {
        nextTime = '14:00 - 14:45';
      }
    }

    const newRowId = makeId('row');
    const newCells: Record<string, string> = {};
    grid.columns.forEach((colId) => {
      newCells[colId] = '';
    });

    const newRow: ScheduleRow = {
      id: newRowId,
      timeRange: nextTime,
      cells: newCells,
    };

    updateGridWithHistory({
      ...grid,
      rows: [...grid.rows, newRow],
    });

    showToast(`Đã thêm Tiết ${grid.rows.length + 1} mới`, 'success');
  };

  const triggerDeleteRow = (rowIndex: number) => {
    if (grid.rows.length <= 1) {
      showToast('Thời khóa biểu phải có ít nhất 1 tiết học!', 'warning');
      return;
    }
    const periodName = `Tiết ${rowIndex + 1}`;
    setRowToDelete({ rowIndex, periodName });
  };

  const confirmDeleteRow = () => {
    if (!rowToDelete) return;
    const { rowIndex } = rowToDelete;

    const newRows = grid.rows.filter((_, idx) => idx !== rowIndex);

    updateGridWithHistory({
      ...grid,
      rows: newRows,
    });

    showToast(`Đã xóa ${rowToDelete.periodName}`, 'info');
    setRowToDelete(null);
  };

  // 12. PERIOD TIME EDITING & VALIDATION
  const handleOpenEditPeriodTime = (rowIndex: number) => {
    if (!isEditMode) return;
    const currentRange = grid.rows[rowIndex]?.timeRange || '07:00 - 07:45';
    const [start, end] = currentRange.split('-').map((s) => s.trim());
    setTempStartTime(start || '07:00');
    setTempEndTime(end || '07:45');
    setEditingPeriodTime({ rowIndex, currentRange });
  };

  const handleSavePeriodTime = () => {
    if (!editingPeriodTime) return;
    const { rowIndex } = editingPeriodTime;

    // Validate start < end
    const [sh, sm] = tempStartTime.split(':').map(Number);
    const [eh, em] = tempEndTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (isNaN(startMins) || isNaN(endMins) || startMins >= endMins) {
      showToast('Lỗi: Giờ bắt đầu phải nhỏ hơn giờ kết thúc!', 'error');
      return;
    }

    const newRange = `${tempStartTime} - ${tempEndTime}`;

    // Check overlap with other periods
    for (let i = 0; i < grid.rows.length; i++) {
      if (i === rowIndex) continue;
      const otherRange = grid.rows[i].timeRange;
      if (otherRange && otherRange.includes('-')) {
        const [oStart, oEnd] = otherRange.split('-').map((s) => s.trim());
        const [osh, osm] = oStart.split(':').map(Number);
        const [oeh, oem] = oEnd.split(':').map(Number);
        const oStartMins = osh * 60 + osm;
        const oEndMins = oeh * 60 + oem;

        if (startMins < oEndMins && endMins > oStartMins) {
          showToast(`Cảnh báo: Khung giờ trùng hoặc đè lên Tiết ${i + 1} (${otherRange})!`, 'warning');
          break;
        }
      }
    }

    const newRows = grid.rows.map((r, idx) => {
      if (idx === rowIndex) {
        return {
          ...r,
          timeRange: newRange,
        };
      }
      return r;
    });

    updateGridWithHistory({
      ...grid,
      rows: newRows,
    });

    showToast(`Đã cập nhật giờ cho Tiết ${rowIndex + 1}`, 'success');
    setEditingPeriodTime(null);
  };

  // 13. EXCEL EXPORT
  const handleExportExcel = () => {
    try {
      const headers = ['Tiết / Giờ', ...grid.columns.map((c) => grid.columnDays[c] || 'Thứ')];
      const dataRows = grid.rows.map((row, rIdx) => {
        const periodLabel = `Tiết ${rIdx + 1} (${row.timeRange})`;
        const rowData = [periodLabel];
        grid.columns.forEach((colId) => {
          const val = row.cells[colId];
          rowData.push(val && val.trim() !== '' ? val : '-trống-');
        });
        return rowData;
      });

      const worksheetData = [headers, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ThoiKhoaBieu');

      const targetTitle =
        scheduleTab === 'class'
          ? CLASS_LIST.find((c) => c.id === selectedClassId)?.name || 'Lop'
          : scheduleTab === 'teacher'
          ? TEACHER_LIST.find((t) => t.id === selectedTeacherId)?.name || 'GiaoVien'
          : ROOM_LIST.find((r) => r.id === selectedRoomId)?.name || 'Phong';

      const fileName = `ThoiKhoaBieu_${targetTitle.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showToast(`Đã xuất file ${fileName} thành công!`, 'success');
    } catch {
      showToast('Xuất file Excel thất bại!', 'error');
    }
  };

  // 14. EXCEL IMPORT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          showToast('File Excel không có đủ dữ liệu bảng', 'warning');
          return;
        }

        const headerRow = rawJson[0] as string[];
        const numCols = Math.min(Math.max(headerRow.length - 1, 1), 7);
        const importedColumns: string[] = [];
        const importedColumnDays: Record<string, string> = {};

        for (let c = 0; c < numCols; c++) {
          const colId = makeId('col');
          importedColumns.push(colId);
          importedColumnDays[colId] = headerRow[c + 1] || FULL_WEEK_DAYS[c] || `Thứ ${c + 2}`;
        }

        const importedRows: ScheduleRow[] = [];
        for (let r = 1; r < rawJson.length; r++) {
          const rowData = rawJson[r] || [];
          if (rowData.length === 0) continue;

          const rawPeriodLabel = String(rowData[0] || '');
          const timeMatch = rawPeriodLabel.match(/\((.*?)\)/);
          const timeRange = timeMatch ? timeMatch[1] : DEFAULT_PERIOD_TIMES[r - 1] || '07:00 - 07:45';

          const cells: Record<string, string> = {};
          importedColumns.forEach((colId, cIdx) => {
            const rawVal = rowData[cIdx + 1];
            cells[colId] =
              rawVal !== undefined && String(rawVal).trim() !== '' && String(rawVal) !== '-trống-'
                ? String(rawVal)
                : '';
          });

          importedRows.push({
            id: makeId('row'),
            timeRange,
            cells,
          });
        }

        if (importedRows.length === 0) {
          showToast('Không đọc được dữ liệu tiết học từ file Excel', 'error');
          return;
        }

        updateGridWithHistory({
          columns: importedColumns,
          columnDays: importedColumnDays,
          rows: importedRows,
        });

        setIsEditMode(true);
        showToast('Đã nhập dữ liệu từ file Excel thành công!', 'success');
      } catch {
        showToast('Đọc file Excel thất bại, vui lòng kiểm tra lại định dạng file!', 'error');
      } finally {
        if (excelInputRef.current) {
          excelInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Safe tab switch with unsaved check
  const handleSelectTab = (tab: 'class' | 'teacher' | 'room') => {
    if (tab === scheduleTab) return;
    if (isEditMode && hasUnsavedChanges) {
      setPendingNavigationAction(() => () => setScheduleTab(tab));
      setShowUnsavedWarningModal(true);
      return;
    }
    setScheduleTab(tab);
  };

  // Safe target switch with unsaved check
  const handleSelectClass = (cId: string) => {
    if (cId === selectedClassId) return;
    if (isEditMode && hasUnsavedChanges) {
      setPendingNavigationAction(() => () => setSelectedClassId(cId));
      setShowUnsavedWarningModal(true);
      return;
    }
    setSelectedClassId(cId);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100 select-none pb-12 animate-in fade-in duration-200">
      {/* Hidden file input for Excel import */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Bar: Breadcrumb + Screen Name on same horizontal row */}
      <PageHeader
        breadcrumbItems={[
          { label: 'Lớp học', href: '/teacher/classes' },
          { label: 'Thời khóa biểu' },
        ]}
        title="Thời Khóa Biểu Thông Minh"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#031526] border border-[#0e3d54] text-cyan-300 px-2.5 py-1 rounded-lg">
              {scheduleTab === 'class' ? 'Lịch lớp học' : scheduleTab === 'teacher' ? 'Lịch giáo viên' : 'Lịch phòng học'}
            </span>
          </div>
        }
      />

      {/* ======================================================== */}
      {/* 1. TOP BAR: TABS & BỘ CHỌN LỚP (GIỐNG HÌNH 1, 2, 3)        */}
      {/* ======================================================== */}
      <div className="bg-[#031526] border border-[#0e3d54] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Left Tabs: Lịch lớp học, Lịch giáo viên, Lịch phòng học */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelectTab('class')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scheduleTab === 'class'
                ? 'bg-[#06b6d4] text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-[#061d33]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Lịch lớp học</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scheduleTab === 'teacher'
                ? 'bg-[#06b6d4] text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-[#061d33]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Lịch giáo viên</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('room')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scheduleTab === 'room'
                ? 'bg-[#06b6d4] text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-[#061d33]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Lịch phòng học</span>
          </button>
        </div>

        {/* Right Selectors: CHỌN LỚP / CHỌN GIÁO VIÊN / CHỌN PHÒNG */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-300 tracking-wider">
            {scheduleTab === 'class'
              ? 'CHỌN LỚP:'
              : scheduleTab === 'teacher'
              ? 'CHỌN GIÁO VIÊN:'
              : 'CHỌN PHÒNG:'}
          </span>

          {scheduleTab === 'class' && (
            <select
              value={selectedClassId}
              onChange={(e) => handleSelectClass(e.target.value)}
              className="bg-[#041627] border border-[#0e3d54] text-white text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer shadow-inner"
            >
              {CLASS_LIST.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#031526] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {scheduleTab === 'teacher' && (
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                if (isEditMode && hasUnsavedChanges) {
                  setPendingNavigationAction(() => () => setSelectedTeacherId(e.target.value));
                  setShowUnsavedWarningModal(true);
                  return;
                }
                setSelectedTeacherId(e.target.value);
              }}
              className="bg-[#041627] border border-[#0e3d54] text-white text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer shadow-inner"
            >
              {TEACHER_LIST.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#031526] text-white">
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {scheduleTab === 'room' && (
            <select
              value={selectedRoomId}
              onChange={(e) => {
                if (isEditMode && hasUnsavedChanges) {
                  setPendingNavigationAction(() => () => setSelectedRoomId(e.target.value));
                  setShowUnsavedWarningModal(true);
                  return;
                }
                setSelectedRoomId(e.target.value);
              }}
              className="bg-[#041627] border border-[#0e3d54] text-white text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer shadow-inner"
            >
              {ROOM_LIST.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#031526] text-white">
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THANH CÔNG CỤ (TOOLBAR) ĐÚNG 6 NÚT CHÍNH + NÚT LƯU      */}
      {/* ======================================================== */}
      <div className="bg-[#031526] border border-[#0e3d54] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút 1: Chỉnh sửa / Đang chỉnh sửa */}
          <button
            type="button"
            onClick={handleToggleEditMode}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isEditMode
                ? 'bg-[#06b6d4] text-slate-950 font-black shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300'
                : 'border border-[#06b6d4] text-white hover:bg-[#062035] hover:border-cyan-300'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}</span>
          </button>

          {/* Nút 2: Xóa (đỏ/hồng) / Chế độ xóa: BẬT */}
          <button
            type="button"
            onClick={handleToggleDeleteMode}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDeleteMode
                ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-500/30 ring-1 ring-rose-400 animate-pulse'
                : 'border border-rose-600/90 text-white hover:bg-rose-950/40 hover:border-rose-500'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{isDeleteMode ? 'Chế độ xóa: BẬT' : 'Xóa'}</span>
          </button>

          {/* Nút 3: Hoàn tác (Ctrl+Z) */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Hoàn tác (Ctrl+Z)"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              undoStack.length > 0
                ? 'border-[#0e3d54] text-slate-200 hover:text-white hover:border-cyan-500 hover:bg-[#062035] cursor-pointer'
                : 'border-[#0e3d54]/50 text-slate-600 cursor-not-allowed opacity-40'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>

          {/* Nút 4: Làm lại (Ctrl+Y) */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Làm lại (Ctrl+Y)"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              redoStack.length > 0
                ? 'border-[#0e3d54] text-slate-200 hover:text-white hover:border-cyan-500 hover:bg-[#062035] cursor-pointer'
                : 'border-[#0e3d54]/50 text-slate-600 cursor-not-allowed opacity-40'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>

          {/* Nút 5: Import Excel */}
          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/80 text-white hover:bg-emerald-950/40 hover:border-emerald-400 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          {/* Nút 6: Xuất thời khóa biểu */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#06b6d4] text-white hover:bg-cyan-950/40 hover:border-cyan-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xuất thời khóa biểu</span>
          </button>
        </div>

        {/* Nút LƯU (Chỉ xuất hiện khi đang ở chế độ Chỉnh sửa - nằm bên phải thanh công cụ) */}
        {isEditMode && (
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 cursor-pointer animate-in fade-in"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. CÁC BANNER HƯỚNG DẪN (GIỐNG HÌNH 2 VÀ HÌNH 3)           */}
      {/* ======================================================== */}

      {/* BANNER 1 (ĐỎ/HỒNG): CHẾ ĐỘ XÓA Ô ĐANG BẬT - HÌNH 3 */}
      {isDeleteMode && (
        <div className="border border-rose-800 bg-[#290d18] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Chế độ xóa ô đang bật: Nhấp vào bất kỳ ô thời khóa biểu nào để xóa nội dung về{' '}
              <span className="bg-rose-950 border border-rose-700 text-white font-mono font-bold px-1.5 py-0.5 rounded text-[11px]">
                -trống-
              </span>{' '}
              . Nhấp lại nút Xóa để thoát.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteMode(false)}
            className="bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Đóng chế độ xóa
          </button>
        </div>
      )}

      {/* BANNER 2 (CYAN): CHẾ ĐỘ CHỈNH SỬA ĐANG BẬT - HÌNH 2 & 3 */}
      {isEditMode && (
        <div className="border border-cyan-800 bg-[#042436] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-cyan-200 animate-in fade-in">
          <Pencil className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Chế độ chỉnh sửa đang bật: Nhấp trực tiếp vào ô để gõ bài học (nhấn Enter xuống dòng giống Word); hàng tự động giãn chiều cao đồng bộ. Nhớ nhấn{' '}
            <strong className="text-emerald-400 font-bold">Lưu</strong> khi hoàn thành.
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. KHUNG BẢNG THỜI KHÓA BIỂU CHÍNH                        */}
      {/* ======================================================== */}
      <div className="bg-[#031526] border border-[#0e3d54] rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center table-fixed min-w-[760px]">
            {/* Header: Tiết / Giờ & Thứ 2 -> Thứ N */}
            <thead>
              <tr className="border-b border-[#0e3d54] bg-[#041c30]">
                {/* Cột 1: Tiết / Giờ */}
                <th className="w-40 p-3.5 text-center text-xs font-bold text-white border-r border-[#0e3d54]">
                  Tiết / Giờ
                </th>

                {/* Các cột Thứ: Thứ 2, Thứ 3... */}
                {grid.columns.map((colId) => {
                  const dayTitle = grid.columnDays[colId] || 'Thứ';
                  return (
                    <th
                      key={colId}
                      className="p-3.5 text-center text-xs font-bold text-white border-r border-[#0e3d54]"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{dayTitle}</span>
                        {/* Trong chế độ chỉnh sửa: hiển thị icon + màu xanh và × màu hồng (Hình 2 & 3) */}
                        {isEditMode && (
                          <div className="inline-flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddColumn();
                              }}
                              title="Thêm cột ngày mới theo thứ tự"
                              className="text-emerald-400 hover:text-emerald-300 font-extrabold text-sm px-1 transition-transform hover:scale-125 cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerDeleteColumn(colId);
                              }}
                              title="Xóa cột ngày này"
                              className="text-rose-400 hover:text-rose-300 font-extrabold text-sm px-1 transition-transform hover:scale-125 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Cột hành động xóa hàng (chỉ hiển thị khi đang ở chế độ Chỉnh sửa) */}
                {isEditMode && (
                  <th className="w-12 p-3 text-center text-xs font-bold text-slate-500">
                    {/* Header trống cho cột xóa hàng */}
                  </th>
                )}
              </tr>
            </thead>

            {/* Body: Các hàng tương ứng Tiết 1, Tiết 2... Tiết N */}
            <tbody className="divide-y divide-[#0e3d54]">
              {grid.rows.map((row, rowIndex) => {
                const periodLabel = `Tiết ${rowIndex + 1}`;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#051c33]/40 transition-colors"
                  >
                    {/* Cột 1: Tiết N và Khoảng Giờ */}
                    <td className="p-3 text-center border-r border-[#0e3d54] bg-[#031526] align-middle">
                      <div className="space-y-1">
                        <div className="font-bold text-xs sm:text-sm text-white">
                          {periodLabel}
                        </div>
                        <button
                          type="button"
                          disabled={!isEditMode}
                          onClick={() => handleOpenEditPeriodTime(rowIndex)}
                          title={isEditMode ? 'Nhấp để chỉnh sửa thời gian tiết học' : undefined}
                          className={`inline-flex items-center justify-center gap-1 text-[11px] font-mono transition-colors ${
                            isEditMode
                              ? 'text-cyan-300 hover:text-cyan-200 border-b border-dotted border-cyan-400/80 cursor-pointer'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{row.timeRange}</span>
                        </button>
                      </div>
                    </td>

                    {/* Các cột Thứ: Ô nội dung môn học / bài học */}
                    {grid.columns.map((colId) => {
                      const cellValue = row.cells[colId] || '';
                      const isEmpty = !cellValue || cellValue.trim() === '';
                      const isCellEditing =
                        isEditMode &&
                        !isDeleteMode &&
                        editingCell?.rowIndex === rowIndex &&
                        editingCell?.colId === colId;

                      return (
                        <td
                          key={colId}
                          onClick={() => {
                            if (isDeleteMode) {
                              handleQuickDeleteCell(rowIndex, colId);
                            } else if (isEditMode && !isCellEditing) {
                              setEditingCell({ rowIndex, colId });
                            }
                          }}
                          className={`p-2.5 text-center border-r border-[#0e3d54] align-middle relative transition-colors ${
                            isDeleteMode
                              ? 'hover:bg-rose-950/40 hover:text-rose-300 cursor-pointer'
                              : isEditMode
                              ? 'hover:bg-[#062038] cursor-pointer'
                              : ''
                          }`}
                        >
                          {isCellEditing ? (
                            /* Ô đang chỉnh sửa trực tiếp giống MS Word */
                            <WordCellEditor
                              initialValue={cellValue}
                              onSave={(val) => handleSaveCellContent(rowIndex, colId, val)}
                              onCancel={() => setEditingCell(null)}
                            />
                          ) : (
                            /* Ô hiển thị thông thường */
                            <div className="min-h-[40px] flex items-center justify-center px-1">
                              {isEmpty ? (
                                <span className="italic text-slate-500 font-medium text-xs select-none">
                                  -trống-
                                </span>
                              ) : (
                                <div className="text-white text-xs sm:text-sm font-semibold whitespace-pre-line leading-relaxed break-words max-w-full">
                                  {cellValue}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Cột Xóa hàng: Thùng rác màu hồng ở cuối mỗi hàng (chỉ khi Chỉnh sửa) */}
                    {isEditMode && (
                      <td className="p-2 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => triggerDeleteRow(rowIndex)}
                          title={`Xóa ${periodLabel} trên tất cả các ngày`}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Nút: + Thêm tiết học mới (dưới cùng bảng khi đang ở chế độ Chỉnh sửa - Quy tắc 6) */}
        {isEditMode && (
          <div className="border-t border-[#0e3d54] bg-[#041a2e] p-2.5 flex items-center justify-center">
            <button
              type="button"
              onClick={handleAddPeriodRow}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-cyan-300 hover:text-cyan-100 hover:bg-[#06243f] rounded-xl border border-cyan-800/80 hover:border-cyan-500 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Thêm tiết học mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Ghi chú lưu trữ demo */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
        <span>* Giao diện chuẩn Dark Mode đồng bộ hệ thống trường học</span>
        <span>Dữ liệu được lưu trữ an toàn trong LocalStorage cho lớp/giáo viên hiện tại</span>
      </div>

      {/* ======================================================== */}
      {/* 5. FLOATING TOAST: CHẾ ĐỘ XÓA Ô ĐANG BẬT (HÌNH 3)         */}
      {/* ======================================================== */}
      {showDeleteToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#041c2f] border border-cyan-600/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1 pr-2">
            <div className="text-xs font-bold text-white leading-snug">
              Chế độ Xóa ô đang BẬT: Nhấp vào ô bất kỳ để xóa nội dung về -trống-
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-medium">info</div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteToast(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODALS & DIALOGS                                       */}
      {/* ======================================================== */}

      {/* Modal 1: Thông báo lỗi tối đa 7 ngày */}
      {showMaxDaysModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#031526] border border-[#0e3d54] rounded-2xl max-w-md w-full p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lỗi giới hạn cột</h3>
              <p className="text-xs text-rose-300 mt-1.5 font-medium">
                Lỗi: Tuần chỉ có 7 ngày.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Không thể thêm cột vì thời khóa biểu chỉ mở rộng tối đa từ Thứ 2 đến Chủ Nhật.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMaxDaysModal(false)}
              className="w-full py-2.5 bg-[#06b6d4] hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Xác nhận xóa cột ngày */}
      {columnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#031526] border border-rose-800/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Xác nhận xóa cột ngày</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bạn có chắc chắn muốn xóa cột <strong>{columnToDelete.dayName}</strong>?
                </p>
              </div>
            </div>
            <p className="text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-900/60 leading-relaxed">
              Toàn bộ dữ liệu bài học trong ngày này sẽ bị xóa khỏi bản nháp. Bạn có thể Hoàn tác trước khi Lưu.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setColumnToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#0e3d54] text-slate-300 hover:text-white hover:bg-[#062035] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteColumn}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Xác nhận xóa hàng tiết học */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#031526] border border-rose-800/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Xác nhận xóa tiết học</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Xác nhận xóa <strong>{rowToDelete.periodName}</strong> trên tất cả các ngày?
                </p>
              </div>
            </div>
            <p className="text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-900/60 leading-relaxed">
              Sau khi xóa, các tiết tiếp theo sẽ tự động được đánh số lại để đảm bảo thứ tự liên tục. Bạn có thể Hoàn tác trước khi bấm Lưu.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#0e3d54] text-slate-300 hover:text-white hover:bg-[#062035] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteRow}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                Xóa tiết này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Cảnh báo chưa lưu thay đổi */}
      {showUnsavedWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#031526] border border-amber-600/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bạn chưa lưu thay đổi</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bạn có các chỉnh sửa chưa lưu trong bản nháp thời khóa biểu.
                </p>
              </div>
            </div>
            <p className="text-xs text-amber-200 bg-amber-950/60 p-3 rounded-xl border border-amber-900/60 leading-relaxed">
              Nếu bạn thoát hoặc chuyển mục mà không Lưu, các thay đổi vừa chỉnh sửa sẽ bị mất.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedWarningModal(false);
                  setPendingNavigationAction(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#0e3d54] text-slate-300 hover:text-white hover:bg-[#062035] transition-colors cursor-pointer"
              >
                Ở lại tiếp tục sửa
              </button>
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/80 transition-colors cursor-pointer"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  if (pendingNavigationAction) {
                    pendingNavigationAction();
                    setPendingNavigationAction(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black transition-colors cursor-pointer shadow-md shadow-emerald-500/25"
              >
                Lưu ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Sửa thời gian tiết học */}
      {editingPeriodTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#031526] border border-cyan-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Chỉnh sửa giờ Tiết {editingPeriodTime.rowIndex + 1}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập giờ bắt đầu và giờ kết thúc tiết học
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Giờ bắt đầu:
                </label>
                <input
                  type="time"
                  value={tempStartTime}
                  onChange={(e) => setTempStartTime(e.target.value)}
                  className="w-full bg-[#041627] border border-[#0e3d54] text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Giờ kết thúc:
                </label>
                <input
                  type="time"
                  value={tempEndTime}
                  onChange={(e) => setTempEndTime(e.target.value)}
                  className="w-full bg-[#041627] border border-[#0e3d54] text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingPeriodTime(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#0e3d54] text-slate-300 hover:text-white hover:bg-[#062035] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePeriodTime}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#06b6d4] hover:bg-cyan-500 text-slate-950 font-black transition-colors cursor-pointer shadow-md shadow-cyan-500/25"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// COMPONENT: WORD CELL EDITOR (Trải nghiệm nhập liệu giống MS Word)
// - Click vào ô hiện ngay con trỏ nháy |
// - Nhấn Enter là xuống dòng trong ô
// - Tự động giãn chiều cao theo nội dung
// - Click ra ngoài áp dụng tạm thời vào bản nháp
// =========================================================================
interface WordCellEditorProps {
  initialValue: string;
  onSave: (val: string) => void;
  onCancel: () => void;
}

const WordCellEditor: React.FC<WordCellEditorProps> = ({ initialValue, onSave, onCancel }) => {
  const [val, setVal] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and place cursor at end
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 44)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onSave(val);
    }
    // Enter key naturally creates a new line in textarea (like MS Word)!
  };

  return (
    <div className="w-full h-full min-h-[44px] flex items-center justify-center p-0.5">
      <textarea
        ref={textareaRef}
        rows={1}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          adjustHeight();
        }}
        onBlur={() => onSave(val)}
        onKeyDown={handleKeyDown}
        placeholder="-trống-"
        className="w-full bg-[#031c30] text-white border border-[#06b6d4] rounded-lg p-2 text-xs sm:text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-cyan-300 resize-none overflow-hidden placeholder:italic placeholder:text-slate-500 shadow-inner"
        style={{ minHeight: '44px' }}
      />
    </div>
  );
};
