# Phase 5: Comments System

## 📋 Overview

**Duration:** Week 3-4 (Days 22-25)  
**Prerequisites:** Completed Phase 4 (Post creation working)

In this phase, you'll build a complete commenting system with nested replies, allowing readers to engage with blog posts through discussions.

---

## 🎯 Learning Objectives

- Build nested comment threads
- Implement Server Actions for comments
- Handle optimistic UI updates
- Create comment forms with validation
- Display comment timestamps
- Allow comment editing and deletion
- Add comment likes

---

## Day 22: Comment Components

### Exercise 5.1: Create Comment Display Component

**Objective:** Build a component to display a single comment.

**Create Comment Component (`components/blog/Comment.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistance } from 'date-fns'
import { Heart, Reply, MoreHorizontal, Edit, Trash } from 'lucide-react'

interface CommentProps {
  comment: {
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      replies: number
    }
    isLiked?: boolean
  }
  currentUserId?: string
  onReply: (commentId: string) => void
  onEdit?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  onLike?: (commentId: string) => void
}

export default function Comment({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
}: CommentProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isAuthor = currentUserId === comment.author.id

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt={comment.author.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
            {comment.author.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistance(new Date(comment.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Menu for author */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(comment.id)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(comment.id)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-600 text-left"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <button
            onClick={() => onLike?.(comment.id)}
            className={`flex items-center gap-1 hover:text-red-600 ${
              comment.isLiked ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={comment.isLiked ? 'currentColor' : 'none'}
            />
            <span>{comment._count.likes}</span>
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>

          {comment._count.replies > 0 && (
            <span className="text-gray-500">
              {comment._count.replies}{' '}
              {comment._count.replies === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Deliverable:** Comment component displays comment with actions

---

### Exercise 5.2: Create Comment Form Component

**Objective:** Build a reusable form for posting comments.

**Create Comment Form (`components/blog/CommentForm.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  buttonText?: string
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...',
  buttonText = 'Comment',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      setContent('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={loading}
      />

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Posting...' : buttonText}
        </button>
      </div>
    </form>
  )
}
```

**Deliverable:** Comment form component is reusable for both top-level and reply comments

---

## Day 23: Comment Section with Nested Replies

### Exercise 5.3: Create Comment Section Component

**Objective:** Build the complete comment section with nested replies.

**Create Comment Section (`components/blog/CommentSection.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Comment from './Comment'
import CommentForm from './CommentForm'
import { MessageCircle } from 'lucide-react'

interface CommentData {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    replies: number
  }
  replies?: CommentData[]
  isLiked?: boolean
}

interface CommentSectionProps {
  postId: string
  comments: CommentData[]
  currentUserId?: string
}

export default function CommentSection({
  postId,
  comments: initialComments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  function handleReplySuccess() {
    setReplyingTo(null)
    router.refresh()
  }

  function handleCommentSuccess() {
    router.refresh()
  }

  async function handleLike(commentId: string) {
    try {
      const response = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  function renderComment(comment: CommentData, depth: number = 0) {
    return (
      <div key={comment.id}>
        <Comment
          comment={comment}
          currentUserId={currentUserId}
          onReply={setReplyingTo}
          onLike={handleLike}
          onDelete={handleDelete}
        />

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="ml-13 mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setReplyingTo(null)}
              placeholder="Write a reply..."
              buttonText="Reply"
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-13 mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {currentUserId ? (
        <div className="mb-8">
          <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-6 text-center mb-8">
          <p className="text-gray-600">
            Please sign in to leave a comment
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** Comment section displays nested comments with reply functionality

---

## Day 24: Comments API

### Exercise 5.4: Create Comments API Routes

**Objective:** Build API routes for comment CRUD operations.

**Create Comments API (`app/api/comments/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const commentSchema = z.object({
  postId: z.string(),
  parentId: z.string().optional(),
  content: z.string().min(1).max(1000),
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { postId, parentId, content } = commentSchema.parse(body)

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If replying, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        parentId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const comments = await getCommentsWithReplies(postId)

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Fetch comments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

async function getCommentsWithReplies(postId: string) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null, // Only get top-level comments
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Recursively fetch replies
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      replies: await getReplies(comment.id),
    }))
  )

  return commentsWithReplies
}

async function getReplies(parentId: string): Promise<any[]> {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Recursively fetch nested replies
  return await Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      replies: await getReplies(reply.id),
    }))
  )
}
```

**Create Comment Delete API (`app/api/comments/[id]/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment and all its replies (cascade)
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
```

**Create Comment Like API (`app/api/comments/like/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to like' },
        { status: 401 }
      )
    }

    const { commentId } = await req.json()

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}
```

**Deliverable:** All comment API routes working

---

## Day 25: Integrate Comments into Post Page

### Exercise 5.5: Add Comments to Post Page

**Objective:** Display comments on individual blog post pages.

**Update Post Page (`app/(blog)/blog/[slug]/page.tsx`):**

Add this after the post content:

```tsx
import CommentSection from '@/components/blog/CommentSection'

