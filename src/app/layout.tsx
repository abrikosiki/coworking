import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoWork — Who's here today",
  description: "Connect with people around you. Find your next collaborator, lunch buddy, or just say hello.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-primary-fg">
        {children}
      </body>
    </html>
  );
}
