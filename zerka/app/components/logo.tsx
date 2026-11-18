import Image from "next/image";
import Link from "next/link";

/** Píldora oscura con el logo (el texto del logo es blanco). El recorte 3:1 elimina el margen del PNG original. */
export default function Logo({ href = "/dashboard", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="ZERKA, ir al inicio"
      className={`flex shrink-0 items-center rounded-r-full border border-stone-800 bg-emerald-950/95 py-1 pr-6 pl-3 ${className}`}>
      <Image src="/logo.png" alt="ZERKA" width={1536} height={1024} priority className="h-12 w-36 object-cover" />
    </Link>
  );
}
