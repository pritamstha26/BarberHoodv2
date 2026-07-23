import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, CreditCard, Flame, Timer, Utensils } from "lucide-react";

export type PricingPeriod = "Lunch" | "Prime Dinner" | "Late Night";

export interface TimeSlot {
  id: string;
  time: string;
  period: PricingPeriod;
  basePrice: number;
  currentPrice?: number;
  startsAt?: string;
  multiplier?: number;
  utilization?: number;
  activeAppointments?: number;
  capacityRemaining: number;
  totalCapacity?: number;
  isAvailable?: boolean;
  isPastSlot?: boolean;
}

interface TierDetails {
  multiplier: number;
  label: string | null;
  badgeClass: string;
  cardClass: string;
}

interface RestaurantSlotPickerProps {
  slots: TimeSlot[];
  totalTablesPerSlot: number;
  onConfirmBooking: (slotId: string, currentPrice: number, slot: TimeSlot) => void;
}

const PERIODS: PricingPeriod[] = ["Lunch", "Prime Dinner", "Late Night"];

const getTierDetails = (
  remaining: number,
  totalTablesPerSlot: number,
): TierDetails => {
  const safeTotal = Math.max(totalTablesPerSlot, 1);
  const fillRate = ((safeTotal - remaining) / safeTotal) * 100;

  if (fillRate >= 91) {
    return {
      multiplier: 1.6,
      label: "Filling Fast",
      badgeClass: "bg-rose-100 text-rose-900",
      cardClass:
        "border-rose-200 bg-rose-50 text-rose-800 ring-rose-500/20 hover:border-rose-300",
    };
  }

  if (fillRate >= 76) {
    return {
      multiplier: 1.3,
      label: "Popular",
      badgeClass: "bg-amber-100 text-amber-900",
      cardClass:
        "border-amber-200 bg-amber-50 text-amber-900 ring-amber-500/20 hover:border-amber-300",
    };
  }

  return {
    multiplier: 1.0,
    label: null,
    badgeClass: "bg-emerald-100 text-emerald-900",
    cardClass:
      "border-emerald-200 bg-emerald-50 text-emerald-950 ring-emerald-500/20 hover:border-emerald-300",
  };
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  return `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
};

export default function RestaurantSlotPicker({
  slots,
  totalTablesPerSlot,
  onConfirmBooking,
}: RestaurantSlotPickerProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );

  const groupedPeriods = useMemo(
    () =>
      PERIODS.map((period) => ({
        period,
        slots: slots.filter((slot) => slot.period === period),
      })),
    [slots],
  );

  const resetSelection = () => {
    setSelectedSlotId(null);
    setIsCheckout(false);
    setTimeLeft(300);
    setIsExpired(false);
  };

  useEffect(() => {
    if (!selectedSlotId) return;
    if (!slots.some((slot) => slot.id === selectedSlotId)) {
      resetSelection();
    }
  }, [selectedSlotId, slots]);

  useEffect(() => {
    if (!isCheckout || isExpired) {
      return undefined;
    }

    if (timeLeft <= 0) {
      setIsExpired(true);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [isCheckout, isExpired, timeLeft]);

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    if (isCheckout) {
      setIsCheckout(false);
      setTimeLeft(300);
      setIsExpired(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedSlot) return;
    setIsCheckout(true);
    setTimeLeft(300);
    setIsExpired(false);
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;

    const { multiplier } = getTierDetails(
      selectedSlot.capacityRemaining,
      selectedSlot.totalCapacity || totalTablesPerSlot,
    );
    const currentPrice = selectedSlot.currentPrice ?? selectedSlot.basePrice * multiplier;
    onConfirmBooking(selectedSlot.id, currentPrice, selectedSlot);
  };

  if (isCheckout && selectedSlot) {
    const { multiplier } = getTierDetails(
      selectedSlot.capacityRemaining,
      selectedSlot.totalCapacity || totalTablesPerSlot,
    );
    const finalPrice = selectedSlot.currentPrice ?? selectedSlot.basePrice * multiplier;
    const displayMultiplier = selectedSlot.multiplier ?? multiplier;

    return (
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div
          className={`mb-6 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
            isExpired
              ? "border-rose-300 bg-rose-100 text-rose-800"
              : timeLeft < 60
              ? "border-amber-300 bg-amber-100 text-amber-900 animate-pulse"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <Timer className="h-4 w-4" />
          {isExpired
            ? "Price lock expired. Please select another slot."
            : `Holding table and price for ${formatTime(timeLeft)}`}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-sm font-semibold uppercase text-stone-500">
              Confirm Reservation
            </p>
            <div className="mt-4 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
              <div>
                <div className="text-stone-500">Time slot</div>
                <div className="text-base font-semibold text-stone-950">
                  {selectedSlot.time} · {selectedSlot.period}
                </div>
              </div>
              <div>
                <div className="text-stone-500">Capacity remaining</div>
                <div className="text-base font-semibold text-stone-950">
                {selectedSlot.capacityRemaining} tables
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-stone-500">Deposit</p>
              <p className="mt-2 text-3xl font-black text-stone-950">
                ${finalPrice.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-sm font-semibold uppercase text-cyan-800">
                Pricing tier
              </p>
              <p className="mt-2 text-lg font-black text-cyan-950">
                {displayMultiplier.toFixed(1)}x
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={resetSelection}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isExpired}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <CreditCard className="h-4 w-4" />
              {isExpired ? "Expired" : "Book Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedPeriods.map(({ period, slots: periodSlots }) =>
        periodSlots.length > 0 ? (
          <section key={period} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-stone-950">
                  <Utensils className="h-5 w-5 text-cyan-700" />
                  {period}
                </h2>
                <p className="text-sm text-stone-500">
                  Select a reservation window to view the current price.
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-600">
                {periodSlots.length} options
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {periodSlots.map((slot) => {
                const { multiplier, label, cardClass, badgeClass } = getTierDetails(
                  slot.capacityRemaining,
                  slot.totalCapacity || totalTablesPerSlot,
                );
                const currentPrice = slot.currentPrice ?? slot.basePrice * multiplier;
                const isSelected = selectedSlotId === slot.id;
                const isUnavailable = slot.isAvailable === false;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => handleSlotClick(slot.id)}
                    className={`group relative flex h-full min-h-[172px] w-full flex-col items-start justify-between overflow-hidden rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-stone-900/30 ${cardClass} ${
                      isSelected
                        ? "ring-2 ring-stone-950/70"
                        : "hover:-translate-y-0.5 hover:shadow-lg"
                    } ${isUnavailable ? "cursor-not-allowed opacity-55 hover:translate-y-0 hover:shadow-none" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-bold text-stone-950">
                          <Clock3 className="h-4 w-4" />
                          {slot.time}
                        </p>
                        <p className="mt-2 text-3xl font-black text-stone-950">
                          ${currentPrice.toFixed(2)}
                        </p>
                      </div>
                      {isUnavailable ? (
                        <span className="rounded-full bg-stone-200 px-2.5 py-1 text-[0.65rem] font-bold uppercase text-stone-700">
                          Closed
                        </span>
                      ) : label ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase ${badgeClass}`}
                        >
                          <Flame className="h-3 w-3" />
                          {label}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 w-full rounded-2xl bg-white/75 px-4 py-3 text-sm text-stone-600 shadow-sm ring-1 ring-stone-200/80">
                      <p className="flex items-center justify-between gap-3">
                        <span>
                        {slot.capacityRemaining} / {slot.totalCapacity || totalTablesPerSlot} tables
                        available
                        </span>
                        {isSelected ? (
                          <Check className="h-4 w-4 text-emerald-700" />
                        ) : null}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null,
      )}

      {selectedSlot ? (
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />
            Proceed to Checkout
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-600">
          Select a time slot to lock in your rate and start checkout.
        </div>
      )}
    </div>
  );
}
