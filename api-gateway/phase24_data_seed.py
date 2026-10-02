import mysql.connector, uuid, datetime, random

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cursor = conn.cursor()

# ─── 1. Add facility bookings (200 bookings across all 23 facilities) ─────────
cursor.execute('SELECT id FROM residents')
resident_ids = [r[0] for r in cursor.fetchall()]
cursor.execute('SELECT id FROM facilities')
facility_ids = [r[0] for r in cursor.fetchall()]

slots = ['06:00-08:00','08:00-10:00','10:00-12:00','12:00-14:00','14:00-16:00','16:00-18:00','18:00-20:00','20:00-22:00']
statuses = ['CONFIRMED','CONFIRMED','CONFIRMED','CANCELLED']
base_date = datetime.date(2026, 9, 15)
added_bookings = 0
for i in range(200):
    rid = random.choice(resident_ids)
    fid = random.choice(facility_ids)
    days_offset = random.randint(-10, 20)
    bd = base_date + datetime.timedelta(days=days_offset)
    slot = random.choice(slots)
    status = random.choice(statuses)
    try:
        cursor.execute(
            'INSERT INTO facility_bookings (resident_id, facility_id, booking_date, time_slot, status) VALUES (%s,%s,%s,%s,%s)',
            (rid, fid, bd, slot, status)
        )
        added_bookings += 1
    except: pass
conn.commit()
print(f'Added {added_bookings} facility bookings')

# ─── 2. More visitor data with varied statuses ────────────────────────────────
cursor.execute('SELECT id FROM visitors')
vis_ids = [r[0] for r in cursor.fetchall()]
cursor.execute('SELECT id FROM flats')
flat_ids = [r[0] for r in cursor.fetchall()]
purposes = [
    'Guest visit', 'Amazon delivery', 'Swiggy delivery', 'Plumber repair',
    'Electrician visit', 'Family visit', 'Cab pickup - Ola', 'Doctor consultation',
    'AC service', 'Pest control', 'Zomato delivery', 'Carpenter work',
    'Internet technician', 'Gas cylinder delivery', 'Wedding invite drop',
    'School friend visit', 'Water purifier service', 'DTH setup'
]
added_visitors = 0
for i in range(60):
    vid = random.choice(vis_ids)
    fid = random.choice(flat_ids)
    token = str(uuid.uuid4())
    hours_ago = random.randint(0, 48)
    entry = datetime.datetime.now() - datetime.timedelta(hours=hours_ago)
    status_list = ['CHECKED_IN', 'CHECKED_IN', 'EXPECTED', 'CHECKED_OUT', 'CHECKED_OUT', 'CHECKED_OUT']
    status = random.choice(status_list)
    exit_t = entry + datetime.timedelta(hours=random.randint(1, 4)) if status == 'CHECKED_OUT' else None
    purpose = random.choice(purposes)
    try:
        cursor.execute(
            'INSERT INTO visitor_logs (visitor_id, flat_id, purpose, expected_time, entry_time, exit_time, status, pass_token, recorded_by) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (vid, fid, purpose, entry, entry if status != 'EXPECTED' else None, exit_t, status, token, 1)
        )
        added_visitors += 1
    except: pass
conn.commit()
print(f'Added {added_visitors} visitor logs')

# ─── 3. Add more maintenance bills with purpose ───────────────────────────────
cursor.execute('SELECT id FROM flats')
flt_ids = [r[0] for r in cursor.fetchall()]
purposes_bill = [
    'Maintenance Charge', 'Water Charge', 'Electricity Common Area',
    'Security Charge', 'Lift Maintenance', 'Garden Maintenance',
    'Housekeeping Charge', 'Sinking Fund', 'Admin Charge',
    'Parking Fee', 'Clubhouse Maintenance', 'Swimming Pool Maintenance',
    'Gym Maintenance', 'CCTV & Security Systems', 'Fire Safety Maintenance'
]
months = ['2026-04-01','2026-05-01','2026-06-01','2026-07-01','2026-08-01','2026-09-01']
statuses_bill = ['PAID','PAID','PAID','UNPAID','OVERDUE']
added_bills = 0
for flat_id in flt_ids:
    for month in months[-3:]:  # Last 3 months only
        purpose = random.choice(purposes_bill)
        amount = random.choice([2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000])
        status = random.choice(statuses_bill)
        due = datetime.date.fromisoformat(month) + datetime.timedelta(days=15)
        try:
            cursor.execute(
                'INSERT INTO maintenance_bills (flat_id, billing_month, amount, due_date, status, purpose) VALUES (%s,%s,%s,%s,%s,%s)',
                (flat_id, month, amount, due, status, purpose)
            )
            added_bills += 1
        except: pass
