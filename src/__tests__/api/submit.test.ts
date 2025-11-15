import request from 'supertest';
import { createServer } from 'http';
import { NextApiHandler } from 'next';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { POST } from '@/app/api/submit/route'; // Adjust path as needed
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabaseClient', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { id: 'mock-submission-id', title: 'Test Title' },
      error: null,
    }),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({
        data: { path: 'mock-path' },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'http://localhost/mock-url' },
      }),
    },
  },
}));

const testClient = (handler: (req: NextRequest) => Promise<Response>) => {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, 'http://localhost');
    const requestHeaders = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => requestHeaders.append(key, v));
      } else if (value) {
        requestHeaders.set(key, value);
      }
    });

    const body = await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const nextRequest = new NextRequest(url, {
        method: req.method,
        headers: requestHeaders,
        body: body.length > 0 ? body : null,
    });

    const response = await handler(nextRequest);

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
    }
    res.end(await response.text());
  });

  return request(server);
};


describe('POST /api/submit', () => {
  it('should return 201 on successful submission', async () => {
    const response = await testClient(POST)
      .post('/api/submit')
      .field('title', 'Test Title')
      .field('description', 'Test Description')
      .attach('files', Buffer.from('test file content'), 'test.txt');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.submission.id).toBe('mock-submission-id');
  });

  it('should return 400 if title is missing', async () => {
    const response = await testClient(POST)
      .post('/api/submit')
      .field('description', 'Test Description');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Title and description are required.');
  });
});
