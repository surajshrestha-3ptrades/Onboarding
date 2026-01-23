export default function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            © 2026 Nishan Poudel. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Twitter
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}