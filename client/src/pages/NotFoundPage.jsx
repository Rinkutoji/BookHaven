import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container py-32 text-center">
      <p className="text-8xl mb-6">📚</p>
      <h1 className="font-display text-5xl font-bold text-ink mb-4">404</h1>
      <p className="text-xl text-ink-muted mb-2">This page got lost in the library.</p>
      <p className="text-ink-muted mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
