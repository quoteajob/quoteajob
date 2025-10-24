export interface User {
  id: string
  name?: string | null
  email: string
  role: string
  isSubscribed: boolean
  trustScore: number
  profileCompletion: number
  companyName?: string | null
  tradeCategory?: string | null
  description?: string | null
  insuranceDoc?: string | null
  qualifications?: string | null
  emailVerified?: Date | null
}

export interface TrustScoreFields {
  name: boolean
  companyName: boolean
  tradeCategory: boolean
  description: boolean
  insuranceDoc: boolean
  qualifications: boolean
  emailVerified: boolean
}

export function calculateTrustScore(user: User): number {
  const fields: TrustScoreFields = {
    name: !!user.name,
    companyName: !!user.companyName,
    tradeCategory: !!user.tradeCategory,
    description: !!user.description,
    insuranceDoc: !!user.insuranceDoc,
    qualifications: !!user.qualifications,
    emailVerified: !!user.emailVerified,
  }

  const totalFields = Object.keys(fields).length
  const completedFields = Object.values(fields).filter(Boolean).length
  
  return Math.round((completedFields / totalFields) * 100)
}

export function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getTrustScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}
