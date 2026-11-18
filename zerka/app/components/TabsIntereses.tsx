"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Pestañas compartidas entre «Mis intereses» e «Interesados en mis publicaciones». */
export default function TabsIntereses() {
  const pathname = usePathname();
  return (
    <nav className="scroll-x mb-6" aria-label="Intereses">
      {[["/dashboard/intereses", "Mis intereses"], ["/dashboard/interesados", "Interesados en mis publicaciones"]].map(([href, label]) => (
        <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
          className={`rounded-full px-5 py-2.5 font-bold whitespace-nowrap ${pathname === href ? "bg-green-800 text-white shadow-md" : "border border-green-200 bg-white text-green-900"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
