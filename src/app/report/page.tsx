'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type FormInputs = {
  title: string;
  description: string;
  tags: string;
  anonymity: boolean;
  contact_info: string;
  files: FileList;
};

type LocationState = {
  lat?: number;
  lng?: number;
  place_name?: string;
};

export default function ReportPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);

  const isAnonymous = watch('anonymity', true);

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a reverse geocoding API here
          setLocation({ lat: latitude, lng: longitude, place_name: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` });
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not retrieve location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSubmissionId(null);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', data.tags);
    formData.append('anonymity', String(data.anonymity));
    if (!data.anonymity) {
      formData.append('contact_info', data.contact_info);
    }
    if (location) {
      formData.append('location', JSON.stringify(location));
    }
    if (data.files) {
      for (let i = 0; i < data.files.length; i++) {
        formData.append('files', data.files[i]);
      }
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionId(result.submission.id);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Submission Successful!</h2>
          <p>Thank you for your contribution.</p>
          <p className="mt-4">Your submission reference ID is:</p>
          <p className="text-lg font-mono bg-gray-200 p-2 rounded mt-2">{submissionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6">Submit a Report</h1>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input id="title" {...register('title', { required: 'Title is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" {...register('description', { required: 'Description is required' })} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input id="tags" {...register('tags')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700">Attach Files (Images, Audio, Video)</label>
            <input id="files" type="file" {...register('files')} multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
          </div>

          <div className="flex items-center space-x-2">
            <button type="button" onClick={handleGeolocation} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">
              Add My Location
            </button>
            {location && <span className="text-sm text-gray-600">{location.place_name}</span>}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="anonymity" {...register('anonymity')} type="checkbox" defaultChecked className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="anonymity" className="font-medium text-gray-700">Submit Anonymously</label>
            </div>
          </div>

          {!isAnonymous && (
            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700">Contact Info (optional)</label>
              <input id="contact_info" {...register('contact_info')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          )}

          <div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
