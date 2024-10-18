import axios, { AxiosInstance } from "axios";
import adapterTEFI, { AdaptedData } from "./Adapters/adapterTEFI";

export class Tefi {
    private axiosInstance: AxiosInstance;
    private token: string | null = null;
    constructor(baseUrl: string) {
        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
    }

    private async Request(method: string, args: any): Promise<any> {
        const postData = {
            method: method,
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: JSON.stringify(args),
        };

        const response = await this.axiosInstance.post('/service/v4_1/rest.php', postData);
        return response.data;
    }

    private async GetToken(force: boolean = false): Promise<boolean> {
        try {
            if (this.token && !force) return true
            const result = await this.Request('login', {
                'user_auth': {
                    'user_name': process.env.TEFI_USER,
                    'password': process.env.TEFI_PASS
                },
                'application_name': process.env.TEFI_NAME,
                'name_value_list': {}
            })
            this.token = result.id
            return true
        } catch (error: any) {
            return false
        }
    }

    public async GetFitac(roadmap: string[]): Promise<AdaptedData[]> {
        try {
            await this.GetToken()
            if (!this.token) return []

            const formattedList = roadmap.map(id => { if (id) { return `"${id}"` } }).join(', ');
            const postData = {
                session: this.token,
                module_name: "Fitac_fitac",
                query: `document_name IN (${formattedList})`,
                order_by: "",
                offset: 0,
                select_fields: [],
                link_name_to_fields_array: [],
                max_results: 100,
                deleted: 0
            }

            const result = await this.Request('get_entry_list', postData)
            if (result.number == 11) {
                await this.GetToken(true)
                return await this.GetFitac(roadmap)
            }
            let data = result as Fitac
            if (data.result_count == 0) return []

            return adapterTEFI(data) 
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
    public async GetOficiosFitac(roadmap: string[]): Promise<AdaptedData[] > {
        try {
            await this.GetToken()
            if (!this.token) return []

            const formattedList = roadmap.map(id => { if (id) { return `"${id}"` } }).join(', ');
            const postData = {
                session: this.token,
                module_name: "Fitac_fitac",
                query: `document_name IN (${formattedList})`,
                order_by: "",
                offset: 0,
                select_fields: ["document_name", "nro_oficio_rep_c", "fecha_oficio_c", "link_oficio_c"],
                link_name_to_fields_array: [],
                max_results: 100,
                deleted: 0
            }

            const result = await this.Request('get_entry_list', postData)
            if (result.number == 11) {
                await this.GetToken(true)
                return await this.GetOficiosFitac(roadmap)
            }
            let data = result as Fitac
            if (data.result_count == 0) return []

            return adapterTEFI(data) 
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}



export const tefi = new Tefi(process.env.URL_API_TEFI);