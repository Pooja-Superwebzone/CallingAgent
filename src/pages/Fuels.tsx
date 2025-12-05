import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface FuelEntry {
  fuel_id: string;
  trip_id: number;
  vehicle_id: number;
  log_sheet_id: string;
  fuel_litres: number;
  fuel_amount: number;
  fuel_date: string;
  odometer_reading: number;
  fuel_station_name: string;
  created_by: number;
  created_time: string;
  updated_by: number;
  updated_time: string;
  deleted_flag: boolean;
  myNewField: number;
}


const API_URL = 'https://n8n.srv799538.hstgr.cloud/webhook/fuel';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';
const AUTH_KEY = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';

const ADD_FUEL_API_URL = 'https://n8n.srv799538.hstgr.cloud/webhook/addfueldata';
const ADD_FUEL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';
const ADD_FUEL_AUTH_KEY = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';

const UPDATE_FUEL_API_URL = 'https://n8n.srv799538.hstgr.cloud/webhook/updatedata';
const UPDATE_FUEL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';
const UPDATE_FUEL_AUTH_KEY = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';

const SPECIFIC_FUEL_API_URL = 'https://n8n.srv799538.hstgr.cloud/webhook/specificdata';
const SPECIFIC_FUEL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';
const SPECIFIC_FUEL_AUTH_KEY = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';

