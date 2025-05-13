import type { Metadata } from "next";
import BackgroundWrapper from "@/components/background/background";
import "./globals.css";


export const metadata: Metadata = {
  title: "Autoscheduler",
  description: "Autoscheduler helps you schedule and send bulk emails with file attachments to up to 50 BCC recipients — all in one go. Perfect for efficient, secure, and timely communication.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      </head>
      <body className="purple">
        <BackgroundWrapper>
        {children}
        </BackgroundWrapper>
      </body>
    </html>
  );
}

export default RootLayout
