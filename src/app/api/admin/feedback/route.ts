import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Simple admin check — only your email can access
const ADMIN_EMAIL = "adamtpang@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get all feedback, newest first
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  // Aggregate stats per legend
  const stats = await prisma.feedback.groupBy({
    by: ["figureSlug"],
    _avg: { rating: true },
    _count: { rating: true },
  });

  // Count of non-5-star feedback with comments (your priority bug/feature list)
  const actionItems = feedback.filter(
    (f) => f.rating < 5 && f.comment
  );

  return Response.json({
    summary: {
      totalFeedback: feedback.length,
      averageRating: feedback.length
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
      actionItems: actionItems.length,
    },
    perLegend: stats.map((s) => ({
      legend: s.figureSlug,
      avgRating: Number(s._avg.rating?.toFixed(1)),
      totalReviews: s._count.rating,
    })),
    // Priority list: non-5-star feedback with comments, sorted by rating (worst first)
    priorityList: actionItems.map((f) => ({
      legend: f.figureSlug,
      rating: f.rating,
      comment: f.comment,
      user: f.user.name || f.user.email,
      date: f.createdAt,
    })),
    // All feedback
    all: feedback.map((f) => ({
      legend: f.figureSlug,
      rating: f.rating,
      comment: f.comment,
      user: f.user.name || f.user.email,
      date: f.createdAt,
    })),
  });
}
