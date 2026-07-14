
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page not found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
