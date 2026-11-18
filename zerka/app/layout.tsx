import type { Metadata } from "next";
import { FC, PropsWithChildren } from "react";
import "@/app/ui/globals.css";
import { roboto } from "@/app/ui/fonts";
import { DemoProvider } from "@/app/context/DemoStore";

export const metadata: Metadata = {
  title: "ZERKA · Comercio local de Florencia",
  description: "Plataforma de comercio local ZERKA: intercambia, ofrece servicios y publica productos en tu comunidad.",
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="es">
      <body className={`${roboto.className} antialiased`}>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
};

export default RootLayout;
