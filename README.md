# Unfiltered Bharat

Unfiltered Bharat is a platform for anonymous submission of news and reports. This repository contains the starter code for the MVP, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Anonymous Submissions**: Users can submit reports without revealing their identity.
- **File Uploads**: Supports multiple file uploads (images, audio, video).
- **Geolocation**: Users can optionally attach their location to a report.
- **Admin Panel**: A simple admin interface to review and manage submissions.
- **PWA Ready**: Can be installed on mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.io/) (Postgres + Storage)
- **Testing**: [Jest](https://jestjs.io/) + [Supertest](https://github.com/visionmedia/supertest)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/unfiltered-bharat.git
cd unfiltered-bharat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1.  **Create a new Supabase project**: Go to [supabase.io](https://supabase.io/) and create a new project.
2.  **Get your project credentials**:
    *   Navigate to **Project Settings > API**.
    *   Find your **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    *   Find your **service\_role key** (`SUPABASE_SERVICE_ROLE_KEY`).
3.  **Create a storage bucket**:
    *   Go to the **Storage** section in your Supabase dashboard.
    *   Create a new bucket. The name of the bucket will be your `SUPABASE_BUCKET_NAME`.
    *   Make the bucket public. You can do this by setting a policy. A simple policy to allow public reads is:
        ```sql
        CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING ( bucket_id = 'your-bucket-name' );
        ```
4.  **Get your database connection string**:
    *   Navigate to **Project Settings > Database**.
    *   Find your **Connection string** (`DATABASE_URL`).

### 4. Set up environment variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, fill in the values in your `.env` file with the credentials you obtained from Supabase.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_BUCKET_NAME=your-supabase-bucket-name

# Admin access
ADMIN_SECRET_KEY=a-very-secret-key-for-admin-access

# This is used by Supabase's pg library if you're running migrations locally
DATABASE_URL="postgresql://postgres:your-postgres-password@db.your-project-ref.supabase.co:5432/postgres"
```

### 5. Run database migrations

You can run the migrations in two ways:

1.  **Using the Supabase CLI**: This is the recommended approach for managing database changes.
    ```bash
    # Install the Supabase CLI
    npm install -g supabase

    # Link your local project to your Supabase project
    supabase link --project-ref your-project-ref

    # Push the migration
    supabase db push
    ```

2.  **Manually in the Supabase dashboard**:
    *   Go to the **SQL Editor** in your Supabase dashboard.
    *   Copy the content of `migrations/001_create_submissions.sql` and run it.

### 6. Run the development server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

-   **Submission Form**: [http://localhost:3000/report](http://localhost:3000/report)
-   **Admin Panel**: [http://localhost:3000/admin?key=your-admin-secret-key](http://localhost:3000/admin?key=your-admin-secret-key)

## Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the code using ESLint.
-   `npm run test`: Runs the API tests using Jest.

## Testing the API with cURL

Here is an example `curl` command to test the file upload API. Make sure to replace `path/to/your/file.jpg` with an actual file path.

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Submission from cURL" \
  -F "description=This is a detailed description of the event." \
  -F "tags=test,curl,api" \
  -F "anonymity=true" \
  -F "location={\"lat\": 19.0760, \"lng\": 72.8777, \"place_name\": \"Mumbai\"}" \
  -F "files=@/path/to/your/file.jpg"
```

### Example Success Response

```json
{
  "success": true,
  "submission": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "Test Submission from cURL",
    "description": "This is a detailed description of the event.",
    "media_urls": ["https://your-supabase-url.co/storage/v1/object/public/your-bucket-name/your-file.jpg"],
    "media_types": ["image/jpeg"],
    "voice_transcript": null,
    "location": { "lat": 19.0760, "lng": 72.8777, "place_name": "Mumbai" },
    "tags": ["test", "curl", "api"],
    "anonymity": true,
    "contact_info": null,
    "source": "web",
    "status": "new",
    "assigned_to": null,
    "created_at": "2023-11-15T12:00:00.000Z",
    "updated_at": "2023-11-15T12:00:00.000Z"
  }
}
```
