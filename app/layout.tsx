import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import OnlineTracker from "@/components/OnlineTracker";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kazançlı Online Market Alışverişi",
  description: "Siz de aynı gün teslim, günlük market ürün indirimleri ve geniş ürün seçimi ile kazançlı çıkın. Doğrusu online market alışverişi yapılır!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#005baa" />
        <link rel="apple-touch-icon" href="/logo_152.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1615624682855194');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1615624682855194&ev=PageView&noscript=1" />`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white min-h-screen`}>
        <OnlineTracker />
        <Header />
        <main className="bg-white" style={{ paddingBottom: "64px" }}>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
