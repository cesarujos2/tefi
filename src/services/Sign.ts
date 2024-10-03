import {
    PDFDocument,
    PDFName,
    PDFNumber,
    PDFHexString,
    PDFString,
    PDFArray,
    StandardFonts,
    rgb,
    PDFPage,
    PDFFont,
} from "pdf-lib";
import signpdf from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import forge from "node-forge"

export default class SignPDF {
    private pdfDoc: Buffer;
    private certificate: Buffer;
    private imagen: Buffer;
    private passphrase: string;

    constructor(pdfFile: Buffer, certFile: Buffer, passphrase: string, imageFile: Buffer) {
        this.pdfDoc = pdfFile;
        this.certificate = certFile;
        this.passphrase = passphrase;
        this.imagen = imageFile;
    }

    async sign(): Promise<Buffer> {
        await this.addVisibleSignature(this.imagen)
        await this._addPlaceholder();

        const signer = new P12Signer(this.certificate, { passphrase: this.passphrase });

        const pdfSigned = await signpdf.sign(this.pdfDoc, signer);

        return pdfSigned;
    }

    private getSignerName(): string {
        const p12Asn1 = forge.asn1.fromDer(this.certificate.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.passphrase);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

        const a = certBags[forge.pki.oids.certBag];
        if (!a) return '';

        const cert = a[0].cert;

        const subject = cert?.subject.attributes;
        const commonNameAttr = subject?.find(attr => attr.name === 'commonName');

        let name = commonNameAttr?.value;

        if (name && typeof name === 'string') {
            const buffer = Buffer.from(name, 'binary');
            name = buffer.toString('utf-8');
            name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            name = name.replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, '');

            return name;
        }

        return '';
    }




    private async _addPlaceholder(): Promise<void> {
        const loadedPdf = await PDFDocument.load(this.pdfDoc);
        const ByteRange = PDFArray.withContext(loadedPdf.context);
        const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
        const SIGNATURE_LENGTH = 8192;
        const pages = loadedPdf.getPages();

        ByteRange.push(PDFNumber.of(0));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));

        const signatureDict = loadedPdf.context.obj({
            Type: 'Sig',
            Filter: 'Adobe.PPKLite',
            SubFilter: 'adbe.pkcs7.detached',
            ByteRange,
            Contents: PDFHexString.of('A'.repeat(SIGNATURE_LENGTH)),
            Reason: PDFString.of('Soy el autor del documento'),
            M: PDFString.fromDate(new Date()),
        });

        const signatureDictRef = loadedPdf.context.register(signatureDict);

        const widgetDict = loadedPdf.context.obj({
            Type: 'Annot',
            Subtype: 'Widget',
            FT: 'Sig',
            Rect: [0, 0, 0, 0],
            V: signatureDictRef,
            T: PDFString.of('test signature'),
            F: 4,
            P: pages[0].ref,
        });

        const widgetDictRef = loadedPdf.context.register(widgetDict);

        pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef]));

        loadedPdf.catalog.set(
            PDFName.of('AcroForm'),
            loadedPdf.context.obj({
                SigFlags: 3,
                Fields: [widgetDictRef],
            })
        );

        const pdfBytes = await loadedPdf.save({ useObjectStreams: false });

        this.pdfDoc = SignPDF.unit8ToBuffer(pdfBytes);
    }

    static unit8ToBuffer(unit8: Uint8Array): Buffer {
        const buf = Buffer.alloc(unit8.byteLength);
        const view = new Uint8Array(unit8);

        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    private async addVisibleSignature(signatureImageBytes: Buffer): Promise<void> {
        const loadedPdf = await PDFDocument.load(this.pdfDoc);
        const pages = loadedPdf.getPages();
        const firstPage = pages[0];

        const signatureImage = await loadedPdf.embedPng(signatureImageBytes);

        const { width, height } = firstPage.getSize();

        const imageWidth = 50;
        const imageHeight = 50;

        const signatureX = width - 190
        const signatureY = 190

        firstPage.drawImage(signatureImage, {
            x: signatureX,
            y: signatureY,
            width: imageWidth,
            height: imageHeight,
        });

        // Obtener la fuente para dibujar el texto
        const font = await loadedPdf.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await loadedPdf.embedFont(StandardFonts.Helvetica);

        // Definir los textos que se van a escribir
        const signerName = this.getSignerName()
        const reason = "Soy el autor del documento";
        const date = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

        const textX = signatureX + imageWidth + 5;
        let textY = signatureY + 40;

        const maxTextWidth = 130;

        textY -= 10 * this.drawTextWithWrapping(firstPage, 'Firmado digitalmente por:', textX, textY, fontRegular, 8, maxTextWidth);
        textY -= 10 * this.drawTextWithWrapping(firstPage, signerName, textX, textY, font, 8, maxTextWidth);
        textY -= 10 * this.drawTextWithWrapping(firstPage, `Motivo: ${reason}`, textX, textY, fontRegular, 8, maxTextWidth);
        textY -= 10 * this.drawTextWithWrapping(firstPage, `Fecha: ${date}`, textX, textY, fontRegular, 8, maxTextWidth);

        const pdfBytes = await loadedPdf.save({ useObjectStreams: false });

        this.pdfDoc = SignPDF.unit8ToBuffer(pdfBytes);
    }

    private drawTextWithWrapping(page: PDFPage, text: string, x: number, y: number, font: PDFFont, fontSize: number, maxWidth: number): number {
        const words = text.split(' ');
        let line = '';
        let lineHeight = fontSize + 2;
        let lineCount = 0;

        for (const word of words) {
            const testLine = line + word + ' ';
            const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (lineWidth > maxWidth && line !== '') {
                page.drawText(line.trim(), {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });
                line = word + ' ';
                y -= lineHeight;
                lineCount++;
            } else {
                line = testLine;
            }
        }

        // Dibujar la última línea
        if (line !== '') {
            page.drawText(line.trim(), {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
            lineCount++;
        }

        return lineCount;
    }



}
