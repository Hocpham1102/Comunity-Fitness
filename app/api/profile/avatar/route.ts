import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function PUT(request: NextRequest) {
    try {
        // Lấy session của user đang đăng nhập
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Lấy dữ liệu base64 image từ request
        const body = await request.json()
        const { image } = body

        if (!image) {
            return NextResponse.json(
                { message: 'Image data is required' },
                { status: 400 }
            )
        }

        // Kiểm tra xem có phải là base64 image không
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { message: 'Invalid image format' },
                { status: 400 }
            )
        }

        // Kiểm tra kích thước (giới hạn ~5MB cho base64)
        // Base64 thường lớn hơn file gốc ~33%, nên 5MB file ≈ 6.7MB base64
        const sizeInBytes = image.length * 0.75 // Ước tính kích thước thực
        const maxSizeInBytes = 5 * 1024 * 1024 // 5MB

        if (sizeInBytes > maxSizeInBytes) {
            return NextResponse.json(
                { message: 'Image size too large. Maximum 5MB allowed.' },
                { status: 400 }
            )
        }

        // Cập nhật avatar vào database
        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: { image },
            select: { image: true }
        })

        return NextResponse.json({
            message: 'Avatar updated successfully',
            image: updatedUser.image,
        })
    } catch (error: any) {
        console.error('Avatar update error:', error)

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Lấy session của user đang đăng nhập
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Xóa avatar khỏi database
        await db.user.update({
            where: { id: session.user.id },
            data: { image: null }
        })

        return NextResponse.json({
            message: 'Avatar deleted successfully',
        })
    } catch (error: any) {
        console.error('Avatar delete error:', error)

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
