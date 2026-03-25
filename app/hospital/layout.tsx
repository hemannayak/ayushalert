import HospitalNav from '../../components/hospital/HospitalNav';

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <HospitalNav />
      <main>{children}</main>
    </div>
  );
}
