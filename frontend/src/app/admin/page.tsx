import DashboardView from './dashboard-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Home — Academic Admin Portal',
  description: 'Academic Portal administrator dashboard and operations.',
};

export default async function AdminPage() {
  // Immediate rendering of Admin Home Dashboard with zero database / network delay
  return (
    <DashboardView
      adminName="Dr. Alexander Vance"
      adminEmail="admin@institution.edu"
      collegeName="Faculty of Engineering"
    />
  );
}
