const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  healthCheck: () => request('/health'),
  login: (phone, password) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    }),
  fetchCustomers: (token) =>
    request('/customers', { headers: { Authorization: `Bearer ${token}` } }),
  fetchLoans: (token) =>
    request('/loans', { headers: { Authorization: `Bearer ${token}` } }),
  fetchLoanDetails: (token, id) =>
    request(`/loans/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  fetchPayments: (token) =>
    request('/payments', { headers: { Authorization: `Bearer ${token}` } }),
  fetchLedger: (token) =>
    request('/ledger', { headers: { Authorization: `Bearer ${token}` } }),
  fetchDashboard: (token) =>
    request('/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
  fetchReports: (token) =>
    request('/reports', { headers: { Authorization: `Bearer ${token}` } }),
  fetchReminders: (token) =>
    request('/reminders', { headers: { Authorization: `Bearer ${token}` } }),
  createCustomer: (token, formData) =>
    request('/customers', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }),
  updateCustomer: (token, id, formData) =>
    request(`/customers/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData }),
  deleteCustomer: (token, id) =>
    request(`/customers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  createLoan: (token, payload) =>
    request('/loans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    }),
  createPayment: (token, payload) =>
    request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
  saveLoanSignature: (token, loanId, signatureData) =>
    request(`/loans/${loanId}/signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ signatureData })
    }),
  createLedgerEntry: (token, payload) =>
    request('/ledger', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
};
