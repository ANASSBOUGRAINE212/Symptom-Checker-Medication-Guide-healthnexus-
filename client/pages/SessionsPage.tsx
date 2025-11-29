import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Monitor, Smartphone, Tablet, MapPin, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const API_URL = 'http://localhost:5174/api/v1';

interface Session {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  rememberMe: boolean;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function SessionsPage() {
  const { accessToken } = useAuth();
  const isMobile = useIsMobile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session');
      }

      setSuccess('Session revoked successfully');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm('Are you sure you want to logout from all other devices?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/auth/sessions/revoke-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke sessions');
      }

      setSuccess('All other sessions revoked successfully');
      setSessions(sessions.filter(s => s.isCurrent));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
    }
  };

  const getDeviceIcon = (deviceName: string | null, userAgent: string | null) => {
    const ua = (deviceName || userAgent || '').toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (ua.includes('ipad') || ua.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-center">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'p-4' : 'p-8'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Active Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your logged-in devices and sessions
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
              {success}
            </AlertDescription>
          </Alert>
        )}

        {sessions.length > 1 && (
          <div className="mb-6">
            <Button
              onClick={revokeAllOtherSessions}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Logout All Other Devices
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No active sessions found</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className={session.isCurrent ? 'border-blue-500 dark:border-blue-400' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getDeviceIcon(session.deviceName, session.userAgent)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {session.deviceName || 'Unknown Device'}
                          {session.isCurrent && (
                            <Badge variant="default" className="ml-2">Current</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {session.userAgent && (
                            <span className="text-xs block">{session.userAgent}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={revokingId === session.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {session.ipAddress && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{session.ipAddress}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last active: {formatDate(session.lastUsedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatExpiry(session.expiresAt)}</span>
                    </div>
                    {session.rememberMe && (
                      <Badge variant="secondary" className="mt-2">
                        Remember Me Enabled (30 days)
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Security Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Review your active sessions regularly</li>
            <li>• Revoke sessions from devices you don't recognize</li>
            <li>• Use "Remember Me" only on trusted devices</li>
            <li>• Logout from public or shared computers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;
