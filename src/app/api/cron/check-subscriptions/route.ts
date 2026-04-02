import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export async function GET(req: Request) {
   // Validate Cron Secret using vercel architecture standard
   const authHeader = req.headers.get("Authorization");
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
   }

   try {
      const complexes = await prisma.complex.findMany({
         where: {
            isActive: true,
            subscriptionStatus: { in: ["trial", "grace"] }
         }
      });

      let updatedCount = 0;
      const today = new Date();

      for (const complex of complexes) {
         if (complex.subscriptionStatus === "trial" && complex.trialEndsAt) {
            // Check if trial has expired
            if (complex.trialEndsAt < today) {
               await prisma.complex.update({
                  where: { id: complex.id },
                  data: { subscriptionStatus: "grace" }
               });
               updatedCount++;
            }
         } else if (complex.subscriptionStatus === "grace" && complex.trialEndsAt) {
            // Check if grace period (3 days) has elapsed since trial ended
            // If we assume trialEndsAt was 3 days ago:
            const daysSinceExpiry = differenceInDays(today, complex.trialEndsAt);
            if (daysSinceExpiry >= 3) {
               await prisma.complex.update({
                  where: { id: complex.id },
                  data: { subscriptionStatus: "blocked" }
               });
               updatedCount++;
            }
         } else if (complex.subscriptionStatus === "grace" && complex.subscriptionEndsAt) {
             const daysSinceExpiry = differenceInDays(today, complex.subscriptionEndsAt);
             if (daysSinceExpiry >= 3) {
                 await prisma.complex.update({
                    where: { id: complex.id },
                    data: { subscriptionStatus: "blocked" }
                 });
                 updatedCount++;
             }
         }
      }

      return NextResponse.json({ 
         status: "success", 
         message: `Checked subscriptions. Updated states for ${updatedCount} complexes.` 
      });

   } catch (error: any) {
      console.error("Subscription Chron Job Failure:", error);
      return new NextResponse("Chronology error", { status: 500 });
   }
}
