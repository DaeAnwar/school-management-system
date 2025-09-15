import React, { useState, useEffect } from 'react';
import FeeCell from './FeeCell';

interface FeeItem {
  type: 'inscription' | 'tuition' | 'transport' | 'club';
  due: number;
  paid: number;
  date: string;
}

interface FeeMonthBlockProps {
  studentId: string;
  month: number;
  items: FeeItem[];
  onSave: (month: number, updatedItems: FeeItem[]) => void;
}

const feeTypes: FeeItem['type'][] = ['inscription', 'tuition', 'transport', 'club'];
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 0,
  }).format(amount);

const FeeMonthBlock: React.FC<FeeMonthBlockProps> = ({  month, items, onSave }) => {
  const [localItems, setLocalItems] = useState<FeeItem[]>([]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleChange = (
    type: FeeItem['type'],
    field: 'due' | 'paid' | 'date',
    value: number | Date
  ) => {
    const updated = [...localItems];
    const index = updated.findIndex(i => i.type === type);

    if (index !== -1) {
      updated[index] = {
        ...updated[index],
        [field]: field === 'date' ? (value as Date).toISOString() : value,
      };
    } else {
      updated.push({
        type,
        due: 0,
        paid: 0,
        date: new Date().toISOString(),
        [field]: field === 'date' ? (value as Date).toISOString() : value,
      } as FeeItem);
    }

    setLocalItems(updated);
    onSave(month, updated);
  };

  const isSeptember = month === 9;
  const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'short' });

  const totalPaid = localItems.reduce((sum, i) => sum + i.paid, 0);
  const totalDue = localItems.reduce((sum, i) => sum + i.due, 0);

  const status =
    totalPaid >= totalDue && totalDue > 0
      ? 'PAID'
      : totalPaid > 0
      ? 'PARTIAL'
      : 'UNPAID';

  const badgeColor =
  
    status === 'PAID'
      ? 'bg-green-100 text-green-800'
      : status === 'PARTIAL'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
      const blockBg =
  status === 'PAID' ? 'bg-green-50' :
  status === 'PARTIAL' ? 'bg-yellow-50' :
  'bg-red-50';

  return (
<div className={`w-[160px] min-w-[160px] border rounded ${blockBg} shadow-sm p-2 text-xs text-center`}>
      <h4 className="font-bold border-b mb-2">{monthName}</h4>

      <div className="mb-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>
          {status}
        </span>
      </div>

      {feeTypes.map((type) => {
        const item = localItems.find(i => i.type === type);

        // 👇 Show thin placeholder if it's not September for inscription
        if (type === 'inscription' && !isSeptember) {
          return (
            <div
              key={type}
              className="mb-2 h-[110px] border border-dashed border-gray-200 bg-gray-50 text-gray-300 flex items-center justify-center text-[11px] italic"
            >
              —
            </div>
          );
        }

        return (
          <div key={type} className="mb-2">
            <FeeCell
              type={type}
              due={item?.due ?? 0}
              paid={item?.paid ?? 0}
              date={item?.date ?? new Date().toISOString()}
              onChange={(field, value) => handleChange(type, field, value)}
            />
          </div>
        );
      })}

      <div className="mt-3 pt-3 border-t">
  <div className="text-xs text-gray-500 mb-1 font-medium">Total</div>
  <div className="text-sm font-semibold text-gray-700">
    {formatCurrency(totalDue)} <span className="text-gray-400">/</span> {formatCurrency(totalPaid)}
  </div>
  <div className="text-[11px] text-gray-400 mt-0.5">Due / Paid</div>
</div>
    </div>
  );
};

export default FeeMonthBlock;
