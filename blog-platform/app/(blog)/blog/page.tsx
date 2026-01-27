import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

const POSTS_PER_PAGE = 10

async function getPosts(page: number) {
  const skip = (page - 1) * POSTS_PER_PAGE

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: {
          include: { tag: true },
          take: 3,
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where: { published: true } }),
  ])

  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const { posts, total, totalPages } = await getPosts(currentPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Blog Posts</h1>
      <p className="text-gray-600 mb-8">
        {total} {total === 1 ? 'post' : 'posts'} published
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b pb-8 last:border-b-0"
          >
            <div className="flex gap-2 mb-3">
              {post.tags.map((postTag) => (
                <Link
                  key={postTag.tag.id}
                  href={`/tag/${postTag.tag.slug}`}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                >
                  {postTag.tag.name}
                </Link>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600"
              >
                {post.title}
              </Link>
            </h2>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>{post.author.name}</span>
              <span>•</span>
              <span>
                {post.publishedAt &&
                  formatDistance(new Date(post.publishedAt), new Date(), {
                    addSuffix: true,
                  })}
              </span>
              <span>•</span>
              <span>{post._count.comments} comments</span>
              <span>•</span>
              <span>{post._count.likes} likes</span>
            </div>

            {post.excerpt && (
              <p className="text-gray-700 mb-4">{post.excerpt}</p>
            )}

            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/blog?page=${page}`}
              className={`px-4 py-2 border rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}