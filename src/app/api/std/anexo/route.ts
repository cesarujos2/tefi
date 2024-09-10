import { Std } from "@/services/std";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    roadmap: string
}

const std = new Std();

export async function GET(request: NextRequest) {
    try {
        const roadmap = getParam(request, "roadmap")
        if(!roadmap) throw new Error("Parametos incorrectos")

        const pdfArrayBuffer = await std.downloadAllAnnex({nroHojaRuta: roadmap})
        let response = new NextResponse(pdfArrayBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=Anexo.pdf'
            }
        });
        return response;
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}

function getParam(request: NextRequest, paramName: keyof Params) {
    const searchParams = request.nextUrl.searchParams
    return searchParams.get(paramName)
}