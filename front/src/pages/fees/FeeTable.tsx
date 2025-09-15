import { useEffect, useState } from 'react';
import axios from 'axios';
import FeeMonthBlock from './FeeMonthBlock';
import toast from 'react-hot-toast';

interface FeeItem {
  type: 'inscription' | 'tuition' | 'transport' | 'club';
  due: number;
  paid: number;
  date: string;
}

interface FeeMonth {
  month: number;
  items: FeeItem[];
}

interface FeeTableProps {
  studentId: string;
  schoolYear: string;
}

const FeeTable = ({ studentId, schoolYear }: FeeTableProps) => {
  const [fees, setFees] = useState<FeeMonth[]>([]);

  const loadFees = async () => {
    try {
      const res = await axios.get(`/api/fees/student/${studentId}`, {
        params: { schoolYear },
      });
      setFees(res.data); // already sorted by month
    } catch (err) {
      console.error('Failed to load fees:', err);
    }
  };

  useEffect(() => {
    loadFees();
  }, [studentId, schoolYear]);

  const monthName = (m: number) =>
    new Date(0, m - 1).toLocaleString('default', { month: 'short' });

  const handleSave = async (month: number, updatedItems: FeeItem[]) => {
    try {
      const res = await axios.post(`/api/fees/${studentId}`, {
        schoolYear,
        month,
        items: updatedItems,
      });

      const updated = [...fees];
      const i = updated.findIndex(f => f.month === month);
      if (i !== -1) {
        updated[i] = res.data;
      } else {
        updated.push(res.data);
      }
      setFees(updated);

      toast.success(`Changes saved for ${monthName(month)}!`);
    } catch (err) {
      console.error('Failed to save fee changes:', err);
      toast.error('Failed to save. Try again.');
    }
  };

const schoolMonths = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

  return (
    <div className="flex gap-2 overflow-x-auto">
      {schoolMonths.map((month) => {
        const monthData = fees.find(f => f.month === month);
        return (
          <FeeMonthBlock
            key={month}
            studentId={studentId}
            month={month}
            items={monthData?.items || []}
            onSave={handleSave}
          />
        );
      })}
    </div>
  );
};

export default FeeTable;
