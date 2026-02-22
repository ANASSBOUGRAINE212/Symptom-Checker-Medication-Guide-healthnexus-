import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageBackground } from "@/components/ui/page-background";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If user is already logged in and verified, redirect to home
    if (user && user.emailVerified) {
      navigate("/home");
      return;
    }
    
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate, user]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      // First verify the email
      const verifyResponse = await fetch("/api/v1/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Verification failed");
        setIsVerifying(false);
        return;
      }

      // Email verified! Now auto-login the user
      const password = location.state?.password;
      
      if (password) {
        // Auto-login with saved password
        try {
          const loginResponse = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Save tokens and reload page to update auth context
            localStorage.setItem("accessToken", loginData.data.accessToken);
            
            setSuccess(true);
            toast({
              title: "Email Verified!",
              description: "Redirecting to profile setup...",
            });
            // Reload to update auth context, then navigate
            setTimeout(() => {
              window.location.href = "/profile-setup";
            }, 1500);
          } else {
            // Login failed, redirect to sign in
            setSuccess(true);
            toast({
              title: "Email Verified!",
              description: "Please sign in to continue.",
            });
            setTimeout(() => navigate("/signin"), 2000);
          }
        } catch {
          // Auto-login failed, redirect to sign in
          setSuccess(true);
          setTimeout(() => navigate("/signin"), 2000);
        }
      } else {
        // No password saved, redirect to sign in
        setSuccess(true);
        toast({
          title: "Email Verified!",
          description: "Please sign in to continue.",
        });
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (err) {
      setError("Failed to verify email. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Redirecting to sign in...
              </p>
            </CardContent>
          </Card>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-200">
              We've sent a 6-digit verification code to
              <br />
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-bold"
                disabled={isVerifying}
                autoFocus
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={code.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </PageBackground>
  );
}
