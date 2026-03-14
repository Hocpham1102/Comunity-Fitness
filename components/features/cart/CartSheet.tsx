'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2 } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CheckoutDialog } from "./CheckoutDialog"

export function CartSheet({ children }: { children?: React.ReactNode }) {
    const { items, removeItem, totalPrice, totalItems } = useCartStore()

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="outline" size="icon" className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {totalItems() > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
                            >
                                {totalItems()}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your Cart ({totalItems()})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-2 border rounded-lg">
                                    <div className="relative w-24 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                        {item.thumbnailUrl ? (
                                            <Image
                                                src={item.thumbnailUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                                            {item.trainerName && (
                                                <p className="text-xs text-muted-foreground mt-1">by {item.trainerName}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="font-semibold text-primary">
                                                {item.price === 0 ? 'Free' : `${item.price} ${item.currency}`}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-lg">Total</span>
                        <span className="font-bold text-xl">{totalPrice()} USD</span>
                    </div>
                    {items.length > 0 ? (
                        <CheckoutDialog>
                            <Button className="w-full" size="lg">
                                Proceed to Checkout
                            </Button>
                        </CheckoutDialog>
                    ) : (
                        <Button className="w-full" size="lg" disabled>
                            Proceed to Checkout
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
