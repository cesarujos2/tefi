import SignPDF from "@/services/Sign";
import { GetPDF } from "@/services/tefiAPI";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs'
import path from "path";

type Params = {
    id: string
}

export async function GET(request: NextRequest) {
    try {
        const idFitac = getParam(request, "id")
        const idTemplate = getParam(request, "idTemplate")

        if (!idFitac || !idTemplate) throw new Error("Parametos incorrectos")
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


interface BodyPDF {
    idFitac: string;
    idTemplate: string;
    certificate: string;
    passphrase: string;
}


export async function POST(request: NextRequest) {
    try {
        const { idFitac, idTemplate, certificate, passphrase } = await request.json() as BodyPDF
        if (!idFitac || !idTemplate || !certificate || !passphrase) throw new Error("Body incomplete!")

        let pdfArrayBuffer = await GetPDF(idFitac, idTemplate)
        if (!pdfArrayBuffer) throw new Error("No existe pdf")
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        
        
        const certificateFile = base64ToBuffer(certificate)

        const imagePath = path.join(process.cwd(), 'public', 'escudo.png');
        const ImageFile = fs.readFileSync(imagePath)
        
        const signPDF = new SignPDF(pdfBuffer, certificateFile, passphrase, ImageFile)
        const signedPDF = await signPDF.sign()

        let response = new NextResponse(signedPDF, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=ficha.pdf'
            }
        });
        return response;

    } catch (error: any) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }

}

function base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
}

function bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
}
