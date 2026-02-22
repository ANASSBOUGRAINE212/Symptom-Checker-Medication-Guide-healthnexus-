import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, X } from 'lucide-react';
import { appointmentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { PageContainer } from '../components/ui/page-container';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-gray-500'
};

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getMyAppointments(accessToken!);
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

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await appointmentApi.cancel(id, accessToken!);
      if (response.ok) {
        toast({ title: 'Appointment cancelled successfully' });
        fetchAppointments();
      } else {
        toast({ title: 'Failed to cancel appointment', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to cancel appointment', variant: 'destructive' });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
            <p className="text-muted-foreground">View and manage your appointments</p>
          </div>
          <Button onClick={() => navigate('/doctors')}>
            Find a Doctor
          </Button>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You don't have any appointments yet</p>
              <Button onClick={() => navigate('/doctors')}>
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-xl">
                          Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
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
                    <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.doctor.address}, {appointment.doctor.city}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-1">Reason for Visit</h4>
                    <p className="text-muted-foreground">{appointment.reason}</p>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Notes</h4>
                      <p className="text-muted-foreground">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.diagnosisNotes && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold mb-1">Doctor's Notes</h4>
                      <p className="text-muted-foreground">{appointment.diagnosisNotes}</p>
                    </div>
                  )}

                  {appointment.needsFollowUp && (
                    <Badge variant="outline" className="mb-4">Follow-up Required</Badge>
                  )}

                  {appointment.status === 'PENDING' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
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
