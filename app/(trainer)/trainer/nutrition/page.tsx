'use client'

import { useState, useEffect } from 'react'
import { MealPlanList } from '@/components/features/nutrition/MealPlanList'
import { AssignMealPlanDialog } from '@/components/features/nutrition/AssignMealPlanDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function TrainerNutritionPage() {
    const [mealPlans, setMealPlans] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string>('')
    const [selectedPlanName, setSelectedPlanName] = useState<string>('')
    const [selectedPlanCycleDays, setSelectedPlanCycleDays] = useState<number>(7)

    useEffect(() => {
        fetchMealPlans()
    }, [search])

    const fetchMealPlans = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)

            const response = await fetch(`/api/trainer/meal-plans?${params}`)
            if (response.ok) {
                const data = await response.json()
                setMealPlans(data.items)
            }
        } catch (error) {
            console.error('Error fetching meal plans:', error)
            toast.error('Failed to load meal plans')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const response = await fetch(`/api/trainer/meal-plans/${deleteId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete meal plan')
            }

            toast.success('Meal plan deleted')
            fetchMealPlans()
        } catch (error: any) {
            console.error('Error deleting meal plan:', error)
            toast.error(error.message || 'Failed to delete meal plan')
        } finally {
            setDeleteId(null)
        }
    }

    const handleAssign = (id: string) => {
        const plan = mealPlans.find((p: any) => p.id === id)
        if (plan) {
            setSelectedPlanId(id)
            setSelectedPlanName((plan as any).name)
            setSelectedPlanCycleDays((plan as any).cycleDays)
            setAssignDialogOpen(true)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Meal Plans</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage meal plan templates for your clients
                    </p>
                </div>
                <Button asChild>
                    <Link href="/trainer/meal-plans/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Meal Plan
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search meal plans..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* List */}
            <MealPlanList
                plans={mealPlans}
                isLoading={isLoading}
                onDelete={(id) => setDeleteId(id)}
                onAssign={handleAssign}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this meal plan. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Dialog */}
            <AssignMealPlanDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                planId={selectedPlanId}
                planName={selectedPlanName}
                planCycleDays={selectedPlanCycleDays}
                onSuccess={() => {
                    setAssignDialogOpen(false)
                    toast.success('Assignment successful')
                }}
            />
        </div>
    )
}
