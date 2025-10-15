'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Filter, Plus, Grid, List, X, Dumbbell } from 'lucide-react'
import { type WorkoutExerciseConfig, type Exercise } from '@/lib/shared/schemas/workout-client.schema'
import { useToast } from '@/hooks/use-toast'

interface ExerciseSelectorProps {
  selectedExercises: WorkoutExerciseConfig[]
  onExercisesChange: (exercises: WorkoutExerciseConfig[]) => void
}

// Mock exercises for development (will be replaced with real data)
const MOCK_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest and triceps',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    isPublic: true,
    thumbnailUrl: '',
  },
  {
    id: '2',
    name: 'Bench Press',
    description: 'Barbell exercise for chest development',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    isPublic: true,
    thumbnailUrl: '',
  },
  {
    id: '3',
    name: 'Squats',
    description: 'Compound exercise for legs and glutes',
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    isPublic: true,
    thumbnailUrl: '',
  },
  {
    id: '4',
    name: 'Deadlifts',
    description: 'Full body compound movement',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS', 'FOREARMS'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    isPublic: true,
    thumbnailUrl: '',
  },
  {
    id: '5',
    name: 'Pull-ups',
    description: 'Upper body pulling exercise',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    isPublic: true,
    thumbnailUrl: '',
  },
  {
    id: '6',
    name: 'Plank',
    description: 'Core stability exercise',
    muscleGroups: ['ABS', 'OBLIQUES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    isPublic: true,
    thumbnailUrl: '',
  },
]

const MUSCLE_GROUP_LABELS = {
  CHEST: 'Chest',
  BACK: 'Back',
  SHOULDERS: 'Shoulders',
  BICEPS: 'Biceps',
  TRICEPS: 'Triceps',
  FOREARMS: 'Forearms',
  ABS: 'Abs',
  OBLIQUES: 'Obliques',
  QUADS: 'Quads',
  HAMSTRINGS: 'Hamstrings',
  GLUTES: 'Glutes',
  CALVES: 'Calves',
  FULL_BODY: 'Full Body',
  CARDIO: 'Cardio',
}

const EQUIPMENT_LABELS = {
  BARBELL: 'Barbell',
  DUMBBELL: 'Dumbbell',
  KETTLEBELL: 'Kettlebell',
  CABLE: 'Cable',
  MACHINE: 'Machine',
  BODYWEIGHT: 'Bodyweight',
  RESISTANCE_BAND: 'Resistance Band',
  CARDIO_EQUIPMENT: 'Cardio Equipment',
  OTHER: 'Other',
}

const DIFFICULTY_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

export function ExerciseSelector({ selectedExercises, onExercisesChange }: ExerciseSelectorProps) {
  const { toast } = useToast()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      // This will be used for responsive behavior
      return window.innerWidth < 768
    }
    checkMobile()
  }, [])

  // Load exercises
  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    setIsLoading(true)
    try {
      // For now, use mock data. Later replace with: await getExercises()
      setExercises(MOCK_EXERCISES)
      setFilteredExercises(MOCK_EXERCISES)
    } catch (error) {
      console.error('Error loading exercises:', error)
      toast({
        title: 'Error',
        description: 'Failed to load exercises',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter exercises based on search and filters
  useEffect(() => {
    let filtered = exercises

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Muscle group filter
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedMuscleGroups.some(group => exercise.muscleGroups.includes(group as any))
      )
    }

    // Equipment filter
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedEquipment.some(equip => exercise.equipment.includes(equip as any))
      )
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty)
    }

    setFilteredExercises(filtered)
  }, [exercises, searchQuery, selectedMuscleGroups, selectedEquipment, selectedDifficulty])

  const addExercise = (exercise: Exercise) => {
    const isAlreadyAdded = selectedExercises.some(selected => selected.exerciseId === exercise.id)
    
    if (isAlreadyAdded) {
      toast({
        title: 'Already added',
        description: `${exercise.name} is already in your workout`,
      })
      return
    }

    const newExercise: WorkoutExerciseConfig = {
      id: `${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      order: selectedExercises.length,
      sets: 3,
      reps: 10,
    }

    onExercisesChange([...selectedExercises, newExercise])
    toast({
      title: 'Exercise added',
      description: `${exercise.name} added to your workout`,
    })
  }

  const removeExercise = (exerciseId: string) => {
    onExercisesChange(selectedExercises.filter(ex => ex.id !== exerciseId))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedMuscleGroups([])
    setSelectedEquipment([])
    setSelectedDifficulty('')
  }

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    )
  }

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    )
  }

  const renderExerciseCard = (exercise: Exercise) => (
    <Card key={exercise.id} className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{exercise.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addExercise(exercise)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {/* Muscle Groups */}
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.slice(0, 3).map((group) => (
              <Badge key={group} variant="secondary" className="text-xs">
                {MUSCLE_GROUP_LABELS[group]}
              </Badge>
            ))}
            {exercise.muscleGroups.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{exercise.muscleGroups.length - 3}
              </Badge>
            )}
          </div>

          {/* Equipment & Difficulty */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{EQUIPMENT_LABELS[exercise.equipment[0]]}</span>
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSelectedExercises = () => (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Dumbbell className="w-4 h-4" />
        Selected Exercises ({selectedExercises.length})
      </h3>
      
      {selectedExercises.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No exercises selected yet. Add some exercises to get started!
        </p>
      ) : (
        <div className="space-y-2">
          {selectedExercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                  {exercise.order + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps || '?'} reps
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeExercise(exercise.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderFilters = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Muscle Groups */}
      <div>
        <h4 className="font-medium text-sm mb-2">Muscle Groups</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => (
            <Button
              key={value}
              variant={selectedMuscleGroups.includes(value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMuscleGroup(value)}
              className="text-xs h-7"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <h4 className="font-medium text-sm mb-2">Equipment</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EQUIPMENT_LABELS).map(([value, label]) => (
            <Button
              key={value}
              variant={selectedEquipment.includes(value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleEquipment(value)}
              className="text-xs h-7"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h4 className="font-medium text-sm mb-2">Difficulty</h4>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Any difficulty" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {(searchQuery || selectedMuscleGroups.length > 0 || selectedEquipment.length > 0 || selectedDifficulty) && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      )}
    </div>
  )

  const renderExerciseList = () => (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {filteredExercises.length} exercises
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Exercise Grid/List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No exercises found</p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {filteredExercises.map(renderExerciseCard)}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add Exercises</h2>
        <p className="text-muted-foreground">
          Search and select exercises to add to your workout
        </p>
      </div>

      {/* Selected Exercises - Always visible on desktop */}
      <div className="hidden md:block">
        {renderSelectedExercises()}
      </div>

      {/* Mobile: Selected exercises in sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">
              <Dumbbell className="w-4 h-4 mr-2" />
              View Selected ({selectedExercises.length})
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Selected Exercises</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {renderSelectedExercises()}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Exercise Library */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-4">
              {renderFilters()}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {renderFilters()}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {renderExerciseList()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
