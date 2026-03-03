'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    ShieldCheck, ShieldOff, Clock, AlertTriangle, CheckCircle2,
    Plus, X, Send, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface VerificationRequest {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    fullName: string
    phoneNumber: string
    yearsExperience: number
    specializations: string[]
    certifications: string[]
    bio: string
    certificateUrl: string | null
    adminNote: string | null
    submittedAt: string
    reviewedAt: string | null
}

export default function TrainerVerificationPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [request, setRequest] = useState<VerificationRequest | null>(null)

    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        yearsExperience: '',
        bio: '',
        certificateUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        websiteUrl: '',
    })
    const [specializations, setSpecializations] = useState<string[]>([])
    const [certifications, setCertifications] = useState<string[]>([])
    const [specInput, setSpecInput] = useState('')
    const [certInput, setCertInput] = useState('')

    const fetchRequest = async () => {
        try {
            const res = await fetch('/api/trainer/verification-request')
            if (res.ok) {
                const data = await res.json()
                if (data.request) {
                    setRequest(data.request)
                    // Pre-fill form with existing data
                    setForm({
                        fullName: data.request.fullName,
                        phoneNumber: data.request.phoneNumber,
                        yearsExperience: String(data.request.yearsExperience),
                        bio: data.request.bio,
                        certificateUrl: data.request.certificateUrl ?? '',
                        instagramUrl: '',
                        twitterUrl: '',
                        websiteUrl: '',
                    })
                    setSpecializations(data.request.specializations)
                    setCertifications(data.request.certifications)

                    if (data.request.socialLinks) {
                        try {
                            const social = JSON.parse(data.request.socialLinks)
                            setForm(prev => ({
                                ...prev,
                                instagramUrl: social.instagram ?? '',
                                twitterUrl: social.twitter ?? '',
                                websiteUrl: social.website ?? '',
                            }))
                        } catch { }
                    }
                } else {
                    // Pre-fill name from session
                    setForm(prev => ({ ...prev, fullName: session?.user?.name ?? '' }))
                }
            }
        } catch {
            toast.error('Failed to load verification status')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.id) fetchRequest()
    }, [session?.user?.id])

    const addTag = (type: 'spec' | 'cert') => {
        if (type === 'spec' && specInput.trim()) {
            setSpecializations(prev => [...prev, specInput.trim()])
            setSpecInput('')
        }
        if (type === 'cert' && certInput.trim()) {
            setCertifications(prev => [...prev, certInput.trim()])
            setCertInput('')
        }
    }

    const removeTag = (type: 'spec' | 'cert', index: number) => {
        if (type === 'spec') setSpecializations(prev => prev.filter((_, i) => i !== index))
        if (type === 'cert') setCertifications(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/trainer/verification-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    yearsExperience: Number(form.yearsExperience),
                    bio: form.bio,
                    specializations,
                    certifications,
                    certificateUrl: form.certificateUrl || null,
                    socialLinks: {
                        instagram: form.instagramUrl || null,
                        twitter: form.twitterUrl || null,
                        website: form.websiteUrl || null,
                    },
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Verification request submitted successfully!')
            await fetchRequest()
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit request')
        } finally {
            setSubmitting(false)
        }
    }

    const isPending = request?.status === 'PENDING'
    const isApproved = request?.status === 'APPROVED'
    const isRejected = request?.status === 'REJECTED'
    const canSubmit = !isPending && !isApproved

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Trainer Verification</h1>
                <p className="text-muted-foreground mt-2">
                    Get verified to unlock service-selling features: Courses, Client Management, and Meal Plans.
                </p>
            </div>

            {/* Status Banner */}
            {isApproved && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-700 dark:text-green-400">Verified Trainer ✓</AlertTitle>
                    <AlertDescription className="text-green-600 dark:text-green-500">
                        Your account is verified. You have full access to all trainer features including Courses, Clients, and Meal Plans.
                    </AlertDescription>
                </Alert>
            )}

            {isPending && (
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-700 dark:text-yellow-400">Pending Review</AlertTitle>
                    <AlertDescription className="text-yellow-600 dark:text-yellow-500">
                        Your request was submitted on {new Date(request!.submittedAt).toLocaleDateString()}. An admin will review it shortly.
                    </AlertDescription>
                </Alert>
            )}

            {isRejected && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Request Rejected</AlertTitle>
                    <AlertDescription>
                        {request?.adminNote
                            ? <><strong>Reason:</strong> {request.adminNote}. Please update your information and resubmit.</>
                            : 'Your request was rejected. Please update your information and resubmit.'}
                    </AlertDescription>
                </Alert>
            )}

            {/* Benefits */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        What Verification Unlocks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: '🎓', title: 'My Courses', desc: 'Create and sell training courses to clients' },
                            { icon: '👥', title: 'Client Management', desc: 'Onboard and manage individual clients' },
                            { icon: '🥗', title: 'Meal Plans', desc: 'Assign nutrition plans to your clients' },
                        ].map(item => (
                            <div key={item.title} className={`p-4 rounded-lg border ${isApproved ? 'border-green-200 bg-green-50 dark:bg-green-950/10' : 'border-muted bg-muted/30'}`}>
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <div className="font-semibold text-sm">{item.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Form */}
            {!isApproved && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your professional identification details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Your legal full name"
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        disabled={isPending}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="+1 234 567 8900"
                                        value={form.phoneNumber}
                                        onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                        disabled={isPending}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                                <Input
                                    id="yearsExperience"
                                    type="number"
                                    min={0}
                                    max={50}
                                    placeholder="e.g. 5"
                                    value={form.yearsExperience}
                                    onChange={e => setForm({ ...form, yearsExperience: e.target.value })}
                                    disabled={isPending}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio *</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Describe your training background, philosophy, and what makes you unique as a trainer..."
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    disabled={isPending}
                                    rows={4}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications</CardTitle>
                            <CardDescription>Your specializations and certifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Specializations */}
                            <div className="space-y-2">
                                <Label>Specializations</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Weight Loss, HIIT, Yoga..."
                                        value={specInput}
                                        onChange={e => setSpecInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('spec') } }}
                                        disabled={isPending}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => addTag('spec')} disabled={isPending}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map((s, i) => (
                                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                            {s}
                                            {!isPending && (
                                                <button type="button" onClick={() => removeTag('spec', i)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="space-y-2">
                                <Label>Certifications</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. NASM-CPT, ACE, CrossFit Level 2..."
                                        value={certInput}
                                        onChange={e => setCertInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('cert') } }}
                                        disabled={isPending}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => addTag('cert')} disabled={isPending}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {certifications.map((c, i) => (
                                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                                            {c}
                                            {!isPending && (
                                                <button type="button" onClick={() => removeTag('cert', i)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Certificate URL */}
                            <div className="space-y-2">
                                <Label htmlFor="certificateUrl">Certificate / Portfolio URL</Label>
                                <Input
                                    id="certificateUrl"
                                    type="url"
                                    placeholder="https://link-to-your-certificate-or-portfolio.com"
                                    value={form.certificateUrl}
                                    onChange={e => setForm({ ...form, certificateUrl: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Profiles</CardTitle>
                            <CardDescription>Links help verify your identity (optional)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram URL</Label>
                                <Input
                                    id="instagram"
                                    type="url"
                                    placeholder="https://instagram.com/yourprofile"
                                    value={form.instagramUrl}
                                    onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter / X URL</Label>
                                <Input
                                    id="twitter"
                                    type="url"
                                    placeholder="https://twitter.com/yourprofile"
                                    value={form.twitterUrl}
                                    onChange={e => setForm({ ...form, twitterUrl: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website URL</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://yourwebsite.com"
                                    value={form.websiteUrl}
                                    onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={submitting || isPending}
                            size="lg"
                            className="min-w-[180px]"
                        >
                            {submitting ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                            ) : isRejected ? (
                                <><Send className="w-4 h-4 mr-2" />Resubmit Request</>
                            ) : (
                                <><Send className="w-4 h-4 mr-2" />Submit Verification Request</>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
