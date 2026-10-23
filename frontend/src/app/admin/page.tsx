import DashboardView from './dashboard-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Home — Academic Admin Portal',
  description: 'Academic Portal administrator dashboard and operations.',
};

export default async function AdminPage() {
  return (
    <DashboardView
      adminName="Administrator"
      adminEmail=""
      collegeName="Academic Campus"
    />
  );
}
