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
    PDFObject,
} from "pdf-lib";
import signpdf from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import forge from "node-forge"

export default class SignPDF {
    private pdfDoc: Buffer;
    private certificate: Buffer;
    private imagen: Buffer;
    private passphrase: string;
    private settings: SettingVisibleSignature = {
        signatureY: 240,
        maxTextWidth: 90,
        fontSize: 6,
        gap: 5,
        imageWidth: 70,
        signatureX: "right"
    }

    constructor(pdfFile: Buffer, certFile: Buffer, passphrase: string, imageFile: Buffer, settings: Partial<SettingVisibleSignature>) {
        this.pdfDoc = pdfFile;
        this.certificate = certFile;
        this.passphrase = passphrase;
        this.imagen = imageFile;
        this.settings = { ...this.settings, ...settings}
    }

    async sign(): Promise<Buffer> {
        await this.addVisibleSignature(this.imagen)

        const annotations = await this.extractAnnotations()
        await this._addPlaceholder(annotations);

        const signer = new P12Signer(this.certificate, { passphrase: this.passphrase });

        const pdfSigned = await signpdf.sign(this.pdfDoc, signer);

        return pdfSigned;
    }

    private async extractAnnotations(): Promise<any[]> {
        const pdfDoc = await PDFDocument.load(this.pdfDoc);
        const pages = pdfDoc.getPages();
        const annotations = [];

        for (const page of pages) {
            const annots = page.node.Annots();  // Extrae las anotaciones
            if (annots) {
                // Resuelve los PDFRef en anotaciones reales
                const resolvedAnnots = annots.asArray().map(annot => pdfDoc.context.lookup(annot));
                annotations.push(resolvedAnnots);
            }
        }
        return annotations;
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




    private async _addPlaceholder(annotations: (PDFObject | undefined)[][]): Promise<void> {
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

        // Obtener las anotaciones existentes de la primera página
        const existingAnnots = pages[0].node.Annots();
        const allAnnots = existingAnnots ? [...existingAnnots.asArray()] : [];

        // Iterar manualmente sobre las anotaciones resueltas y registrarlas en el contexto del PDF
        annotations.forEach(annotationPage => {
            annotationPage.forEach(annot => {
                if (annot) {
                    allAnnots.push(loadedPdf.context.register(annot));
                }
            });
        });

        // Añadir el widget de la firma
        allAnnots.push(widgetDictRef);

        // Asignar las anotaciones combinadas a la página del PDF
        pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj(allAnnots));

        //pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef, ...annotations]));

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

        const { width, height } = firstPage.getSize();

        const signatureImage = await loadedPdf.embedPng(signatureImageBytes);
        const font = await loadedPdf.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await loadedPdf.embedFont(StandardFonts.Helvetica);


        const signerName = this.getSignerName()
        const reason = "Soy el autor del documento";
        const date = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });


        let signatureY = this.settings.signatureY
        let maxTextWidth = this.settings.maxTextWidth;
        let fontSize = this.settings.fontSize
        let gap = this.settings.gap
        let imageWidth = this.settings.imageWidth;
        let signatureX
        switch(this.settings.signatureX){
            case "left":
                signatureX = 2
                break;
            case "right":
                signatureX = width - (maxTextWidth + gap + imageWidth)
                break;
            case "center":
                signatureX = width / 2 - (maxTextWidth + gap + imageWidth) / 2

        }

        if (imageWidth == 0) gap = 2
        const textX = signatureX + imageWidth + gap;
        let textY = signatureY - (fontSize + 2);

        textY -= (fontSize + 2) * this.drawTextWithWrapping(firstPage, 'Firmado digitalmente por:', textX, textY, fontRegular, fontSize, maxTextWidth);
        textY -= (fontSize + 2) * this.drawTextWithWrapping(firstPage, signerName, textX, textY, font, fontSize, maxTextWidth);
        textY -= (fontSize + 2) * this.drawTextWithWrapping(firstPage, `Motivo: ${reason}`, textX, textY, fontRegular, fontSize, maxTextWidth);
        this.drawTextWithWrapping(firstPage, `Fecha: ${date}`, textX, textY, fontRegular, fontSize, maxTextWidth);

        let imageHeight = imageWidth * signatureImage.height / signatureImage.width

        let imageX
        let imageY

        if (imageHeight >= (signatureY - textY)) {
            imageHeight = (signatureY - textY)
            imageWidth = imageHeight * signatureImage.width / signatureImage.height
            imageY = signatureY - imageHeight
            imageX = textX - gap - imageWidth
        } else {
            imageX = signatureX
            imageY = ((signatureY - textY) / 2) - (imageHeight/2) + textY
        }

        firstPage.drawImage(signatureImage, {
            x: imageX,
            y: imageY,
            width: imageWidth,
            height: imageHeight,
            opacity: 0.9,
        });

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

export interface SettingVisibleSignature {
  signatureY: number;
  maxTextWidth: number;
  fontSize: number;
  gap: number;
  imageWidth: number;
  signatureX: "center" | "left" | "right";
}
