import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200MB

export async function POST(request: NextRequest) {
    try {
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const type = formData.get('type') as string | null // 'thumbnail' | 'video'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
        }

        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
        if (file.size > maxSize) {
            const limitMB = maxSize / 1024 / 1024
            return NextResponse.json({ error: `File too large. Max ${limitMB}MB` }, { status: 400 })
        }

        // Build upload directory
        const subfolder = type === 'video' ? 'videos' : 'thumbnails'
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses', subfolder)
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Unique filename
        const ext = extname(file.name) || (isImage ? '.jpg' : '.mp4')
        const filename = `${user.id}-${Date.now()}${ext}`
        const filePath = join(uploadDir, filename)

        const bytes = await file.arrayBuffer()
        await writeFile(filePath, Buffer.from(bytes))

        const publicUrl = `/uploads/courses/${subfolder}/${filename}`
        return NextResponse.json({ url: publicUrl }, { status: 201 })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
