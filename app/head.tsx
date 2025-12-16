export default function Head() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

  return (
    <>
      {supabaseUrl && supabaseAnonKey ? (
        <>
          <meta name="sturdy:supabase-url" content={supabaseUrl} />
          <meta name="sturdy:supabase-anon-key" content={supabaseAnonKey} />
        </>
      ) : null}
    </>
  );
}

