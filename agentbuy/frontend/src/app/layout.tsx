import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AgentBuy - Voice AI Purchase Agent',
    description: 'Buy anything with your voice. AI-powered autonomous purchasing.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
