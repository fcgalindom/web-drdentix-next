import PatientNav from '@/components/layout/PatientNav';
import Footer from '@/components/layout/Footer';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PatientNav />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
