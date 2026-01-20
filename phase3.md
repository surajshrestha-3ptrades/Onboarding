# Phase 3: User Dashboard & Profile Management

## 📋 Overview

**Duration:** Week 2-3 (Days 11-17)  
**Prerequisites:** Completed Phase 1 & 2 (Authentication working)

In this phase, you'll build a complete user dashboard where authenticated users can:
- View and manage their posts (drafts and published)
- View their bookmarked posts
- Edit their profile
- Access analytics about their content

---

## 🎯 Learning Objectives

- Protected routes and middleware
- Dashboard layouts with sidebar navigation
- Data fetching with user-specific filters
- Profile management forms
- Server actions for data mutations
- Conditional rendering based on auth status

---

## 📁 Files You'll Create

```
app/
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard home
│   │   ├── posts/
│   │   │   └── page.tsx          # My posts list
│   │   ├── bookmarks/
│   │   │   └── page.tsx          # Saved posts
│   │   └── settings/
│   │       └── page.tsx          # Profile settings
│   └── layout.tsx                # Dashboard layout
├── middleware.ts                 # Route protection
components/
├── dashboard/
│   ├── DashboardNav.tsx
│   ├── PostsList.tsx
│   └── StatsCard.tsx
```

---

## Day 11-12: Dashboard Layout & Navigation

### Exercise 3.1: Create Middleware for Protected Routes

**Objective:** Protect dashboard routes from unauthenticated users.

**Create Middleware (`middleware.ts` in root):**

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

**Alternative if using older NextAuth:**

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

**Test it:**
1. Log out of your application
2. Try to access `/dashboard`
3. You should be redirected to `/login`

**Deliverable:** Unauthenticated users cannot access `/dashboard` routes

---

### Exercise 3.2: Create Dashboard Layout with Sidebar

**Objective:** Build a sidebar navigation for the dashboard.

