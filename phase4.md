# Phase 4: Rich Text Editor & Post Creation

## 📋 Overview

**Duration:** Week 3 (Days 18-21)  
**Prerequisites:** Completed Phase 3 (Dashboard working)

In this phase, you'll implement a powerful rich text editor using Tiptap, allowing users to create and edit blog posts with rich formatting, images, code blocks, and more.

---

## 🎯 Learning Objectives

- Integrate Tiptap rich text editor
- Handle file uploads (images)
- Implement auto-save functionality
- Create slug generation
- Build create and edit post forms
- Use Server Actions for form submission
- Handle draft and publish workflows

---

## 📦 Dependencies to Install

```bash
# Tiptap editor and extensions
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-link @tiptap/extension-image
npm install @tiptap/extension-code-block-lowlight
npm install lowlight

# For image upload
npm install react-dropzone

# For slug generation
npm install slugify
```

---

## Day 18: Tiptap Editor Setup

### Exercise 4.1: Create Basic Rich Text Editor Component

**Objective:** Build a reusable Tiptap editor component.

**Create Editor Component (`components/editor/RichTextEditor.tsx`):**

```tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('code') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Insert */}
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
          type="button"
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          type="button"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
```

**Deliverable:** Working rich text editor component with toolbar

---

### Exercise 4.2: Create Image Upload Component

**Objective:** Allow users to upload images for their posts.

**Create Image Upload API Route (`app/api/upload/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`
    const path = join(process.cwd(), 'public', 'uploads', filename)

    // Save file
    await writeFile(path, buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
```

**Create uploads directory:**
```bash
mkdir -p public/uploads
```

**Create Image Upload Component (`components/editor/ImageUpload.tsx`):**

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        onChange(data.url)
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image')
      } finally {
        setUploading(false)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  if (value) {
    return (
      <div className="relative">
        <Image
          src={value}
          alt="Uploaded image"
          width={600}
          height={400}
          className="rounded-lg w-full"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the image here'
              : 'Drag & drop an image, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** Image upload component with drag-and-drop

---

## Day 19: Create New Post Page

### Exercise 4.3: Build Create Post Form

**Objective:** Create a form for writing new blog posts.

**Create Slug Generation Utility (`lib/utils.ts`):**

```typescript
import slugify from 'slugify'

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
```

**Create New Post Page (`app/(dashboard)/dashboard/posts/new/page.tsx`):**

```tsx
import PostForm from '@/components/dashboard/PostForm'

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-gray-600 mt-2">
          Write and publish your blog post
        </p>
      </div>

      <PostForm />
    </div>
  )
}
```

**Create Post Form Component (`components/dashboard/PostForm.tsx`):**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/editor/RichTextEditor'
import ImageUpload from '@/components/editor/ImageUpload'
import { generateSlug } from '@/lib/utils'
import { Save, Eye, X } from 'lucide-react'

interface PostFormProps {
  initialData?: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string | null
    published: boolean
  }
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoSaving, setAutoSaving] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && title) {
      setSlug(generateSlug(title))
    }
  }, [title, initialData])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!title || !content) return

    const timer = setTimeout(() => {
      saveDraft()
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [title, content, excerpt])

  async function saveDraft() {
    if (!title || !content) return

    setAutoSaving(true)
    try {
      const response = await fetch('/api/posts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          title,
          slug,
          content,
          excerpt,
          coverImage,
        }),
      })

      if (response.ok) {
        console.log('Draft auto-saved')
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }

  async function handleSubmit(published: boolean) {
    setError('')
    setLoading(true)

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      setLoading(false)
      return
    }

    try {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const response = await fetch('/api/posts', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          title,
          slug,
          content,
          excerpt,
          coverImage,
          published,
          tags: tagArray,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post')
      }

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="max-w-4xl space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {autoSaving && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
          Auto-saving...
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold border-0 focus:ring-0 focus:outline-none placeholder-gray-300"
          placeholder="Post title"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          URL Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">/blog/</span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="post-url-slug"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Auto-generated from title. You can edit it.
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of your post (optional)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Used in post previews and meta descriptions
        </p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Cover Image
        </label>
        <ImageUpload
          value={coverImage}
          onChange={setCoverImage}
          onRemove={() => setCoverImage('')}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-2">Content *</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your post content..."
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="javascript, react, nextjs (comma-separated)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Separate tags with commas
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Eye className="w-4 h-4" />
          {loading ? 'Publishing...' : 'Publish'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

**Deliverable:** Create post form with rich text editor and auto-save

---

## Day 20: Post Creation API

### Exercise 4.4: Create Post API Routes

**Objective:** Build API routes to handle post creation and updates.

**Create Posts API Route (`app/api/posts/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = postSchema.parse(body)

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create or find tags
    const tagObjects = await Promise.all(
      (validatedData.tags || []).map(async (tagName) => {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-')
        return await prisma.tag.upsert({
          where: { slug },
          create: { name: tagName, slug },
          update: {},
        })
      })
    )

    // Create post
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        coverImage: validatedData.coverImage || null,
        published: validatedData.published,
        publishedAt: validatedData.published ? new Date() : null,
        authorId: session.user.id,
        tags: {
          create: tagObjects.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, ...validatedData } = z
      .object({
        id: z.string(),
      })
      .merge(postSchema)
      .parse(body)

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check slug uniqueness (excluding current post)
    if (validatedData.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Handle tags
    const tagObjects = await Promise.all(
      (validatedData.tags || []).map(async (tagName) => {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-')
        return await prisma.tag.upsert({
          where: { slug },
          create: { name: tagName, slug },
          update: {},
        })
      })
    )

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        coverImage: validatedData.coverImage || null,
        published: validatedData.published,
        publishedAt:
          validatedData.published && !existingPost.published
            ? new Date()
            : existingPost.publishedAt,
        tags: {
          deleteMany: {},
          create: tagObjects.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}
```

**Create Draft Auto-Save API (`app/api/posts/draft/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, title, slug, content, excerpt, coverImage } = body

    if (id) {
      // Update existing draft
      await prisma.post.update({
        where: { id, authorId: session.user.id },
        data: { title, slug, content, excerpt, coverImage },
      })
    } else {
      // Create new draft
      await prisma.post.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          coverImage,
          published: false,
          authorId: session.user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Draft save error:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}
