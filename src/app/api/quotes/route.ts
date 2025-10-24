import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compareQuoteToAverage } from '@/lib/quote-comparison'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const proId = searchParams.get('proId')

    const where: any = {}
    if (jobId) where.jobId = jobId
    if (proId) where.proId = proId

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            averageQuote: true,
          }
        },
        pro: {
          select: {
            id: true,
            name: true,
            companyName: true,
            trustScore: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a pro and subscribed
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'PRO' || !user.isSubscribed) {
      return NextResponse.json({ 
        error: 'Only subscribed professionals can submit quotes' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { jobId, amount, comment } = body

    if (!jobId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if quote already exists
    const existingQuote = await prisma.quote.findUnique({
      where: {
        jobId_proId: {
          jobId,
          proId: session.user.id
        }
      }
    })

    if (existingQuote) {
      return NextResponse.json({ error: 'Quote already exists for this job' }, { status: 400 })
    }

    // Get job to calculate average
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        quotes: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        jobId,
        proId: session.user.id,
        amount,
        comment,
      }
    })

    // Calculate new average and update job
    const allQuotes = [...job.quotes, quote]
    const newAverage = allQuotes.reduce((sum, q) => sum + q.amount, 0) / allQuotes.length

    await prisma.job.update({
      where: { id: jobId },
      data: { averageQuote: newAverage }
    })

    // Update quote status based on average
    const status = compareQuoteToAverage(amount, newAverage)
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status }
    })

    // Update all other quotes' statuses
    const otherQuotes = job.quotes
    for (const otherQuote of otherQuotes) {
      const otherStatus = compareQuoteToAverage(otherQuote.amount, newAverage)
      await prisma.quote.update({
        where: { id: otherQuote.id },
        data: { status: otherStatus }
      })
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
