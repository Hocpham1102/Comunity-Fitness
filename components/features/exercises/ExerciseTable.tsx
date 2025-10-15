'use client'

import { useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface ExerciseItem {
  id: string
  name: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
  isPublic: boolean
}

interface Props {
  readonly items: ExerciseItem[]
}

export default function ExerciseTable({ items }: Props) {
  const rows = useMemo(() => items, [items])
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this exercise?')
    if (!ok) return
    const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    startTransition(() => router.refresh())
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Muscles</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{ex.name}</span>
                  {!ex.isPublic && <Badge variant="outline">Private</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ex.muscleGroups.map((m) => (
                    <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ex.equipment.map((e) => (
                    <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="default" className="text-xs">{ex.difficulty}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/exercises/${ex.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(ex.id)} disabled={isPending}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                No exercises found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}


