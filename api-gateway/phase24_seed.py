import mysql.connector, uuid, datetime

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cursor = conn.cursor()

# Add purpose to bills
try:
    cursor.execute('ALTER TABLE maintenance_bills ADD COLUMN purpose VARCHAR(100) DEFAULT NULL')
    print('Added purpose to bills')
except: print('purpose already exists')

# Insert comprehensive facilities
facilities_data = [
  ('Swimming Pool', '6:00 AM - 9:00 PM | Cap:30 | Olympic-size pool with lifeguard. Children area 4-6 PM daily.'),
  ('Fitness Center', '5:00 AM - 10:00 PM | Cap:25 | Fully equipped gym with treadmills, weights, yoga space. Personal trainer Tue/Thu.'),
  ('Clubhouse', '9:00 AM - 11:00 PM | Cap:80 | AC hall with projector. Parties, meetings & celebrations. Fee: Rs 2000.'),
  ('Badminton Court', '6:00 AM - 10:00 PM | Cap:8 | Indoor synthetic court with professional lighting. Rackets available.'),
  ('Tennis Court', '6:00 AM - 10:00 PM | Cap:4 | Hard court with floodlights. Coaching every Saturday 7-9 AM.'),
  ('Yoga Room', '5:30 AM - 8:00 PM | Cap:20 | Peaceful meditation room. Classes Mon/Wed/Fri 6-7 AM.'),
  ('Children Play Area', '6:00 AM - 8:00 PM | Cap:50 | Swings, slides, sandpit. Age 2-12. Parent supervision required.'),
  ('Garden Park', '5:00 AM - 10:00 PM | Cap:100 | 2-acre landscaped garden with walking track, seating & fountain.'),
  ('Mini Theatre', '4:00 PM - 11:00 PM | Cap:40 | 4K projector Dolby sound. Movie nights & sports screenings.'),
  ('Co-Working Space', '8:00 AM - 10:00 PM | Cap:20 | High-speed WiFi, workdesks, meeting cabin, printer, coffee.'),
  ('Study Room', '6:00 AM - 10:00 PM | Cap:15 | Quiet zone with books & magazines. No phone calls allowed.'),
  ('Community Hall', '8:00 AM - 11:00 PM | Cap:150 | Large hall for AGMs, workshops, cultural events. Fee: Rs 3000.'),
  ('BBQ Area', '10:00 AM - 10:00 PM | Cap:30 | Open-air BBQ pits, outdoor seating. Charcoal provided.'),
  ('Laundry Room', '6:00 AM - 10:00 PM | Cap:10 | 5 washing machines, 3 dryers. Rs 30 per wash cycle.'),
  ('Maintenance Center', '9:00 AM - 6:00 PM | Cap:5 | Plumbing, electrical, carpentry, AC repairs. 24-hr emergency.'),
  ('Guest Apartment', '24 Hours | Cap:6 | 3 guest rooms. Book 48 hrs in advance. Fee: Rs 500/night.'),
  ('Visitor Parking', '24 Hours | Cap:20 | 20 visitor slots near main gate. Max 4 hours. Token from security.'),
  ('Car Wash Bay', '8:00 AM - 6:00 PM | Cap:3 | Car wash Rs 150, Bike wash Rs 80. 2 car + 1 bike bay.'),
  ('Pet Zone', '6:00 AM - 9:00 PM | Cap:20 | Pet play area, walking trail, washing station. Keep leashed.'),
  ('EV Charging Station', '24 Hours | Cap:4 | 4 fast-charging stations 22kW. Rs 8/unit. Book to avoid wait.'),
]
for name, desc in facilities_data:
    try:
        cursor.execute('INSERT IGNORE INTO facilities (name, description) VALUES (%s, %s)', (name, desc))
    except Exception as e: print('fac err', e)
conn.commit()
cursor.execute('SELECT COUNT(*) FROM facilities')
print(f'Total facilities: {cursor.fetchone()[0]}')

# Update bills with purposes
purposes = ['Maintenance Charge','Water Charge','Electricity Common Area','Security Charge','Lift Maintenance','Garden Maintenance','Housekeeping Charge','Sinking Fund','Admin Charge','Parking Fee','Clubhouse Maintenance','Swimming Pool Maintenance']
cursor.execute('SELECT id FROM maintenance_bills')
bill_ids = [r[0] for r in cursor.fetchall()]
for i, bid in enumerate(bill_ids):
    cursor.execute('UPDATE maintenance_bills SET purpose=%s WHERE id=%s', (purposes[i % len(purposes)], bid))
conn.commit()
print(f'Updated {len(bill_ids)} bills with purposes')

# Add more visitor data
cursor.execute('SELECT id FROM visitors')
vis_ids = [r[0] for r in cursor.fetchall()]
cursor.execute('SELECT id FROM flats')
flat_ids = [r[0] for r in cursor.fetchall()]
purposes_v = ['Guest visit', 'Delivery - Amazon', 'Repair work', 'Cab pickup', 'Family visit', 'Food delivery - Swiggy', 'Doctor visit', 'Courier - Delhivery']
added = 0
for i in range(40):
    vis_id = vis_ids[i % len(vis_ids)]
    flat_id = flat_ids[i % len(flat_ids)]
    token = str(uuid.uuid4())
    entry = datetime.datetime.now() - datetime.timedelta(hours=i % 10)
    status = ['CHECKED_IN', 'EXPECTED', 'CHECKED_OUT'][i % 3]
    exit_t = entry + datetime.timedelta(hours=2) if status == 'CHECKED_OUT' else None
    try:
        cursor.execute('INSERT INTO visitor_logs (visitor_id, flat_id, purpose, expected_time, entry_time, exit_time, status, pass_token) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)',
            (vis_id, flat_id, purposes_v[i%8], entry, entry if status != 'EXPECTED' else None, exit_t, status, token))
        added += 1
    except: pass
conn.commit()
print(f'Added {added} visitor logs')

cursor.execute('SELECT COUNT(*) FROM visitor_logs')
print(f'Total visitor logs: {cursor.fetchone()[0]}')
cursor.close()
conn.close()
print('Seeding complete!')
