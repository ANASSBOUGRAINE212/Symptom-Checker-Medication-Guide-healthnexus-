import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Stethoscope } from 'lucide-react';
import { doctorApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PageContainer } from '../components/ui/page-container';

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [specialty, city]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (specialty) params.specialty = specialty;
      if (city) params.city = city;
      if (search) params.search = search;
      
      const response = await doctorApi.getAll(params);
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

  const handleSearch = () => {
    fetchDoctors();
  };

  const specialties = [...new Set(doctors.map(d => d.specialty))];
  const cities = [...new Set(doctors.map(d => d.city))];

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-muted-foreground">Search for healthcare professionals by name, specialty, or location</p>
        </div>

        <Card className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialty..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Button onClick={handleSearch} className="mt-4 w-full md:w-auto">
              Search Doctors
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No doctors found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/doctors/${doctor.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                      </CardTitle>
                      <Badge className="mt-2">{doctor.specialty}</Badge>
                    </div>
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {doctor.city}
                    </div>
                    {doctor.yearsOfExperience && (
                      <p className="text-muted-foreground">
                        {doctor.yearsOfExperience} years of experience
                      </p>
                    )}
                    {doctor.bio && (
                      <p className="text-muted-foreground line-clamp-2 mt-2">
                        {doctor.bio}
                      </p>
                    )}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
