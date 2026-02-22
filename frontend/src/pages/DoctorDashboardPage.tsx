import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { appointmentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { PageContainer } from '../components/ui/page-container';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-gray-500'
};

export default function DoctorDashboardPage() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    visited: false,
    needsFollowUp: false,
    diagnosisNotes: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getDoctorAppointments(accessToken!);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async (id: string) => {
    try {
      const response = await appointmentApi.updateStatus(id, updateData, accessToken!);
      if (response.ok) {
        toast({ title: 'Appointment updated successfully' });
        setEditingId(null);
        fetchAppointments();
      } else {
        toast({ title: 'Failed to update appointment', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to update appointment', variant: 'destructive' });
    }
  };

  const startEdit = (appointment: any) => {
    setEditingId(appointment.id);
    setUpdateData({
      status: appointment.status,
      visited: appointment.visited,
      needsFollowUp: appointment.needsFollowUp,
      diagnosisNotes: appointment.diagnosisNotes || '',
      notes: appointment.notes || ''
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toDateString();
      return new Date(apt.appointmentDate).toDateString() === today;
    }
    return apt.status === filter.toUpperCase();
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">Loading appointments...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
              <Button variant={filter === 'today' ? 'default' : 'outline'} onClick={() => setFilter('today')}>Today</Button>
              <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
              <Button variant={filter === 'confirmed' ? 'default' : 'outline'} onClick={() => setFilter('confirmed')}>Confirmed</Button>
              <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>Completed</Button>
            </div>
          </CardContent>
        </Card>

        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-xl">
                          {appointment.user.firstName} {appointment.user.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{appointment.user.email}</p>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[appointment.status]}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-1">Reason for Visit</h4>
                    <p className="text-muted-foreground">{appointment.reason}</p>
                  </div>

                  {appointment.user.profile && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Patient Info</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {appointment.user.profile.bloodType && <p>Blood Type: {appointment.user.profile.bloodType}</p>}
                        {appointment.user.profile.allergies && <p>Allergies: {appointment.user.profile.allergies}</p>}
                      </div>
                    </div>
                  )}

                  {editingId === appointment.id ? (
                    <div className="space-y-4 p-4 border rounded-md">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={updateData.status}
                          onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={updateData.visited}
                            onChange={(e) => setUpdateData({ ...updateData, visited: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Patient Visited</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={updateData.needsFollowUp}
                            onChange={(e) => setUpdateData({ ...updateData, needsFollowUp: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Needs Follow-up</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Diagnosis Notes</label>
                        <Textarea
                          value={updateData.diagnosisNotes}
                          onChange={(e) => setUpdateData({ ...updateData, diagnosisNotes: e.target.value })}
                          placeholder="Add diagnosis notes..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Additional Notes</label>
                        <Textarea
                          value={updateData.notes}
                          onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                          placeholder="Add notes..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(appointment.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {appointment.diagnosisNotes && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <h4 className="font-semibold mb-1">Diagnosis Notes</h4>
                          <p className="text-muted-foreground">{appointment.diagnosisNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 items-center mb-4">
                        {appointment.visited && (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Visited
                          </Badge>
                        )}
                        {appointment.needsFollowUp && (
                          <Badge variant="outline" className="bg-yellow-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Follow-up Required
                          </Badge>
                        )}
                      </div>

                      <Button onClick={() => startEdit(appointment)} size="sm">
                        Update Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
