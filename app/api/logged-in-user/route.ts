import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/app/utils/access-token";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await getLoggedInUser());
}
