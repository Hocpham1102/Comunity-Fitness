'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { GripVertical, Trash2, Edit3, Save, Clock, Repeat, Dumbbell } from 'lucide-react'
import { type WorkoutExerciseConfig } from '@/lib/shared/schemas/workout-client.schema'
import { useToast } from '@/hooks/use-toast'

interface ExerciseConfiguratorProps {
  exercises: WorkoutExerciseConfig[]
  onExercisesChange: (exercises: WorkoutExerciseConfig[]) => void
}

export function ExerciseConfigurator({ exercises, onExercisesChange }: ExerciseConfiguratorProps) {
  const { toast } = useToast()
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const updateExercise = useCallback((index: number, updates: Partial<WorkoutExerciseConfig>) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], ...updates }
    onExercisesChange(newExercises)
  }, [exercises, onExercisesChange])

  const removeExercise = useCallback((index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index)
    // Reorder remaining exercises
    const reorderedExercises = newExercises.map((exercise, i) => ({
      ...exercise,
      order: i
    }))
    onExercisesChange(reorderedExercises)
    toast({
      title: 'Exercise removed',
      description: `${exercises[index].name} removed from workout`,
    })
  }, [exercises, onExercisesChange, toast])

  const moveExercise = useCallback((fromIndex: number, toIndex: number) => {
    const newExercises = [...exercises]
    const [movedExercise] = newExercises.splice(fromIndex, 1)
    newExercises.splice(toIndex, 0, movedExercise)
    
    // Update order for all exercises
    const reorderedExercises = newExercises.map((exercise, index) => ({
      ...exercise,
      order: index
    }))
    
    onExercisesChange(reorderedExercises)
  }, [exercises, onExercisesChange])

  const startEditing = (exerciseId: string) => {
    setEditingExercise(exerciseId)
  }

  const stopEditing = () => {
    setEditingExercise(null)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== dropIndex) {
      moveExercise(dragIndex, dropIndex)
    }
    setDragIndex(null)
  }

  const renderExerciseItem = (exercise: WorkoutExerciseConfig, index: number) => {
    const isEditing = editingExercise === exercise.id
    const isDragging = dragIndex === index

    return (
      <Card key={exercise.id} className={`transition-all ${isDragging ? 'opacity-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              className="cursor-move p-1 hover:bg-muted rounded"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  // Handle drag start for keyboard users
                }
              }}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Exercise Number */}
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>

            {/* Exercise Info */}
            <div className="flex-1">
              <h3 className="font-semibold">{exercise.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  <span>{exercise.sets} sets</span>
                </div>
                {exercise.reps && (
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    <span>{exercise.reps} reps</span>
                  </div>
                )}
                {exercise.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{exercise.duration}s</span>
                  </div>
                )}
                {exercise.rest && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{exercise.rest}s rest</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopEditing}
                >
                  <Save className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(exercise.id)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeExercise(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sets */}
                <div className="space-y-2">
                  <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                  <Input
                    id={`sets-${exercise.id}`}
                    type="number"
                    min="1"
                    max="50"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, { sets: parseInt(e.target.value) || 1 })}
                  />
                </div>

                {/* Reps */}
                <div className="space-y-2">
                  <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                  <Input
                    id={`reps-${exercise.id}`}
                    type="number"
                    min="1"
                    max="1000"
                    value={exercise.reps || ''}
                    onChange={(e) => updateExercise(index, { 
                      reps: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor={`duration-${exercise.id}`}>Duration (seconds)</Label>
                  <Input
                    id={`duration-${exercise.id}`}
                    type="number"
                    min="1"
                    max="3600"
                    value={exercise.duration || ''}
                    onChange={(e) => updateExercise(index, { 
                      duration: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                  />
                </div>

                {/* Rest Time */}
                <div className="space-y-2">
                  <Label htmlFor={`rest-${exercise.id}`}>Rest (seconds)</Label>
                  <Input
                    id={`rest-${exercise.id}`}
                    type="number"
                    min="0"
                    max="600"
                    value={exercise.rest || ''}
                    onChange={(e) => updateExercise(index, { 
                      rest: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 space-y-2">
                <Label htmlFor={`notes-${exercise.id}`}>Notes</Label>
                <Textarea
                  id={`notes-${exercise.id}`}
                  value={exercise.notes || ''}
                  onChange={(e) => updateExercise(index, { notes: e.target.value })}
                  placeholder="Add any notes for this exercise..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderMobileView = () => (
    <Accordion type="single" collapsible className="w-full">
      {exercises.map((exercise, index) => (
        <AccordionItem key={exercise.id} value={exercise.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 flex-1 text-left">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{exercise.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{exercise.sets} sets</span>
                  {exercise.reps && <span>× {exercise.reps} reps</span>}
                  {exercise.duration && <span>× {exercise.duration}s</span>}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Quick Edit Form */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`mobile-sets-${exercise.id}`} className="text-xs">Sets</Label>
                  <Input
                    id={`mobile-sets-${exercise.id}`}
                    type="number"
                    min="1"
                    max="50"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, { sets: parseInt(e.target.value) || 1 })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`mobile-reps-${exercise.id}`} className="text-xs">Reps</Label>
                  <Input
                    id={`mobile-reps-${exercise.id}`}
                    type="number"
                    min="1"
                    max="1000"
                    value={exercise.reps || ''}
                    onChange={(e) => updateExercise(index, { 
                      reps: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`mobile-duration-${exercise.id}`} className="text-xs">Duration (s)</Label>
                  <Input
                    id={`mobile-duration-${exercise.id}`}
                    type="number"
                    min="1"
                    max="3600"
                    value={exercise.duration || ''}
                    onChange={(e) => updateExercise(index, { 
                      duration: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`mobile-rest-${exercise.id}`} className="text-xs">Rest (s)</Label>
                  <Input
                    id={`mobile-rest-${exercise.id}`}
                    type="number"
                    min="0"
                    max="600"
                    value={exercise.rest || ''}
                    onChange={(e) => updateExercise(index, { 
                      rest: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Optional"
                    className="h-8"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label htmlFor={`mobile-notes-${exercise.id}`} className="text-xs">Notes</Label>
                <Textarea
                  id={`mobile-notes-${exercise.id}`}
                  value={exercise.notes || ''}
                  onChange={(e) => updateExercise(index, { notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeExercise(index)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No exercises yet</h3>
        <p className="text-muted-foreground">
          Go back to the previous step to add exercises to your workout
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Configure Exercises</h2>
        <p className="text-muted-foreground">
          Set reps, sets, and rest times for each exercise
        </p>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{exercises.length}</div>
              <div className="text-sm text-muted-foreground">Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {exercises.reduce((sum, ex) => sum + (ex.reps || 0) * ex.sets, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Reps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(exercises.reduce((sum, ex) => {
                  const exerciseTime = (ex.duration || 30) * ex.sets
                  const restTime = (ex.rest || 60) * (ex.sets - 1)
                  return sum + exerciseTime + restTime
                }, 0) / 60)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        {/* Desktop View */}
        <div className="hidden md:block">
          {exercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {renderMobileView()}
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">Instructions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Drag exercises to reorder them (desktop)</li>
            <li>• Click edit to modify sets, reps, and rest times</li>
            <li>• Either reps or duration should be specified</li>
            <li>• Add notes for exercise-specific instructions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
