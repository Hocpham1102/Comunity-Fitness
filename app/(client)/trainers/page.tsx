'use client'

import { useState, useEffect } from 'react'
import { TrainerCard } from '@/components/trainers/TrainerCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

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
        fetchTrainers()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Expert Trainers</h1>
                <p className="text-muted-foreground">
                    Connect with certified trainers and explore their fitness programs
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search trainers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </div>
            </form>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Trainers Grid */}
            {!loading && trainers.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {trainers.map((trainer) => (
                            <TrainerCard key={trainer.id} trainer={trainer} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && trainers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No trainers found</p>
                </div>
            )}
        </div>
    )
}
