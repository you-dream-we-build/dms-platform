import { Navbar } from '../../components/navbar';
import { DataTable, AvatarNameCell, StatusBadge } from '../../components/DataTable';
import { getDonors, Donor } from '../../lib/api';

export const revalidate = 60; // ISR

export const metadata = {
  title: 'Our Generous Donors | Degyal Memorial Society',
  description: 'Honoring all those who have contributed to supporting education and preserving our cultural heritage.',
};

export default async function DonorsPage() {
  let donors: Donor[] = [];
  let total = 0;

  try {
    const res = await getDonors({ limit: 50 });
    donors = res.data ?? [];
    total = res.total ?? donors.length;
  } catch (err) {
    console.error('Failed to fetch donors from API:', err);
  }

  const columns = [
    {
      header: 'Donor',
      accessor: 'custom' as const,
      render: (donor: Donor) => (
        <AvatarNameCell
          name={donor.name}
          subtitle={donor.location}
          avatarUrl={donor.avatar ?? ''}
        />
      ),
      width: '30%',
    },
    {
      header: 'Contribution',
      accessor: 'amount' as const,
      render: (donor: Donor) => (
        <span style={{ fontWeight: 600, color: '#d97706' }}>
          {donor.currency} {donor.amount.toLocaleString()}
        </span>
      ),
      width: '20%',
    },
    {
      header: 'Date',
      accessor: 'date' as const,
      render: (donor: Donor) => {
        const formattedDate = new Date(donor.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return <span>{formattedDate}</span>;
      },
      width: '20%',
    },
    {
      header: 'Type',
      accessor: 'custom' as const,
      render: (donor: Donor) => {
        const variant = donor.type === 'Monthly' ? 'success' : 'info';
        return <StatusBadge status={donor.type} variant={variant} />;
      },
      width: '15%',
    },
  ];

  // Aggregate totals from the API data
  const totalAmount = donors.reduce((sum, d) => sum + d.amount, 0);
  const monthlyCount = donors.filter((d) => d.type === 'Monthly').length;

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="page-header">
        <div className="container text-center">
          <h1 className="hero-title text-white">Our Generous Donors</h1>
          <p className="text-white opacity-80 max-w-2xl mx-auto">
            With deep gratitude, we honor all those who have contributed to supporting education and preserving our cultural heritage.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container section-padding -mt-10 relative z-10">
        {/* Stats Cards */}
        <div className="grid-3 gap-6 mb-8">
          <div className="glass-card text-center">
            <div className="stat-value">NPR {totalAmount.toLocaleString()}</div>
            <div className="stat-label">Total Contributions</div>
          </div>
          <div className="glass-card text-center">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Donors</div>
          </div>
          <div className="glass-card text-center">
            <div className="stat-value">{monthlyCount}</div>
            <div className="stat-label">Monthly Supporters</div>
          </div>
        </div>

        {/* Donors Table */}
        <div>
          <div className="table-header-section">
            <div>
              <h3 className="table-title">All Donors</h3>
              <p className="table-subtitle">Showing all contributors to DMS</p>
            </div>
            <button className="btn btn-sm">Make a Donation</button>
          </div>

          <DataTable
            columns={columns}
            data={donors}
            emptyMessage="No donors yet"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer mt-auto">
        <div className="container text-center pt-8 pb-8">
          <p className="small-text opacity-50">&copy; {new Date().getFullYear()} Degyal Memorial Society.</p>
        </div>
      </footer>
    </div>
  );
}
