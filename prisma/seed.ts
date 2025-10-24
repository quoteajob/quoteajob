import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quoteajob.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@quoteajob.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isSubscribed: true,
      trustScore: 100,
      profileCompletion: 100,
    },
  })

  // Create sample professional user
  const proPassword = await bcrypt.hash('pro123', 12)
  const professional = await prisma.user.upsert({
    where: { email: 'pro@example.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'pro@example.com',
      passwordHash: proPassword,
      role: 'PRO',
      isSubscribed: true,
      trustScore: 85,
      profileCompletion: 85,
      companyName: 'Smith Plumbing Services',
      tradeCategory: 'Plumbing',
      description: 'Experienced plumber with 10+ years in the industry. Specializing in residential and commercial plumbing services.',
      qualifications: 'City & Guilds Plumbing Level 3, Gas Safe Registered, 10+ years experience',
    },
  })

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'user@example.com',
      passwordHash: userPassword,
      role: 'USER',
      isSubscribed: false,
      trustScore: 0,
      profileCompletion: 0,
    },
  })

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Kitchen Renovation',
      description: 'Complete kitchen renovation including new cabinets, countertops, and appliances. Looking for experienced contractor.',
      category: 'Kitchen',
      location: 'London',
      budget: 15000,
      userId: user.id,
      averageQuote: 12000,
    },
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Bathroom Repair',
      description: 'Fix leaking shower and replace bathroom tiles. Small job but needs to be done quickly.',
      category: 'Bathroom',
      location: 'Manchester',
      budget: 2000,
      userId: user.id,
      averageQuote: 1800,
    },
  })

  // Create sample quotes
  await prisma.quote.create({
    data: {
      jobId: job1.id,
      proId: professional.id,
      amount: 12000,
      comment: 'I can complete this renovation within 4 weeks. Includes all materials and labor.',
      status: 'ABOUT_RIGHT',
    },
  })

  await prisma.quote.create({
    data: {
      jobId: job2.id,
      proId: professional.id,
      amount: 1800,
      comment: 'Quick fix for your bathroom issues. Can start next week.',
      status: 'ABOUT_RIGHT',
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@quoteajob.com / admin123')
  console.log('Professional user: pro@example.com / pro123')
  console.log('Regular user: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
