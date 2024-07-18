import { tefiDB } from "@/services/tefiDB";
import { NextRequest, NextResponse } from "next/server";

type Body = {
    query: string
}

export async function POST(request: NextRequest) {
    try {
        const body: Body = await request.json();
        const result = await tefiDB(body.query);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(error);
    }
}

export async function GET() {
    try {
        return NextResponse.json({cargado: 'cargado'});
    } catch (error) {
        return NextResponse.json(error);
    }
}