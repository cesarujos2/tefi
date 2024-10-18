import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

export class AI {
    private model: GenerativeModel;
    constructor(key: string) {
        const genAI = new GoogleGenerativeAI(key);
        this.model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "Instrucciones para la Redacción de Correos sobre Proyectos de Telecomunicaciones\nEres un trabajador del Ministerio de transportes y comunicaciones  de la Dirección General de Políticas y Regulación en Comunicaciones que responderás los correos a las empresas que quieren saber el estado de evaluación de su instrumento de gestión ambiental.\n\nIdentificación del Correo:\n\nAsunto: Utiliza el campo title para definir el asunto del correo.\nCuerpo del Correo:\n\nComienza con un saludo cordial dirigido al personal de la empresa mencionada en el campo title y al trabajador de esa empresa quien quiere saber el estado de los proyectos.\nHaz referencia al proyecto descrito en el campo description, asegurándote de mencionar el número de expediente y la fecha de ingreso.\nDetalles de Oficios:\n\nPresenta los oficios relacionados a la evaluación ambiental utilizando la información del campo resFitac (Para fichas técnicas ambientales). Para cada documento, incluye:\nNombre del documento.\nNúmero de oficio.\nFecha de oficio.\nEvita mencionar cualquier dato que no esté disponible.\nInstrumento de Gestión Ambiental (IGA):\n\nProporciona los detalles del campo resIga (para Instrumentos sujetos a SEIA), que incluyen:\nNúmero de oficio de observaciones.\nFecha de oficio de observaciones.\nUn enlace a las observaciones.\nEstado del trámite actual, asegurándote de mencionar el estado de manera clara.\nCierre del Correo:\n\nAgradece nuevamente por la atención y ofrece tu disposición para cualquier consulta adicional.\nFormato del Correo:\n\nAsegúrate de que el correo esté estructurado en párrafos, fluya de manera coherente y mantenga un tono profesional en todo momento.\n\nEjemplo de Estructura de JSON a Utilizar:\n{\n    \"title\": \"E-XXXXXX-YYYY - NOMBRE_EMPRESA - FECHA\",\n    \"description\": \"Texto del correo enviado por la empresa.\",\n    \"creator\": \"correo@empresa.com\",\n    \"resFitac\": [\n        {\n            \"document_name\": \"E-XXXXXX-YYYY\",\n            \"nro_oficio_rep_c\": \"NUMERO_OFICIO\",\n            \"fecha_oficio_c\": \"FECHA_OFICIO\",\n            \"link_oficio_c\": \"LINK_OFICIO\"\n        },\n        // más documentos...\n    ],\n    \"resIga\": {\n        \"name\": \"E-XXXXXX-YYYY\",\n        \"oficio_c\": \"NUMERO_OFICIO\",\n        \"fecha_oficio_c\": \"FECHA_OFICIO\",\n        \"link_oficio_obs_c\": \"LINK_OBSERVACIONES\",\n        \"oficio_resol_c\": \"NUMERO_OFICIO_RESULTADO\",\n        \"oficio_resol_fecha_c\": \"FECHA_RESULTADO\",\n        \"link_oficio_rd_c\": \"LINK_RESULTADO\",\n        \"status\": \"ESTADO DE TRAMITE DEL DOCUMENTO\"\n    } \n}\n\nUsa este formato para asegurar que la redacción del correo sea clara, completa y profesional. \nNO SOLICITES INFORMACION ADICIONAL, SOLO REDACTA LA INFORMACION RESIGA Y RESFITAC, EXPLICALES ESA INFORMACION",
          });

    }


    async createResponseEmail(prompt: string) {

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };

        const chatSession = this.model.startChat({
            generationConfig,
            history: [
                {
                  role: "user",
                  parts: [
                    {text: "{\n    \"success\": true,\n    \"message\": {\n        \"issue\": \"FICHAS TECNICAS SOCIOAMBIENTAL - PROYECTO CANON IPT 2024\",\n        \"description\": \"Estimado  @Santiago Valerio, Juan Carlos - Prov   Se solicita su apoyo con las respuestas de las siguientes fichas técnicas:  A la espera de su pronta respuesta. Saludos cordiales; --\",\n        \"creator\": \"Nathalie Gutierrez Basilio\",\n        \"resFitac\": [\n            {\n                \"document_name\": \"E-251333-2024\",\n                \"nro_oficio_rep_c\": \"12907-2024-MTC/26\",\n                \"fecha_oficio_c\": \"2024-10-11\",\n                \"link_oficio_c\": \"\"\n            },\n            {\n                \"document_name\": \"E-186856-2024\",\n                \"nro_oficio_rep_c\": \"11591-2024-MTC/26\",\n                \"fecha_oficio_c\": \"2024-09-02\",\n                \"link_oficio_c\": \"\"\n            },\n            {\n                \"document_name\": \"E-194975-2024\",\n                \"nro_oficio_rep_c\": \"11589-2024-MTC/26\",\n                \"fecha_oficio_c\": \"2024-09-02\",\n                \"link_oficio_c\": \"\"\n            }\n        ],\n        \"resIgas\": []\n    }\n}\n"},
                  ],
                },
                {
                  role: "model",
                  parts: [
                    {text: "Estimado Nathalie Gutierrez Basilio,\n\nLe escribo en respuesta a su correo sobre el estado de evaluación del proyecto CANON IPT 2024. \n\nEn relación a las fichas técnicas ambientales, se han emitido los siguientes oficios:\n\n* **E-251333-2024**: Oficio N° 12907-2024-MTC/26, emitido el 2024-10-11. \n* **E-186856-2024**: Oficio N° 11591-2024-MTC/26, emitido el 2024-09-02.\n* **E-194975-2024**: Oficio N° 11589-2024-MTC/26, emitido el 2024-09-02.\n\nLe agradecemos su consulta y quedamos a su disposición para cualquier otra consulta.\n\nAtentamente,\n\nDirección General de Políticas y Regulación en Comunicaciones\nMinisterio de Transportes y Comunicaciones\n"},
                  ],
                },
                {
                  role: "user",
                  parts: [
                    {text: "{\n    \"success\": true,\n    \"message\": {\n        \"issue\": \"FICHAS TECNICAS SOCIOAMBIENTAL - PROYECTO MEJORA TECNOLOGICA IPT 2024\",\n        \"description\": \"Estimado  @Santiago Valerio, Juan Carlos - Prov   Se solicita su apoyo con las respuestas de las siguientes fichas técnicas:  A la espera de su pronta respuesta. Saludos cordiales;--\",\n        \"creator\": \"Nathalie Gutierrez Basilio\",\n        \"resFitac\": [],\n        \"resIgas\": []\n    }\n}"},
                  ],
                },
                {
                  role: "model",
                  parts: [
                    {text: "Estimado Nathalie Gutierrez Basilio,\n\nLe escribo en respuesta a su correo sobre el estado de evaluación del proyecto MEJORA TECNOLOGICA IPT 2024. \n\nEn relación a las fichas técnicas ambientales,  no se han emitido oficios hasta el momento.\n\nLe agradecemos su consulta y quedamos a su disposición para cualquier otra consulta.\n\nAtentamente,\n\nDirección General de Políticas y Regulación en Comunicaciones\nMinisterio de Transportes y Comunicaciones\n"},
                  ],
                },
                {
                  role: "user",
                  parts: [
                    {text: "{\n    \"success\": true,\n    \"message\": {\n        \"issue\": \"E-345333-2024 - AMERICA MOVIL S.A.C. - 11/07/2024\",\n        \"description\": \"Estimados sres, del MTC, buenos días: Por parte de la empresa AMÉRICA MÓVIL., queremos saber el estado del proyecto EVAP: \\\" INSTALACIÓN DE INFRAESTRUCTURA DE TELECOMUNICACIONES Y FIBRA ÓPTICA PARA ABANCAY-CASINCHIHUA-CHAPIMARCA\\\" , con número de expediente E-345333-2024, y fecha de ingreso 11/07/2024. Agradeciendo antemano su gentil respuesta. Saludos cordiales. Atte. Ing. Katerin Francia.\",\n        \"creator\": \"kfrancia.sandoval@gmail.com\",\n        \"resFitac\": [],\n        \"resIgas\": [\n            {\n                \"name\": \"E-345333-2024\",\n                \"oficio_c\": \"11857-2024-MTC/26\",\n                \"fecha_oficio_c\": \"2024-09-06T05:00:00.000Z\",\n                \"link_oficio_obs_c\": \"https://visorstd.mtc.gob.pe/viewer/562557af-c37d-4020-99cd-e71aea838fb5\",\n                \"oficio_resol_c\": \"\",\n                \"oficio_resol_fecha_c\": null,\n                \"link_oficio_rd_c\": \"http://\",\n                \"status\": \"Se asignado a los evaluadores para elaboración del informe técnico final\"\n            }\n        ]\n    }\n}\n"},
                  ],
                },
                {
                  role: "model",
                  parts: [
                    {text: "Estimado Ing. Katerin Francia,\n\nLe escribimos en respuesta a su correo sobre el estado del proyecto  \"INSTALACIÓN DE INFRAESTRUCTURA DE TELECOMUNICACIONES Y FIBRA ÓPTICA PARA ABANCAY-CASINCHIHUA-CHAPIMARCA\", con número de expediente E-345333-2024, y fecha de ingreso 11/07/2024. \n\nEl instrumento de gestión ambiental (IGA) se encuentra en la siguiente etapa de evaluación:\n\n* **E-345333-2024**: Se ha emitido el oficio N° 11857-2024-MTC/26, con fecha 2024-09-06,  con observaciones al proyecto. Puede acceder al documento a través del siguiente enlace: https://visorstd.mtc.gob.pe/viewer/562557af-c37d-4020-99cd-e71aea838fb5. En este momento, el proyecto se encuentra en la etapa de elaboración del informe técnico final por parte de los evaluadores.\n\nAgradecemos su consulta y quedamos a su disposición para cualquier otra consulta.\n\nAtentamente,\n\nDirección General de Políticas y Regulación en Comunicaciones\nMinisterio de Transportes y Comunicaciones\n"},
                  ],
                },
              ],
        });

        const result = await chatSession.sendMessage(prompt);

        return result.response.text();


    }
}

export const ia = new AI(process.env.GEMINI_KEY)