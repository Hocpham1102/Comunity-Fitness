'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  muscleGroups: z.array(z.string()).min(1),
  equipment: z.array(z.string()).min(1),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
})

export type ExerciseFormValues = z.infer<typeof schema>

interface Props {
  readonly defaultValues?: Partial<ExerciseFormValues>
  readonly onSubmit: (data: ExerciseFormValues) => Promise<void> | void
  readonly submitLabel?: string
}

const MG = [
  'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','FOREARMS','ABS','OBLIQUES','QUADS','HAMSTRINGS','GLUTES','CALVES','FULL_BODY','CARDIO',
]
const EQ = [
  'BARBELL','DUMBBELL','KETTLEBELL','CABLE','MACHINE','BODYWEIGHT','RESISTANCE_BAND','CARDIO_EQUIPMENT','OTHER',
]

export default function ExerciseForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      muscleGroups: [],
      equipment: [],
      difficulty: 'BEGINNER',
      isPublic: true,
      ...defaultValues,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (defaultValues) form.reset({ ...form.getValues(), ...defaultValues })
  }, [defaultValues])

  const { register, handleSubmit, setValue, watch, formState } = form
  const muscleGroups = watch('muscleGroups')
  const equipment = watch('equipment')

  const toggleMulti = (field: 'muscleGroups' | 'equipment', value: string) => {
    const arr = new Set(watch(field))
    if (arr.has(value)) arr.delete(value)
    else arr.add(value)
    setValue(field, Array.from(arr), { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(async (v) => onSubmit(v))} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm">Name</label>
              <Input id="name" {...register('name')} placeholder="Bench Press" />
              {formState.errors.name && (
                <p className="text-sm text-destructive">{formState.errors.name.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm">Difficulty</label>
              <Select value={watch('difficulty')} onValueChange={(v) => setValue('difficulty', v as any, { shouldValidate: true })}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm">Description</label>
            <Textarea id="description" rows={3} {...register('description')} placeholder="How to perform it, benefits, notes..." />
          </div>
          <div className="space-y-2">
            <label htmlFor="instructions" className="text-sm">Instructions</label>
            <Textarea id="instructions" rows={3} {...register('instructions')} placeholder="Step-by-step instructions" />
          </div>

          <div className="space-y-2">
            <span className="text-sm">Muscle groups</span>
            <div className="flex flex-wrap gap-2">
              {MG.map((m) => (
                <Badge key={m} variant={muscleGroups.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMulti('muscleGroups', m)}>
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm">Equipment</span>
            <div className="flex flex-wrap gap-2">
              {EQ.map((e) => (
                <Badge key={e} variant={equipment.includes(e) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMulti('equipment', e)}>
                  {e}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="videoUrl" className="text-sm">Video URL</label>
              <Input id="videoUrl" {...register('videoUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="thumbnailUrl" className="text-sm">Thumbnail URL</label>
              <Input id="thumbnailUrl" {...register('thumbnailUrl')} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm">Visibility</span>
            <div className="flex gap-2">
              <Button type="button" variant={watch('isPublic') ? 'default' : 'outline'} onClick={() => setValue('isPublic', true)}>
                Public
              </Button>
              <Button type="button" variant={!watch('isPublic') ? 'default' : 'outline'} onClick={() => setValue('isPublic', false)}>
                Private
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={!formState.isValid}>{submitLabel}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}


