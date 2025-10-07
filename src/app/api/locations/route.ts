import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const locations = await prisma.locations.findMany()
    return NextResponse.json(locations)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error fetching locations' }, { status: 500 })
  }
}
