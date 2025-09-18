import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRole } from "../lib/aut/session";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/pattern-auth.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        

        <main className="min-h-dvh grid place-items-center p-2">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">Yüksi</h1>
        <p className="text-neutral-600">Devam etmek için giriş yap.</p>
        <div className="flex gap-1 justify-center">
          <Link href="/login" scroll={false} className="px-4 py-2 rounded bg-brand text-white">
            Giriş Yap
          </Link>
          <Link href="/register" scroll={false} className="px-4 py-2 rounded border">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </main>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="icons/google.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Google
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="icons/apple.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Apple
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="icons/facebook.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Facebook
        </a>
      </footer>
    </div>
  );
}
