import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import {
  fetchBookingServices,
  fetchBookingSlots,
  formatBookingConfirmation,
  minBookingDate,
  submitBooking,
} from "@/lib/clinicBooking";
import { bookingServiceTitles, DEFAULT_BOOKING_SERVICE } from "@/lib/services";

/** 16px minimum — prevents iOS Safari from zooming when focusing inputs */
const FIELD =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary";

export function BookingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(DEFAULT_BOOKING_SERVICE);
  const [date, setDate] = useState(minBookingDate());
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ message: string; when: string } | null>(null);

  const serviceOptions = useMemo(() => {
    if (services.length) return services;
    return [...bookingServiceTitles];
  }, [services]);

  function pickDefaultService(titles: string[]) {
    if (titles.includes(DEFAULT_BOOKING_SERVICE)) return DEFAULT_BOOKING_SERVICE;
    return titles[0] || DEFAULT_BOOKING_SERVICE;
  }

  useEffect(() => {
    let alive = true;
    setLoadingServices(true);
    fetchBookingServices()
      .then((data) => {
        if (!alive) return;
        const titles = (data.services || []).map((s) => s.title).filter(Boolean);
        setServices(titles);
        setService((prev) => (prev && titles.includes(prev) ? prev : pickDefaultService(titles)));
      })
      .catch(() => {
        if (!alive) return;
        setServices([]);
        setService(DEFAULT_BOOKING_SERVICE);
      })
      .finally(() => {
        if (alive) setLoadingServices(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!date) return;
    let alive = true;
    setLoadingSlots(true);
    setError("");
    fetchBookingSlots(date)
      .then((data) => {
        if (!alive) return;
        setClosed(Boolean(data.closed));
        setSlots(data.slots || []);
        setSlot((prev) => {
          if (data.slots?.includes(prev)) return prev;
          return data.slots?.[0] || "";
        });
      })
      .catch((err) => {
        if (!alive) return;
        setSlots([]);
        setSlot("");
        setError(err instanceof Error ? err.message : "Could not load time slots");
      })
      .finally(() => {
        if (alive) setLoadingSlots(false);
      });
    return () => {
      alive = false;
    };
  }, [date]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await submitBooking({
        name: name.trim(),
        phone: phone.trim(),
        service,
        date,
        slot,
        notes: notes.trim() || undefined,
        website: String(fd.get("website") ?? ""),
      });
      setSuccess({
        message: result.message,
        when: formatBookingConfirmation(result.scheduledAt),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="h-fit rounded-[1.75rem] border border-border bg-card p-6 sm:rounded-[2rem] sm:p-8 lg:p-10">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <h2 className="font-display mt-4 text-2xl text-foreground">Request received</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{success.message}</p>
        <p className="mt-3 rounded-xl bg-secondary/60 px-4 py-3 text-sm text-foreground">
          <strong>Preferred time:</strong> {success.when}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The clinic will confirm by phone or WhatsApp. For urgent help, call{" "}
          <a href="tel:+916301433852" className="font-medium text-primary hover:underline">
            6301433852
          </a>
          .
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-primary hover:underline"
          onClick={() => {
            setSuccess(null);
            setName("");
            setPhone("");
            setNotes("");
          }}
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="booking-form h-fit rounded-[1.75rem] border border-border bg-card p-6 sm:rounded-[2rem] sm:p-8 lg:p-10"
    >
      <h2 className="font-display text-2xl text-foreground">Book an appointment</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a time online. Your request goes straight to the clinic desk — no WhatsApp needed.
      </p>

      <div className="mt-5 grid gap-4 sm:mt-6">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Full name</span>
          <input
            required
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Phone</span>
          <input
            required
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={FIELD}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Reason for visit</span>
          <select
            required
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            disabled={loadingServices}
            className={FIELD}
          >
            {serviceOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Preferred date</span>
          <input
            required
            name="date"
            type="date"
            min={minBookingDate()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD}
          />
        </label>

        <div className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Preferred time</span>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
            </div>
          ) : closed ? (
            <p className="text-sm text-muted-foreground">Clinic is closed on Sundays. Please pick another day.</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open slots for this date. Try another day.</p>
          ) : (
            <select
              required
              name="slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className={FIELD}
            >
              <option value="" disabled>
                Select a time
              </option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-foreground">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any pain, allergies, or questions"
            className={FIELD}
          />
        </label>

        {/* Honeypot — hidden from users */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !slot || closed || slots.length === 0}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            "Request appointment"
          )}
        </button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Or call / WhatsApp{" "}
          <a href="tel:+916301433852" className="text-primary hover:underline">
            6301433852
          </a>{" "}
          if you prefer to speak with the clinic directly.
        </p>
      </div>
    </form>
  );
}
