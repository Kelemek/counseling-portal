import Link from 'next/link'import Link from 'next/link'import Image from "next/image";



export default function HomePage() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">export default function HomePage() {export default function Home() {

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">

        <div className="text-center mb-8">  return (  return (

          <h1 className="text-3xl font-bold text-gray-900 mb-2">

            Counseling Portal    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

          </h1>

          <p className="text-gray-600">      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

            Church Counseling Ministry Portal

          </p>        <div className="text-center mb-8">        <Image

        </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">          className="dark:invert"

        <div className="space-y-4">

          <Link            Counseling Portal          src="/next.svg"

            href="/login"

            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md text-center transition"          </h1>          alt="Next.js logo"

          >

            Sign In          <p className="text-gray-600">          width={100}

          </Link>

            Church Counseling Ministry Portal          height={20}

          <div className="relative">

            <div className="absolute inset-0 flex items-center">          </p>          priority

              <div className="w-full border-t border-gray-300" />

            </div>        </div>        />

            <div className="relative flex justify-center text-sm">

              <span className="px-2 bg-white text-gray-500">Quick Access</span>        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">

            </div>

          </div>        <div className="space-y-4">          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">



          <div className="grid grid-cols-3 gap-2 text-sm">          <Link            To get started, edit the page.tsx file.

            <Link

              href="/admin"            href="/login"          </h1>

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"

            >            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md text-center transition"          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">

              Admin

            </Link>          >            Looking for a starting point or more instructions? Head over to{" "}

            <Link

              href="/counselor"            Sign In            <a

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"

            >          </Link>              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

              Counselor

            </Link>              className="font-medium text-zinc-950 dark:text-zinc-50"

            <Link

              href="/counselee"          <div className="relative">            >

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"

            >            <div className="absolute inset-0 flex items-center">              Templates

              Counselee

            </Link>              <div className="w-full border-t border-gray-300" />            </a>{" "}

          </div>

        </div>            </div>            or the{" "}



        <div className="mt-8 text-center text-sm text-gray-500">            <div className="relative flex justify-center text-sm">            <a

          <p>Need help? Contact your church administrator</p>

        </div>              <span className="px-2 bg-white text-gray-500">Quick Access</span>              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

      </div>

    </div>            </div>              className="font-medium text-zinc-950 dark:text-zinc-50"

  )

}          </div>            >


              Learning

          <div className="grid grid-cols-3 gap-2 text-sm">            </a>{" "}

            <Link            center.

              href="/admin"          </p>

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"        </div>

            >        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">

              Admin          <a

            </Link>            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"

            <Link            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

              href="/counselor"            target="_blank"

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"            rel="noopener noreferrer"

            >          >

              Counselor            <Image

            </Link>              className="dark:invert"

            <Link              src="/vercel.svg"

              href="/counselee"              alt="Vercel logomark"

              className="text-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"              width={16}

            >              height={16}

              Counselee            />

            </Link>            Deploy Now

          </div>          </a>

        </div>          <a

            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"

        <div className="mt-8 text-center text-sm text-gray-500">            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

          <p>Need help? Contact your church administrator</p>            target="_blank"

        </div>            rel="noopener noreferrer"

      </div>          >

    </div>            Documentation

  )          </a>

}        </div>

      </main>
    </div>
  );
}
