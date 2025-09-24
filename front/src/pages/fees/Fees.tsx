import { useEffect, useState } from 'react';
import api from '../../utils/api';
import FeeTable from './FeeTable';

interface StudentInfo {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  class: string | { _id: string; name: string }; // ✅ allow both string or populated object
  profilePhoto: string;
  studentId: string;
}

interface FeeEntry {
  student: StudentInfo;
  fee: any;
  status: 'paid' | 'partial' | 'unpaid';
  totalPaid: number;
  totalDue: number;
}

const Fees = () => {
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const [feeData, setFeeData] = useState<FeeEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [schoolYears, setSchoolYears] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    schoolYear: getCurrentSchoolYear(),
    month: '',
    status: '',
    class: '',
    search: '',
  });

  useEffect(() => {
  api.get('/api/fees/school-years').then(res => {
    setSchoolYears(res.data.data);
  });
}, []);

const loadData = async () => {
  try {
    const res = await api.get('/api/fees', {
      params: {
        schoolYear: filters.schoolYear || undefined,
        month: filters.month || undefined,
        status: filters.status || undefined,
      },
    });
    setFeeData(res.data);
  } catch (err) {
    console.error('Failed to fetch fee data:', err);
  }
};

  useEffect(() => {
    loadData();
  }, [filters]);

  const filteredStudents = feeData.filter(entry => {
    const name = `${entry.student.firstName} ${entry.student.lastName}`.toLowerCase();
    const searchMatch = name.includes(filters.search.toLowerCase());

    const className =
      typeof entry.student.class === 'string'
        ? entry.student.class
        : entry.student.class?.name || '';

    const classMatch = filters.class
      ? className.toLowerCase() === filters.class.toLowerCase()
      : true;

    const statusMatch = filters.status ? entry.status === filters.status : true;

    return searchMatch && classMatch && statusMatch;
  });

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filters.schoolYear}
          onChange={e => setFilters({ ...filters, schoolYear: e.target.value })}
          className="input border p-2 rounded"
        >
          <option value="">All School Years</option>
          {schoolYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={filters.month}
          onChange={e => setFilters({ ...filters, month: e.target.value })}
          className="input border p-2 rounded"
        >
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="input border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <input
          type="text"
          placeholder="Search student name"
          className="input border p-2 rounded w-64"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Student Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Class</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Total Paid / Due</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((entry: FeeEntry) => {
            const className =
              typeof entry.student.class === 'string'
                ? entry.student.class
                : entry.student.class?.name || 'N/A';

            return (
              <tr key={entry.student._id}>
                <td colSpan={4} className="py-4">
                  <div className="border rounded-lg shadow-sm p-4 bg-white">
                    <div
                      onClick={() =>
                        setExpanded(expanded === entry.student._id ? null : entry.student._id)
                      }
                      className="cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-base">
                          {entry.student.firstName} {entry.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Class: {className}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-700">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : entry.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.status.toUpperCase()}
                        </span>
                        <span className="font-semibold">
                          TND {entry.totalPaid} / TND {entry.totalDue}
                        </span>
                      </div>
                    </div>

                    {expanded === entry.student._id && (
                      <div className="mt-4">
                        <FeeTable studentId={entry.student._id} schoolYear={filters.schoolYear} />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Fees;
