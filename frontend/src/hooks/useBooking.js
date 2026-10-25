import { useMemo, useState } from 'react';
import { createReservation } from '../services/api';
import { getEndTime, getToday, validateReservation } from '../utils/validation';

const initialForm = {
  namaPelanggan: '',
  tanggal: getToday(),
  waktu: '19:00',
  jumlahTamu: '2',
  idMeja: null,
  catatan: '',
};

export function useBooking({ tables, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ submitting: false, error: '', success: null });

  const availableTables = useMemo(
    () => tables.filter((table) => table.status_meja === 0),
    [tables],
  );

  const selectedTable = tables.find((table) => table.id_meja === form.idMeja);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setState((current) => ({ ...current, error: '' }));
  };

  const selectTable = (id) => updateField('idMeja', id);

  const submit = async (event) => {
    event?.preventDefault();
    const nextErrors = validateReservation(form, selectedTable);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return false;

    setState({ submitting: true, error: '', success: null });
    try {
      const response = await createReservation({
        nama_pelanggan: form.namaPelanggan.trim(),
        tanggal_reservasi: form.tanggal,
        waktu_reservasi: form.waktu,
        waktu_selesai: getEndTime(form.waktu),
        jumlah_tamu: Number(form.jumlahTamu),
        id_meja: Number(form.idMeja),
        catatan: form.catatan.trim(),
      });
      setState({ submitting: false, error: '', success: response.data || response });
      await onSuccess(response);
      return true;
    } catch (error) {
      setState({ submitting: false, error: error.message, success: null });
      return false;
    }
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setState({ submitting: false, error: '', success: null });
  };

  return { form, errors, state, availableTables, updateField, selectTable, submit, reset };
}
