# QuoteAJOB - Professional Job Quoting Platform

A full-stack web application that connects job posters with verified professionals for transparent, competitive quoting.

## Features

### For Job Posters (Free)
- Post jobs for free
- Receive quotes from verified professionals
- See average quote pricing for transparency
- Compare quotes with "lower/about right/higher" indicators

### For Professionals (£6.99/month)
- Subscribe to quote unlimited jobs
- Build trust score with verified profile
- Get visibility with higher trust scores
- Access to all job categories

### Admin Panel
- Manage users, jobs, and quotes
- View platform metrics
- Monitor subscription status

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Credentials + Google OAuth)
- **Payments:** Stripe subscriptions
- **UI:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Hosting:** Vercel ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Google OAuth credentials (optional)
- Resend account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quoteajob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/quoteajob?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   
   # Email
   RESEND_API_KEY="your_resend_api_key"
   
   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models

- **User**: Users, professionals, and admins
- **Job**: Job postings with categories and locations
- **Quote**: Professional quotes on jobs
- **Subscription**: Stripe subscription management

### Key Features

- **Trust Score**: Calculated based on profile completion
- **Quote Comparison**: Automatic "lower/about right/higher" classification
- **Subscription Management**: Stripe integration for professional subscriptions
- **Admin Dashboard**: User and job management

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create new job
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Quotes
- `GET /api/quotes` - List quotes
- `POST /api/quotes` - Submit quote

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Stripe
- `POST /api/stripe/create-checkout-session` - Create subscription
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/jobs` - Job management

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Set up database**
   - Use Vercel Postgres or external PostgreSQL
   - Update `DATABASE_URL` in Vercel environment variables

4. **Configure Stripe webhooks**
   - Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Copy webhook secret to environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `RESEND_API_KEY` | Resend API key | No |

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database (if configured)
npm run db:studio    # Open Prisma Studio

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@quoteajob.com or create an issue in the repository.