// ... existing code ...

async function getComments(postId: string, userId?: string) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: userId
        ? {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Add nested replies
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      isLiked: comment.likes && comment.likes.length > 0,
      replies: await getReplies(comment.id, userId),
    }))
  )

  return commentsWithReplies
}

async function getReplies(parentId: string, userId?: string): Promise<any[]> {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      likes: userId
        ? {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return await Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      isLiked: reply.likes && reply.likes.length > 0,
      replies: await getReplies(reply.id, userId),
    }))
  )
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await auth()
  const post = await getPost(params.slug)
  const comments = await getComments(post.id, session?.user?.id)

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ... existing post content ... */}

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        comments={comments}
        currentUserId={session?.user?.id}
      />
    </article>
  )
}
```

**Deliverable:** Comments appear on blog post pages with full functionality

---

## 📝 Phase 5 Checklist

- [ ] Comment component displays correctly
- [ ] Comment form validates input
- [ ] Comments can be posted
- [ ] Nested replies work
- [ ] Reply form shows/hides properly
- [ ] Comments can be deleted by author
- [ ] Comment likes work
- [ ] Like count updates
- [ ] Empty states display
- [ ] Timestamps format correctly

---

## 🎯 Testing Checklist

1. **Basic Comments**
   - [ ] Can post a comment when logged in
   - [ ] Cannot post empty comments
   - [ ] Comments show immediately after posting
   - [ ] Comment count updates

2. **Nested Replies**
   - [ ] Reply button shows reply form
   - [ ] Can post replies
   - [ ] Replies nest correctly (visual indentation)
   - [ ] Can reply to replies (multiple levels)

3. **Interactions**
   - [ ] Like button toggles
   - [ ] Like count updates
   - [ ] Only author can delete their comments
   - [ ] Delete confirmation shows
   - [ ] Comment disappears after deletion

4. **Authentication**
   - [ ] Logged-out users see "sign in to comment"
   - [ ] Logged-in users see comment form
   - [ ] Menu only shows for comment author

---

## 💡 Pro Tips

1. **Performance**: Use pagination for posts with many comments (100+)
2. **Real-time**: Consider WebSockets for instant comment updates
3. **Moderation**: Add ability to report inappropriate comments
4. **Notifications**: Notify authors when someone comments/replies
5. **Sorting**: Add sort options (newest, oldest, most liked)

---

## 🐛 Common Issues

**Issue:** "Comments not showing after posting"
- **Solution:** Call `router.refresh()` after successful comment creation

**Issue:** "Nested replies not indenting"
- **Solution:** Check the `ml-13` class is applied and border-left styling is correct

**Issue:** "Like button not updating"
- **Solution:** Ensure you're passing `isLiked` prop and it's updating correctly

**Issue:** "Can delete other users' comments"
- **Solution:** Verify authorization check in DELETE API route

---

## 🚀 Next Steps

Move to **Phase 6: Engagement Features** where you'll:
- Add post likes
- Implement bookmarks/save posts
- Create user activity feed
- Add post view tracking