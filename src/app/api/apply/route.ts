import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const formData = await request.json()

  // Convert expectedSalary to a number
  const expectedSalary = parseInt(formData.expectedSalary, 10)

  try {
    const newApplication = await prisma.job_applications.create({
      data: {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        current_living_place: formData.currentLivingPlace,
        place_to_work: formData.placeToWork,
        job_title: formData.jobTitle,
        expected_salary: isNaN(expectedSalary) ? 0 : expectedSalary,
        info: formData.info,
      },
    })
    console.log(newApplication)
    return NextResponse.json({ message: 'Application received', data: newApplication })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error saving application' }, { status: 500 })
  }
}
