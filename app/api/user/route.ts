import type { User } from "@/types/user";
import { NextResponse } from "next/server";

export async function GET() {
  const user: User = {
    id: "1",
    name: "Ola Nordmann",
  };

  return NextResponse.json(user);
}
