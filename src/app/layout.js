import "./globals.css";

export const metadata = {
  title: "IntelliQuiz",
  description: "AI-powered quiz generation system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <main>{children}</main>
      </body>
    </html>
  );
}
