import localFont from "next/font/local";
import "./globals.css";
import MatrixBackground from "./components/background/MatrixBackground";
import { GoogleOAuthProvider } from '@react-oauth/google';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "FMC Portal",
  description: "Event Registration Portal - FMC Weekend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        <MatrixBackground/>
        {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
