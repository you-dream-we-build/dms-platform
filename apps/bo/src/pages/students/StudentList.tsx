import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi, Student } from '../../api/student.api';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';

export function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.list({ page, limit: 10, search: search || undefined });
      setStudents(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await studentApi.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      className: 'w-10',
      render: (s: Student) =>
        s.avatar ? (
          <img
            src={s.avatar}
            alt={s.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
            {s.name[0]}
          </div>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (s: Student) => (
        <div>
          <p className="font-medium text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-500">{s.email ?? '—'}</p>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade' },
    { key: 'school', header: 'School', className: 'hidden md:table-cell' },
    { key: 'region', header: 'Region', className: 'hidden lg:table-cell' },
    {
      key: 'status',
      header: 'Status',
      render: (s: Student) => <StatusBadge status={s.status} />,
    },
    {
      key: 'createdAt',
      header: 'Registered',
      className: 'hidden xl:table-cell',
      render: (s: Student) => new Date(s.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Student) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/students/${s._id}/edit`)}
            className="btn-ghost btn btn-sm text-indigo-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(s._id, s.name)}
            className="btn-ghost btn btn-sm text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">{total} total records</p>
        </div>
        <Link to="/students/new" className="btn-primary btn btn-sm">
          + New Student
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, school, region…"
          className="field-input flex-1"
        />
        <button type="submit" className="btn-secondary btn btn-sm">
          Search
        </button>
        {search && (
          <button
            type="button"
            className="btn-ghost btn btn-sm"
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="card">
        <Table columns={columns} data={students} loading={loading} emptyMessage="No students found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