export default function Fuels() {
  const [fuels, setFuels] = useState<FuelEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editFuel, setEditFuel] = useState<FuelEntry | null>(null);
  const [form, setForm] = useState<any>({ fuel_date: '', vehicle_id: '', fuel_litres: '', fuel_amount: '', fuel_station_name: '', odometer_reading: '' });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [logSheets, setLogSheets] = useState<any[]>([]);

  // Move fetchFuels here so it's accessible everywhere in the component
  const fetchFuels = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': AUTH_KEY,
          'session_id': '1',
          'content-Profile': 'srtms',
          'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
        },
      });
      const data = await response.json();
      const first = Array.isArray(data) ? data[0] : data;
      if (first.status === 'success' && Array.isArray(first.data)) {
        setFuels(first.data);
      } else {
        setFuels([]);
      }
    } catch (error) {
      setFuels([]);
    }
  };

  useEffect(() => {
    fetchFuels();
    // Fetch vehicles
    const fetchVehicles = async () => {
      try {
        const response = await fetch('https://n8n.srv799538.hstgr.cloud/webhook/vehiclemanagement', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
            'Authorization': AUTH_KEY,
            'session_id': '1',
            'content-Profile': 'srtms',
            'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
          },
        });
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.status === 'success') {
          setVehicles(data[0].data);
        } else {
          setVehicles([]);
        }
      } catch (error) {
        setVehicles([]);
      }
    };
    // Fetch trips (assignments)
    const fetchTrips = async () => {
      try {
        const response = await fetch('https://n8n.srv799538.hstgr.cloud/webhook/586caf97-2a5c-4d3e-97be-9f2cfc8b5794', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
            'Authorization': AUTH_KEY,
            'session_id': '1',
            'content-Profile': 'srtms',
            'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
          },
        });
        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[0]?.data)) {
          setTrips(data[0].data);
        } else {
          setTrips([]);
        }
      } catch (error) {
        setTrips([]);
      }
    };
    // Fetch log sheets
    const fetchLogSheets = async () => {
      try {
        const response = await fetch('https://n8n.srv799538.hstgr.cloud/webhook/getalllogsheet', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
            'Authorization': AUTH_KEY,
            'session_id': '1',
            'content-Profile': 'srtms',
            'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
          },
        });
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.status === 'success') {
          setLogSheets(data[0].data);
        } else {
          setLogSheets([]);
        }
      } catch (error) {
        setLogSheets([]);
      }
    };
    fetchVehicles();
    fetchTrips();
    fetchLogSheets();
  }, []);


  const openAdd = () => {
    setEditFuel(null);
    setForm({ fuel_date: '', vehicle_id: '', fuel_litres: '', fuel_amount: '', fuel_station_name: '', odometer_reading: '' });
    setModalOpen(true);
  };

  const openEdit = async (fuel: FuelEntry) => {
    try {
      const response = await fetch(SPECIFIC_FUEL_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': SPECIFIC_FUEL_API_KEY,
          'Authorization': SPECIFIC_FUEL_AUTH_KEY,
          'session_id': '1',
          'content-Profile': 'srtms',
          'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
        },
        body: JSON.stringify({ fuel_id: fuel.fuel_id }),
      });
      const data = await response.json();
      const fuelData = Array.isArray(data) ? data[0] : data;
      setEditFuel(fuelData);
      setForm({
        fuel_date: fuelData.fuel_date,
        vehicle_id: String(fuelData.vehicle_id),
        trip_id: String(fuelData.trip_id),
        log_sheet_id: fuelData.log_sheet_id,
        fuel_litres: fuelData.fuel_litres,
        fuel_amount: fuelData.fuel_amount,
        fuel_station_name: fuelData.fuel_station_name,
        odometer_reading: fuelData.odometer_reading,
      });
      setModalOpen(true);
    } catch (error) {
      // fallback to old behavior if API fails
      setEditFuel(fuel);
      setForm({
        fuel_date: fuel.fuel_date,
        vehicle_id: String(fuel.vehicle_id),
        trip_id: String(fuel.trip_id),
        log_sheet_id: fuel.log_sheet_id,
        fuel_litres: fuel.fuel_litres,
        fuel_amount: fuel.fuel_amount,
        fuel_station_name: fuel.fuel_station_name,
        odometer_reading: fuel.odometer_reading,
      });
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const isoString = now.toISOString();
    const body = {
      fuel_id: editFuel?.fuel_id, // will be undefined for add
      trip_id: Number(form.trip_id),
      vehicle_id: Number(form.vehicle_id),
      log_sheet_id: form.log_sheet_id,
      fuel_litres: Number(form.fuel_litres),
      fuel_amount: Number(form.fuel_amount),
      fuel_date: form.fuel_date,
      odometer_reading: Number(form.odometer_reading),
      fuel_station_name: form.fuel_station_name,
      created_by: '29',
      created_time: isoString,
      updated_by: '29',
      updated_time: isoString,
      deleted_flag: false
    };
    try {
      if (editFuel) {
        // Update existing fuel entry
        await fetch(UPDATE_FUEL_API_URL, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Apikey': UPDATE_FUEL_API_KEY,
            'Authorization': UPDATE_FUEL_AUTH_KEY,
            'session_id': '1',
            'content-Profile': 'srtms',
            'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
          },
          body: JSON.stringify(body),
        });
      } else {
        // Add new fuel entry
        await fetch(ADD_FUEL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Apikey': ADD_FUEL_API_KEY,
            'Authorization': ADD_FUEL_AUTH_KEY,
            'session_id': '1',
            'Content-Profile': 'srtms',
            'Accept-Profile': 'srtms',
            'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
          },
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      fetchFuels(); 
    } catch (error) {
      setModalOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fuels</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Fuel Entry
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fuel Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Trip ID</TableHead>
                <TableHead>Log Sheet ID</TableHead>
                <TableHead>Litres</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Updated Time</TableHead>
                <TableHead>My New Field</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuels.map(fuel => (
                <TableRow key={fuel.fuel_id}>
                  <TableCell>{fuel.fuel_id}</TableCell>
                  <TableCell>{fuel.fuel_date}</TableCell>
                  <TableCell>{fuel.vehicle_id}</TableCell>
                  <TableCell>{fuel.trip_id}</TableCell>
                  <TableCell>{fuel.log_sheet_id}</TableCell>
                  <TableCell>{fuel.fuel_litres}</TableCell>
                  <TableCell>{fuel.fuel_amount}</TableCell>
                  <TableCell>{fuel.odometer_reading}</TableCell>
                  <TableCell>{fuel.fuel_station_name}</TableCell>
                  <TableCell>{fuel.created_by}</TableCell>
                  <TableCell>{new Date(fuel.created_time).toLocaleString()}</TableCell>
                  <TableCell>{fuel.updated_by}</TableCell>
                  <TableCell>{new Date(fuel.updated_time).toLocaleString()}</TableCell>
                  <TableCell>{fuel.myNewField}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(fuel)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {fuels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-muted-foreground">No fuel records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editFuel ? 'Edit Fuel Entry' : 'Add Fuel Entry'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Select
              value={form.vehicle_id}
              onValueChange={value => setForm(f => ({ ...f, vehicle_id: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.vehicle_id} value={String(v.vehicle_id)}>
                    {`${v.registration_number} - ${v.vehicle_model} - ${v.vehicle_type_name} - ${v.driver_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trip Dropdown */}
            <Select
              value={form.trip_id}
              onValueChange={value => setForm(f => ({ ...f, trip_id: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map(t => (
                  <SelectItem key={t.trip_id} value={String(t.trip_id)}>
                    {`${t.registration_number} - ${t.origin} - ${t.destination} - ${t.driver_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Log Sheet Dropdown */}
            <Select
              value={form.log_sheet_id}
              onValueChange={value => setForm(f => ({ ...f, log_sheet_id: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Log Sheet" />
              </SelectTrigger>
              <SelectContent>
                {logSheets.map(l => (
                  <SelectItem key={l.log_sheet_id} value={String(l.log_sheet_id)}>
                    {l.log_sheet_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={form.fuel_date} onChange={e => setForm(f => ({ ...f, fuel_date: e.target.value }))} required />
            <Input type="number" placeholder="Litres" value={form.fuel_litres} onChange={e => setForm(f => ({ ...f, fuel_litres: e.target.value }))} required min={0} />
            <Input type="number" placeholder="Amount (₹)" value={form.fuel_amount} onChange={e => setForm(f => ({ ...f, fuel_amount: e.target.value }))} required min={0} />
            <Input type="number" placeholder="Odometer" value={form.odometer_reading} onChange={e => setForm(f => ({ ...f, odometer_reading: e.target.value }))} required min={0} />
            <Input placeholder="Station" value={form.fuel_station_name} onChange={e => setForm(f => ({ ...f, fuel_station_name: e.target.value }))} required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editFuel ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 