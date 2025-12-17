import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <main id="main" className="mx-auto w-full max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm font-semibold text-teal-300 hover:text-teal-200">
          Back
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Contact</h1>
        <p className="mt-4 text-white/70">
          Email us at <a className="text-teal-300 hover:text-teal-200" href="mailto:hello@studyparent.com">hello@studyparent.com</a>.
        </p>
      </main>
    </div>
  );
}

