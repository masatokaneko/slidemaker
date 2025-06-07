import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const industry = searchParams.get("industry")

  try {
    const templates = await prisma.template.findMany({
      where: {
        AND: [category ? { category } : {}, industry ? { industry } : {}, { isPublic: true }],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { usage: true },
        },
      },
      orderBy: [{ featured: "desc" }, { usage: { _count: "desc" } }, { createdAt: "desc" }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, category, industry, yamlData, thumbnail, isPublic } = await request.json()

    const template = await prisma.template.create({
      data: {
        title,
        description,
        category,
        industry,
        yamlData,
        thumbnail,
        isPublic: isPublic || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
