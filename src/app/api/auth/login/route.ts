import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (username === adminUsername && password === adminPassword) {
      // Create a response with authentication token
      const response = NextResponse.json(
        { success: true, message: 'Authentication successful' },
        { status: 200 }
      )

      // Set a simple authentication cookie (in production, use proper JWT)
      response.cookies.set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    }

    return NextResponse.json(
      { error: 'İstifadəçi adı və ya şifrə yanlışdır' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Xəta baş verdi' },
      { status: 500 }
    )
  }
}
