export const OPENING_HOUR = 10;
export const CLOSING_HOUR = 22;
export const MAX_GUESTS = 12;

export function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
}

export function getTimeSlots() {
  return Array.from({ length: CLOSING_HOUR - OPENING_HOUR }, (_, index) => {
    const hour = OPENING_HOUR + index;
    return `${String(hour).padStart(2, '0')}:00`;
  });
}

export function getEndTime(startTime) {
  const [hour, minute] = startTime.split(':').map(Number);
  return `${String(hour + 2).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function validateReservation(form, selectedTable) {
  const errors = {};
  if (!form.namaPelanggan.trim()) errors.namaPelanggan = 'Nama lengkap wajib diisi.';
  if (form.namaPelanggan.trim().length > 100) errors.namaPelanggan = 'Nama maksimal 100 karakter.';
  if (!form.tanggal) errors.tanggal = 'Pilih tanggal reservasi.';
  if (form.tanggal && form.tanggal < getToday()) errors.tanggal = 'Tanggal tidak boleh sudah lewat.';
  if (!form.waktu) errors.waktu = 'Pilih waktu kedatangan.';
  if (!form.jumlahTamu || Number(form.jumlahTamu) < 1) errors.jumlahTamu = 'Jumlah tamu minimal 1 orang.';
  if (Number(form.jumlahTamu) > MAX_GUESTS) errors.jumlahTamu = `Maksimal ${MAX_GUESTS} tamu per reservasi.`;
  if (!form.idMeja) errors.idMeja = 'Pilih meja yang tersedia.';
  if (selectedTable && selectedTable.status_meja !== 0) errors.idMeja = 'Meja ini sudah tidak tersedia.';
  return errors;
}
