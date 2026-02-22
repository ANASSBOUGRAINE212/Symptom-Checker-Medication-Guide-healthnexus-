import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PageContainer } from '../components/ui/page-container';
import { User, Mail, Phone, Calendar, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: {
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string;
  };
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  patient: Patient;
}

export default function DoctorPatientsPage() {
  const { accessToken, user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Map<string, Patient>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Admins fetch all appointments, doctors fetch only their own
      const response = isAdmin 
        ? await fetch('http://localhost:5174/api/v1/appointments', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        : await appointmentApi.getDoctorAppointments(accessToken!);
        
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        
        // Extract unique patients
        const uniquePatients = new Map<string, Patient>();
        data.forEach((apt: Appointment) => {
          if (apt.patient && !uniquePatients.has(apt.patient.id)) {
            uniquePatients.set(apt.patient.id, apt.patient);
          }
        });
        setPatients(uniquePatients);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast({ title: 'Failed to load patients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => apt.patient.id === patientId);
  };

  const getPatientStats = (patientId: string) => {
    const patientApts = getPatientAppointments(patientId);
    return {
      total: patientApts.length,
      completed: patientApts.filter(apt => apt.status === 'COMPLETED').length,
      upcoming: patientApts.filter(apt => apt.status === 'CONFIRMED').length,
      cancelled: patientApts.filter(apt => apt.status === 'CANCELLED').length
    };
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setUpdatingAppointment(true);
      const response = await fetch(`http://localhost:5174/api/v1/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          status: selectedAppointment.status,
          visited: (selectedAppointment as any).visited,
          needsFollowUp: (selectedAppointment as any).needsFollowUp,
          diagnosisNotes: (selectedAppointment as any).diagnosisNotes,
          notes: (selectedAppointment as any).notes
        })
      });

      if (response.ok) {
        toast({ title: 'Appointment updated successfully!' });
        setAppointmentDialogOpen(false);
        fetchAppointments();
      } else {
        const error = await response.json();
        toast({ title: error.error || 'Failed to update appointment', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to update appointment', variant: 'destructive' });
    } finally {
      setUpdatingAppointment(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">Loading patients...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isAdmin ? 'All Patients' : 'My Patients'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'View all patients in the system' 
              : 'View and manage your patient list'}
          </p>
        </div>

        {patients.size === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No patients yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Patients will appear here once they book appointments with you
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(patients.values()).map((patient) => {
              const stats = getPatientStats(patient.id);
              const patientApts = getPatientAppointments(patient.id);
              const lastAppointment = patientApts.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0];

              return (
                <Card 
                  key={patient.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          {stats.total} appointment{stats.total !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.email}</span>
                      </div>
                      {patient.profile?.gender && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{patient.profile.gender}</span>
                        </div>
                      )}
                      {patient.profile?.bloodType && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Blood Type:</span>
                          <Badge variant="outline">{patient.profile.bloodType}</Badge>
                        </div>
                      )}
                      {patient.profile?.allergies && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Allergies:</span>
                          <p className="text-red-600 dark:text-red-400 mt-1">
                            {patient.profile.allergies}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Appointment Statistics</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {stats.completed}
                          </div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {stats.upcoming}
                          </div>
                          <div className="text-xs text-muted-foreground">Upcoming</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                            {stats.cancelled}
                          </div>
                          <div className="text-xs text-muted-foreground">Cancelled</div>
                        </div>
                      </div>
                    </div>

                    {lastAppointment && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-2">Last Appointment</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(lastAppointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{lastAppointment.time}</span>
                          </div>
                          {lastAppointment.reason && (
                            <div className="text-muted-foreground mt-2">
                              Reason: {lastAppointment.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Patient Detail Dialog */}
        <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPatient?.firstName} {selectedPatient?.lastName} - Appointment History
              </DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedPatient.email}</p>
                  </div>
                  {selectedPatient.profile?.bloodType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium">{selectedPatient.profile.bloodType}</p>
                    </div>
                  )}
                  {selectedPatient.profile?.allergies && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Allergies</p>
                      <p className="font-medium text-red-600 dark:text-red-400">{selectedPatient.profile.allergies}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Appointments</h3>
                  <div className="space-y-2">
                    {getPatientAppointments(selectedPatient.id).map((apt) => (
                      <Card 
                        key={apt.id} 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleAppointmentClick(apt)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{new Date(apt.date).toLocaleDateString()}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{apt.time}</span>
                              </div>
                              {apt.reason && (
                                <p className="text-sm text-muted-foreground">Reason: {apt.reason}</p>
                              )}
                            </div>
                            <Badge className={
                              apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              apt.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {apt.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Update Dialog */}
        <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Appointment</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <p className="text-sm">{selectedAppointment.time}</p>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedAppointment.status} 
                    onValueChange={(value) => setSelectedAppointment({...selectedAppointment, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Patient Visited</Label>
                  <Switch 
                    checked={(selectedAppointment as any).visited || false}
                    onCheckedChange={(checked) => setSelectedAppointment({...selectedAppointment, visited: checked} as any)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Needs Follow-up</Label>
                  <Switch 
                    checked={(selectedAppointment as any).needsFollowUp || false}
                    onCheckedChange={(checked) => setSelectedAppointment({...selectedAppointment, needsFollowUp: checked} as any)}
                  />
                </div>

                <div>
                  <Label>Diagnosis Notes</Label>
                  <Textarea 
                    value={(selectedAppointment as any).diagnosisNotes || ''}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, diagnosisNotes: e.target.value} as any)}
                    placeholder="Enter diagnosis notes..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea 
                    value={(selectedAppointment as any).notes || ''}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, notes: e.target.value} as any)}
                    placeholder="Enter additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUpdateAppointment} 
                    disabled={updatingAppointment}
                    className="flex-1"
                  >
                    {updatingAppointment ? 'Updating...' : 'Update Appointment'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAppointmentDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
