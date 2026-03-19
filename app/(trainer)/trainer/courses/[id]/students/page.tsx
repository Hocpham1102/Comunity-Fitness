'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { ArrowLeft, Users, Mail, UserPlus, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useNotify } from '@/providers/notifications-provider'
import Link from 'next/link'

interface Student {
    id: string
    name: string | null
    email: string | null
    image: string | null
    enrolledAt: string
    relationship: {
        status: 'INVITED' | 'ACTIVE' | 'CANCELLED'
        invitedAt: string
    } | null
}

export default function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [students, setStudents] = useState<Student[]>([])
    const [courseName, setCourseName] = useState('')
    const [loading, setLoading] = useState(true)
    const [inviting, setInviting] = useState<string | null>(null)
    const notify = useNotify()

    const fetchStudents = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/trainer/courses/${id}/students`)
            if (res.ok) {
                const data = await res.json()
                setStudents(data.students)
                setCourseName(data.course.title)
            } else {
                notify.error({ title: 'Error', description: 'Failed to load students' })
            }
        } catch {
            notify.error({ title: 'Error', description: 'An error occurred while loading' })
        } finally {
            setLoading(false)
        }
    }, [id, notify])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const handleInvite = async (clientId: string) => {
        setInviting(clientId)
        try {
            const res = await fetch('/api/trainer/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            })

            if (res.ok) {
                notify.success({ title: 'Success', description: 'Invitation sent to student' })
                fetchStudents() // Refresh list to get updated relationship status
            } else {
                const data = await res.json()
                notify.error({ title: 'Error', description: data.error || 'Failed to send invite' })
            }
        } catch {
            notify.error({ title: 'Error', description: 'An error occurred' })
        } finally {
            setInviting(null)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/trainer/courses">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Course Students
                    </div>
                    <h1 className="text-2xl font-bold">
                        {loading ? 'Đang tải...' : courseName}
                    </h1>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 animate-pulse flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-muted rounded" />
                                    <div className="h-3 w-40 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="h-9 w-24 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : students.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No students yet</p>
                    <p className="text-sm mt-1">Students who enroll in this course will appear here.</p>
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="font-medium px-4 py-3 text-left">Student</th>
                                    <th className="font-medium px-4 py-3 text-left">Enrollment Date</th>
                                    <th className="font-medium px-4 py-3 text-left">Client Status</th>
                                    <th className="font-medium px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map((student) => {
                                    const initials = student.name?.substring(0, 2).toUpperCase() || 'ST'
                                    const date = new Date(student.enrolledAt).toLocaleDateString('vi-VN')
                                    const isInviting = inviting === student.id

                                    return (
                                        <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarImage src={student.image || undefined} />
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-foreground truncate">{student.name}</div>
                                                        <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-1 truncate">
                                                            <Mail className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {date}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!student.relationship ? (
                                                    <span className="text-muted-foreground italic text-xs">Not a client</span>
                                                ) : student.relationship.status === 'ACTIVE' ? (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 flex items-center gap-1 w-fit">
                                                        <Check className="w-3 h-3" /> Active
                                                    </Badge>
                                                ) : student.relationship.status === 'INVITED' ? (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-900 flex items-center gap-1 w-fit">
                                                        <Clock className="w-3 h-3" /> Pending invite
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-xs">
                                                        Status: {student.relationship.status.toLowerCase()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {student.relationship?.status === 'ACTIVE' ? (
                                                    <Link href={`/trainer/clients/${student.id}`}>
                                                        <Button size="sm" variant="secondary" className="h-8">
                                                            View Profile
                                                        </Button>
                                                    </Link>
                                                ) : student.relationship?.status === 'INVITED' ? (
                                                    <Button size="sm" variant="outline" className="h-8" disabled>
                                                        Invited
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 gap-1.5"
                                                        onClick={() => handleInvite(student.id)}
                                                        disabled={isInviting}
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        {isInviting ? 'Inviting...' : 'Invite to Client'}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
