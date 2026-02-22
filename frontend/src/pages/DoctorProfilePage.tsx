import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doctorApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { PageContainer } from '../components/ui/page-container';
import { Edit, Save, X, Calendar, Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorProfilePage() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialty: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    bio: '',
    yearsOfExperience: '',
    education: '',
    languages: ''
  });
  const [schedules, setSchedules] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>([]);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAll({});
      if (response.ok) {
        const doctors = await response.json();
        const myProfile = doctors.find((d: any) => d.userId === user?.id);
        if (myProfile) {
          setDoctor(myProfile);
          setFormData({
            firstName: myProfile.user.firstName,
            lastName: myProfile.user.lastName,
            specialty: myProfile.specialty,
            address: myProfile.address,
            city: myProfile.city,
            country: myProfile.country || '',
            phone: myProfile.phone,
            bio: myProfile.bio || '',
            yearsOfExperience: myProfile.yearsOfExperience?.toString() || '',
            education: myProfile.education || '',
            languages: myProfile.languages || ''
          });
          // Load schedules
          setSchedules(myProfile.schedules || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined
      };

      const response = await fetch('http://localhost:5174/api/v1/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({ title: 'Profile updated successfully!' });
        setEditing(false);
        fetchDoctorProfile();
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to update profile', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5174/api/v1/doctors/profile/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ schedules })
      });

      if (response.ok) {
        toast({ title: 'Schedule updated successfully!' });
        setEditingSchedule(false);
        fetchDoctorProfile();
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to update schedule', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to update schedule', variant: 'destructive' });
    }
  };

  const addSchedule = () => {
    setSchedules([...schedules, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">Loading profile...</div>
      </PageContainer>
    );
  }

  if (!doctor) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Doctor profile not found</p>
            <p className="text-sm text-muted-foreground">Please contact an administrator</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Doctor Profile</h1>
            <p className="text-muted-foreground">Manage your professional information</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => { setEditing(false); fetchDoctorProfile(); }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  {editing ? (
                    <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  ) : (
                    <p className="text-muted-foreground">{doctor.user.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  {editing ? (
                    <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  ) : (
                    <p className="text-muted-foreground">{doctor.user.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground">{doctor.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Specialty</label>
                  {editing ? (
                    <Input value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />
                  ) : (
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Years of Experience</label>
                  {editing ? (
                    <Input type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })} />
                  ) : (
                    <p className="text-muted-foreground">{doctor.yearsOfExperience || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                {editing ? (
                  <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} />
                ) : (
                  <p className="text-muted-foreground">{doctor.bio || 'No bio provided'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Education</label>
                {editing ? (
                  <Textarea value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} rows={3} />
                ) : (
                  <p className="text-muted-foreground">{doctor.education || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Languages</label>
                {editing ? (
                  <Input value={formData.languages} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} placeholder="e.g., English, French, Arabic" />
                ) : (
                  <p className="text-muted-foreground">{doctor.languages || 'Not specified'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                {editing ? (
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                ) : (
                  <p className="text-muted-foreground">{doctor.phone}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                {editing ? (
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                ) : (
                  <p className="text-muted-foreground">{doctor.address}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                {editing ? (
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                ) : (
                  <p className="text-muted-foreground">{doctor.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                {editing ? (
                  <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                ) : (
                  <p className="text-muted-foreground">{doctor.country}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Schedule</CardTitle>
                {!editingSchedule ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingSchedule(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Schedule
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSchedule}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { 
                      setEditingSchedule(false); 
                      setSchedules(doctor.schedules || []); 
                    }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingSchedule ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      Set your weekly availability for appointments
                    </p>
                    <Button type="button" size="sm" variant="outline" onClick={addSchedule}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Day
                    </Button>
                  </div>
                  
                  {schedules.length > 0 ? (
                    <div className="space-y-2">
                      {schedules.map((schedule, index) => (
                        <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <select
                            value={schedule.dayOfWeek}
                            onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          >
                            {DAYS.map((day, i) => (
                              <option key={i} value={i}>{day}</option>
                            ))}
                          </select>
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            className="w-28"
                          />
                          <span className="text-sm text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            className="w-28"
                          />
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeSchedule(index)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No schedule added yet. Click "Add Day" to set your availability.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {schedules && schedules.length > 0 ? (
                    <div className="space-y-2">
                      {schedules.map((schedule: any) => (
                        <div key={schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{DAYS[schedule.dayOfWeek]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-3">No schedule set yet</p>
                      <Button size="sm" variant="outline" onClick={() => setEditingSchedule(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Schedule
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
