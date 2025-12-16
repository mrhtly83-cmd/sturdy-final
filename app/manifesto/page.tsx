import ManifestoContent from '../_components/ManifestoContent';

export default function ManifestoPage() {
  return (
    <div className="relative min-h-screen w-full font-sans text-white bg-black">
      <video autoPlay loop muted playsInline className="fixed inset-0 -z-10 h-full w-full object-cover opacity-40">
        <source src="https://cdn.coverr.co/videos/coverr-a-mother-and-her-child-touching-hands-6625/1080p.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 -z-10 bg-stone-900/50 mix-blend-multiply" />

      <div className="mx-auto w-full max-w-md px-6 pb-16 pt-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">The Manifesto</h1>
          <p className="mt-2 text-sm text-white/70">Small principles that create calmer moments.</p>
        </header>
        <ManifestoContent />
      </div>
    </div>
  );
}

