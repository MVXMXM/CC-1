import './globals.css';

const description =
  'CC-1 is an AI-powered calculator for word arithmetic. It was designed & developed by Maximillian Piras as an experiment to explore bias within the training data of Large Language Models.';

export const metadata = {
  metadataBase: new URL('https://conceptcalculator.com'),
  title: 'CC-1 Concept Calculator',
  description,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
  openGraph: {
    title: 'CC-1 Concept Calculator',
    description,
    url: 'https://conceptcalculator.com',
    type: 'website',
    images: ['/ogImage.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CC-1 Concept Calculator',
    description,
    images: ['/ogImage.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        {children}
      </body>
    </html>
  );
}
