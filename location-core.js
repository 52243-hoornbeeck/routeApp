/* Local geometry and measurement validation; no network or location storage. */
(function (root) {
    'use strict';
    const MAX_AGE = 15000;
    // Usable for approximate movement only, never room-level accuracy.
    const MAX_ACCURACY = 40;
    function validFix(p, now = Date.now()) {
        return p && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
            Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180 &&
            Number.isFinite(p.accuracy) && p.accuracy > 0 &&
            Number.isFinite(p.timestamp) && p.timestamp <= now + 1000 &&
            now - p.timestamp <= MAX_AGE;
    }
    function meters(a, b) {
        const r = Math.PI / 180;
        const h = Math.sin((b.latitude - a.latitude) * r / 2) ** 2 +
            Math.cos(a.latitude * r) * Math.cos(b.latitude * r) *
            Math.sin((b.longitude - a.longitude) * r / 2) ** 2;
        return 12742000 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
    }
    class Tracker {
        constructor() { this.reset(); }
        reset() { this.last = null; this.filtered = null; this.candidate = null; this.count = 0; this.latest = 0; }
        accept(p, now = Date.now()) {
            if (!validFix(p, now)) return { reason: 'Ongeldige of verouderde meting.' };
            if (p.timestamp <= this.latest) return { reason: 'Dubbele of oudere meting.' };
            this.latest = p.timestamp;
            if (p.accuracy > MAX_ACCURACY) return { reason: 'Signaal te onnauwkeurig voor deze plattegrond.' };
            let reacquired = false;
            const dt = this.last ? (p.timestamp - this.last.timestamp) / 1000 : 0;
            if (this.last && dt < 30 && meters(this.last, p) > 3 * dt + this.last.accuracy + p.accuracy) {
                this.count = this.candidate && p.timestamp - this.candidate.timestamp < 10000 &&
                    meters(this.candidate, p) <= Math.max(5, p.accuracy) ? this.count + 1 : 1;
                this.candidate = { ...p };
                if (this.count < 3) return { reason: 'Onverwachte sprong; wachten op bevestigende metingen.' };
                reacquired = true;
            }
            this.candidate = null; this.count = 0;
            const alpha = !this.filtered || dt >= 15 || reacquired ? 1 :
                1 - Math.exp(-Math.max(0.1, dt) / (p.accuracy <= 8 ? 0.8 : 1.5));
            const old = this.filtered || p;
            this.filtered = { ...p,
                latitude: old.latitude + alpha * (p.latitude - old.latitude),
                longitude: old.longitude + alpha * (p.longitude - old.longitude) };
            if (alpha < 1 && meters(old, p) < Math.min(3, Math.max(0.8, p.accuracy * 0.35))) {
                this.filtered.latitude = old.latitude;
                this.filtered.longitude = old.longitude;
            }
            this.last = { ...p };
            return { position: { ...this.filtered } };
        }
    }
    const api = { MAX_AGE, MAX_ACCURACY, validFix, meters, Tracker };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.LocationCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
