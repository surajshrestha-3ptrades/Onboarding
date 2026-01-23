import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from 'date-fns'

async function getRecentPosts() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
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
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 6,
  })

  return posts
}

export default async function HomePage() {
  const posts = await getRecentPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Our Blog
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
        <Link
          href="/blog"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
        >
          Start Reading
        </Link>
      </section>

      {/* Recent Posts */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {post.tags.slice(0, 2).map((postTag) => (
                    <span
                      key={postTag.tag.id}
                      className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-violet-600"
                    >
                      {postTag.tag.name}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {post.author.image && (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || 'Author'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>{post._count.comments} comments</span>
                    <span>{post._count.likes} likes</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {post.publishedAt &&
                    formatDistance(new Date(post.publishedAt), new Date(), {
                      addSuffix: true,
                    })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}