import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
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

  if (!post) {
    notFound()
  }

  return post
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Post Header */}
      <header className="mb-8">
        <div className="flex gap-2 mb-4">
          {post.tags.map((postTag) => (
            <Link
              key={postTag.tag.id}
              href={`/tag/${postTag.tag.slug}`}
              className="text-sm bg-blue-600 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
            >
              {postTag.tag.name}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-6">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name || 'Author'}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <Link
              href={`/author/${post.author.id}`}
              className="font-semibold hover:text-blue-600"
            >
              {post.author.name}
            </Link>
            <div className="text-sm text-gray-600">
              {post.publishedAt &&
                format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              <span className="mx-2">•</span>
              <span>{post._count.comments} comments</span>
              <span className="mx-2">•</span>
              <span>{post._count.likes} likes</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full rounded-lg mb-8"
          />
        )}
      </header>

      {/* Post Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Author Bio */}
      <div className="border-t border-b py-8 my-12">
        <div className="flex gap-4">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name || 'Author'}
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <div>
            <h3 className="text-xl font-bold mb-2">
              Written by {post.author.name}
            </h3>
            {post.author.bio && (
              <p className="text-gray-600">{post.author.bio}</p>
            )}
            <Link
              href={`/author/${post.author.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View all posts by {post.author.name} →
            </Link>
          </div>
        </div>
      </div>

      {/* Comments Section Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          Comments ({post._count.comments})
        </h2>
        <p className="text-gray-600">
          Comments section coming soon...
        </p>
      </div>
    </article>
  )
}