import { useMemo, useState } from "react";
import { useConfig } from "../lib/config";
import { Ic, Reveal, SectionHead, toast } from "./Ornaments";
import type { BookPrefill } from "./Services";

function slotsFor(dateKey: string, stylist: string) {
  let h = 0;
  const s = dateKey + stylist;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  const out: { t: string; free: boolean }[] = [];
  for (let m = 9 * 60; m <= 18 * 60; m += 45) {
    out.push({ t: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, free: ((h = (h * 137 + 11) % 997), h % 5 !== 0 && h % 7 !== 0) });
  }
  return out;
}

export default function Booking({ prefill }: { prefill: BookPrefill | null }) {
  const cfg = useConfig();
  const head = cfg.headings.booking;
  const services = cfg.services.flatMap((c) => c.items);
  const [step, setStep] = useState(0);
  const [service, setService] = useState(prefill?.service ?? "");
  const [stylist, setStylist] = useState(prefill?.stylist ?? "Any available");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const dates = useMemo(() => {
    const out: { key: string; label: string; day: string; closed: boolean }[] = [];
    for (let i = 1; i <= 12; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      out.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), day: d.toLocaleDateString(undefined, { weekday: "short" }), closed: d.getDay() === 1 });
    }
    return out;
  }, []);
  const slots = useMemo(() => (date ? slotsFor(date, stylist) : []), [date, stylist]);
  const chosen = services.find((s) => s.name === service);
  const total = chosen?.price ?? 0;

  const confirm = () => {
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("A name and a valid email, and we're yours"); return; }
    setCode("LX-" + Math.random().toString(36).slice(2, 7).toUpperCase());
  };

  const steps = ["Service", "Stylist", "Date & time", "Your details"];
  return (
    <section id="booking" className="relative bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHead center eyebrow="Reserve a Chair" title={head.title} italic={head.italic} desc={head.desc} tr="booking" />
        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-[2.6rem_2.6rem_2.6rem_0.8rem] border border-rose/30 bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-12">
            {code ? (
              <div className="relative mx-auto max-w-xl py-8 text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-sage text-sage"><Ic.Check className="h-9 w-9" /></span>
                <h3 className="font-display mt-7 text-4xl font-medium text-ink sm:text-5xl">The chair is <em className="font-accenti text-rosedeep">yours.</em></h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-inksoft">{name.split(" ")[0]}, we've pencilled you in — a confirmation is on its way to {email}.</p>
                <div className="mt-8 grid gap-3 rounded-[1.6rem_1.6rem_0.5rem_1.6rem] border border-linec bg-base/60 p-6 text-left">
                  {[["Service", service], ["Stylist", stylist], ["When", `${date} · ${time}`], ["Estimate", total ? `from £${total}` : "Confirmed at consultation"]].map(([k, v]) => (
                    <p key={k} className="flex justify-between gap-6 text-[13.5px]"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkfaint">{k}</span><span className="text-right text-ink">{v}</span></p>
                  ))}
                </div>
                <p className="font-mono mt-6 text-[12px] uppercase tracking-[0.3em] text-gold">Ref · {code}</p>
              </div>
            ) : (
              <>
                <div className="mb-10 grid grid-cols-4 gap-1.5">
                  {steps.map((s, i) => (
                    <div key={s}>
                      <span className={`block h-[3px] rounded-full transition-all duration-500 ${i <= step ? "bg-rosedeep" : "bg-linesoft"}`} />
                      <p className={`font-mono mt-2 hidden text-[9px] uppercase tracking-[0.18em] sm:block ${i <= step ? "text-rosedeep" : "text-inkfaint"}`}>{s}</p>
                    </div>
                  ))}
                </div>
                {step === 0 && (
                  <div className="phase-swap">
                    <h3 className="font-display text-3xl font-medium text-ink">What shall we do?</h3>
                    <div className="mt-7 flex flex-wrap gap-2.5">
                      {services.map((s) => (
                        <button key={s.name} onClick={() => { setService(s.name); setStep(1); }} data-cursor="hand"
                          className={`rounded-full border px-5 py-2.5 font-mono text-[11px] tracking-[0.08em] transition-all ${service === s.name ? "border-rosedeep bg-rosedeep text-surface" : "border-linec text-inksoft hover:border-rosedeep/60 hover:text-ink"}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="phase-swap">
                    <h3 className="font-display text-3xl font-medium text-ink">Whose hands?</h3>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      {["Any available", ...cfg.stylists.map((s) => s.name)].map((nm) => (
                        <button key={nm} onClick={() => { setStylist(nm); setStep(2); }} data-cursor="hand"
                          className={`group flex items-center gap-4 rounded-[1.6rem_1.6rem_0.5rem_1.6rem] border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] ${stylist === nm ? "border-rosedeep/70 bg-rose-ghost" : "border-linec bg-base/50 hover:border-rosedeep/50"}`}>
                          <span className="font-display block text-xl text-ink">{nm}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setStep(0)} className="link-draw font-mono mt-7 text-[10px] uppercase tracking-[0.22em] text-inkfaint">← Back</button>
                  </div>
                )}
                {step === 2 && (
                  <div className="phase-swap">
                    <h3 className="font-display text-3xl font-medium text-ink">When suits you?</h3>
                    <div className="no-scrollbar mt-7 flex gap-2.5 overflow-x-auto pb-2">
                      {dates.map((d) => (
                        <button key={d.key} disabled={d.closed} onClick={() => { setDate(d.key); setTime(""); }} data-cursor="hand"
                          className={`flex min-w-[76px] flex-col items-center rounded-[1.2rem_1.2rem_0.4rem_1.2rem] border px-4 py-3 transition-all ${d.closed ? "cursor-not-allowed border-linesoft text-inkfaint opacity-45" : date === d.key ? "border-gold/70 bg-gold-soft text-ink" : "border-linec text-inksoft hover:border-gold/50 hover:text-ink"}`}>
                          <span className="font-mono text-[9px] uppercase tracking-[0.16em]">{d.day}</span>
                          <span className="font-display mt-1 text-lg">{d.label}</span>
                        </button>
                      ))}
                    </div>
                    {date && (
                      <div className="mt-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkfaint">Open chairs · {stylist}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {slots.map((s) => (
                            <button key={s.t} disabled={!s.free} onClick={() => setTime(s.t)} data-cursor="hand"
                              className={`rounded-full border px-4 py-2 font-mono text-[12px] tabular-nums transition-all ${!s.free ? "cursor-not-allowed border-linesoft text-inkfaint opacity-40 line-through" : time === s.t ? "border-rosedeep bg-rosedeep text-surface" : "border-linec text-inksoft hover:border-rosedeep/60 hover:text-ink"}`}>{s.t}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-7 flex items-center gap-5">
                      <button onClick={() => setStep(1)} className="link-draw font-mono text-[10px] uppercase tracking-[0.22em] text-inkfaint">← Back</button>
                      <button onClick={() => setStep(3)} disabled={!date || !time} data-cursor="hand" className="btn-sheen rounded-full border border-rosedeep/70 px-7 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink disabled:cursor-not-allowed disabled:opacity-40">Continue</button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="phase-swap">
                    <h3 className="font-display text-3xl font-medium text-ink">Almost yours.</h3>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      <input className="luxe-field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                      <input className="luxe-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-linesoft pt-6">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft">{service || "Your ritual"} · {stylist} · {date} {time}{total > 0 && <span className="text-gold"> · from £{total}</span>}</p>
                      <div className="flex items-center gap-5">
                        <button onClick={() => setStep(2)} className="link-draw font-mono text-[10px] uppercase tracking-[0.22em] text-inkfaint">← Back</button>
                        <button onClick={confirm} data-cursor="hand" className="btn-sheen rounded-full border border-gold/70 px-9 py-4 font-mono text-[11px] uppercase tracking-[0.26em] text-ink shadow-[var(--glow-rose)]">Confirm booking</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
