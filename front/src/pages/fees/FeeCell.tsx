import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FeeCellProps {
  type: 'inscription' | 'tuition' | 'transport' | 'club';
  due: number;
  paid: number;
  date: string;
  onChange: (field: 'due' | 'paid' | 'date', value: number | Date) => void;
}

const FeeCell: React.FC<FeeCellProps> = ({ type, due, paid, date, onChange }) => {
  const [localDue, setLocalDue] = useState(due);
  const [localPaid, setLocalPaid] = useState(paid);
  const [localDate, setLocalDate] = useState<Date>(new Date(date));

  useEffect(() => {
    setLocalDue(due);
    setLocalPaid(paid);
    setLocalDate(new Date(date));
  }, [due, paid, date]);

  const bgColor = 'bg-white shadow border';


  return (
    <div className={`p-3 rounded ${bgColor} text-sm shadow-sm`}>
      <div className="font-semibold capitalize mb-1 text-sm">{type}</div>

      <div className="mb-2 text-left">
        <label className="block text-[11px] font-medium text-gray-700 mb-1">Due</label>
        <input
          type="number"
          className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
          value={localDue}
          onChange={e => setLocalDue(Number(e.target.value))}
          onBlur={() => onChange('due', localDue)}
        />
      </div>

      <div className="mb-2 text-left">
        <label className="block text-[11px] font-medium text-gray-700 mb-1">Paid</label>
        <input
          type="number"
          className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
          value={localPaid}
          onChange={e => setLocalPaid(Number(e.target.value))}
          onBlur={() => onChange('paid', localPaid)}
        />
      </div>

      <div className="text-left">
        <label className="block text-[11px] font-medium text-gray-700 mb-1">Date</label>
        <DatePicker
          selected={localDate}
          onChange={(date) => {
            if (date) {
              setLocalDate(date);
              onChange('date', date);
            }
          }}
          className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
          dateFormat="yyyy-MM-dd"
        />
      </div>
    </div>
  );
};

export default FeeCell;
