# Phase 6: Engagement Features (Likes & Bookmarks)

## 📋 Overview

**Duration:** Week 4 (Days 26-28)  
**Prerequisites:** Completed Phase 5 (Comments working)

Add engagement features that allow users to like posts and save them for later reading.

---

## Day 26: Post Likes

### Exercise 6.1: Add Like Button to Posts

**Create Like Button Component (`components/blog/LikeButton.tsx`):**

```tsx
'use client'

import { useState, useOptimistic } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialIsLiked: boolean
  showCount?: boolean
}

export default function LikeButton({
  postId,
  initialLikes,
  initialIsLiked,
  showCount = true,
}: LikeButtonProps) {
  const router = useRouter()
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    { likes: initialLikes, isLiked: initialIsLiked },
    (state, newIsLiked: boolean) => ({
      likes: newIsLiked ? state.likes + 1 : state.likes - 1,
      isLiked: newIsLiked,
    })
  )

  async function handleLike() {
    const newIsLiked = !optimisticLikes.isLiked
    setOptimisticLikes(newIsLiked)

    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        // Revert optimistic update
        setOptimisticLikes(!newIsLiked)
      } else {
        router.refresh()
      }
    } catch (error) {
      setOptimisticLikes(!newIsLiked)
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
        optimisticLikes.isLiked
          ? 'bg-red-50 border-red-200 text-red-600'
          : 'hover:bg-gray-50'
      }`}
    >
      <Heart
        className="w-5 h-5"
        fill={optimisticLikes.isLiked ? 'currentColor' : 'none'}
      />
      {showCount && <span>{optimisticLikes.likes}</span>}
    </button>
  )
}
```

**Create Post Like API (`app/api/posts/like/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}
```

**Add to Post Page:**

```tsx
// In app/(blog)/blog/[slug]/page.tsx

// Add after post content
<div className="flex items-center gap-4 mt-8 pt-8 border-t">
  <LikeButton
    postId={post.id}
    initialLikes={post._count.likes}
    initialIsLiked={!!post.likes?.length}
  />
  <BookmarkButton
    postId={post.id}
    initialIsBookmarked={!!post.bookmarks?.length}
  />
</div>
```

---

## Day 27: Bookmarks

### Exercise 6.2: Add Bookmark Feature

**Create Bookmark Button (`components/blog/BookmarkButton.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookmarkButtonProps {
  postId: string
  initialIsBookmarked: boolean
}

export default function BookmarkButton({
  postId,
  initialIsBookmarked,
}: BookmarkButtonProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleBookmark() {
    setLoading(true)
    const newState = !isBookmarked
    setIsBookmarked(newState)

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        setIsBookmarked(!newState)
      } else {
        router.refresh()
      }
    } catch (error) {
      setIsBookmarked(!newState)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
        isBookmarked
          ? 'bg-blue-50 border-blue-200 text-blue-600'
          : 'hover:bg-gray-50'
      }`}
    >
      <Bookmark
        className="w-5 h-5"
        fill={isBookmarked ? 'currentColor' : 'none'}
      />
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  )
}
```

**Create Bookmark API (`app/api/bookmarks/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      })
      return NextResponse.json({ bookmarked: false })
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process bookmark' },
      { status: 500 }
    )
  }
}
```

---

## Day 28: View Counter & Reading Time

### Exercise 6.3: Track Post Views

**Add View Counter to Schema (if not already added):**

```prisma
model Post {
  // ... existing fields
  views         Int       @default(0)
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_views
```

**Create View Tracker Component (`components/blog/ViewTracker.tsx`):**

```tsx
'use client'

import { useEffect } from 'react'

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    // Track view after 5 seconds (actual reading)
    const timer = setTimeout(() => {
      fetch('/api/posts/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [postId])

  return null
}
```

**Create View API (`app/api/posts/view/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { postId } = await req.json()

    await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
```

**Add Reading Time Utility:**

```typescript
// In lib/utils.ts
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
```

**Display in Post:**

```tsx
// In post page
const readingTime = calculateReadingTime(post.content)

<div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
  <span>{readingTime} min read</span>
  <span>•</span>
  <span>{post.views} views</span>
</div>

<ViewTracker postId={post.id} />
```

---

## 📝 Phase 6 Checklist

- [ ] Like button works with optimistic UI
- [ ] Like count updates correctly
- [ ] Bookmark button saves posts
- [ ] Bookmarked posts appear in dashboard
- [ ] View counter tracks after 5 seconds
- [ ] Reading time calculates correctly
- [ ] Both features require authentication

---

## 🚀 Next Steps

Move to **Phase 7: Search & Filtering** for search functionality, tag pages, and filtering options.