import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/credits — check current credits
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ credits: 0, signedIn: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  return Response.json({ credits: user?.credits ?? 0, signedIn: true });
}

// POST /api/credits — decrement 1 credit (called after each message)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  if (!user || user.credits <= 0) {
    return Response.json({ error: "No credits remaining", credits: 0 }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: 1 } },
    select: { credits: true },
  });

  return Response.json({ credits: updated.credits });
}
