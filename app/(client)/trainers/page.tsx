'use client'

import { useState, useEffect } from 'react'
import { TrainerCard } from '@/components/trainers/TrainerCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Users, Star, Award } from 'lucide-react'

interface Trainer {
    id: string
    name: string | null
    email: string
    image: string | null
    profile: {
        bio: string | null
        specializations: string[]
        certifications: string[]
        yearsExperience: number | null
        hourlyRate: number | null
    } | null
    courseCount: number
}

export default function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchTrainers()
    }, [page, search])

    const fetchTrainers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(search && { search }),
            })

            const response = await fetch(`/api/trainers?${params}`)
            if (response.ok) {
                const data = await response.json()
                setTrainers(data.trainers)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Error fetching trainers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-primary/20 via-primary/5 to-background border p-8 md:p-12">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                        <Star className="w-3.5 h-3.5 fill-primary" />
                        Verified Expert Trainers
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                        Find Your Perfect Trainer
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Connect with admin-verified fitness professionals and enroll in their expert-designed courses.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-6 mt-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span><span className="font-semibold text-foreground">{trainers.length}</span> verified trainers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span>All admin-verified</span>
                        </div>
                    </div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2 max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 rounded-xl"
                        />
                    </div>
                    <Button type="submit" className="h-11 rounded-xl px-6">Search</Button>
                </div>
            </form>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Finding trainers...</p>
                    </div>
                </div>
            )}

            {/* Trainers Grid */}
            {!loading && trainers.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {trainers.map((trainer) => (
                            <TrainerCard key={trainer.id} trainer={trainer} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <Button variant="outline" className="rounded-xl" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
                            <Button variant="outline" className="rounded-xl" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && trainers.length === 0 && (
                <div className="text-center py-24">
                    <div className="text-6xl mb-4">🏋️</div>
                    <h3 className="text-xl font-semibold mb-2">No trainers found</h3>
                    <p className="text-muted-foreground">
                        {search ? `No results for "${search}" — try a different search` : 'No verified trainers available right now'}
                    </p>
                    {search && (
                        <Button variant="outline" className="mt-4" onClick={() => setSearch('')}>
                            Clear search
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
