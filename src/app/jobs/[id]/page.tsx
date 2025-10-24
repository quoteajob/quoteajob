"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Clock, DollarSign, User, MessageSquare, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { getQuoteStatusColor, getQuoteStatusLabel } from "@/lib/quote-comparison"

interface Job {
  id: string
  title: string
  description: string
  category: string
  location: string
  budget?: number
  averageQuote?: number
  createdAt: string
  user: {
    name: string
    companyName?: string
  }
  quotes: Array<{
    id: string
    amount: number
    comment?: string
    status: string
    createdAt: string
    pro: {
      id: string
      name: string
      companyName?: string
      trustScore: number
      profileCompletion: number
    }
  }>
  _count: {
    quotes: number
  }
}

interface QuoteFormData {
  amount: string
  comment: string
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    amount: "",
    comment: ""
  })
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchJob()
    }
  }, [session])

  const fetchJob = async () => {
    try {
      const { id } = await params
      const response = await fetch(`/api/jobs/${id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching job:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }


  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !job) return

    setIsSubmittingQuote(true)

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          amount: parseFloat(quoteForm.amount),
          comment: quoteForm.comment,
        }),
      })

      if (response.ok) {
        toast.success("Quote submitted successfully!")
        setQuoteForm({ amount: "", comment: "" })
        fetchJob() // Refresh job data
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to submit quote")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSubmittingQuote(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !job) {
    return null
  }

  const isJobOwner = session.user.id === job.user.name
  const isPro = session.user.role === "PRO"
  const canQuote = isPro && !isJobOwner

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">QuoteAJOB</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                Back
              </Button>
              <Button variant="ghost" onClick={() => router.push("/api/auth/signout")}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {job.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {job.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">Posted</p>
                  <p className="text-gray-600">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-gray-600">
                    {job.budget ? `£${job.budget}` : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {job.averageQuote && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  <p className="font-semibold text-blue-900">
                    Average Quote: £{job.averageQuote.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Posted by</p>
                  <p className="text-gray-600">
                    {job.user.name}
                    {job.user.companyName && ` (${job.user.companyName})`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Form (for professionals) */}
        {canQuote && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submit Your Quote</CardTitle>
              <CardDescription>
                Provide your quote amount and any additional comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Quote Amount (£)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                    placeholder="Enter your quote amount"
                    required
                    disabled={isSubmittingQuote}
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-2">
                    Additional Comments (Optional)
                  </label>
                  <Textarea
                    id="comment"
                    value={quoteForm.comment}
                    onChange={(e) => setQuoteForm({ ...quoteForm, comment: e.target.value })}
                    placeholder="Add any additional details about your quote..."
                    disabled={isSubmittingQuote}
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isSubmittingQuote}>
                  {isSubmittingQuote ? "Submitting..." : "Submit Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quotes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Quotes ({job.quotes.length})
            </CardTitle>
            <CardDescription>
              {job.quotes.length === 0 
                ? "No quotes yet. Be the first to quote on this job!"
                : "Professional quotes for this job"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {job.quotes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No quotes submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {job.quotes.map((quote) => (
                  <div key={quote.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{quote.pro.name}</h4>
                        {quote.pro.companyName && (
                          <p className="text-sm text-gray-600">{quote.pro.companyName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          £{quote.amount.toFixed(2)}
                        </p>
                        <Badge 
                          className={`text-xs ${getQuoteStatusColor(quote.status as any)}`}
                        >
                          {getQuoteStatusLabel(quote.status as any)}
                        </Badge>
                      </div>
                    </div>
                    
                    {quote.comment && (
                      <p className="text-gray-700 mb-3">{quote.comment}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Trust Score: {quote.pro.trustScore}%</span>
                        <span>Profile: {quote.pro.profileCompletion}%</span>
                      </div>
                      <span>
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
