import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Sprout,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { FarmTask, TaskCategory } from '../../types/farm';
import { formatNaira, formatWeight } from '../../utils/finance';

export const TasksCalendarView: React.FC = () => {
  const {
    tasks,
    crops,
    fields,
    expenses,
    sales,
    harvests,
    financialSummary,
    cropProfitability,
    toggleTaskStatus,
    updateTask,
    deleteTask,
    openModal,
    setActiveSection,
    showToast,
  } = useFarm();

  // Primary sub-view toggle
  const [currentTab, setCurrentTab] = useState<'calendar' | 'list' | 'reports' | 'exports'>('calendar');

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State (Default to current date: October 2026)
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 9, 1)); // October 2026
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  // Today reference
  const todayStr = '2026-10-21';

  // 1. Reminders & Urgency Calculations
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const upcomingReminders = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.status !== 'completed' &&
        t.dueDate >= todayStr &&
        t.dueDate <= '2026-10-28'
    );
  }, [tasks, todayStr]);

  // Snooze task helper (+1, +3, +7 days)
  const handleSnooze = async (task: FarmTask, daysToAdd: number) => {
    const current = new Date(task.dueDate);
    const newDate = new Date(current.getTime() + daysToAdd * 86400000)
      .toISOString()
      .split('T')[0];

    await updateTask(task.id, {
      dueDate: newDate,
      reminderDate: newDate,
      isReminderActive: true,
    });

    showToast({
      type: 'info',
      title: 'Task Rescheduled',
      message: `"${task.title}" pushed to ${newDate}.`,
    });
  };

  // Toggle reminder alert helper
  const handleToggleReminder = async (task: FarmTask) => {
    const nextState = !task.isReminderActive;
    await updateTask(task.id, {
      isReminderActive: nextState,
      reminderDate: nextState ? task.dueDate : undefined,
    });
    showToast({
      type: 'info',
      title: nextState ? 'Reminder Enabled' : 'Reminder Muted',
      message: nextState
        ? `Alert set for ${task.dueDate}`
        : 'Alert notifications silenced.',
    });
  };

  // 2. Calendar Month Construction
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells: {
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      cells.push({
        dayNumber: dayNum,
        dateString: `${prevYear}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateString = `${year}-${mStr}-${dStr}`;
      cells.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Trailing days from next month to complete 35 or 42 grid
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        dayNumber: d,
        dateString: `${nextYear}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayOfWeek, daysInPrevMonth, todayStr]);

  // Tasks grouped by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, FarmTask[]>();
    tasks.forEach((t) => {
      const existing = map.get(t.dueDate) || [];
      existing.push(t);
      map.set(t.dueDate, existing);
    });
    return map;
  }, [tasks]);

  // Filtered tasks for List View
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        filterPriority === 'all' || t.priority === filterPriority;

      const isDone = t.status === 'completed';
      const isOverdue = !isDone && t.dueDate < todayStr;

      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'completed'
          ? isDone
          : filterStatus === 'overdue'
          ? isOverdue
          : filterStatus === 'active'
          ? !isDone
          : true;

      const matchesCategory =
        filterCategory === 'all' || t.category === filterCategory;

      return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
    });
  }, [tasks, searchQuery, filterPriority, filterStatus, filterCategory, todayStr]);

  // Selected day items
  const selectedDayTasks = selectedDayString ? tasksByDate.get(selectedDayString) || [] : [];

  // ==========================================
  // CSV EXPORT GENERATORS
  // ==========================================
  const downloadCSV = (filename: string, content: string) => {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTasksCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Category',
      'Due Date',
      'Priority',
      'Status',
      'Assignee',
      'Reminder Date',
      'Reminder Time',
      'Field Block',
      'Crop Enterprise',
      'Notes',
    ];

    const rows = tasks.map((t) => {
      const f = fields.find((item) => item.id === t.fieldId);
      const c = crops.find((item) => item.id === t.cropId);
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category || 'General',
        t.dueDate,
        t.priority,
        t.status,
        `"${t.assignedTo}"`,
        t.reminderDate || '',
        t.reminderTime || '',
        `"${f?.name || ''}"`,
        `"${c?.name || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    downloadCSV(
      `FarmPilot_Tasks_Schedule_${todayStr}.csv`,
      [headers.join(','), ...rows].join('\n')
    );

    showToast({
      type: 'success',
      title: 'Tasks Exported',
      message: `${tasks.length} tasks and reminders exported to CSV.`,
    });
  };

  const exportTransactionsCSV = () => {
    const headers = [
      'Transaction ID',
      'Type',
      'Date',
      'Category / Enterprise',
      'Description / Party',
      'Amount (NGN)',
      'Payment Method',
      'Payment Status',
      'Voucher / Waybill #',
    ];

    const salesRows = sales.map((s) => [
      s.id,
      'SALE_INVOICE',
      s.date,
      `"${crops.find((c) => c.id === s.cropId)?.name || 'Crop Produce'}"`,
      `"Sale to ${s.buyerName.replace(/"/g, '""')}"`,
      s.totalAmount,
      s.paymentMethod || 'Bank Transfer',
      s.paymentStatus,
      s.invoiceNumber || s.waybillNumber || '',
    ]);

    const expenseRows = expenses.map((e) => [
      e.id,
      'EXPENSE',
      e.date,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')} (Vendor: ${e.vendor})"`,
      -e.amount,
      e.paymentMethod,
      e.paymentStatus,
      e.receiptNumber || '',
    ]);

    const all = [...salesRows, ...expenseRows].sort(
      (a, b) => new Date(b[2]).getTime() - new Date(a[2]).getTime()
    );

    downloadCSV(
      `FarmPilot_Financial_Ledger_${todayStr}.csv`,
      [headers.join(','), ...all.map((r) => r.join(','))].join('\n')
    );

    showToast({
      type: 'success',
      title: 'Ledger Exported',
      message: `${all.length} income and expense transactions exported.`,
    });
  };

  const exportSalesReceivablesCSV = () => {
    const headers = [
      'Invoice #',
      'Buyer / Off-taker',
      'Buyer Phone',
      'Crop Enterprise',
      'Date',
      'Due Date',
      'Quantity Dispatched',
      'Unit Price (NGN)',
      'Total Amount (NGN)',
      'Amount Paid (NGN)',
      'Outstanding Debt (NGN)',
      'Status',
      'Waybill #',
      'Vehicle Plate',
      'Driver Name',
    ];

    const rows = sales.map((s) => {
      const c = crops.find((item) => item.id === s.cropId);
      return [
        s.invoiceNumber,
        `"${s.buyerName.replace(/"/g, '""')}"`,
        `"${s.buyerPhone || ''}"`,
        `"${c?.name || ''}"`,
        s.date,
        s.dueDate || '',
        `${s.quantitySold} ${s.unit}`,
        s.unitPrice,
        s.totalAmount,
        s.amountPaid,
        s.outstandingAmount,
        s.paymentStatus,
        `"${s.waybillNumber || ''}"`,
        `"${s.vehicleNumber || ''}"`,
        `"${s.driverName || ''}"`,
      ].join(',');
    });

    downloadCSV(
      `FarmPilot_Sales_Receivables_${todayStr}.csv`,
      [headers.join(','), ...rows].join('\n')
    );

    showToast({
      type: 'success',
      title: 'Sales & Receivables Exported',
      message: `${sales.length} invoices downloaded to CSV.`,
    });
  };

  const exportExpensesCSV = () => {
    const headers = [
      'Expense ID',
      'Date',
      'Category',
      'Description',
      'Amount (NGN)',
      'Vendor / Payee',
      'Receipt #',
      'Payment Method',
      'Payment Status',
      'Linked Crop',
      'Linked Field',
    ];

    const rows = expenses.map((e) => {
      const c = crops.find((item) => item.id === e.cropId);
      const f = fields.find((item) => item.id === e.fieldId);
      return [
        e.id,
        e.date,
        e.category,
        `"${e.description.replace(/"/g, '""')}"`,
        e.amount,
        `"${e.vendor.replace(/"/g, '""')}"`,
        `"${e.receiptNumber || ''}"`,
        e.paymentMethod,
        e.paymentStatus,
        `"${c?.name || 'General Overhead'}"`,
        `"${f?.name || 'Whole Farm'}"`,
      ].join(',');
    });

    downloadCSV(
      `FarmPilot_Operating_Expenses_${todayStr}.csv`,
      [headers.join(','), ...rows].join('\n')
    );

    showToast({
      type: 'success',
      title: 'Expenses Exported',
      message: `${expenses.length} operating expenses downloaded.`,
    });
  };

  const exportHarvestsCSV = () => {
    const headers = [
      'Harvest ID',
      'Batch Number',
      'Crop Enterprise',
      'Field Block',
      'Harvest Date',
      'Quantity',
      'Unit',
      'Normalized Weight (Kg)',
      'Grade Quality',
      'Storage Location',
      'Moisture (%)',
      'Notes',
    ];

    const rows = harvests.map((h) => {
      const c = crops.find((item) => item.id === h.cropId);
      const f = fields.find((item) => item.id === h.fieldId);
      return [
        h.id,
        `"${h.batchNumber || ''}"`,
        `"${c?.name || ''}"`,
        `"${f?.name || ''}"`,
        h.date,
        h.quantity,
        h.unit,
        h.normalizedKg,
        `"${h.gradeQuality}"`,
        `"${h.storageLocation}"`,
        h.moisturePercent || '',
        `"${(h.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    downloadCSV(
      `FarmPilot_Harvest_Stock_${todayStr}.csv`,
      [headers.join(','), ...rows].join('\n')
    );

    showToast({
      type: 'success',
      title: 'Harvests Exported',
      message: `${harvests.length} harvest logs downloaded to CSV.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#181a19]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight text-[#181a19]">
              Tasks & Reports Suite
            </h2>
          </div>
          <p className="text-xs text-[#181a19]/60 mt-0.5">
            Smart reminders, visual operations calendar, audited financial statements, and CSV exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal('create_task')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Farm Task</span>
          </button>
        </div>
      </div>

      {/* Reminders & Alerts Notification Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Overdue Alert Box */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
            overdueTasks.length > 0
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-white border-[#181a19]/10 text-[#181a19]/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle
              className={`w-4 h-4 shrink-0 ${
                overdueTasks.length > 0 ? 'text-rose-600' : 'text-[#181a19]/40'
              }`}
            />
            <div>
              <span className="text-xs font-bold block">
                {overdueTasks.length} Overdue Task{overdueTasks.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] opacity-70 block">
                {overdueTasks.length > 0
                  ? 'Immediate field follow-up required'
                  : 'All farm schedules on track'}
              </span>
            </div>
          </div>
          {overdueTasks.length > 0 && (
            <span className="text-xs font-mono font-bold bg-rose-200/80 px-2 py-0.5 rounded text-rose-900">
              Action Needed
            </span>
          )}
        </div>

        {/* Today's Schedule Box */}
        <div className="p-3.5 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold block">
                {todayTasks.length} Action{todayTasks.length === 1 ? '' : 's'} Due Today
              </span>
              <span className="text-[10px] text-emerald-800/80 block">
                Date: {todayStr}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-900">
            {todayTasks.length}
          </span>
        </div>

        {/* 7-Day Reminder Outlook Box */}
        <div className="p-3.5 rounded-xl border bg-white border-[#181a19]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#181a19] block">
                {upcomingReminders.length} Active Reminder{upcomingReminders.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] text-[#181a19]/50 block">
                Scheduled in next 7 operational days
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
            Outlook
          </span>
        </div>
      </div>

      {/* Sub-view Navigation Strip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#181a19]/10 rounded-xl w-fit">
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            currentTab === 'calendar'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Interactive Calendar</span>
        </button>

        <button
          onClick={() => setCurrentTab('list')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            currentTab === 'list'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Tasks & Reminders List ({tasks.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            currentTab === 'reports'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Financial Reports</span>
        </button>

        <button
          onClick={() => setCurrentTab('exports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            currentTab === 'exports'
              ? 'bg-[#16422b] text-white shadow-xs'
              : 'text-[#181a19]/70 hover:text-[#181a19] hover:bg-[#fafaf7]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV Data Exports</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-VIEW 1: INTERACTIVE CALENDAR GRID                     */}
      {/* ========================================================= */}
      {currentTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Calendar Controls & Month Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#181a19]/10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#181a19]">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-sm">
                  Active Planting & Harvest Cycle
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg border border-[#181a19]/15 hover:bg-[#fafaf7] text-[#181a19]/70 hover:text-[#181a19]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date(2026, 9, 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#181a19]/15 hover:bg-[#fafaf7] text-[#181a19]"
                >
                  Today (Oct 2026)
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg border border-[#181a19]/15 hover:bg-[#fafaf7] text-[#181a19]/70 hover:text-[#181a19]"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Header Strip */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[#181a19]/60 pb-2 mb-1 border-b border-[#181a19]/5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
              {calendarCells.map((cell) => {
                const dayTasks = tasksByDate.get(cell.dateString) || [];
                const isSelected = selectedDayString === cell.dateString;

                return (
                  <div
                    key={cell.dateString}
                    onClick={() =>
                      setSelectedDayString(isSelected ? null : cell.dateString)
                    }
                    className={`min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      cell.isToday
                        ? 'border-[#16422b] bg-[#16422b]/5 ring-1 ring-[#16422b]/30'
                        : isSelected
                        ? 'border-[#16422b] bg-white ring-2 ring-[#16422b]'
                        : cell.isCurrentMonth
                        ? 'bg-white border-[#181a19]/10 hover:border-[#16422b]/40 hover:bg-[#fafaf7]'
                        : 'bg-[#fafaf7]/50 border-transparent opacity-40'
                    }`}
                  >
                    {/* Date Number + Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          cell.isToday
                            ? 'w-5 h-5 rounded-full bg-[#16422b] text-white flex items-center justify-center text-[11px]'
                            : cell.isCurrentMonth
                            ? 'text-[#181a19]'
                            : 'text-[#181a19]/40'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>

                    {/* Day Task Event Pills */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                            t.status === 'completed'
                              ? 'bg-slate-100 text-slate-500 line-through'
                              : t.priority === 'high'
                              ? 'bg-rose-100 text-rose-900 font-semibold'
                              : t.category === 'Spraying / Chemical'
                              ? 'bg-purple-100 text-purple-900'
                              : t.category === 'Financial & Billing'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                          title={`${t.title} (${t.assignedTo})`}
                        >
                          {t.title}
                        </div>
                      ))}

                      {dayTasks.length > 2 && (
                        <span className="text-[9px] font-mono font-semibold text-[#181a19]/50 block">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Footer micro-details */}
                    <div className="text-[9px] text-[#181a19]/40 font-mono">
                      {dayTasks.length > 0 ? `${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector Panel (if clicked) */}
          {selectedDayString && (
            <div className="p-5 bg-white border border-[#16422b]/30 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Schedule for {selectedDayString}{' '}
                    {selectedDayString === todayStr && (
                      <span className="text-xs text-[#16422b] font-normal font-mono">(Today)</span>
                    )}
                  </h4>
                  <p className="text-xs text-[#181a19]/60">
                    {selectedDayTasks.length} operational events scheduled on this date
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('create_task')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task Here</span>
                  </button>
                  <button
                    onClick={() => setSelectedDayString(null)}
                    className="text-[#181a19]/40 hover:text-[#181a19] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-[#181a19]/50 py-3">
                  No tasks or reminders scheduled on this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`mt-0.5 transition-colors ${
                            t.status === 'completed'
                              ? 'text-[#16422b]'
                              : 'text-[#181a19]/30 hover:text-[#16422b]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <p
                            className={`font-semibold ${
                              t.status === 'completed'
                                ? 'line-through text-[#181a19]/50'
                                : 'text-[#181a19]'
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="text-[11px] text-[#181a19]/60 mt-0.5">
                            {t.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#181a19]/50 mt-1 font-mono">
                            <span>Assignee: {t.assignedTo}</span>
                            <span>·</span>
                            <span>Category: {t.category || 'General'}</span>
                            {t.isReminderActive && (
                              <>
                                <span>·</span>
                                <span className="text-amber-800 font-semibold">
                                  🔔 Alert: {t.reminderTime || '08:00'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSnooze(t, 1)}
                          className="px-2 py-1 text-[10px] font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-white border border-[#181a19]/10 rounded"
                        >
                          +1 Day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSnooze(t, 3)}
                          className="px-2 py-1 text-[10px] font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-white border border-[#181a19]/10 rounded"
                        >
                          +3 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleReminder(t)}
                          className="p-1 text-[#181a19]/50 hover:text-[#181a19]"
                          title={t.isReminderActive ? 'Disable reminder' : 'Enable reminder'}
                        >
                          {t.isReminderActive ? (
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <BellOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 2: TASKS & REMINDERS LIST                        */}
      {/* ========================================================= */}
      {currentTab === 'list' && (
        <div className="space-y-4">
          {/* Filter toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-[#181a19]/10 rounded-xl p-3.5 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Categories</option>
                <option value="Agronomic">Agronomic</option>
                <option value="Spraying / Chemical">Spraying / Chemical</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Machinery">Machinery</option>
                <option value="Harvest">Harvest</option>
                <option value="Financial & Billing">Financial & Billing</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Task list container */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#181a19]/15">
              <Calendar className="w-8 h-8 text-[#181a19]/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#181a19]">No matching tasks</p>
              <p className="text-xs text-[#181a19]/50 mt-1 mb-4">
                Schedule a field task, pesticide spray, or customer billing reminder.
              </p>
              <button
                onClick={() => openModal('create_task')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] rounded-lg shadow-xs"
              >
                + Create Farm Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'completed';
                const isOverdue = !isDone && task.dueDate < todayStr;
                const linkedCrop = crops.find((c) => c.id === task.cropId);
                const linkedField = fields.find((f) => f.id === task.fieldId);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-[#fafaf7] border-[#181a19]/10 opacity-70'
                        : isOverdue
                        ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                        : 'bg-white border-[#181a19]/10 hover:border-[#16422b]/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 transition-colors shrink-0 ${
                          isDone
                            ? 'text-[#16422b]'
                            : 'text-[#181a19]/30 hover:text-[#16422b]'
                        }`}
                        aria-label="Toggle completed"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-bold truncate ${
                              isDone
                                ? 'line-through text-[#181a19]/50'
                                : 'text-[#181a19]'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.category && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#181a19]/5 text-[#181a19]/70 shrink-0">
                              {task.category}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#181a19]/60 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#181a19]/60 mt-2 font-mono tabular-nums">
                          <span
                            className={
                              isOverdue ? 'text-rose-600 font-bold' : 'text-[#181a19]'
                            }
                          >
                            Due: {task.dueDate} {isOverdue && '(OVERDUE)'}
                          </span>
                          <span>·</span>
                          <span>Assignee: {task.assignedTo}</span>
                          {linkedField && (
                            <>
                              <span>·</span>
                              <span>Field: {linkedField.name}</span>
                            </>
                          )}
                          {linkedCrop && (
                            <>
                              <span>·</span>
                              <span>Crop: {linkedCrop.name}</span>
                            </>
                          )}
                          {task.isReminderActive && (
                            <>
                              <span>·</span>
                              <span className="text-amber-800 font-semibold flex items-center gap-1">
                                <Bell className="w-3 h-3 text-amber-600" />
                                {task.reminderTime || '08:00'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleSnooze(task, 1)}
                        className="px-2 py-1 text-[11px] font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-[#fafaf7] border border-[#181a19]/10 rounded hover:bg-[#181a19]/5"
                        title="Snooze due date by 1 day"
                      >
                        +1 Day
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleReminder(task)}
                        className="p-1 text-[#181a19]/40 hover:text-[#181a19] transition-colors"
                        title={task.isReminderActive ? 'Turn off alert' : 'Turn on alert'}
                      >
                        {task.isReminderActive ? (
                          <Bell className="w-4 h-4 text-amber-600" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-[#181a19]/30 hover:text-rose-600 transition-colors p-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 3: FINANCIAL REPORTS HUB                        */}
      {/* ========================================================= */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181a19]/10">
              <div>
                <h3 className="text-base font-bold text-[#181a19]">
                  Audited Financial Statements Hub
                </h3>
                <p className="text-xs text-[#181a19]/60">
                  Comprehensive farm performance summaries for commercial banks, outgrower off-takers, and investor audits
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('reports')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
              >
                <span>Open Full Profit Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Financial Performance Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums text-xs">
              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase font-medium">
                  Recognized Sales
                </span>
                <span className="text-base font-bold text-[#16422b] mt-1 block">
                  {formatNaira(financialSummary.totalSalesRevenue)}
                </span>
                <span className="font-sans text-[10px] text-[#181a19]/50 block mt-0.5">
                  Delivered: {formatWeight(financialSummary.totalSoldKg)}
                </span>
              </div>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase font-medium">
                  Cash Collected
                </span>
                <span className="text-base font-bold text-emerald-700 mt-1 block">
                  {formatNaira(financialSummary.totalCashReceived)}
                </span>
                <span className="font-sans text-[10px] text-emerald-800 font-medium block mt-0.5">
                  {financialSummary.cashRealizationRate.toFixed(1)}% Realization Rate
                </span>
              </div>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase font-medium">
                  Operating Costs
                </span>
                <span className="text-base font-bold text-rose-600 mt-1 block">
                  {formatNaira(financialSummary.totalOperatingExpenses)}
                </span>
                <span className="font-sans text-[10px] text-[#181a19]/50 block mt-0.5">
                  CIR: {financialSummary.costToIncomeRatio.toFixed(1)}%
                </span>
              </div>

              <div className="p-4 bg-[#fafaf7] rounded-xl border border-[#181a19]/10">
                <span className="font-sans text-[11px] text-[#181a19]/60 block uppercase font-medium">
                  Net Operating Margin
                </span>
                <span
                  className={`text-base font-bold mt-1 block ${
                    financialSummary.netOperatingResult >= 0 ? 'text-[#16422b]' : 'text-rose-600'
                  }`}
                >
                  {financialSummary.netOperatingResult >= 0 ? '+' : ''}
                  {formatNaira(financialSummary.netOperatingResult)}
                </span>
                <span className="font-sans text-[10px] text-[#181a19]/60 block mt-0.5">
                  EBITDA Margin: {financialSummary.operatingMarginPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Quick Export Table */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-emerald-950 block">
                  Download Certified Accounting Ledgers
                </span>
                <span className="text-emerald-800/80 text-[11px] block">
                  Generate raw spreadsheet exports for external auditors, farm accountants, or cooperative meetings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportTransactionsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-white border border-emerald-300 rounded-lg shadow-xs hover:bg-emerald-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Financial Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 4: CSV DATA EXPORTS CENTER                       */}
      {/* ========================================================= */}
      {currentTab === 'exports' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#181a19]/10 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#181a19]">
                Enterprise CSV Data Export Suite
              </h3>
              <p className="text-xs text-[#181a19]/60">
                Export all raw operational databases, schedules, transaction ledgers, and crop yields into standard CSV files
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Export 1: Tasks & Schedule */}
              <div className="p-5 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] hover:border-[#16422b]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#16422b]/10 text-[#16422b] flex items-center justify-center mb-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Tasks & Reminders Schedule
                  </h4>
                  <p className="text-xs text-[#181a19]/60 mt-1">
                    All scheduled operations, assignees, due dates, reminder times, and task statuses.
                  </p>
                  <span className="text-[11px] font-mono font-medium text-[#181a19]/50 block mt-2">
                    {tasks.length} rows ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportTasksCSV}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tasks CSV</span>
                </button>
              </div>

              {/* Export 2: Financial Transactions */}
              <div className="p-5 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] hover:border-[#16422b]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Full Financial Ledger
                  </h4>
                  <p className="text-xs text-[#181a19]/60 mt-1">
                    Combined sales and expense transactions sorted chronologically with payment channels.
                  </p>
                  <span className="text-[11px] font-mono font-medium text-[#181a19]/50 block mt-2">
                    {sales.length + expenses.length} transactions ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportTransactionsCSV}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ledger CSV</span>
                </button>
              </div>

              {/* Export 3: Sales & Receivables */}
              <div className="p-5 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] hover:border-[#16422b]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Sales & Buyer Receivables
                  </h4>
                  <p className="text-xs text-[#181a19]/60 mt-1">
                    Invoices, customer buyer contacts, paid amounts, outstanding balances, and haulage waybills.
                  </p>
                  <span className="text-[11px] font-mono font-medium text-[#181a19]/50 block mt-2">
                    {sales.length} invoices ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportSalesReceivablesCSV}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sales CSV</span>
                </button>
              </div>

              {/* Export 4: Operating Expenses */}
              <div className="p-5 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] hover:border-[#16422b]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-700 flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Operating Expenses Ledger
                  </h4>
                  <p className="text-xs text-[#181a19]/60 mt-1">
                    Farm input purchases, labor payroll, mechanization fuel, and land lease vouchers.
                  </p>
                  <span className="text-[11px] font-mono font-medium text-[#181a19]/50 block mt-2">
                    {expenses.length} expense rows ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportExpensesCSV}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Expenses CSV</span>
                </button>
              </div>

              {/* Export 5: Harvest & Warehouse Stock */}
              <div className="p-5 rounded-xl border border-[#181a19]/10 bg-[#fafaf7] hover:border-[#16422b]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center mb-3">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#181a19]">
                    Harvest Logs & Stock Inventory
                  </h4>
                  <p className="text-xs text-[#181a19]/60 mt-1">
                    Harvest lot batches, crop yields in kg and MT, moisture testing %, and storage locations.
                  </p>
                  <span className="text-[11px] font-mono font-medium text-[#181a19]/50 block mt-2">
                    {harvests.length} harvest lots ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportHarvestsCSV}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Harvests CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
