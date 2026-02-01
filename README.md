# 🎓 Elpida Alumni Digital ID Engine

A modern web application designed for the **Elpida Schools Alumni Association** to generate and verify digital identity cards for its members.

## ✨ Features

- **Real-time Preview:** Instant visualization of the ID card as data is entered.
- **Photo Integration:** Support for member profile photo uploads.
- **Smart Verification:** Automated member validation against a CSV database.
- **Admin Override:** Manual authorization system for special board members.
- **Dynamic QR Codes:** Each card features a unique QR code containing member metadata.
- **High-Resolution Export:** Download identities as high-quality PNG files ready for print or mobile use.

## 🛡️ Administrative Guide

For data integrity and security, database updates and special verifications are protected by specific protocols.

### 📥 Updating the Member Database
1. Click the **Update Database** button in the top-right corner.
2. Enter the Admin Password: `Olympiakos7@`.
3. Select your updated member CSV file (Structure: Surname, First Name, Email).
4. The system securely stores the data locally in the browser's storage for the current device.

### 🔑 Manual Verification (Admin Override)
To issue a **Verified** identity for VIPs or members not yet in the database:
- In the **Email / Admin Code** field, type: `ADMIN_ELPIDA`.
- This bypasses the CSV check and activates the "Verified" badge.

## 🚀 Tech Stack

- **React.js** (Frontend Framework)
- **Tailwind CSS** (Modern Styling)
- **Lucide React** (Professional Icon Set)
- **html-to-image** (High-fidelity image rendering)

---
Designed & Developed for the **Alumni Association of Elpida Schools**.