import { NextResponse } from "next/server";
import { MercadoPagoWebhooks } from "@/lib/mercadopago/webhooks";

export async function POST(req: Request) {
  try {
     const { searchParams } = new URL(req.url);
     const complexId = searchParams.get("complexId");

     if (!complexId) {
        return new NextResponse("Missing Complex Context", { status: 400 });
     }

     const body = await req.json();

     // MP Webhook sends type="payment" or action="payment.created" 
     // with the payment ID inside data.id or object (dependiendo la version de IPN / webhook)
     let paymentId = body.data?.id;
     
     // Fallbacks para otros formatos de webhooks de MP si envían topic
     if (searchParams.get("topic") === "payment") {
        paymentId = searchParams.get("id");
     }

     if (body.action === "payment.created" || body.type === "payment") {
        if (paymentId) {
           await MercadoPagoWebhooks.processPaymentWebhook(complexId, paymentId);
        }
     }
     
     return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
     console.error("Webhook Error: ", err.message);
     return new NextResponse("Webhook Proccessing Error", { status: 500 });
  }
}
