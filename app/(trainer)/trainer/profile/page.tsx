'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TrainerProfilePage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState({
        bio: '',
        specializations: [] as string[],
        certifications: [] as string[],
        yearsExperience: 0,
        hourlyRate: 0,
        instagramUrl: '',
        twitterUrl: '',
        websiteUrl: '',
        isAcceptingClients: true,
    })

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Trainer Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your professional profile and credentials
                </p>
            </div>

            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Your public trainer profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{session?.user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                            <Badge className="mt-2">Trainer</Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell clients about yourself..."
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="yearsExperience">Years of Experience</Label>
                            <Input
                                id="yearsExperience"
                                type="number"
                                value={profile.yearsExperience}
                                onChange={(e) =>
                                    setProfile({ ...profile, yearsExperience: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                value={profile.hourlyRate}
                                onChange={(e) =>
                                    setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) || 0 })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                    <CardDescription>Connect your social profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram URL</Label>
                        <Input
                            id="instagram"
                            type="url"
                            placeholder="https://instagram.com/yourprofile"
                            value={profile.instagramUrl}
                            onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter URL</Label>
                        <Input
                            id="twitter"
                            type="url"
                            placeholder="https://twitter.com/yourprofile"
                            value={profile.twitterUrl}
                            onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={profile.websiteUrl}
                            onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
