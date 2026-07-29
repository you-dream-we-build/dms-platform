import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donorApi, Donor } from '../../api/donor.api';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { AvatarCell, AVATAR_COLUMN_CLASS } from '../../components/AvatarCell';

export function DonorList() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donorApi.list({ page, limit: 10, search: search || undefined });
      setDonors(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete donor ${name}?`)) return;
    try {
      await donorApi.delete(id);
      toast.success('Donor deleted');
      fetchDonors();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      className: AVATAR_COLUMN_CLASS,
      render: (d: Donor) => <AvatarCell name={d.name} src={d.avatar} />,
    },
    {
      key: 'name',
      header: 'Donor',
      render: (d: Donor) => (
        <div>
          <p className="font-medium text-gray-900">{d.name}</p>
          <p className="text-xs text-gray-500">{d.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (d: Donor) => (
        <span className="font-semibold text-amber-600">
          {d.currency} {d.amount.toLocaleString()}
        </span>
      ),
    },
    { key: 'location', header: 'Location', className: 'hidden md:table-cell' },
    {
      key: 'type',
      header: 'Type',
      render: (d: Donor) => <StatusBadge status={d.type} />,
    },
    {
      key: 'date',
      header: 'Date',
      className: 'hidden lg:table-cell',
      render: (d: Donor) => new Date(d.date).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d: Donor) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/donors/${d._id}/edit`)}
            className="btn-ghost btn btn-sm text-indigo-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(d._id, d.name)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Donors</h1>
          <p className="text-sm text-gray-500">{total} total records</p>
        </div>
        <Link to="/donors/new" className="btn-primary btn btn-sm">
          + New Donor
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, location…"
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

      <div className="card">
        <Table columns={columns} data={donors} loading={loading} emptyMessage="No donors found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
