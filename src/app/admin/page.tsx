import { supabaseAdmin } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// This is a simplified example. For production, use a robust auth solution.
export const middleware = (req: NextRequest) => {
  const secret = process.env.ADMIN_SECRET_KEY;
  const key = req.nextUrl.searchParams.get('key');

  if (secret && key === secret) {
    return NextResponse.next();
  }

  return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};

type Submission = {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
};

// This component fetches data on the server side
async function getSubmissions(status: string | null): Promise<Submission[]> {
    let query = supabaseAdmin.from('submissions').select('id, title, description, status, created_at');

    if (status) {
        query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
    return data;
}

export default async function AdminPage({
    searchParams,
}: {
    searchParams: { status?: string };
}) {
    const submissions = await getSubmissions(searchParams.status);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Filter by Status</h2>
                    <div className="flex space-x-2">
                        <a href="/admin" className={`px-3 py-1 rounded-full text-sm ${!searchParams.status ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All</a>
                        <a href="/admin?status=new" className={`px-3 py-1 rounded-full text-sm ${searchParams.status === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>New</a>
                        <a href="/admin?status=verified" className={`px-3 py-1 rounded-full text-sm ${searchParams.status === 'verified' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Verified</a>
                        <a href="/admin?status=rejected" className={`px-3 py-1 rounded-full text-sm ${searchParams.status === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Rejected</a>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((submission) => (
                                <tr key={submission.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                                        <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '300px' }}>{submission.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            submission.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                                            submission.status === 'verified' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {submission.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(submission.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">Assign</button>
                                        <button className="text-green-600 hover:text-green-900">Verify</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {submissions.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No submissions found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// You need to export a config object with the runtime for server-side fetching in the app router
export const runtime = 'experimental-edge';
