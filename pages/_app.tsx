import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { nunito } from '@/lib/font';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={nunito.className}>
      <Component {...pageProps} />
    </main>
  );
}
