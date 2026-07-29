import { Navbar } from '../../components/navbar';
import { DataTable, AvatarNameCell, StatusBadge } from '../../components/DataTable';
import { Footer } from '../../components/footer';
import { getStudents, Student } from '../../lib/api';
import Link from 'next/link';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata = {
  title: 'Student Beneficiaries | Degyal Memorial Society',
  description: 'List of students currently supported by the Degyal Memorial Society.',
};

export default async function StudentsPage() {
  let students: Student[] = [];
  let total = 0;

  try {
    const res = await getStudents({ limit: 50 });
    students = res.data ?? [];
    total = res.total ?? students.length;
  } catch (err) {
    console.error('Failed to fetch students from API:', err);
    // Fallback to empty list — API may not be running
  }

  const columns = [
    {
      header: 'Student',
      accessor: 'custom' as const,
      render: (student: Student) => (
        <AvatarNameCell
          name={student.name}
          subtitle={student.grade}
          avatarUrl={student.avatar ?? ''}
        />
      ),
      width: '25%',
    },
    {
      header: 'School/Institution',
      accessor: 'school' as const,
      width: '30%',
    },
    {
      header: 'Region',
      accessor: 'region' as const,
      width: '20%',
    },
    {
      header: 'Status',
      accessor: 'custom' as const,
      render: (student: Student) => {
        const variant =
          student.status === 'Active' ? 'success'
            : student.status === 'Pending' ? 'warning'
              : student.status === 'Graduated' ? 'info'
                : 'default';
        return <StatusBadge status={student.status} variant={variant} />;
      },
      width: '15%',
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="page-header">
        <div className="container text-center">
          <h1 className="hero-title text-white">Student Beneficiaries</h1>
          <p className="text-white opacity-80 max-w-2xl mx-auto">
            Supporting the bright minds of our community. Below is the list of students currently supported by the Degyal Memorial Society.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container section-padding -mt-10 relative z-10">
        <div className="glass-card">
          <div className="table-header-section">
            <div>
              <h3 className="table-title">Registered Students</h3>
              <p className="table-subtitle">Total students: {total}</p>
            </div>
            <Link href="/students/register" className="btn btn-sm">
              + Register New Student
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={students}
            emptyMessage="No students registered yet"
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
