import { QuoteStatus } from '@prisma/client'

export function compareQuoteToAverage(quoteAmount: number, averageAmount: number): QuoteStatus {
  const difference = Math.abs(quoteAmount - averageAmount)
  const percentageDifference = (difference / averageAmount) * 100

  if (quoteAmount < averageAmount) {
    if (percentageDifference > 20) {
      return 'LOWER'
    } else {
      return 'ABOUT_RIGHT'
    }
  } else {
    if (percentageDifference > 20) {
      return 'HIGHER'
    } else {
      return 'ABOUT_RIGHT'
    }
  }
}

export function getQuoteStatusColor(status: QuoteStatus): string {
  switch (status) {
    case 'LOWER':
      return 'text-green-600 bg-green-50'
    case 'ABOUT_RIGHT':
      return 'text-blue-600 bg-blue-50'
    case 'HIGHER':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  switch (status) {
    case 'LOWER':
      return 'Lower than average'
    case 'ABOUT_RIGHT':
      return 'About right'
    case 'HIGHER':
      return 'Higher than average'
    default:
      return 'Unknown'
  }
}
