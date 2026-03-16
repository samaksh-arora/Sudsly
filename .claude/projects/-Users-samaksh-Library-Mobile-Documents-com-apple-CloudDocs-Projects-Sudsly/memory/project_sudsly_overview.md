---
name: Sudsly Project Overview
description: Core product decisions, tech stack, pricing, and MVP scope for the Sudsly laundry pickup/delivery app
type: project
---

## What is Sudsly
Uber Eats for laundry — customers request pickup, a Washer picks up their laundry, washes it at a laundromat, and delivers it back.

## Launch Market
Detroit and nearby cities.

## Tech Stack
- Frontend: React Native + Expo
- Backend: Node.js + JavaScript
- Auth + Database: Supabase (auth + PostgreSQL)
- Payments: Stripe Connect
- Push Notifications: Expo Notifications

## App Structure
- Single app — user picks role (Customer or Washer) at sign-up

## Pricing Model (MVP)
- Flat rate per bag ($25/bag covers everything)
- Tipping enabled
- Special instructions via free text field

## Money Split (per bag)
- Customer pays: $25
- Washer gets: ~$15
- Laundromat costs: ~$5
- Sudsly keeps: ~$5

## Roles
- **Customer** — requests pickup, pays, tracks status
- **Washer** — accepts jobs, picks up, washes, delivers

## MVP Decisions
- Bags: customer provides their own (Sudsly-branded bags planned for later)
- Washer verification: ID upload + manual admin approval
- Customer-Washer communication: masked phone call (like Uber)
- No Washers available: queue the order, notify customer when one comes online, give option to cancel
- Detergent: Washer brings their own; customer provides if they want specific
- Damage/loss policy: to be written later, not in-app for v1
- No scheduled pickups for MVP — on-demand only
- No real-time map tracking for MVP — status updates only

## V2 Features (design for but don't build yet)
- **Host role** — people rent out their personal washer/dryer for Washers to use instead of laundromats (Airbnb for washing machines). Better margins for Sudsly (~$7/order vs ~$5).
- Scheduled/recurring pickups
- Subscription plans
- Rush/same-day fee
- Sudsly-branded bags shipped to customers
- Special care upcharges (dry clean, delicates)
- Commercial accounts (Airbnbs, gyms, salons)
- Real-time GPS map tracking

## MVP Screens (~15 total)
**Customer:** Sign up → Home → New order (select bags, instructions, pickup time, confirm) → Matching → Order tracking (status timeline) → Rate + tip
**Washer:** Sign up + ID upload → Home (online/offline toggle) → Accept job → Step-through flow (navigate → pickup photo → wash → deliver → delivery photo) → Earnings
**Shared:** Splash, auth, profile/settings
