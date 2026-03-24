import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Stripe sends checkout.session.completed webhook here
// For payment links, the customer_email is included
export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify webhook signature in production
  const sig = req.headers.get("stripe-signature");
  if (!sig && process.env.NODE_ENV === "production") {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email || session.customer_details?.email;

      if (!email) {
        console.error("Webhook: No email in checkout session");
        return Response.json({ error: "No email" }, { status: 400 });
      }

      // Add 100 credits to the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        await prisma.user.update({
          where: { email },
          data: { credits: { increment: 100 } },
        });
        console.log(`Added 100 credits to ${email}, new total: ${user.credits + 100}`);
      } else {
        console.error(`Webhook: User not found for email ${email}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}
