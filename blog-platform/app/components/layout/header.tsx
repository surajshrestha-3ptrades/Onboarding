import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            BlogPlatform
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            <Link href="/about" className="hover:text-blue-600">
              About
            </Link>
            <Link href="/login" className="hover:text-blue-600">
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}