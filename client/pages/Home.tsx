import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const isAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  
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
        const resp = await fetch(`/api/v1/user/profile`, {
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
          fetch(`/api/v1/user/diagnosis/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          fetch(`/api/v1/user/diagnoses?limit=5`, {
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
    <PageContainer title="HealthNexus" hideNavigation={false}>
      {/* Welcome Section */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <div className="inline-flex items-center justify-center p-2 mb-4 bg-blue-100/60 dark:bg-blue-900/20 rounded-full shadow-sm">
          <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">Your Personal Health Assistant</span>
        </div>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Take control of your health with our comprehensive medical platform. <br className="sm:hidden" />
          Get diagnoses, learn about diseases, track medications, and more.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-12 max-w-3xl mx-auto px-2 sm:px-0">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700">
          <CardContent className="p-6 sm:p-8 relative z-10 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 font-medium text-base sm:text-lg">Diagnoses Made</p>
                {isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-2xl font-bold">Loading...</span>
                  </div>
                ) : (
                  <p className="text-4xl sm:text-5xl font-bold mt-1">{stats.diagnosisCount}</p>
                )}
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700">
          <CardContent className="p-6 sm:p-8 relative z-10 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium text-base sm:text-lg">Last Diagnosis</p>
                {isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-2xl font-bold">Loading...</span>
                  </div>
                ) : (
                  <p className="text-4xl sm:text-5xl font-bold mt-1">{formatLastVisit(stats.lastDiagnosis)}</p>
                )}
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Admin Access (visible only for admin and when there are diagnoses) */}
  {isAdmin && (
          <div className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800/50 dark:to-gray-800/80 rounded-xl p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300">Admin Access</h3>
            </div>
            <p className="text-amber-700 dark:text-amber-200 mb-4 text-center">You have administrator privileges to manage the application database and settings.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link to="/admin">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-8 py-3 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link to="/nav-test">
                <Button variant="outline" className="px-6 py-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                  🔧 Navigation Test
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0 max-w-7xl mx-auto">
          {/* Diagnose Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-gray-800 shadow-md">
            <div className="h-2 bg-blue-500 w-full"></div>
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  Diagnose Yourself
                </CardTitle>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                Check your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Answer questions about your symptoms to get a possible diagnosis and recommendations.
              </p>
              <Link to="/diagnose" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all duration-300">
                  Start Diagnosis
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Diseases Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-gray-800 shadow-md">
            <div className="h-2 bg-green-500 w-full"></div>
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  Disease Info
                </CardTitle>
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardDescription className="text-green-600 dark:text-green-400 font-medium">
                Learn about conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Browse our database of diseases, their symptoms, treatments, and prevention methods.
              </p>
              <Link to="/diseases" className="block">
                <Button className="w-full bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-300 dark:bg-gray-800 dark:hover:bg-green-900/20 dark:text-green-400 dark:border-green-800 group-hover:shadow-md transition-all duration-300">
                  Explore Diseases
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medications Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-gray-800 shadow-md">
            <div className="h-2 bg-purple-500 w-full"></div>
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  Medications
                </CardTitle>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardDescription className="text-purple-600 dark:text-purple-400 font-medium">
                Find drug information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Search for medications, their uses, side effects, and interactions with other drugs.
              </p>
              <Link to="/medications" className="block">
                <Button className="w-full bg-white hover:bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300 dark:bg-gray-800 dark:hover:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 group-hover:shadow-md transition-all duration-300">
                  View Medications
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-gray-800 shadow-md">
            <div className="h-2 bg-orange-500 w-full"></div>
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  User Profile
                </CardTitle>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                  <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <CardDescription className="text-orange-600 dark:text-orange-400 font-medium">
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                View and update your personal information, preferences, and account settings.
              </p>
              <Link to="/profile" className="block">
                <Button className="w-full bg-white hover:bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 group-hover:shadow-md transition-all duration-300">
                  Go to Profile
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Diagnosis History */}
        <div className="mt-8 sm:mt-12 px-4 sm:px-0 max-w-7xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-8 overflow-hidden">
            <div className="h-2 bg-blue-500 w-full"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Diagnosis History
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Your recent health diagnoses</CardDescription>
              </div>
              <Link to="/diagnoses">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300">
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
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-red-600 dark:text-red-400" />
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
                  <Stethoscope className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No diagnosis history yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start a diagnosis to see your history here</p>
                  <Link to="/diagnose" className="mt-4 inline-block">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
                      Start Diagnosis
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
              <CardDescription className="dark:text-gray-400">Your latest health interactions</CardDescription>
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
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start using the app to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </PageContainer>
  );
}

export default Home;
