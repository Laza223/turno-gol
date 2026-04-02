import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
     const body = await req.json();

     // SAAS MercadoPago Webhooks. 
     // We listen for topic=preapproval or type=subscription.
     // Also authorize direct 'payment' to see if it matches our recurring MP sub.
     
     // MP Subscription Webhook Structure:
     // If type == "subscription_preapproval" or "preapproval"
     let preapprovalId = body.data?.id;
     
     if (body.type === "subscription_preapproval" || body.action === "created") {
        if (!preapprovalId) return new NextResponse("OK", { status: 200 });

        // A recurring subscription was created or billed
        const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
           headers: { "Authorization": `Bearer ${process.env.SAAS_MP_ACCESS_TOKEN}` }
        });
        
        if (res.ok) {
           const subData = await res.json();
           const complexId = subData.external_reference;
           const status = subData.status; // 'authorized'

           if (complexId && status === "authorized") {
              const endsAt = new Date();
              endsAt.setMonth(endsAt.getMonth() + 1); // 1 month subscription
              
              await prisma.complex.update({
                 where: { id: complexId },
                 data: {
                    subscriptionStatus: "active",
                    mpSubscriptionId: preapprovalId,
                    subscriptionEndsAt: endsAt,
                    subscriptionPlan: "cancha" // Assume basic for now or derive from reason
                 }
              });
           }
        }
     }
     
     return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
     return new NextResponse("SaaS Webhook Proccessing Error", { status: 500 });
  }
}
