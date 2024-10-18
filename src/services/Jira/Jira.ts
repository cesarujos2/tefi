import axios, { AxiosInstance } from "axios";
import { statusEquivalencia } from "./dgprc/status";
import { parseText } from "@/services/Jira/libs/ParseText";

export class Jira {
    private axiosInstance: AxiosInstance;
    constructor(url: string, email: string, token: string) {
        this.axiosInstance = axios.create({
            baseURL: url,
            headers: {
                "Content-Type": "application/json"
            },
            auth: {
                username: email,
                password: token
            }
        })
    }


    async getIssueContent(issue: string): Promise<{
        title: string,
        description: string,
        creator: string,
        roadmaps: {
            roadmap: string,
            status: typeof statusEquivalencia[keyof typeof statusEquivalencia] | null
        }[]
    } | null> {
        try {
            const response = await this.axiosInstance.get(`/issue/${issue}`)
            const data = response.data as Issue

            const title = data.fields.summary
            const description = extractContent(data.fields.description.content)
            const creator = `${data.fields.creator.displayName}`
            const roadmapslist = extractRoadmaps(data.fields)

            const roadmaps = await Promise.all(roadmapslist.map(roadmap => {
                return this.getSatusIssueBySummary(roadmap).then(status => ({
                    roadmap,
                    status
                }));
            }));

            return { title, description, creator, roadmaps }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getSatusIssueBySummary(roadmap: string): Promise<typeof statusEquivalencia[keyof typeof statusEquivalencia]| null> {
        try {
            const response = await this.axiosInstance.get(`/search`,
                {
                    params: {
                        'jql': `project = EI AND summary ~ ${roadmap}`
                    }
                }
            )
            const listIssues = response.data.issues as Issue[]
            if (listIssues.length == 0) return null
            const status = listIssues[0].fields.status.name as keyof typeof statusEquivalencia;
            return statusEquivalencia[status]
        } catch (error) {
            console.error(error)
            return null
        }
    }
    async sendComment(issue: string, comment: string): Promise<{ success: boolean, message: string }> {
        try {
            const content = parseText.parseMarkdownText(comment)
            const response = await this.axiosInstance.post(`/issue/${issue}/comment`,
                {
                    body: {
                        type: "doc",
                        version: 1,
                        content: content
                    }
                }
            )
            return { success: true, message: response.statusText }
        } catch (err: any) {
            console.error(err)
            return { success: false, message: err.message }
        }
    }
}


function extractContent(description: Content2[]): string {
    let content = "";

    if (description.length > 0) {
        description.forEach((parrafo) => {
            if (parrafo.type === "paragraph") {
                parrafo.content.forEach((lineText) => {
                    if (lineText.type === "text") {
                        content += `${lineText.text} `;
                    }
                });
            }
        });
        content = content.trim();
    }
    return content
}

function extractRoadmaps(description: Fields): string[] {
    const hojasDeRuta = JSON.stringify(description)
        .replace(/\s+/g, '')
        .match(/(?<!S-)\b\d{6}-\d{4}\b/g);

    const rutasFormateadas = hojasDeRuta ? [... new Set(hojasDeRuta.map(x => `E-${x}`))] : [];

    return rutasFormateadas
}

export const jira = new Jira(process.env.JIRA_URL, process.env.JIRA_EMAIL, process.env.JIRA_TOKEN)

