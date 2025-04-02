import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Looks like you're lost... 🧭</p>
      <img
        src="https://media.giphy.com/media/ji6zzUZwNIuLS/giphy.gif"
        alt="Confused animation"
        className="w-72 h-auto mb-6 rounded shadow-lg"
      />
      <p className="text-md text-gray-400 mb-8">
        This page doesn't exist or has been moved. But hey, at least you found A Mirror.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Safety
      </Link>
    </main>
  );
}