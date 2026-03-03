'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Plus, X, Save, Loader2, ShieldCheck, ShieldOff, Clock, AlertTriangle,
    Instagram, Globe, Twitter, DollarSign, User,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null

interface TrainerProfile {
    id: string
    bio: string | null
    specializations: string[]
    certifications: string[]
    yearsExperience: number | null
    hourlyRate: number | null
    instagramUrl: string | null
    twitterUrl: string | null
    websiteUrl: string | null
    isVerified: boolean
    isAcceptingClients: boolean
}

export default function TrainerProfilePage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<TrainerProfile | null>(null)
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null)

    const [form, setForm] = useState({
        bio: '',
        yearsExperience: '',
        hourlyRate: '',
        instagramUrl: '',
        twitterUrl: '',
        websiteUrl: '',
        isAcceptingClients: true,
    })
    const [specializations, setSpecializations] = useState<string[]>([])
    const [certifications, setCertifications] = useState<string[]>([])
    const [specInput, setSpecInput] = useState('')
    const [certInput, setCertInput] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, verRes] = await Promise.all([
                    fetch('/api/trainer/profile'),
                    fetch('/api/trainer/verification-request'),
                ])
                if (profileRes.ok) {
                    const data = await profileRes.json()
                    if (data.profile) {
                        const p = data.profile as TrainerProfile
                        setProfile(p)
                        setForm({
                            bio: p.bio ?? '',
                            yearsExperience: p.yearsExperience !== null ? String(p.yearsExperience) : '',
                            hourlyRate: p.hourlyRate !== null ? String(p.hourlyRate) : '',
                            instagramUrl: p.instagramUrl ?? '',
                            twitterUrl: p.twitterUrl ?? '',
                            websiteUrl: p.websiteUrl ?? '',
                            isAcceptingClients: p.isAcceptingClients,
                        })
                        setSpecializations(p.specializations)
                        setCertifications(p.certifications)
                    }
                }
                if (verRes.ok) {
                    const vData = await verRes.json()
                    setVerificationStatus(vData.request?.status ?? null)
                }
            } catch {
                toast.error('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.id) load()
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

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/trainer/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio: form.bio,
                    yearsExperience: form.yearsExperience,
                    hourlyRate: form.hourlyRate,
                    instagramUrl: form.instagramUrl,
                    twitterUrl: form.twitterUrl,
                    websiteUrl: form.websiteUrl,
                    specializations,
                    certifications,
                    isAcceptingClients: form.isAcceptingClients,
                }),
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setProfile(data.profile)
            toast.success('Profile updated successfully!')
        } catch {
            toast.error('Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Trainer Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Your public trainer profile — visible to clients and admins
                    </p>
                </div>
                {/* Verification status badge */}
                {profile?.isVerified && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 flex items-center gap-1.5 px-3 py-1.5 text-sm">
                        <ShieldCheck className="w-4 h-4" />Verified Trainer
                    </Badge>
                )}
            </div>

            {/* Verification callout — shown when not yet verified */}
            {!profile?.isVerified && (
                <Alert className={`${verificationStatus === 'PENDING'
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
                        : verificationStatus === 'REJECTED'
                            ? 'border-destructive bg-destructive/5'
                            : 'border-primary/40 bg-primary/5'
                    }`}>
                    {verificationStatus === 'PENDING' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                    ) : verificationStatus === 'REJECTED' ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                        <ShieldOff className="h-4 w-4 text-primary" />
                    )}
                    <AlertTitle className="text-sm font-semibold">
                        {verificationStatus === 'PENDING'
                            ? 'Verification Pending Review'
                            : verificationStatus === 'REJECTED'
                                ? 'Verification Request Rejected'
                                : 'Your account is not verified yet'}
                    </AlertTitle>
                    <AlertDescription className="text-xs space-y-2">
                        <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">This page (Profile)</span> = your public info that clients see — bio, specializations, rates, social links. You can edit it freely at any time.
                        </div>
                        <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">Verification</span> = a one-time admin approval process that unlocks{' '}
                            <span className="font-medium">Clients, Courses & Meal Plans</span>.
                        </div>
                        {verificationStatus === 'PENDING' ? (
                            <p className="text-yellow-700 dark:text-yellow-400">Your request is under review. You&apos;ll be notified once approved.</p>
                        ) : verificationStatus === 'REJECTED' ? (
                            <Button asChild size="sm" variant="destructive" className="mt-1 h-7 text-xs">
                                <Link href="/trainer/verification"><AlertTriangle className="w-3 h-3 mr-1" />Review &amp; Resubmit</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="mt-1 h-7 text-xs">
                                <Link href="/trainer/verification"><ShieldCheck className="w-3 h-3 mr-1" />Request Verification →</Link>
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Accepting Clients toggle */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Accepting New Clients</div>
                            <div className="text-sm text-muted-foreground">
                                Toggle this off if you're at full capacity
                            </div>
                        </div>
                        <Switch
                            checked={form.isAcceptingClients}
                            onCheckedChange={val => setForm(prev => ({ ...prev, isAcceptingClients: val }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-4 h-4" />About Me
                    </CardTitle>
                    <CardDescription>Your professional bio shown on your public profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="yearsExperience">
                                <Clock className="w-3.5 h-3.5 inline mr-1" />Years of Experience
                            </Label>
                            <Input
                                id="yearsExperience"
                                type="number"
                                min={0}
                                max={50}
                                placeholder="e.g. 5"
                                value={form.yearsExperience}
                                onChange={e => setForm(prev => ({ ...prev, yearsExperience: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">
                                <DollarSign className="w-3.5 h-3.5 inline mr-1" />Hourly Rate ($)
                            </Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                min={0}
                                placeholder="e.g. 50"
                                value={form.hourlyRate}
                                onChange={e => setForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Describe your training background, coaching philosophy, and what you specialize in..."
                            value={form.bio}
                            onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                            rows={5}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Specializations & Certifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Qualifications</CardTitle>
                    <CardDescription>Specializations and certifications that build client trust</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Specializations */}
                    <div className="space-y-2">
                        <Label>Specializations</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Weight Loss, HIIT, Yoga..."
                                value={specInput}
                                onChange={e => setSpecInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('spec') } }}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => addTag('spec')}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {specializations.map((s, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1">
                                    {s}
                                    <button onClick={() => removeTag('spec', i)} className="ml-0.5 hover:text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                            {specializations.length === 0 && (
                                <span className="text-sm text-muted-foreground italic">No specializations added yet</span>
                            )}
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
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => addTag('cert')}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {certifications.map((c, i) => (
                                <Badge key={i} variant="outline" className="flex items-center gap-1 pr-1">
                                    {c}
                                    <button onClick={() => removeTag('cert', i)} className="ml-0.5 hover:text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                            {certifications.length === 0 && (
                                <span className="text-sm text-muted-foreground italic">No certifications added yet</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Help clients find and trust you online</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5" />Instagram
                        </Label>
                        <Input
                            id="instagram"
                            type="url"
                            placeholder="https://instagram.com/yourprofile"
                            value={form.instagramUrl}
                            onChange={e => setForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-1.5">
                            <Twitter className="w-3.5 h-3.5" />Twitter / X
                        </Label>
                        <Input
                            id="twitter"
                            type="url"
                            placeholder="https://twitter.com/yourprofile"
                            value={form.twitterUrl}
                            onChange={e => setForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />Website
                        </Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={form.websiteUrl}
                            onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save */}
            <div className="flex justify-end pb-8">
                <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-[140px]">
                    {saving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                        <><Save className="w-4 h-4 mr-2" />Save Profile</>
                    )}
                </Button>
            </div>
        </div>
    )
}
