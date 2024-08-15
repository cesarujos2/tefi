import { GetPDF } from "@/services/tefiAPI";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    id: string
}

export async function GET(request: NextRequest) {
    try {
        const idFitac = getParam(request, "id")
        const idTemplate = getParam(request, "idTemplate")

        if(!idFitac || !idTemplate) throw new Error("Parametos incorrectos")
        var pdfArrayBuffer = await GetPDF(idFitac, idTemplate)
        let response = new NextResponse(pdfArrayBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=ficha.pdf'
            }
        });
        return response;
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}

function getParam(request: NextRequest, paramName: string) {
    const searchParams = request.nextUrl.searchParams
    return searchParams.get(paramName)
}