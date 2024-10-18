import { ia } from "@/services/AI/AI"
import { db } from "@/services/DB/db"
import { jira } from "@/services/Jira/Jira"
import { tefi } from "@/services/Tefi/Tefi"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { issue: string } }) {
    try {
        const issue = await jira.getIssueContent(params.issue)
        if (!issue) return NextResponse.json({ error: `No se encontro el issue ${params.issue}` }, { status: 404 })

        //return NextResponse.json({ success: true, message: issue })

        const listRoadmaps = issue.roadmaps.map(roadmap => roadmap.roadmap)

        const resFitac = await tefi.GetOficiosFitac(listRoadmaps)
        const resIgas = await db.getOficiosIGA(listRoadmaps)
        const resIgasWithStatus = resIgas.map(resIgas => {
            const status = issue.roadmaps.find(roadmap => roadmap.roadmap == resIgas.name)?.status
            return { ...resIgas, status }
        })

        if (!resFitac || !resIgas) return NextResponse.json({ error: `No se encuentra registrado ${listRoadmaps}` }, { status: 404 })
        const prompt = JSON.stringify({ issue: issue.title, description: issue.description, creator: issue.creator, resFitac, resIgas: resIgasWithStatus });
        
        //return NextResponse.json({ success: true, message: JSON.parse(prompt) })

        const mailText = await ia.createResponseEmail(prompt)

        //return NextResponse.json({ success: true, message: mailText })

        const request = await jira.sendComment(params.issue, mailText)

        if (!request.success) return NextResponse.json({ error: request.message }, { status: 500 })

        return NextResponse.json({ success: request.success, message: request.message })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: `Error del servidor: ${error}` }, { status: 500 })
    }
}
