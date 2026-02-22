import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Calendar, Clock, GraduationCap, Languages } from 'lucide-react';
import { doctorApi, appointmentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { PageContainer } from '../components/ui/page-container';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getById(id!);
      if (response.ok) {
        const data = await response.json();
        setDoctor(data);
      }
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast({ title: 'Please sign in to book an appointment', variant: 'destructive' });
      navigate('/signin');
      return;
    }

    try {
      const response = await appointmentApi.create({
        doctorId: doctor.id,
        ...appointmentData
      }, accessToken!);

      if (response.ok) {
        toast({ title: 'Appointment booked successfully!' });
        setBookingOpen(false);
        navigate('/appointments');
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to book appointment', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to book appointment', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">Loading doctor details...</div>
      </PageContainer>
    );
  }

  if (!doctor) {
    return (
      <PageContainer>
        <div className="text-center py-12">Doctor not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/doctors')} className="mb-4">
          ← Back to Doctors
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </CardTitle>
                    <Badge className="mt-2">{doctor.specialty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{doctor.bio}</p>
                  </div>
                )}

                {doctor.education && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Education</h3>
                      <p className="text-muted-foreground">{doctor.education}</p>
                    </div>
                  </div>
                )}

                {doctor.languages && (
                  <div className="flex items-start gap-2">
                    <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Languages</h3>
                      <p className="text-muted-foreground">{doctor.languages}</p>
                    </div>
                  </div>
                )}

                {doctor.yearsOfExperience && (
                  <div>
                    <h3 className="font-semibold">Experience</h3>
                    <p className="text-muted-foreground">{doctor.yearsOfExperience} years</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.schedules && doctor.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {doctor.schedules.map((schedule: any) => (
                      <div key={schedule.id} className="flex items-center justify-between py-2 border-b last:border-0">
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
                  <p className="text-muted-foreground">No schedule available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{doctor.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{doctor.address}</p>
                    <p className="text-muted-foreground">{doctor.city}, {doctor.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">Book Appointment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={appointmentData.appointmentDate}
                      onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={appointmentData.appointmentTime}
                      onChange={(e) => setAppointmentData({ ...appointmentData, appointmentTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason for Visit</label>
                    <Textarea
                      value={appointmentData.reason}
                      onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                      placeholder="Describe your symptoms or reason for visit..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleBookAppointment} className="w-full">
                    Confirm Booking
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
