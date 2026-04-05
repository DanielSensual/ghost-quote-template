import type { Metadata } from "next";
import config from "../config.json";

export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { colors, font } = config.brand;

  return (
    <html lang="en">
      <head>
        <link
          href={`https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700;800;900&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: `'${font}', -apple-system, BlinkMacSystemFont, sans-serif`,
          background: colors.bg,
          color: "#f5f5f7",
        }}
      >
        {children}
      </body>
    </html>
  );
}
