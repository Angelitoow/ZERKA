"use client";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { useProteger } from "@/app/context/DemoStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!useProteger()) return <p className="grid min-h-screen place-items-center text-sm text-stone-500">Redirigiendo al inicio de sesión…</p>;
  return (
    <div className="min-h-screen bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "linear-gradient(rgba(251,248,239,.6), rgba(251,248,239,.6)), url('/fondo.png')" }}>
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 pt-24 pb-36 lg:px-10">{children}</main>
      <Footer />
    </div>
  );
}
