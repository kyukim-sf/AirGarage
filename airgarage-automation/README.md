# AirGarage Parking Automation

Automatically starts and ends a parking session at Central Park Plaza (San Mateo) every weekday.

- **Start:** 7:15 AM PST (Mon–Fri)
- **End:** 9:13 AM PST (Mon–Fri)
- **Discount code:** EQN120 (2 hours free)

---

## Setup

### 1. Create a GitHub repo
- Go to [github.com](https://github.com) → **New repository**
- Name it something like `airgarage-automation`
- Set it to **Private**
- Click **Create repository**

### 2. Upload these files
Upload all files from this folder to the repo, keeping the folder structure:
```
.github/
  workflows/
    parking.yml
start_parking.js
end_parking.js
package.json
```

### 3. Enable GitHub Actions
- Go to your repo → **Actions** tab
- Click **"I understand my workflows, go ahead and enable them"**

### 4. Test manually
- Go to **Actions** → **AirGarage Parking Automation**
- Click **Run workflow**
- Choose `start` or `end` and run it
- Check the logs to confirm it worked

---

## ⚠️ Important: SMS Verification
The first time the script runs in a fresh environment, AirGarage may require SMS verification.
The script attempts to use your PIN (`449189`) as the verification code.

If verification fails, you may need to run it manually the first time and complete the SMS step yourself. After that, AirGarage may remember the session.

---

## Timezone Note
The cron schedule uses UTC. The workflow uses:
- `15 15 * * 1-5` → 7:15 AM **PST** (UTC-8, winter)
- `13 17 * * 1-5` → 9:13 AM **PST** (UTC-8, winter)

During **PDT (summer, UTC-7)**, update to:
- `15 14 * * 1-5` for 7:15 AM PDT
- `13 16 * * 1-5` for 9:13 AM PDT
