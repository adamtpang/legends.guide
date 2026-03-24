import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { figureSlug, rating, comment } = await req.json();

  if (!figureSlug || !rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Invalid feedback" }, { status: 400 });
  }

  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      figureSlug,
      rating,
      comment: comment || null,
    },
  });

  return Response.json({ success: true });
}
