import PatientNav from '../../components/patient/PatientNav';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Universal Background Glows */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <PatientNav />
      <main className="flex-1 flex flex-col min-h-screen h-screen overflow-y-auto z-10">
        <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
