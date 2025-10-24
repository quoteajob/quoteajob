import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, companyName, tradeCategory, description, qualifications } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        companyName,
        tradeCategory,
        description,
        qualifications,
      }
    })

    // Calculate new trust score
    const trustScore = calculateTrustScore(updatedUser)
    const profileCompletion = Math.round((Object.values({
      name: !!updatedUser.name,
      companyName: !!updatedUser.companyName,
      tradeCategory: !!updatedUser.tradeCategory,
      description: !!updatedUser.description,
      qualifications: !!updatedUser.qualifications,
      emailVerified: !!updatedUser.emailVerified,
    }).filter(Boolean).length / 6) * 100)

    const finalUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trustScore,
        profileCompletion,
      }
    })

    return NextResponse.json(finalUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
