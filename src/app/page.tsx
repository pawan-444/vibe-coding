import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Unfiltered Bharat</h1>
        <p className="text-lg">Welcome. Report an incident or view submissions.</p>
        <div className="flex space-x-4">
          <Link href="/report" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit a Report
          </Link>
          <Link href="/admin" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}
