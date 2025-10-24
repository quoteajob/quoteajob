"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Shield, Award, FileText, Building, MapPin, Mail } from "lucide-react"
import { toast } from "sonner"
import { calculateTrustScore, getTrustScoreColor, getTrustScoreLabel } from "@/lib/trust-score"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  isSubscribed: boolean
  trustScore: number
  profileCompletion: number
  companyName?: string
  tradeCategory?: string
  description?: string
  insuranceDoc?: string
  qualifications?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    tradeCategory: "",
    description: "",
    qualifications: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          companyName: data.companyName || "",
          tradeCategory: data.tradeCategory || "",
          description: data.description || "",
          qualifications: data.qualifications || ""
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast.success("Profile updated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
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

  if (!session || !profile) {
    return null
  }

  const trustScore = calculateTrustScore(profile as any)
  const trustScoreColor = getTrustScoreColor(trustScore)
  const trustScoreLabel = getTrustScoreLabel(trustScore)

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <Badge variant={profile.role === "PRO" ? "default" : "secondary"} className="mt-2">
                    {profile.role}
                  </Badge>
                </div>

                {profile.role === "PRO" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Trust Score</span>
                        <span className={`text-sm font-bold ${trustScoreColor}`}>
                          {trustScore}%
                        </span>
                      </div>
                      <Progress value={trustScore} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {trustScoreLabel}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Profile Completion</span>
                        <span className="text-sm font-bold">
                          {profile.profileCompletion}%
                        </span>
                      </div>
                      <Progress value={profile.profileCompletion} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Subscription</span>
                      <Badge variant={profile.isSubscribed ? "default" : "destructive"}>
                        {profile.isSubscribed ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Complete your profile to increase your trust score and visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSaving}
                    />
                  </div>

                  {profile.role === "PRO" && (
                    <>
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                          Company Name
                        </label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          disabled={isSaving}
                          placeholder="Your company or business name"
                        />
                      </div>

                      <div>
                        <label htmlFor="tradeCategory" className="block text-sm font-medium mb-2">
                          Trade Category
                        </label>
                        <select
                          id="tradeCategory"
                          value={formData.tradeCategory}
                          onChange={(e) => setFormData({ ...formData, tradeCategory: e.target.value })}
                          disabled={isSaving}
                          className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="">Select your trade</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Carpentry">Carpentry</option>
                          <option value="Painting">Painting</option>
                          <option value="Roofing">Roofing</option>
                          <option value="Flooring">Flooring</option>
                          <option value="Kitchen">Kitchen</option>
                          <option value="Bathroom">Bathroom</option>
                          <option value="Garden">Garden</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                          Professional Description
                        </label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={isSaving}
                          placeholder="Tell potential customers about your experience and expertise..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <label htmlFor="qualifications" className="block text-sm font-medium mb-2">
                          Qualifications & Certifications
                        </label>
                        <Textarea
                          id="qualifications"
                          value={formData.qualifications}
                          onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                          disabled={isSaving}
                          placeholder="List your qualifications, certifications, and relevant experience..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {profile.role === "PRO" && !profile.isSubscribed && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Professional Subscription
                  </CardTitle>
                  <CardDescription>
                    Subscribe to quote on unlimited jobs and build your professional reputation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">£6.99/month</div>
                    <p className="text-gray-600 mb-4">
                      Quote unlimited jobs and build your trust score
                    </p>
                    <Button asChild>
                      <a href="/subscribe">Subscribe Now</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
