"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { PenLine } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PenLine className="h-6 w-6" />
            <span className="font-bold">Anonymous Blog</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              href="/tags"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/tags")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Tags
            </Link>
            <Link
              href="/trending"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/trending")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Trending
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}