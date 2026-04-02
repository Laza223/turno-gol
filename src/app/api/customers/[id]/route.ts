import { NextResponse } from "next/server";
import { getAuthComplex } from "@/lib/supabase/server";
import { CustomerService } from "@/lib/services/customer-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const complex = await getAuthComplex();
    if (!complex) return new NextResponse("Unauthorized", { status: 401 });

    const data = await CustomerService.getCustomerDetail(complex.id, params.id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
