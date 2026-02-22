import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import {
  Stethoscope,
  BookOpen,
  Pill,
  User,
  Activity,
  Clock,
  Shield,
  Loader2,
  ArrowRight
} from "lucide-react";
import { getSeverityColor } from "@/constants";

interface UserStats {
  diagnosisCount: number;
  lastDiagnosis: string | null;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  recentDiagnoses?: Array<{
    id: string;
    symptoms: string[];
    createdAt: string;
    disease?: {
      name: string;
      severity: string;
    };
  }>;
}

function Home() {
  const { user, isLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (() => {
    const email = user?.email?.toLowerCase();
    if (!email) return false;
    return email === import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  })();
  
  const [stats, setStats] = useState<UserStats>({
    diagnosisCount: 0,
    lastDiagnosis: null,
    recentActivities: [],
    recentDiagnoses: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      try {
        const resp = await apiFetch(`/user/profile`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (!data.user?.profile) {
            navigate('/profile-setup');
            return;
          }
        }
      } catch (_) {
      } finally {
        setCheckedProfile(true);
      }
    };

    if (!isLoading && user) checkProfile();
  }, [isLoading, user, navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const [statsResponse, diagnosesResponse] = await Promise.all([
          apiFetch(`/user/diagnosis/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          apiFetch(`/user/diagnoses?limit=5`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);
        
        if (statsResponse.ok && diagnosesResponse.ok) {
          const userStats = await statsResponse.json();
          const diagnosesData = await diagnosesResponse.json();
          setStats({ ...userStats, recentDiagnoses: diagnosesData.diagnoses || [] });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!isLoading && user && checkedProfile) fetchUserStats();
  }, [user, isLoading, checkedProfile]);

  const formatLastVisit = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    if (diffDays <= 30) return `${Math.floor((diffDays - 1) / 7)}w ago`;
    return `${Math.floor((diffDays - 1) / 30)}m ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="relative">
      {/* Background Image Section - Extended to cards */}
      <div className="absolute top-0 left-0 right-0 z-0" style={{ height: '110vh', minHeight: '900px' }}>
        <img 
          src="/hero-bg.jpg" 
          alt="Healthcare background" 
          className="w-full h-full object-cover object-center"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/85 to-blue-900/75 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/80"></div>
        {/* Smooth fade to transparent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900"></div>
      </div>

      <PageContainer title="HealthNexus" hideNavigation={false} useBackground={false}>
        {/* Hero Section */}
        <div className="relative z-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8">
            {/* Left Side - Welcome Text */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white mb-6">
                Your Partner in Health and Wellness
              </h1>
              <p className="text-xl text-blue-100 dark:text-gray-200 leading-relaxed mb-8">
                Empowering you with intelligent health insights and personalized care. From symptom analysis to expert consultations, we're here to guide your journey toward better health, every step of the way.
              </p>
              <Link to="/diagnose">
                <Button size="lg" className="h-16 rounded-full px-10 text-xl font-medium shadow-xl shadow-blue-500/30 bg-white text-blue-600 hover:bg-blue-50">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Right Side - Quick Stats (Stacked) */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-base sm:text-lg">Diagnoses Made</p>
                      {isLoadingStats ? (
                        <div className="flex items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2 text-red-500" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-4xl sm:text-5xl font-bold mt-1 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">{stats.diagnosisCount}</p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                      <Stethoscope className="h-8 w-8 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-base sm:text-lg">Last Diagnosis</p>
                      {isLoadingStats ? (
                        <div className="flex items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-4xl sm:text-5xl font-bold mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">{formatLastVisit(stats.lastDiagnosis)}</p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                      <Clock className="h-8 w-8 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Admin Access (visible only for admin and when there are diagnoses) */}
        {isAdmin && (
          <div className="relative z-10 mb-12 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 dark:bg-white/10 p-2 rounded-full mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Admin Access</h3>
            </div>
            <p className="text-blue-100 dark:text-gray-200 mb-4 text-center">You have administrator privileges to manage the application database and settings.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link to="/admin">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link to="/nav-test">
                <Button variant="outline" className="px-6 py-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
                  🔧 Navigation Test
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Navigation Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0 max-w-7xl mx-auto mb-12">
          {/* Diagnose Card */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
                <Stethoscope className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <CardTitle className="text-lg">Diagnose Yourself</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Answer questions about your symptoms to get a possible diagnosis and recommendations.
              </p>
              <Link to="/diagnose" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Diagnosis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Diseases Card */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <BookOpen className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <CardTitle className="text-lg">Disease Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our database of diseases, their symptoms, treatments, and prevention methods.
              </p>
              <Link to="/diseases" className="block">
                <Button className="w-full bg-white hover:bg-green-50 text-green-600 border border-green-200 hover:border-green-300 dark:bg-gray-800 dark:hover:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  Explore Diseases
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medications Card */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg">
                <Pill className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <CardTitle className="text-lg">Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Search for medications, their uses, side effects, and interactions with other drugs.
              </p>
              <Link to="/medications" className="block">
                <Button className="w-full bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 hover:border-purple-300 dark:bg-gray-800 dark:hover:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                  View Medications
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <User className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <CardTitle className="text-lg">User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and update your personal information, preferences, and account settings.
              </p>
              <Link to="/profile" className="block">
                <Button className="w-full bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                  Go to Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Diagnosis History */}
        <div className="relative z-10 mt-8 sm:mt-12 px-4 sm:px-0 max-w-7xl mx-auto">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-8 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg mr-3">
                    <Activity className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  Diagnosis History
                </CardTitle>
                <CardDescription className="dark:text-gray-400 ml-13">Your recent health diagnoses</CardDescription>
              </div>
              <Link to="/diagnoses">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300 rounded-full">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading diagnosis history...</span>
                </div>
              ) : stats.recentDiagnoses && stats.recentDiagnoses.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentDiagnoses.map((diagnosis) => (
                    <Link to={`/diagnosis/${diagnosis.id}`} key={diagnosis.id}>
                      <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-300 shadow-md hover:shadow-lg border border-white/20 dark:border-white/5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
                            <Stethoscope className="h-5 w-5 text-white" strokeWidth={2.2} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {diagnosis.disease ? diagnosis.disease.name : "Health Check"}
                            </p>
                            <div className="flex items-center gap-2">
                              {diagnosis.disease && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(diagnosis.disease.severity)}`}>
                                  {diagnosis.disease.severity}
                                </span>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {diagnosis.symptoms.length} symptoms reported
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatLastVisit(diagnosis.createdAt)}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:translate-x-1 transition-transform duration-300">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg mb-4">
                    <Stethoscope className="h-8 w-8" strokeWidth={2.2} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No diagnosis history yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Start a diagnosis to see your history here</p>
                  <Link to="/diagnose" className="mt-4 inline-block">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 rounded-full shadow-lg">
                      Start Diagnosis
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pt-6">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg mr-3">
                  <Activity className="h-5 w-5" strokeWidth={2.2} />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="dark:text-gray-400 ml-13">Your latest health interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading recent activity...</span>
                </div>
              ) : stats.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-300 shadow-md hover:shadow-lg border border-white/20 dark:border-white/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                          <Activity className="h-5 w-5 text-white" strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{activity.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatLastVisit(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg mb-4">
                    <Activity className="h-8 w-8" strokeWidth={2.2} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start using the app to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}

export default Home;
