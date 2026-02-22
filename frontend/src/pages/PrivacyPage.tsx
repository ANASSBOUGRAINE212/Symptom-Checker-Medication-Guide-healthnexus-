import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    // If logged in, go to home; otherwise go to signup
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {isAuthenticated ? 'Back to Home' : 'Back to Sign Up'}
            </button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              HealthNexus Privacy Policy
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Last updated: November 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Introduction</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  At HealthNexus, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you use our medical information and diagnosis service. 
                  Please read this policy carefully to understand our views and practices regarding your personal data.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Information We Collect</h3>

                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Personal Information</h4>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                  <li>First and last name</li>
                  <li>Email address (securely encrypted)</li>
                  <li>Password (hashed with bcrypt - we never store plain text passwords)</li>
                  <li>Date of birth, gender, and country (if you provide them)</li>
                </ul>

                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Health Information</h4>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                  <li>Height, weight, and blood type (optional)</li>
                  <li>Known allergies (optional)</li>
                  <li>Symptoms you select during diagnosis and your diagnosis results (including matched disease)</li>
                </ul>

                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Usage Information</h4>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Theme preference (light/dark) stored in your profile</li>
                  <li>Security audit logs (IP address, user agent, request metadata) for security monitoring</li>
                  <li>Authentication tokens (JWT) stored securely with httpOnly cookies</li>
                  <li>Session information for maintaining your logged-in state</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. How We Use Your Information</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Service Provision:</strong> Deliver the diagnosis feature and show medication information</li>
                  <li><strong>Personalization:</strong> Tailor UI and content (e.g., theme, country) to your preferences</li>
                  <li><strong>Account & Security:</strong> Authenticate users securely and protect access to your data with industry-standard encryption</li>
                  <li><strong>Research (opt‑in):</strong> Use anonymized/aggregated data for research only if you enable <em>Data Sharing</em> in your profile</li>
                  <li><strong>Safety:</strong> Prevent abuse, detect security threats, and troubleshoot issues using audit logs</li>
                  <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h3>
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    <strong>Security Commitment:</strong> We implement industry-standard security measures to protect your health information.
                  </p>
                </div>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256)</li>
                  <li>Passwords are hashed using bcrypt with salt rounds</li>
                  <li>Sensitive health data is encrypted at the field level</li>
                  <li>JWT tokens with short expiration times and secure httpOnly cookies</li>
                  <li>Rate limiting and security headers (CSP, HSTS, XSS protection)</li>
                  <li>Regular security audits and automated vulnerability scanning</li>
                  <li>Access to your information is restricted to authorized personnel only</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Your Rights</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
                  <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Cookies and Tracking</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  We use minimal tracking technologies:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Authentication Cookies:</strong> Essential httpOnly cookies to keep you signed in securely (refreshToken)</li>
                  <li><strong>Access Token (localStorage):</strong> Short-lived JWT token for API authentication</li>
                  <li><strong>CSRF Token:</strong> Security token to prevent cross-site request forgery attacks</li>
                  <li><strong>No Ads/Marketing:</strong> We do not use marketing cookies or third‑party ad trackers</li>
                  <li><strong>No Analytics:</strong> We do not use third-party analytics services</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                  You can control cookies through your browser settings. Disabling session cookies may prevent you from signing in.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Data Retention</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We keep your profile and diagnosis records while your account is active, or as needed to provide the service. If you delete your account
                  or request deletion of specific records, we will remove them unless we are required to retain them by law. Backups may retain data for a
                  limited period before being purged.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Contact Us</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-200">
                    <strong>Email:</strong> annajiwoon@gmail.com<br />
                    <strong>Response Time:</strong> We aim to respond within 48 hours
                  </p>
                </div>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  By using HealthNexus, you consent to the collection and use of your information as described in this Privacy Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