conn.commit()
print(f'Added {added_bills} billing records')

# ─── 4. Add more complaints ────────────────────────────────────────────────────
cursor.execute('SELECT id FROM residents')
res_ids = [r[0] for r in cursor.fetchall()]
cursor.execute('SELECT id FROM flats')
fl_ids_list = [r[0] for r in cursor.fetchall()]
complaint_data = [
    ('Water leakage in bathroom', 'PLUMBING', 'Water leaking from ceiling. Urgent fix needed.', 'CRITICAL', 'OPEN'),
    ('Lift stuck between floors', 'ELECTRICAL', 'Lift stopped between 3rd and 4th floor.', 'CRITICAL', 'IN_PROGRESS'),
    ('Power outage in corridor', 'ELECTRICAL', 'B Block corridor lights all off.', 'HIGH', 'OPEN'),
    ('Garbage not collected', 'HOUSEKEEPING', 'Garbage in common area not collected for 3 days.', 'MEDIUM', 'OPEN'),
    ('Broken window in lobby', 'CIVIL', 'Lobby entrance window glass cracked.', 'MEDIUM', 'IN_PROGRESS'),
    ('Noise complaint from neighbours', 'NOISE', 'Loud music after midnight from A203.', 'HIGH', 'OPEN'),
    ('Street light not working', 'ELECTRICAL', 'Parking area street light is off.', 'LOW', 'RESOLVED'),
    ('Swimming pool dirty', 'MAINTENANCE', 'Pool water appears green and algae visible.', 'HIGH', 'IN_PROGRESS'),
    ('Dog barking all night', 'NOISE', 'Dog kept outside apartment barking.', 'MEDIUM', 'OPEN'),
    ('Parking violation', 'SECURITY', 'Unknown vehicle parked in my slot P-12.', 'HIGH', 'OPEN'),
    ('Internet outage', 'MAINTENANCE', 'Society broadband down since morning.', 'MEDIUM', 'RESOLVED'),
    ('Roof leakage during rain', 'CIVIL', 'Water seeping from roof during heavy rain.', 'CRITICAL', 'IN_PROGRESS'),
    ('Gym equipment broken', 'MAINTENANCE', 'Treadmill belt torn, needs replacement.', 'MEDIUM', 'OPEN'),
    ('Security camera not working', 'SECURITY', 'Camera near B Block entrance is offline.', 'HIGH', 'IN_PROGRESS'),
    ('Plumbing blockage', 'PLUMBING', 'Kitchen drain completely blocked.', 'HIGH', 'RESOLVED'),
    ('AC not cooling', 'MAINTENANCE', 'Common area AC in lobby not cooling.', 'LOW', 'OPEN'),
    ('Fire alarm malfunction', 'ELECTRICAL', 'Fire alarm beeping randomly at night.', 'CRITICAL', 'IN_PROGRESS'),
    ('Gate sensor broken', 'SECURITY', 'Main gate sensor not detecting cards.', 'HIGH', 'OPEN'),
    ('Pest infestation in basement', 'HOUSEKEEPING', 'Rats seen in basement parking area.', 'HIGH', 'OPEN'),
    ('Water tank cleaning overdue', 'MAINTENANCE', 'Overhead tank not cleaned in 6 months.', 'MEDIUM', 'OPEN'),
]
added_complaints = 0
for title, cat, desc, priority, status in complaint_data:
    rid = random.choice(res_ids)
    fid = random.choice(fl_ids_list)
    days_ago = random.randint(1, 30)
    created = datetime.datetime.now() - datetime.timedelta(days=days_ago)
    resolved = created + datetime.timedelta(days=2) if status == 'RESOLVED' else None
    sla = 1 if days_ago > 7 and status == 'OPEN' else 0
    try:
        cursor.execute(
            'INSERT INTO complaints (resident_id, flat_id, title, category, description, priority, status, resolved_date, created_at, sla_breached) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (rid, fid, title, cat, desc, priority, status, resolved, created, sla)
        )
        added_complaints += 1
    except Exception as e:
        print(f'complaint err: {e}')
conn.commit()
print(f'Added {added_complaints} complaints')

# ─── 5. Summary ───────────────────────────────────────────────────────────────
cursor.execute('SELECT COUNT(*) FROM facility_bookings'); print(f'Total bookings: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM visitor_logs');      print(f'Total visitors: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM maintenance_bills'); print(f'Total bills: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM complaints');        print(f'Total complaints: {cursor.fetchone()[0]}')
cursor.execute("SELECT COUNT(*) FROM visitor_logs WHERE status='CHECKED_IN'"); print(f'Currently inside: {cursor.fetchone()[0]}')

cursor.close()
conn.close()
print('\nAll data seeding complete!')
