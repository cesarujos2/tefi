import { getFitac } from "@/services/getFitac";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    roadmap: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        if (!params.roadmap) return NextResponse.json({ error: "Missing roadmap" }, { status: 400 });
        const result = await getFitac(params.roadmap);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}
