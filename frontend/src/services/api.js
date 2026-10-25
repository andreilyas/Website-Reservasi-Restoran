const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const token = localStorage.getItem('restokalcer_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.pesan || payload.message || 'Permintaan tidak dapat diproses.');
  }
  return payload;
}

export const getTables = (filters = {}) => {
  const query = new URLSearchParams();
  const filterMap = {
    tanggal: 'date',
    date: 'date',
    waktu: 'start_time',
    start_time: 'start_time',
    waktu_selesai: 'end_time',
    end_time: 'end_time',
    jumlahTamu: 'guest_count',
    guest_count: 'guest_count',
  };

  Object.entries(filters).forEach(([key, value]) => {
    const queryKey = filterMap[key];
    if (queryKey && value !== undefined && value !== null && value !== '') {
      query.set(queryKey, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/reservasi/meja${suffix}`);
};
export const getReservationDetail = (tableId) => request(`/reservasi/detail/${tableId}`);
export const createReservation = (data) => request('/reservasi/booking', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateTableStatus = (tableId, status) => request('/reservasi/update-status', {
  method: 'PUT',
  body: JSON.stringify({ id_meja: tableId, status_baru: status }),
});
export const authenticate = (data, mode) => request(`/auth/${mode}`, {
  method: 'POST',
  body: JSON.stringify(data),
});
