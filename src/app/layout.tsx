import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col text-slate-900 antialiased overflow-x-hidden">
        <Header />

        <main className="container-app flex-1 w-full py-6 sm:py-8 md:py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}