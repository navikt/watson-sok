import { NextResponse } from 'next/server'
import type { User} from "@/app/types/user";

export async function GET() {
    const user: User = {
        id: '1',
        name: 'Ola Nordmann'
    }

    return NextResponse.json(user)
}
