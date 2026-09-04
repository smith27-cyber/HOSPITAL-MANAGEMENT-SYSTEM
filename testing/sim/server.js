const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'test-secret-key-12345-min-32-chars';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load test data
let testData = {
  users: require('./data/users.json'),
  patients: require('./data/patients.json'),
  doctors: require('./data/doctors.json'),
  appointments: require('./data/appointments.json'),
  consultations: require('./data/consultations.json'),
  billing: require('./data/billing.json')
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// =====================================================
// AUTH ROUTES
// =====================================================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Bad Request', message: 'Username and password required' });
  }

  const user = testData.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    type: 'Bearer',
    expiresIn: 28800,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// =====================================================
// PATIENT ROUTES
// =====================================================

app.get('/api/patients', authenticateToken, (req, res) => {
  const { page = 0, size = 20, search } = req.query;
  let filtered = testData.patients;

  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  res.json({
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    currentPage: page,
    size
  });
});

app.get('/api/patients/:id', authenticateToken, (req, res) => {
  const patient = testData.patients.find(p => p.id == req.params.id);

  if (!patient) {
    return res.status(404).json({ error: 'Not Found', message: 'Patient not found' });
  }

  res.json(patient);
});

app.post('/api/patients', authenticateToken, (req, res) => {
  const { name, email, phoneNumber, dateOfBirth, gender, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Validation Error', message: 'Name and email required' });
  }

  if (testData.patients.find(p => p.email === email)) {
    return res.status(400).json({ error: 'Validation Error', message: 'Email already exists' });
  }

  const newPatient = {
    id: Math.max(...testData.patients.map(p => p.id)) + 1,
    name,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  testData.patients.push(newPatient);
  res.status(201).json(newPatient);
});

app.put('/api/patients/:id', authenticateToken, (req, res) => {
  const patient = testData.patients.find(p => p.id == req.params.id);

  if (!patient) {
    return res.status(404).json({ error: 'Not Found', message: 'Patient not found' });
  }

  Object.assign(patient, req.body, { updatedAt: new Date().toISOString() });
  res.json(patient);
});

app.delete('/api/patients/:id', authenticateToken, (req, res) => {
  const index = testData.patients.findIndex(p => p.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Patient not found' });
  }

  testData.patients.splice(index, 1);
  res.status(204).send();
});

// =====================================================
// APPOINTMENT ROUTES
// =====================================================

app.get('/api/appointments', authenticateToken, (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const start = page * size;
  const content = testData.appointments.slice(start, start + size);

  res.json({
    content,
    totalElements: testData.appointments.length,
    totalPages: Math.ceil(testData.appointments.length / size),
    currentPage: page,
    size
  });
});

app.get('/api/appointments/queue', authenticateToken, (req, res) => {
  const queue = testData.appointments
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 10);

  res.json({
    content: queue,
    totalWaiting: queue.length,
    estimatedWaitTime: '2 hours'
  });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const { patientId, doctorId, dateTime, reason, notes } = req.body;

  if (!patientId || !doctorId || !dateTime) {
    return res.status(400).json({ error: 'Validation Error', message: 'Required fields missing' });
  }

  // Check for conflicts
  const conflicts = testData.appointments.filter(a =>
    a.doctorId == doctorId &&
    Math.abs(new Date(a.dateTime) - new Date(dateTime)) < 3600000
  );

  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Conflict', message: 'Doctor not available at this time' });
  }

  const newAppointment = {
    id: Math.max(...testData.appointments.map(a => a.id)) + 1,
    patientId,
    doctorId,
    dateTime,
    status: 'scheduled',
    reason,
    notes,
    createdAt: new Date().toISOString()
  };

  testData.appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const appointment = testData.appointments.find(a => a.id == req.params.id);

  if (!appointment) {
    return res.status(404).json({ error: 'Not Found', message: 'Appointment not found' });
  }

  Object.assign(appointment, req.body);
  res.json(appointment);
});

app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  const index = testData.appointments.findIndex(a => a.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Appointment not found' });
  }

  testData.appointments.splice(index, 1);
  res.status(204).send();
});

// =====================================================
// CONSULTATION ROUTES
// =====================================================

app.get('/api/consultations', authenticateToken, (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const start = page * size;
  const content = testData.consultations.slice(start, start + size);

  res.json({
    content,
    totalElements: testData.consultations.length,
    totalPages: Math.ceil(testData.consultations.length / size),
    currentPage: page,
    size
  });
});

app.post('/api/consultations', authenticateToken, (req, res) => {
  const { appointmentId, patientId, doctorId, notes, diagnosis } = req.body;

  if (!patientId || !doctorId) {
    return res.status(400).json({ error: 'Validation Error', message: 'Required fields missing' });
  }

  const newConsultation = {
    id: Math.max(...testData.consultations.map(c => c.id)) + 1,
    appointmentId,
    patientId,
    doctorId,
    notes,
    diagnosis,
    createdAt: new Date().toISOString()
  };

  testData.consultations.push(newConsultation);
  res.status(201).json(newConsultation);
});

// =====================================================
// BILLING ROUTES
// =====================================================

app.get('/api/billing', authenticateToken, (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const start = page * size;
  const content = testData.billing.slice(start, start + size);

  res.json({
    content,
    totalElements: testData.billing.length,
    totalPages: Math.ceil(testData.billing.length / size),
    currentPage: page,
    size
  });
});

app.post('/api/billing', authenticateToken, (req, res) => {
  const { patientId, consultationId, items, discount, taxRate } = req.body;

  if (!patientId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'Invalid billing data' });
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount || 0;
  const taxAmount = (subtotal - discountAmount) * (taxRate || 0);
  const total = subtotal - discountAmount + taxAmount;

  const newBilling = {
    id: Math.max(...testData.billing.map(b => b.id)) + 1,
    patientId,
    consultationId,
    invoiceNumber: `INV-${Date.now()}`,
    items,
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  testData.billing.push(newBilling);
  res.status(201).json(newBilling);
});

// =====================================================
// RESET DATA (For Testing)
// =====================================================

app.post('/api/reset', (req, res) => {
  testData = {
    users: require('./data/users.json'),
    patients: require('./data/patients.json'),
    doctors: require('./data/doctors.json'),
    appointments: require('./data/appointments.json'),
    consultations: require('./data/consultations.json'),
    billing: require('./data/billing.json')
  };

  res.json({ message: 'Test data reset successfully' });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Server Error',
    message: 'An unexpected error occurred'
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`HMS Backend Simulator running on http://localhost:${PORT}`);
  console.log(`Mock API available at http://localhost:${PORT}/api`);
});