**Create Dashboard Navigation Component (`components/dashboard/DashboardNav.tsx`):**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Bookmark,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Posts',
    href: '/dashboard/posts',
    icon: FileText,
  },
  {
    name: 'Bookmarks',
    href: '/dashboard/bookmarks',
    icon: Bookmark,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 pt-8 border-t">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
```

**Create Dashboard Layout (`app/(dashboard)/layout.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
```

**Deliverable:** Dashboard has a working sidebar with navigation

---

### Exercise 3.3: Create Dashboard Home Page

**Objective:** Build the dashboard overview with statistics.

**Create Stats Card Component (`components/dashboard/StatsCard.tsx`):**

```tsx
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}
```

**Create Dashboard Home (`app/(dashboard)/dashboard/page.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatsCard from '@/components/dashboard/StatsCard'
import { FileText, Eye, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats(userId: string) {
  const [totalPosts, publishedPosts, totalLikes, totalComments] =
    await Promise.all([
      prisma.post.count({
        where: { authorId: userId },
      }),
      prisma.post.count({
        where: { authorId: userId, published: true },
      }),
      prisma.like.count({
        where: {
          post: {
            authorId: userId,
          },
        },
      }),
      prisma.comment.count({
        where: {
          post: {
            authorId: userId,
          },
        },
      }),
    ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts: totalPosts - publishedPosts,
    totalLikes,
    totalComments,
  }
}

async function getRecentPosts(userId: string) {
  return await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  })
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id

  const stats = await getDashboardStats(userId)
  const recentPosts = await getRecentPosts(userId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session!.user!.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          description={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
        />
        <StatsCard
          title="Published"
          value={stats.publishedPosts}
          icon={Eye}
          description="Live posts"
        />
        <StatsCard
          title="Total Likes"
          value={stats.totalLikes}
          icon={Heart}
          description="Across all posts"
        />
        <StatsCard
          title="Comments"
          value={stats.totalComments}
          icon={MessageCircle}
          description="Total discussions"
        />
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Posts</h2>
          <Link
            href="/dashboard/posts"
            className="text-blue-600 hover:underline text-sm"
          >
            View all
          </Link>
        </div>
        <div className="divide-y">
          {recentPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No posts yet.</p>
              <Link
                href="/dashboard/posts/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium">{post.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Last updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post._count.comments}
                  </span>
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
```

**Deliverable:** Dashboard home shows user statistics and recent posts

---

## Day 13-14: My Posts Page

### Exercise 3.4: Create My Posts Page with Tabs

**Objective:** Display user's posts with filtering (All, Published, Drafts).

**Create My Posts Page (`app/(dashboard)/dashboard/posts/page.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Eye, Calendar, Edit, Trash2 } from 'lucide-react'
import { formatDistance } from 'date-fns'

async function getUserPosts(userId: string, filter: string) {
  const where: any = { authorId: userId }

  if (filter === 'published') {
    where.published = true
  } else if (filter === 'drafts') {
    where.published = false
  }

  return await prisma.post.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  })
}

export default async function MyPostsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const session = await auth()
  const userId = session!.user!.id
  const filter = searchParams.filter || 'all'

  const posts = await getUserPosts(userId, filter)

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'drafts' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/posts?filter=${tab.value}`}
            className={`pb-4 px-2 border-b-2 transition ${
              filter === tab.value
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'drafts'
              ? "You don't have any drafts."
              : filter === 'published'
              ? "You haven't published any posts yet."
              : "Start writing your first post."}
          </p>
          <Link
            href="/dashboard/posts/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{post.title}</h2>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex gap-2 mb-4">
                    {post.tags.slice(0, 3).map((postTag) => (
                      <span
                        key={postTag.tag.id}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {postTag.tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Updated{' '}
                      {formatDistance(new Date(post.updatedAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    {post.published && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post._count.likes} likes
                        </span>
                        <span>{post._count.comments} comments</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** My Posts page displays user's posts with filtering

---

## Day 15-16: Bookmarks Page

### Exercise 3.5: Create Bookmarks Page

**Objective:** Show posts that the user has bookmarked.

**Create Bookmarks Page (`app/(dashboard)/dashboard/bookmarks/page.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Calendar } from 'lucide-react'
import { formatDistance } from 'date-fns'

async function getBookmarkedPosts(userId: string) {
  return await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
            take: 3,
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      },
    },
  })
}

export default async function BookmarksPage() {
  const session = await auth()
  const userId = session!.user!.id

  const bookmarks = await getBookmarkedPosts(userId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
        <p className="text-gray-600">
          {bookmarks.length}{' '}
          {bookmarks.length === 1 ? 'post' : 'posts'} saved for later
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
          <p className="text-gray-600 mb-6">
            Save posts to read later by clicking the bookmark icon.
          </p>
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Explore Posts
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map(({ post, createdAt }) => (
            <article
              key={post.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition"
            >
              <div className="flex gap-6">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={200}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                )}

                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    {post.tags.map((postTag) => (
                      <span
                        key={postTag.tag.id}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {postTag.tag.name}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {post.author.image && (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || ''}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span>{post.author.name}</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Saved{' '}
                      {formatDistance(new Date(createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>•</span>
                    <span>{post._count.comments} comments</span>
                    <span>•</span>
                    <span>{post._count.likes} likes</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** Bookmarks page displays saved posts

---

## Day 17: Profile Settings

### Exercise 3.6: Create Profile Settings Page

**Objective:** Allow users to update their profile information.

**Create Settings Page (`app/(dashboard)/dashboard/settings/page.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileForm from '@/components/dashboard/ProfileForm'

async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
    },
  })
}

export default async function SettingsPage() {
  const session = await auth()
  const userId = session!.user!.id

  const user = await getUserProfile(userId)

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your profile and account settings
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
```

**Create Profile Form Component (`components/dashboard/ProfileForm.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  bio: string | null
  image: string | null
}

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          Profile updated successfully!
        </div>
      )}

      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Profile'}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full border shadow-sm hover:bg-gray-50"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p>JPG, GIF or PNG. Max size 1MB.</p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your name"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-500">
          Email cannot be changed
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={user.bio || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Brief description for your profile. Max 200 characters.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

**Create Profile Update API (`app/api/user/profile/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, bio } = profileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

**Deliverable:** Users can update their name and bio

---

## 📝 Phase 3 Checklist

- [ ] Middleware protects dashboard routes
- [ ] Dashboard layout with sidebar navigation works
- [ ] Dashboard home displays user statistics
- [ ] My Posts page shows all user posts
- [ ] Tab filtering works (All, Published, Drafts)
- [ ] Bookmarks page displays saved posts
- [ ] Settings page allows profile updates
- [ ] Profile update API works correctly

---

## 🎯 Testing Checklist

1. **Authentication**
   - [ ] Cannot access dashboard when logged out
   - [ ] Redirects to login page when accessing protected routes
   - [ ] Sign out button works from dashboard

2. **Dashboard**
   - [ ] Statistics display correctly
   - [ ] Recent posts show up-to-date data
   - [ ] Navigation highlights active page

3. **My Posts**
   - [ ] All tabs filter correctly
   - [ ] Empty states display properly
   - [ ] Post counts are accurate

4. **Bookmarks**
   - [ ] Only bookmarked posts appear
   - [ ] Empty state shows when no bookmarks
   - [ ] Posts link to correct pages

5. **Settings**
   - [ ] Form pre-fills with current data
   - [ ] Updates save successfully
   - [ ] Error messages display properly
   - [ ] Success message appears after save

---

## 💡 Pro Tips

1. **Use Server Components**: Most dashboard pages should be server components for better performance
2. **Optimize Queries**: Use `select` and `include` to fetch only needed data
3. **Handle Empty States**: Always show helpful messages when there's no data
4. **Loading States**: Add loading indicators for better UX
5. **Error Handling**: Always handle errors gracefully

---

## 🐛 Common Issues

**Issue:** "Cannot access dashboard after login"
- **Solution:** Check if `session.user.id` is available. Update your auth config's callbacks.

**Issue:** "Stats showing 0 even though I have posts"
- **Solution:** Make sure you're querying with the correct `userId` from the session.

**Issue:** "Page doesn't refresh after update"
- **Solution:** Use `router.refresh()` after mutations to revalidate server components.

---

## 🚀 Next Steps

Once you complete Phase 3, move to **Phase 4: Rich Text Editor** where you'll:
- Integrate Tiptap editor
- Create new post form
- Implement draft auto-save
- Add image upload for post content