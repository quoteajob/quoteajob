import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      totalJobs,
      totalQuotes,
      activePros,
      averageQuoteValue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.quote.count(),
      prisma.user.count({
        where: {
          role: 'PRO',
          isSubscribed: true
        }
      }),
      prisma.quote.aggregate({
        _avg: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalJobs,
      totalQuotes,
      activePros,
      averageQuoteValue: averageQuoteValue._avg.amount || 0
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
