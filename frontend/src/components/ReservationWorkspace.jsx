import { useState } from 'react';
import BookingFilters from './BookingFilters';
import TableMap from './TableMap';
import ReservationForm from './ReservationForm';
import ConfirmationModal from './ConfirmationModal';
import { getEndTime } from '../utils/validation';

export default function ReservationWorkspace({
  booking, tables, tableState, selectedTable, onReload, onBack, activeUser,
}) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (event) => {
    const success = await booking.submit(event);
    if (success) setConfirmationOpen(true);
  };

  const showAvailability = async () => {
    if (booking.errors.tanggal || booking.errors.waktu || booking.errors.jumlahTamu) return;
    const filteredTables = await onReload({
      date: booking.form.tanggal,
      start_time: booking.form.waktu,
      end_time: getEndTime(booking.form.waktu),
      guest_count: booking.form.jumlahTamu,
    });
    const selected = filteredTables.find((table) => table.id_meja === booking.form.idMeja);
    if (!selected || selected.status_meja !== 0) booking.selectTable(null);
    setStep(2);
  };

  return (
    <section className="workspace-page fade-in">
      <div className="page-heading">
        <button className="back-link" onClick={onBack}>← Kembali ke beranda</button>
        <div className="heading-row">
          <div>
            <span className="eyebrow">RestoKalcer / Reservasi</span>
            <h1>Temukan meja untuk momenmu.</h1>
            <p>Atur preferensi, pilih meja, lalu kami siapkan pengalaman terbaik.</p>
          </div>
          <div className="stepper" aria-label="Langkah reservasi">
            <span className={step >= 1 ? 'active' : ''}><b>01</b> Pilih waktu</span>
            <i />
            <span className={step >= 2 ? 'active' : ''}><b>02</b> Pilih meja</span>
            <i />
            <span className={step >= 3 ? 'active' : ''}><b>03</b> Konfirmasi</span>
          </div>
        </div>
      </div>

      <BookingFilters
        form={booking.form}
        errors={booking.errors}
        onChange={booking.updateField}
        onStep={showAvailability}
        loading={tableState.loading}
      />

      <div className="reservation-layout">
        <div className="map-column">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Live availability</span>
              <h2>Pilih meja favoritmu</h2>
            </div>
            <button className="icon-button" onClick={onReload} aria-label="Muat ulang ketersediaan">↻</button>
          </div>
          <TableMap
            tables={tables}
            loading={tableState.loading}
            error={tableState.error}
            selectedId={booking.form.idMeja}
            onSelect={(id) => { booking.selectTable(id); setStep(2); }}
            interactive
          />
        </div>
        <ReservationForm
          form={booking.form}
          errors={booking.errors}
          state={booking.state}
          selectedTable={selectedTable}
          activeUser={activeUser}
          onChange={booking.updateField}
          onSubmit={handleSubmit}
          onReset={booking.reset}
        />
      </div>

      {confirmationOpen && (
        <ConfirmationModal
          reservation={booking.state.success}
          form={booking.form}
          table={selectedTable}
          onClose={() => { setConfirmationOpen(false); booking.reset(); setStep(1); }}
        />
      )}
    </section>
  );
}
