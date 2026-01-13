import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const vietnameseFoods = [
    // Vietnamese Dishes
    { name: 'Phở bò', description: 'Phở bò Hà Nội truyền thống', calories: 350, protein: 15, carbs: 50, fats: 8, servingSize: 100, servingUnit: 'g' },
    { name: 'Phở gà', description: 'Phở gà thanh đạm', calories: 300, protein: 12, carbs: 48, fats: 6, servingSize: 100, servingUnit: 'g' },
    { name: 'Bún bò Huế', description: 'Bún bò cay Huế', calories: 380, protein: 14, carbs: 52, fats: 10, servingSize: 100, servingUnit: 'g' },
    { name: 'Bún chả', description: 'Bún chả Hà Nội', calories: 420, protein: 18, carbs: 45, fats: 15, servingSize: 100, servingUnit: 'g' },
    { name: 'Bánh mì thịt', description: 'Bánh mì Sài Gòn', calories: 280, protein: 12, carbs: 35, fats: 10, servingSize: 100, servingUnit: 'g' },
    { name: 'Cơm tấm sườn', description: 'Cơm tấm sườn nướng', calories: 450, protein: 20, carbs: 55, fats: 14, servingSize: 100, servingUnit: 'g' },
    { name: 'Cơm gà', description: 'Cơm gà Hải Nam', calories: 380, protein: 22, carbs: 48, fats: 10, servingSize: 100, servingUnit: 'g' },
    { name: 'Xôi xéo', description: 'Xôi xéo đậu xanh', calories: 320, protein: 8, carbs: 58, fats: 6, servingSize: 100, servingUnit: 'g' },
    { name: 'Bánh cuốn', description: 'Bánh cuốn nhân thịt', calories: 180, protein: 6, carbs: 32, fats: 3, servingSize: 100, servingUnit: 'g' },
    { name: 'Bún riêu', description: 'Bún riêu cua', calories: 340, protein: 13, carbs: 48, fats: 9, servingSize: 100, servingUnit: 'g' },
    { name: 'Hủ tiếu', description: 'Hủ tiếu Nam Vang', calories: 330, protein: 12, carbs: 50, fats: 7, servingSize: 100, servingUnit: 'g' },
    { name: 'Mì Quảng', description: 'Mì Quảng Đà Nẵng', calories: 360, protein: 14, carbs: 52, fats: 8, servingSize: 100, servingUnit: 'g' },
    { name: 'Cao lầu', description: 'Cao lầu Hội An', calories: 370, protein: 13, carbs: 54, fats: 9, servingSize: 100, servingUnit: 'g' },
    { name: 'Bánh xèo', description: 'Bánh xèo miền Tây', calories: 250, protein: 8, carbs: 28, fats: 12, servingSize: 100, servingUnit: 'g' },
    { name: 'Gỏi cuốn', description: 'Gỏi cuốn tôm thịt', calories: 120, protein: 8, carbs: 18, fats: 2, servingSize: 100, servingUnit: 'g' },
    { name: 'Chả giò', description: 'Chả giò rán', calories: 280, protein: 10, carbs: 22, fats: 16, servingSize: 100, servingUnit: 'g' },

    // Rice & Noodles
    { name: 'Cơm trắng', description: 'Cơm trắng nấu chín', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: 100, servingUnit: 'g' },
    { name: 'Cơm gạo lứt', description: 'Cơm gạo lứt', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, servingSize: 100, servingUnit: 'g' },
    { name: 'Bún tươi', description: 'Bún tươi luộc', calories: 109, protein: 1.8, carbs: 25, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Phở khô', description: 'Bánh phở khô', calories: 364, protein: 7, carbs: 82, fats: 0.5, servingSize: 100, servingUnit: 'g' },
    { name: 'Miến', description: 'Miến khô', calories: 351, protein: 0.1, carbs: 86, fats: 0.1, servingSize: 100, servingUnit: 'g' },
    { name: 'Xôi nếp', description: 'Xôi nếp trắng', calories: 116, protein: 2.4, carbs: 25, fats: 0.3, servingSize: 100, servingUnit: 'g' },

    // Meats
    { name: 'Thịt lợn nạc', description: 'Thịt lợn nạc luộc', calories: 143, protein: 27, carbs: 0, fats: 3.5, servingSize: 100, servingUnit: 'g' },
    { name: 'Thịt lợn ba chỉ', description: 'Thịt ba chỉ', calories: 518, protein: 9, carbs: 0, fats: 53, servingSize: 100, servingUnit: 'g' },
    { name: 'Thịt bò nạc', description: 'Thịt bò nạc', calories: 250, protein: 26, carbs: 0, fats: 15, servingSize: 100, servingUnit: 'g' },
    { name: 'Thịt gà ức', description: 'Ức gà không da', calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: 100, servingUnit: 'g' },
    { name: 'Thịt gà đùi', description: 'Đùi gà có da', calories: 209, protein: 26, carbs: 0, fats: 11, servingSize: 100, servingUnit: 'g' },
    { name: 'Trứng gà', description: 'Trứng gà luộc', calories: 155, protein: 13, carbs: 1.1, fats: 11, servingSize: 100, servingUnit: 'g' },
    { name: 'Trứng vịt', description: 'Trứng vịt luộc', calories: 185, protein: 13, carbs: 1.5, fats: 14, servingSize: 100, servingUnit: 'g' },

    // Seafood
    { name: 'Tôm sú', description: 'Tôm sú luộc', calories: 99, protein: 24, carbs: 0.2, fats: 0.3, servingSize: 100, servingUnit: 'g' },
    { name: 'Cá hồi', description: 'Cá hồi tươi', calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: 100, servingUnit: 'g' },
    { name: 'Cá thu', description: 'Cá thu tươi', calories: 205, protein: 19, carbs: 0, fats: 14, servingSize: 100, servingUnit: 'g' },
    { name: 'Cá rô phi', description: 'Cá rô phi', calories: 128, protein: 26, carbs: 0, fats: 2.7, servingSize: 100, servingUnit: 'g' },
    { name: 'Mực ống', description: 'Mực ống tươi', calories: 92, protein: 16, carbs: 3.1, fats: 1.4, servingSize: 100, servingUnit: 'g' },

    // Vegetables
    { name: 'Rau muống', description: 'Rau muống xào', calories: 19, protein: 2.6, carbs: 3.1, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Cải xanh', description: 'Cải xanh luộc', calories: 13, protein: 1.5, carbs: 2.2, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Bông cải xanh', description: 'Bông cải xanh (broccoli)', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: 100, servingUnit: 'g' },
    { name: 'Cà chua', description: 'Cà chua tươi', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Dưa chuột', description: 'Dưa chuột tươi', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, servingSize: 100, servingUnit: 'g' },
    { name: 'Đậu phụ', description: 'Đậu phụ non', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, servingSize: 100, servingUnit: 'g' },
    { name: 'Khoai lang', description: 'Khoai lang luộc', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, servingSize: 100, servingUnit: 'g' },
    { name: 'Khoai tây', description: 'Khoai tây luộc', calories: 77, protein: 2, carbs: 17, fats: 0.1, servingSize: 100, servingUnit: 'g' },

    // Fruits
    { name: 'Chuối', description: 'Chuối tiêu', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, servingSize: 100, servingUnit: 'g' },
    { name: 'Táo', description: 'Táo tươi', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Cam', description: 'Cam tươi', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, servingSize: 100, servingUnit: 'g' },
    { name: 'Xoài', description: 'Xoài chín', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, servingSize: 100, servingUnit: 'g' },
    { name: 'Đu đủ', description: 'Đu đủ chín', calories: 43, protein: 0.5, carbs: 11, fats: 0.3, servingSize: 100, servingUnit: 'g' },
    { name: 'Dưa hấu', description: 'Dưa hấu đỏ', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, servingSize: 100, servingUnit: 'g' },
    { name: 'Nho', description: 'Nho tươi', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, servingSize: 100, servingUnit: 'g' },

    // Beverages & Others
    { name: 'Sữa tươi', description: 'Sữa tươi không đường', calories: 42, protein: 3.4, carbs: 5, fats: 1, servingSize: 100, servingUnit: 'ml' },
    { name: 'Sữa chua', description: 'Sữa chua không đường', calories: 59, protein: 3.5, carbs: 4.7, fats: 3.3, servingSize: 100, servingUnit: 'g' },
    { name: 'Đậu nành', description: 'Sữa đậu nành không đường', calories: 33, protein: 2.9, carbs: 1.7, fats: 1.8, servingSize: 100, servingUnit: 'ml' },
    { name: 'Cà phê đen', description: 'Cà phê đen không đường', calories: 2, protein: 0.3, carbs: 0, fats: 0, servingSize: 100, servingUnit: 'ml' },
    { name: 'Trà xanh', description: 'Trà xanh không đường', calories: 1, protein: 0, carbs: 0, fats: 0, servingSize: 100, servingUnit: 'ml' },
    { name: 'Nước dừa', description: 'Nước dừa tươi', calories: 19, protein: 0.7, carbs: 3.7, fats: 0.2, servingSize: 100, servingUnit: 'ml' },
]

async function main() {
    console.log('Starting Vietnamese food seeding...')

    for (const food of vietnameseFoods) {
        await prisma.food.create({
            data: {
                ...food,
                isPublic: true,
            },
        })
    }

    console.log(`✅ Successfully seeded ${vietnameseFoods.length} Vietnamese foods`)
}

main()
    .catch((e) => {
        console.error('Error seeding foods:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
