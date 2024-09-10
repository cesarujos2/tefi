import { createClientAsync } from "soap";
import { Client } from "soap";
import { PDFDocument } from 'pdf-lib';

export class Std {
    private client: STDClient | null = null;

    public async initializeClient(): Promise<void> {
        const url = 'https://wsstd.mtc.gob.pe/tramitews/webservice/serviciosstd?wsdl';

        try {
            this.client = await createClientAsync(url) as STDClient;
            console.log('Cliente SOAP creado con éxito.');
        } catch (err) {
            console.error('Error al crear el cliente SOAP:', err);
            throw err;
        }
    }

    private async ensureClientInitialized(): Promise<void> {
        if (!this.client) {
            await this.initializeClient();
        }
    }

    private async callSoapMethod<T>(methodName: keyof STDClient, args: any): Promise<T> {
        await this.ensureClientInitialized();
        return new Promise<T>((resolve, reject) => {
            this.client?.[methodName](args, (err: any, result: T) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    public async getDocumentByRoadMap(args: ConsultaExpedienteRequest): Promise<Expediente> {
        try {
            const result = await this.callSoapMethod<SoapResponse<Expediente | Expediente[]>>('consultaExpediente', args);
            if (Array.isArray(result.URL)) {
                return result.URL.find(x => x.noexpediente.split('-')[0] == 'E') ?? result.URL[0]
            }
            return result.URL;
        } catch (err) {
            console.error('Error en la consulta del expediente:', err);
            throw err;
        }
    }

    public async getListAnnex(args: ObtenerAnexoRequest): Promise<Anexo[]> {
        try {
            const result = await this.callSoapMethod<SoapResponse<Anexo[]>>('obtenerAnexo', args);
            return result.URL;
        } catch (err) {
            console.error('Error al invocar el método obtenerAnexo:', err);
            throw err;
        }
    }

    public async downloadAnnex(args: DownloadAnexoWSRequest): Promise<ArrayBuffer> {
        try {
            const result = await this.callSoapMethod<SoapResponse<string>>('downloadAnexoWS', args)
            const pdfBuffer = Buffer.from(result.URL, 'base64');
            return pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
        } catch (err) {
            console.error('Error al invocar el método descargarAnexo', err)
            throw err
        }
    }

    public async downloadAllAnnex(args: ObtenerAnexoRequest) {
        const responseAnnexIds = await this.getListAnnex(args)
        const arrayBuffers = await Promise.all(
            responseAnnexIds.map(async (anexo) => {
                return this.downloadAnnex({ idAnexo: anexo.idAnexo });
            })
        );

        const pdfMerge = await mergePdfs(arrayBuffers.reverse());
        return pdfMerge
    }
}

async function mergePdfs(pdfArrayBuffers: Array<ArrayBuffer>): Promise<ArrayBuffer> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfArrayBuffer of pdfArrayBuffers) {
        const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes.buffer;
}


interface SoapMethod<TRequest, TResponse> {
    (args: TRequest, callback: (err: any, result: TResponse) => void): void;
}

interface SoapResponse<TResponse>{
    URL: TResponse
}

interface STDClient extends Client {
    consultaExpediente: SoapMethod<ConsultaExpedienteRequest, SoapResponse<Expediente | Expediente[] >>
    obtenerAnexo: SoapMethod<ObtenerAnexoRequest, SoapResponse<Anexo[] | Anexo>>
    downloadAnexoWS: SoapMethod<DownloadAnexoWSRequest, SoapResponse<string>>
}

interface ConsultaExpedienteRequest {
    anio: string;
    numero: string;
}

interface ObtenerAnexoRequest {
    nroHojaRuta: string;
}

interface Expediente {
    anexos: string;
    asunto: string;
    cadenasPrueba: string;
    claveAdministrado: string;
    courier: Courier[];
    departamento: string;
    derivExterna: string;
    diasMaxEstadia: string;
    direccion: string;
    distrito: string;
    fechahoradeiniciodetramite: string;
    fechahoradeldocumento: string;
    fechahorarecepcion: string;
    iddoc: string;
    instruccion: string;
    movimientos: Movimientos[];
    noexpediente: string;
    numerodedocumento: string;
    numerodefolios: string;
    observacionDocFin: string;
    ordenVuce: string;
    pais: string;
    prioridad: string;
    procedimiento: string;
    provincia: string;
    remitente: string;
    responsableArea: string;
    responsableUsuario: string;
    situacionactual: string;
    tipodedocumento: string;
    tupa: string;
}

interface Movimientos {
    apellidoMaternoDestino: string;
    apellidoPaternoDestino: string;
    estado: string;
    fechadederivacion: string;
    fechadeestado: string;
    instruccion: string;
    instruccionList: string[];
    nombreDestino: string;
    observacion: string;
    observacionAtencion: string;
    perfil: string;
    remitente: string;
    tiempotranscurrido: string;
    unidaddestino: string;
    usuarioDestino: string;
}

interface Courier {
    direcciontxt: string;
    doAnio: string;
    doDesc: string;
    doId: string;
    doNodoc: string;
    doNohe: string;
    doNohetxt: string;
    doNoordenpedido: string;
    estadotxt: string;
    fechaCrea: string;
}

interface Anexo {
    fechaCrea: string;
    filename: string;
    filenameoriginal: string;
    filenameoriginalV2: string;
    flagDigital: string;
    idAnexo: string;
    idDoc: string;
    nroDoc: string;
    nuevoArchivo: string;
    remitente: string;
    tipoDoc: string;
}

interface DownloadAnexoWSRequest {
    idAnexo: string;
}
