import { differenceInDays } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { UI_TEXTS } from "@/lib/constants/ui-texts";

interface SubscriptionBannerProps {
  status: string;
  plan: string;
  trialEndsAt: Date | null;
}

export function SubscriptionBanner({
  status,
  plan,
  trialEndsAt,
}: SubscriptionBannerProps) {
  if (status === "active" && plan !== "trial") {
    return null;
  }

  if (status === "blocked") {
    return null; // Handled by full screen block in layout
  }

  if (plan === "trial" && status === "active" && trialEndsAt) {
    const daysLeft = Math.max(0, differenceInDays(trialEndsAt, new Date()));

    const text = UI_TEXTS.subscription.trial_banner.replace(
      "{days}",
      String(daysLeft)
    );

    return (
      <div className="bg-yellow-accent/20 px-4 py-2 text-center text-sm font-medium text-yellow-700">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{text}</span>
          <Link
            href="/dashboard/settings"
            className="underline hover:text-yellow-800"
          >
            {UI_TEXTS.subscription.subscribe_button}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "grace") {
    // Esto se calcularía con la fecha de fin real, mock 3 días para UI.
    const text = UI_TEXTS.subscription.grace_banner.replace("{days}", "3");

    return (
      <div className="bg-red-500/10 px-4 py-2 text-center text-sm font-medium text-red-600">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{text}</span>
          <Link
            href="/dashboard/settings"
            className="underline hover:text-red-700"
          >
            {UI_TEXTS.subscription.subscribe_button}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
