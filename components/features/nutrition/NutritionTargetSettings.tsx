'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Calculator, RotateCcw } from 'lucide-react'

interface NutritionTargets {
    targetCalories: number
    targetProtein: number
    targetCarbs: number
    targetFats: number
}

interface NutritionTargetSettingsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentTargets: NutritionTargets
    onUpdate: () => void
}

export function NutritionTargetSettings({
    open,
    onOpenChange,
    currentTargets,
    onUpdate,
}: NutritionTargetSettingsProps) {
    const [isCustom, setIsCustom] = useState(false)
    const [targets, setTargets] = useState(currentTargets)
    const [autoTargets, setAutoTargets] = useState<NutritionTargets | null>(null)
    const [loading, setLoading] = useState(false)
    const [resetting, setResetting] = useState(false)

    // Fetch auto-calculated targets from profile
    useEffect(() => {
        if (open) {
            fetchAutoTargets()
        }
    }, [open])

    const fetchAutoTargets = async () => {
        try {
            const response = await fetch('/api/nutrition-targets')
            if (response.ok) {
                const data = await response.json()
                setAutoTargets(data)
                // Check if current targets match auto targets (within 5 units tolerance)
                const isUsingCustom =
                    Math.abs(currentTargets.targetCalories - data.targetCalories) > 5 ||
                    Math.abs(currentTargets.targetProtein - data.targetProtein) > 5 ||
                    Math.abs(currentTargets.targetCarbs - data.targetCarbs) > 5 ||
                    Math.abs(currentTargets.targetFats - data.targetFats) > 5
                setIsCustom(isUsingCustom)
            }
        } catch (error) {
            console.error('Error fetching auto targets:', error)
        }
    }

    const handleReset = async () => {
        setResetting(true)
        try {
            const response = await fetch('/api/nutrition-targets/reset', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to reset targets')
            }

            const data = await response.json()
            setTargets(data.targets)
            setAutoTargets(data.targets)
            setIsCustom(false)
            toast.success('Targets reset to auto-calculated values')
            onUpdate()
        } catch (error) {
            console.error('Error resetting targets:', error)
            toast.error('Failed to reset targets. Please ensure your profile is complete.')
        } finally {
            setResetting(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/nutrition-targets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...targets,
                    useCustomTargets: isCustom,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update targets')
            }

            toast.success('Nutrition targets updated successfully')
            onUpdate()
            onOpenChange(false)
        } catch (error) {
            console.error('Error updating targets:', error)
            toast.error('Failed to update targets')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleCustom = (checked: boolean) => {
        setIsCustom(checked)
        if (!checked && autoTargets) {
            // Switch back to auto targets
            setTargets(autoTargets)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Nutrition Target Settings
                    </DialogTitle>
                    <DialogDescription>
                        Customize your daily nutrition targets or use auto-calculated values based on your
                        TDEE and fitness goals.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Custom Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                            <Label htmlFor="custom-mode" className="font-semibold">
                                Custom Targets
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isCustom
                                    ? 'Set your own target values'
                                    : 'Using auto-calculated targets from your profile'}
                            </p>
                        </div>
                        <Switch
                            id="custom-mode"
                            checked={isCustom}
                            onCheckedChange={handleToggleCustom}
                        />
                    </div>

                    {/* Auto-calculated info */}
                    {!isCustom && autoTargets && (
                        <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 rounded-md">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Auto-calculated from your profile
                            </p>
                            <p className="text-xs">
                                Based on your TDEE, current weight, and fitness goal. Update your profile to
                                change these values.
                            </p>
                        </div>
                    )}

                    {/* Target Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="calories">Calories (kcal)</Label>
                            <Input
                                id="calories"
                                type="number"
                                value={targets.targetCalories}
                                onChange={(e) =>
                                    setTargets({ ...targets, targetCalories: Number(e.target.value) })
                                }
                                disabled={!isCustom}
                                min={1000}
                                max={5000}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="protein">Protein (g)</Label>
                            <Input
                                id="protein"
                                type="number"
                                value={targets.targetProtein}
                                onChange={(e) =>
                                    setTargets({ ...targets, targetProtein: Number(e.target.value) })
                                }
                                disabled={!isCustom}
                                min={50}
                                max={500}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="carbs">Carbs (g)</Label>
                            <Input
                                id="carbs"
                                type="number"
                                value={targets.targetCarbs}
                                onChange={(e) =>
                                    setTargets({ ...targets, targetCarbs: Number(e.target.value) })
                                }
                                disabled={!isCustom}
                                min={20}
                                max={800}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fats">Fats (g)</Label>
                            <Input
                                id="fats"
                                type="number"
                                value={targets.targetFats}
                                onChange={(e) =>
                                    setTargets({ ...targets, targetFats: Number(e.target.value) })
                                }
                                disabled={!isCustom}
                                min={20}
                                max={300}
                            />
                        </div>
                    </div>

                    {/* Macro Summary */}
                    <div className="text-sm bg-muted/30 p-3 rounded-md">
                        <p className="font-medium mb-2">Macro Breakdown:</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <span className="text-muted-foreground">Protein:</span>{' '}
                                <span className="font-medium">
                                    {Math.round((targets.targetProtein * 4 * 100) / targets.targetCalories)}%
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Carbs:</span>{' '}
                                <span className="font-medium">
                                    {Math.round((targets.targetCarbs * 4 * 100) / targets.targetCalories)}%
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Fats:</span>{' '}
                                <span className="font-medium">
                                    {Math.round((targets.targetFats * 9 * 100) / targets.targetCalories)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading || resetting}
                        className="w-full sm:w-auto"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {resetting ? 'Resetting...' : 'Reset to Auto'}
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
