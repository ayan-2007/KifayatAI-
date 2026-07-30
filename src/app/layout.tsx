import type { Metadata } from 'next';
import { Anton, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const anton = Anton({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400'],
});

const outfit = Outfit({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kifayat AI — Smart Visual Shopping & Price Intelligence — Pakistan',
  description: 'Never overpay again. AI checks prices across all Pakistani stores — upload a product photo and get instant price intelligence, web comparisons, and savings insights.',
  openGraph: {
    title: 'Kifayat AI — Pakistan Price Intelligence',
    description: 'AI-powered visual price comparison for Pakistani marketplaces.',
    siteName: 'Kifayat AI',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${outfit.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = JSON.parse(localStorage.getItem('ka-theme'));
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
