import { useState, useEffect } from 'react';
import { Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { doctorApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

export default function DoctorsManagement() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
    fetchPendingDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAll({});
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      // Fetch doctors with includeUnverified=true to get pending applications
      const response = await doctorApi.getAll({ includeUnverified: 'true' });
      if (response.ok) {
        const data = await response.json();
        // Filter for unverified doctors
        const pending = data.filter((doc: any) => !doc.isVerified || !doc.isActive);
        setPendingDoctors(pending);
      }
    } catch (error) {
      console.error('Failed to fetch pending doctors:', error);
    }
  };

  const handleApproveDoctor = async (doctorId: string) => {
    try {
      const response = await fetch(`http://localhost:5174/api/v1/doctors/${doctorId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ isVerified: true, isActive: true })
      });

      if (response.ok) {
        toast({ title: 'Doctor approved successfully!' });
        fetchDoctors();
        fetchPendingDoctors();
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to approve doctor', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to approve doctor', variant: 'destructive' });
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to reject this doctor application? This will permanently remove their doctor profile and they will need to reapply.')) return;

    try {
      const response = await fetch(`http://localhost:5174/api/v1/doctors/${doctorId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        toast({ title: 'Doctor application rejected and removed' });
        fetchDoctors();
        fetchPendingDoctors();
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to reject doctor', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to reject doctor', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this doctor?')) return;

    try {
      const response = await doctorApi.delete(id, accessToken!);
      if (response.ok) {
        toast({ title: 'Doctor deactivated successfully' });
        fetchDoctors();
      } else {
        toast({ title: 'Failed to deactivate doctor', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to deactivate doctor', variant: 'destructive' });
    }
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      {/* Pending Doctor Applications Section */}
      {pendingDoctors.length > 0 && (
        <div className="mb-8">
          <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              You have {pendingDoctors.length} pending doctor application{pendingDoctors.length > 1 ? 's' : ''} awaiting review
            </AlertDescription>
          </Alert>

          <h3 className="text-xl font-bold mb-4">Pending Doctor Applications</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {pendingDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Dr. {doctor.user.firstName} {doctor.user.lastName}</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending Approval
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveDoctor(doctor.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectDoctor(doctor.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><strong>Email:</strong> {doctor.user.email}</p>
                      <p><strong>Specialty:</strong> {doctor.specialty}</p>
                      <p><strong>City:</strong> {doctor.city}</p>
                      <p><strong>Country:</strong> {doctor.country}</p>
                      <p><strong>Phone:</strong> {doctor.phone}</p>
                    </div>
                    <div className="space-y-2">
                      {doctor.yearsOfExperience && <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>}
                      {doctor.education && <p><strong>Education:</strong> {doctor.education}</p>}
                      {doctor.languages && <p><strong>Languages:</strong> {doctor.languages}</p>}
                      {doctor.bio && (
                        <div>
                          <strong>Bio:</strong>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{doctor.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Verified Doctors Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Verified Doctors</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage approved doctors. New doctors must apply through the registration form.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Dr. {doctor.user.firstName} {doctor.user.lastName}</span>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Specialty:</strong> {doctor.specialty}</p>
                  <p><strong>City:</strong> {doctor.city}</p>
                  <p><strong>Country:</strong> {doctor.country}</p>
                  <p><strong>Phone:</strong> {doctor.phone}</p>
                  {doctor.yearsOfExperience && <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className={doctor.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {doctor.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
