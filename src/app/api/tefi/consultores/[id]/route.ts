import { db } from "@/services/DB/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    id: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        if (!params.id) return NextResponse.json({ error: "Missing roadmap" }, { status: 400 });
        const result = await db.getConsultores();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}
