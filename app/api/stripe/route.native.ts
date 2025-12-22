// app/api/stripe/webhook/route.native.ts

export function GET() {
  return Response.json({ error: "Not available on mobile" }, { status: 404 });
}

export function POST() {
  return Response.json({ error: "Not available on mobile" }, { status: 404 });
}
