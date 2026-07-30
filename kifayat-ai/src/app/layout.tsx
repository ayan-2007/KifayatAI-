import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, JetBrains_Mono, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: '--font-urdu',
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kifayat AI — Pakistan Smart Price Intelligence',
  description: 'پھر کبھی زیادہ نہ دیں۔ AI پاکستانی مارکیٹ سے قیمتیں چیک کرتی ہے — تصویر اپ لوڈ کریں اور فوری قیمت کی انٹیلیجنس حاصل کریں۔',
  openGraph: {
    title: 'Kifayat AI — Pakistan Smart Price Intelligence',
    description: 'AI-powered visual price comparison for Pakistani marketplaces.',
    siteName: 'Kifayat AI Pakistan',
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
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${notoNastaliqUrdu.variable} dark`}
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
