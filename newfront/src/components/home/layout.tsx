import "./globals.scss";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en">
      {children}
    </div>
  );
}