```

**Deliverable:** API routes for creating and updating posts

---

## Day 21: Edit Post Page

### Exercise 4.5: Create Edit Post Page

**Objective:** Allow users to edit their existing posts.

**Create Edit Post Page (`app/(dashboard)/dashboard/posts/[id]/edit/page.tsx`):**

```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import PostForm from '@/components/dashboard/PostForm'

async function getPost(id: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== userId) {
    redirect('/dashboard/posts')
  }

  return post
}

export default async function EditPostPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const userId = session!.user!.id

  const post = await getPost(params.id, userId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-gray-600 mt-2">
          Make changes to your blog post
        </p>
      </div>

      <PostForm
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          coverImage: post.coverImage,
          published: post.published,
        }}
      />
    </div>
  )
}
```

**Deliverable:** Edit page loads existing post data into the form

---

## 📝 Phase 4 Checklist

- [ ] Tiptap editor component created
- [ ] Editor toolbar with formatting buttons works
- [ ] Image upload API route functional
- [ ] Image upload component with drag-and-drop
- [ ] Create new post form complete
- [ ] Auto-save draft functionality working
- [ ] Slug auto-generation from title
- [ ] Post creation API working
- [ ] Post update API working
- [ ] Edit post page functional
- [ ] Tags creation and association working

---

## 🎯 Testing Checklist

1. **Rich Text Editor**
   - [ ] All formatting buttons work
   - [ ] Undo/redo functionality works
   - [ ] Links can be inserted
   - [ ] Images can be inserted

2. **Image Upload**
   - [ ] Drag and drop works
   - [ ] Click to select works
   - [ ] Image previews correctly
   - [ ] Remove image button works

3. **Create Post**
   - [ ] Form validates required fields
   - [ ] Slug generates from title
   - [ ] Auto-save works every 30 seconds
   - [ ] Can save as draft
   - [ ] Can publish immediately
   - [ ] Tags are saved correctly

4. **Edit Post**
   - [ ] Loads existing post data
   - [ ] Can update and save changes
   - [ ] Can publish draft
   - [ ] Can unpublish post

---

## 💡 Pro Tips

1. **Auto-save**: Debounce auto-save to avoid too many requests
2. **Slug Validation**: Check slug uniqueness before saving
3. **Rich Text**: Sanitize HTML content before saving to database
4. **Images**: Consider using a CDN or cloud storage (Cloudinary, AWS S3) for production
5. **Tags**: Use lowercase slugs for tags to avoid duplicates

---

## 🐛 Common Issues

**Issue:** "Editor toolbar buttons not responding"
- **Solution:** Make sure all buttons have `type="button"` to prevent form submission

**Issue:** "Image upload fails silently"
- **Solution:** Check file size limits and ensure `/public/uploads` directory exists

**Issue:** "Slug already exists" error
- **Solution:** Add timestamp to slug or prompt user to change it

**Issue:** "Auto-save conflicts with manual save"
- **Solution:** Disable auto-save when user is actively saving/publishing

---

## 🚀 Next Steps

Move to **Phase 5: Comments System** where you'll:
- Build comment components
- Implement nested replies
- Add comment likes
- Create comment moderation