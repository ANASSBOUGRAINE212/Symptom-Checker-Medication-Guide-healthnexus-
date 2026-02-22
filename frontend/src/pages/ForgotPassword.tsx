import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageBackground } from '@/components/ui/page-background';

const API_URL = 'http://localhost:5174/api/v1';

function ForgotPasswordPage() {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageBackground>
      <div className={`min-h-screen ${isMobile ? 'p-4' : 'p-8'}`}>
        <div className="mx-auto w-full max-w-md mt-20">
          <div className="flex justify-center mb-6">
            <img src="/icon.png" alt="HealthNexus Logo" className="h-12 w-12 rounded-xl" />
          </div>

          <div className="rounded-2xl p-6 md:p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Enter your email and we'll send you a reset code
              </p>
            </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Reset code sent! Check your email (or server logs if email is disabled).
                <Link to="/reset-password" className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Enter reset code →
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Sign In
            </Link>
          </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

export default ForgotPasswordPage;
