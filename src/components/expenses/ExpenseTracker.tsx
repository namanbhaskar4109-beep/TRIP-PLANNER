import React, { useState, useMemo } from 'react';
import {
  Wallet,
  PlusCircle,
  Trash2,
  PieChart,
  Tag,
  Calendar,
  AlertTriangle,
  Hotel,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  ArrowUpRight,
  Download,
  Filter,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types/trip';

interface ExpenseTrackerProps {
  expenses: Expense[];
  budget: number;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
  onClearExpenses: () => void;
}

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }
> = {
  Accommodation: {
    icon: Hotel,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  'Food & Drinks': {
    icon: Utensils,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  Transportation: {
    icon: Car,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  Activities: {
    icon: Ticket,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  Shopping: {
    icon: ShoppingBag,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  Miscellaneous: {
    icon: MoreHorizontal,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

const CATEGORIES: ExpenseCategory[] = [
  'Accommodation',
  'Food & Drinks',
  'Transportation',
  'Activities',
  'Shopping',
  'Miscellaneous',
];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  budget,
  onAddExpense,
  onRemoveExpense,
  onClearExpenses,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Drinks');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formError, setFormError] = useState<string | null>(null);

  // Total spent calculation
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const remaining = budget - totalSpent;
  const percentUsed = Math.min(100, Math.round((totalSpent / (budget || 1)) * 100));
  const isOverBudget = remaining < 0;

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<ExpenseCategory, { total: number; count: number }> = {
      Accommodation: { total: 0, count: 0 },
      'Food & Drinks': { total: 0, count: 0 },
      Transportation: { total: 0, count: 0 },
      Activities: { total: 0, count: 0 },
      Shopping: { total: 0, count: 0 },
      Miscellaneous: { total: 0, count: 0 },
    };

    expenses.forEach((item) => {
      if (breakdown[item.category]) {
        breakdown[item.category].total += item.amount;
        breakdown[item.category].count += 1;
      }
    });

    return breakdown;
  }, [expenses]);

  // Filtered expenses
  const displayedExpenses = useMemo(() => {
    if (filterCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === filterCategory);
  }, [expenses, filterCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError('Please enter a description for the expense.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than $0.');
      return;
    }

    if (!date) {
      setFormError('Please select a date.');
      return;
    }

    onAddExpense({
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
    });

    // Reset inputs
    setDescription('');
    setAmount('');
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Description', 'Amount (USD)', 'Category', 'Date'];
    const rows = expenses.map((e) => [
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.date,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trip-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="expenses" className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Budget & Expense Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your real-time expenses, visualize spending categories, and stay on budget.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {expenses.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Export spreadsheet CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all expenses?')) {
                      onClearExpenses();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Budget Progress Bar & KPI Stats */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-slate-900 text-2xl">
                ${totalSpent.toLocaleString()}
              </span>
              <span className="text-slate-500 font-medium">spent of ${budget.toLocaleString()} budget</span>
            </div>
            <div className="font-bold">
              {isOverBudget ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Over budget by ${Math.abs(remaining).toLocaleString()}
                </span>
              ) : (
                <span className="text-emerald-700">
                  ${remaining.toLocaleString()} remaining ({100 - percentUsed}% left)
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : percentUsed > 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
        </div>

        {/* Visual Category Breakdown Cards */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-teal-600" />
            Spending Category Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const info = CATEGORY_CONFIG[cat];
              const Icon = info.icon;
              const catData = categoryBreakdown[cat];
              const catPercent = totalSpent > 0 ? Math.round((catData.total / totalSpent) * 100) : 0;

              return (
                <div
                  key={cat}
                  className={`p-3.5 rounded-2xl border transition ${info.bg} ${info.border}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-2xs ${info.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">
                      {catPercent}%
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 truncate" title={cat}>
                    {cat}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    ${catData.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {catData.count} {catData.count === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Add Expense Form & Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add Expense Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              Log New Expense
            </h3>
            <p className="text-xs text-slate-500">
              Add meals, transit, tickets, or bookings to your trip tracker.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Airport Taxi, Dinner, Museum Tickets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
            </div>

            {/* Amount and Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition cursor-pointer bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Expense Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </form>
        </div>

        {/* Right Column: Expense History & Filter (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recorded Expenses</h3>
                <p className="text-xs text-slate-500">
                  {expenses.length} total {expenses.length === 1 ? 'transaction' : 'transactions'}
                </p>
              </div>

              {/* Filter by Category */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Empty state */}
            {displayedExpenses.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Expenses Recorded</p>
                <p className="text-[11px] text-slate-400">
                  {filterCategory !== 'all'
                    ? 'No expenses found in this category.'
                    : 'Use the form on the left or click "Log Stay to Trip Expenses" to add items.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {displayedExpenses.map((expense) => {
                  const info = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.Miscellaneous;
                  const Icon = info.icon;

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${info.bg} ${info.border} ${info.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{expense.date}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-sm font-extrabold text-slate-900">
                          ${expense.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveExpense(expense.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete expense"
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

          {/* Quick Footer Summary in List */}
          {displayedExpenses.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Showing {displayedExpenses.length} of {expenses.length} expenses</span>
              <span>
                Subtotal: $
                {displayedExpenses
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
