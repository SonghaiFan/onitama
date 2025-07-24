import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onitama - 意志與策略的對弈 | Will and Strategy in Battle",
  description:
    "Play Onitama online - a two-player abstract strategy game on a 5×5 board. Master the art of movement cards, capture your opponent's master, or reach their temple to win. Experience deep strategy in elegant 15-minute games.",
  keywords: [
    "Onitama",
    "board game",
    "strategy game",
    "abstract strategy",
    "two player game",
    "chess-like game",
    "movement cards",
    "tactical game",
    "online board game",
    "形意棋",
    "策略遊戲",
    "棋盤遊戲",
    "雙人對弈",
    "移動卡牌",
    "戰術遊戲",
  ],
  authors: [{ name: "Onitama Game" }],
  creator: "Onitama Game",
  publisher: "Onitama Game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://onitama-game.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Onitama - 意志與策略的對弈 | Will and Strategy in Battle",
    description:
      "Play Onitama online - a two-player abstract strategy game on a 5×5 board. Master the art of movement cards, capture your opponent's master, or reach their temple to win.",
    url: "https://onitama-game.vercel.app",
    siteName: "Onitama",
    images: [
      {
        url: "/temple-arch.svg",
        width: 24,
        height: 24,
        alt: "Onitama - Temple Arch Symbol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onitama - 意志與策略的對弈 | Will and Strategy in Battle",
    description:
      "Play Onitama online - a two-player abstract strategy game on a 5×5 board. Master the art of movement cards.",
    images: ["/temple-arch.svg"],
    creator: "@onitama_game",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/temple-arch.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/temple-arch.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#78716c" />
        <meta name="color-scheme" content="light" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Onitama" />
        <meta name="application-name" content="Onitama" />
        <meta name="msapplication-TileColor" content="#78716c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
