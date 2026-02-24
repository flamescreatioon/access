# Changelog for Uaccess

---

## Release v0.2.0 — 24 Feb 2026

This release introduces a **Fair Booking & Allocation Algorithm System** — a comprehensive fairness engine that ensures equitable access to spaces and equipment across all members.

### What's New

* **7-Layer Fairness Engine** — Every booking request passes through availability, slot locking, rolling usage, booking cap, cooldown, no-show penalty, and audit logging checks

* **Rolling Usage Window** — Replaces the old calendar-month cap with a 7-day rolling window (default: 6 hours/week) for fairer limit enforcement

* **Per-User Booking Cap** — Members can hold a maximum number of active future bookings (default: 3) to prevent hoarding

* **Cooldown Enforcement** — Prevents rebooking the same resource within a configurable period (default: 24 hours)

* **No-Show Penalty System** — Progressive penalties including warnings, quota reductions, and temporary booking suspensions based on no-show count

* **Slot Locking** — Temporary locks during the booking flow to prevent race conditions and double bookings

* **FIFO Waitlist Queue** — Users can join a waitlist when a slot is full; automatic offers are sent when cancellations occur, with a timed claim window

* **Check-In Endpoint** — Members can check in to confirm attendance, feeding the no-show tracking system

* **Admin Booking Rules UI** — New "Booking Rules" page for admins and hub managers to configure all fairness parameters from the dashboard — no code changes needed

* **Resource-Specific Overrides** — Admins can set different rules for spaces vs equipment, or for individual resources, with automatic config merging (global → type → specific)

---

## Release v0.1.0 — 24 Feb 2026

We've launched Version 0.1.0 of the platform.

This release focuses on building a strong foundation to support future growth and improvements.

### What's Now in Place

* User account and access management system

* Structured space and equipment management

* Booking system framework

* Membership management structure

* Activity tracking and basic analytics setup

* Notification and onboarding systems

* Optimized web experience with app-like support
