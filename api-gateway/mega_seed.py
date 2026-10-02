import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cursor = conn.cursor()

PASSWORD_HASH = '$2b$10$O/r1pmgcGhcbNo7FHQu0meUoj3vT8RsJ5EShXtDHd2yKJslrLaaGG'

print("Step 1: Altering tables for new columns...")
try:
    cursor.execute("ALTER TABLE vehicles ADD COLUMN parking_slot VARCHAR(20) NULL")
    print(" - Added parking_slot to vehicles")
except: print(" - parking_slot already exists")

try:
    cursor.execute("ALTER TABLE feedback ADD COLUMN complaint_id INT NULL")
    print(" - Added complaint_id to feedback")
except: print(" - complaint_id already exists")

conn.commit()

print("Step 2: Inserting Flats...")
flats = []
for block in ['A', 'B', 'C']:
    for num in range(101, 112):
        flats.append((f'{block}-{num}', block))

for f in flats:
    try:
        cursor.execute("INSERT INTO flats (flat_number, block) VALUES (%s, %s)", f)
    except: pass
conn.commit()

cursor.execute("SELECT id, flat_number FROM flats ORDER BY id")
flat_rows = cursor.fetchall()
print(f"  Total flats: {len(flat_rows)}")

print("Step 3: Inserting Resident Users...")
resident_data = [
    ("Aarav Sharma", "9876501001", "aarav@email.com", "aarav_sharma"),
    ("Priya Nair", "9876501002", "priya@email.com", "priya_nair"),
    ("Rohan Mehta", "9876501003", "rohan@email.com", "rohan_mehta"),
    ("Ananya Singh", "9876501004", "ananya@email.com", "ananya_singh"),
    ("Kiran Patel", "9876501005", "kiran@email.com", "kiran_patel"),
    ("Divya Reddy", "9876501006", "divya@email.com", "divya_reddy"),
    ("Arjun Kumar", "9876501007", "arjun@email.com", "arjun_kumar"),
    ("Sneha Iyer", "9876501008", "sneha@email.com", "sneha_iyer"),
    ("Vikram Joshi", "9876501009", "vikram@email.com", "vikram_joshi"),
    ("Meera Pillai", "9876501010", "meera@email.com", "meera_pillai"),
    ("Rahul Verma", "9876501011", "rahul@email.com", "rahul_verma"),
    ("Kavya Bose", "9876501012", "kavya@email.com", "kavya_bose"),
    ("Siddharth Rao", "9876501013", "siddharth@email.com", "siddharth_rao"),
    ("Nisha Gupta", "9876501014", "nisha@email.com", "nisha_gupta"),
    ("Aditya Tiwari", "9876501015", "aditya@email.com", "aditya_tiwari"),
    ("Pooja Malhotra", "9876501016", "pooja@email.com", "pooja_malhotra"),
    ("Suresh Bhat", "9876501017", "suresh@email.com", "suresh_bhat"),
    ("Rekha Krishnan", "9876501018", "rekha@email.com", "rekha_krishnan"),
    ("Manish Pandey", "9876501019", "manish@email.com", "manish_pandey"),
    ("Sunita Choudhary", "9876501020", "sunita@email.com", "sunita_choudhary"),
    ("Nikhil Aggarwal", "9876501021", "nikhil@email.com", "nikhil_aggarwal"),
    ("Shreya Das", "9876501022", "shreya@email.com", "shreya_das"),
    ("Tarun Kapoor", "9876501023", "tarun@email.com", "tarun_kapoor"),
    ("Anjali Mishra", "9876501024", "anjali@email.com", "anjali_mishra"),
    ("Dev Saxena", "9876501025", "dev@email.com", "dev_saxena"),
]

cursor.execute("SELECT id FROM roles WHERE role_name='RESIDENT'")
resident_role_id = cursor.fetchone()[0]
new_user_ids = []
for name, phone, email, username in resident_data:
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, role_id) VALUES (%s, %s, %s)",
            (username, PASSWORD_HASH, resident_role_id)
        )
        new_user_ids.append(cursor.lastrowid)
    except:
        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        row = cursor.fetchone()
        if row: new_user_ids.append(row[0])

conn.commit()
print(f"  Inserted/found {len(new_user_ids)} users")

print("Step 4: Inserting Residents...")
cursor.execute("SELECT id FROM flats ORDER BY id")
all_flat_ids = [r[0] for r in cursor.fetchall()]

resident_ids = []
for i, (user_id, (name, phone, email, _)) in enumerate(zip(new_user_ids, resident_data)):
    flat_id = all_flat_ids[i % len(all_flat_ids)]
    try:
        cursor.execute(
            "INSERT INTO residents (user_id, flat_id, name, phone, email) VALUES (%s, %s, %s, %s, %s)",
            (user_id, flat_id, name, phone, email)
        )
        resident_ids.append(cursor.lastrowid)
    except:
        cursor.execute("SELECT id FROM residents WHERE user_id=%s", (user_id,))
        row = cursor.fetchone()
        if row: resident_ids.append(row[0])

conn.commit()
print(f"  Inserted/found {len(resident_ids)} residents")

# Get all resident ids
cursor.execute("SELECT id, flat_id FROM residents ORDER BY id")
all_residents = cursor.fetchall()
all_resident_ids = [r[0] for r in all_residents]
all_resident_flat_map = {r[0]: r[1] for r in all_residents}

print("Step 5: Inserting Bills...")
import datetime
months = []
for y in [2024, 2025]:
    for m in range(1, 13):
        months.append(datetime.date(y, m, 1))
months.append(datetime.date(2026, 1, 1))
months.append(datetime.date(2026, 2, 1))
months.append(datetime.date(2026, 3, 1))

statuses = ['PAID', 'PAID', 'PAID', 'UNPAID', 'OVERDUE']
amounts = [2500, 3000, 3500, 2800, 4000, 3200]
bill_count = 0
for i, res_id in enumerate(all_resident_ids[:20]):
    flat_id = all_resident_flat_map[res_id]
    for j, month in enumerate(months[:6]):
        status = statuses[(i + j) % len(statuses)]
        amount = amounts[(i + j) % len(amounts)]
        due_date = month + datetime.timedelta(days=15)
        try:
            cursor.execute(
                "INSERT INTO maintenance_bills (flat_id, billing_month, amount, due_date, status) VALUES (%s, %s, %s, %s, %s)",
                (flat_id, month, amount, due_date, status)
            )
            bill_count += 1
        except: pass
conn.commit()
print(f"  Inserted {bill_count} bills")

print("Step 6: Inserting Complaints...")
complaints_data = [
    ("Water leakage in bathroom", "MAINTENANCE", "CRITICAL", "Severe water leakage from pipe causing flooding in bathroom"),
    ("Lift not working", "INFRASTRUCTURE", "HIGH", "Elevator in Block A has been non-functional since Monday"),
    ("Corridor lights broken", "ELECTRICAL", "MEDIUM", "Multiple corridor lights on 3rd floor are not working"),
    ("Garden maintenance needed", "MAINTENANCE", "LOW", "Garden area needs regular trimming and watering"),
    ("Parking area flooding", "INFRASTRUCTURE", "CRITICAL", "Rainwater accumulating in basement parking - cars damaged"),
    ("Gym equipment broken", "AMENITIES", "HIGH", "Treadmill and cycle machine are out of order"),
    ("Sewage smell in lobby", "SANITATION", "HIGH", "Strong sewage smell emanating from ground floor lobby"),
    ("Security guard absent", "SECURITY", "CRITICAL", "Night shift security guard not present from 11 PM to 6 AM"),
    ("Internet outage", "INFRASTRUCTURE", "HIGH", "Society WiFi down since 3 days - affects work from home"),
    ("Swimming pool dirty", "AMENITIES", "MEDIUM", "Pool water is greenish and has not been cleaned this week"),
    ("Noisy neighbours", "GENERAL", "LOW", "Residents in B-205 play loud music past midnight"),
    ("Stray dogs in compound", "SECURITY", "MEDIUM", "Multiple stray dogs entering compound causing fear"),
    ("Generator not starting", "ELECTRICAL", "HIGH", "Power backup generator fails to start during outages"),
    ("Terrace door unlocked", "SECURITY", "MEDIUM", "Terrace access door left unlocked posing safety risk"),
    ("Roof leakage", "MAINTENANCE", "HIGH", "Water dripping from roof into C-301 flat during rains"),
    ("Broken tiles in lobby", "INFRASTRUCTURE", "MEDIUM", "Cracked tiles in main lobby are a trip hazard"),
    ("Pest infestation", "SANITATION", "HIGH", "Cockroach and rat infestation in Block B utility area"),
    ("Fire extinguisher expired", "SAFETY", "CRITICAL", "Fire extinguishers on floors 2-5 are past expiry date"),
    ("CCTV camera down", "SECURITY", "HIGH", "CCTV at main gate and parking not recording"),
    ("Children play area damaged", "AMENITIES", "MEDIUM", "Swing and see-saw in children's play area are broken"),
    ("Water pressure low", "MAINTENANCE", "MEDIUM", "Very low water pressure in Block C top floors during morning"),
    ("Garbage collection delayed", "SANITATION", "LOW", "Society garbage pickup missed for 3 days"),
    ("Intercom not working", "INFRASTRUCTURE", "MEDIUM", "Intercom system in Block A flats non-functional"),
    ("Power fluctuation", "ELECTRICAL", "HIGH", "Frequent power fluctuations damaging appliances in Block B"),
    ("Gate motor broken", "INFRASTRUCTURE", "HIGH", "Main gate motor not working - gate stuck in manual mode"),
    ("Plumbing leak common area", "MAINTENANCE", "MEDIUM", "Pipe leak in 2nd floor common area corridor"),
    ("Street lights out", "ELECTRICAL", "MEDIUM", "Three street lights in the compound not working at night"),
    ("Tennis court net damaged", "AMENITIES", "LOW", "Tennis court net is torn and needs replacement"),
    ("Visitor parking blocked", "INFRASTRUCTURE", "LOW", "Visitors have no space to park as residents occupying visitor slots"),
    ("Rooftop antenna issue", "INFRASTRUCTURE", "MEDIUM", "DTH antenna on rooftop damaged by recent storm"),
]

statuses_complaint = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'OPEN', 'IN_PROGRESS']
comp_count = 0
for i, (title, category, priority, description) in enumerate(complaints_data):
    res_id = all_resident_ids[i % len(all_resident_ids)]
    flat_id = all_resident_flat_map[res_id]
    status = statuses_complaint[i % len(statuses_complaint)]
    resolved_date = datetime.datetime.now() - datetime.timedelta(days=i) if status == 'RESOLVED' else None
    try:
        cursor.execute(
            "INSERT INTO complaints (resident_id, flat_id, title, category, description, priority, status, resolved_date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (res_id, flat_id, title, category, description, priority, status, resolved_date)
        )
        comp_count += 1
    except Exception as e: print(f"Complaint error: {e}")
conn.commit()
print(f"  Inserted {comp_count} complaints")

print("Step 7: Inserting Visitors...")
visitors_data = [
    ("Rahul Sharma", "9111000001"),
    ("Priya Kapoor", "9111000002"),
    ("Amit Desai", "9111000003"),
    ("Sunita Roy", "9111000004"),
    ("Ramesh Yadav", "9111000005"),
    ("Geeta Pillai", "9111000006"),
    ("Vikram Singh", "9111000007"),
    ("Kaveri Nair", "9111000008"),
    ("Santosh Kumar", "9111000009"),
    ("Meena Bose", "9111000010"),
    ("Rajan Tiwari", "9111000011"),
    ("Lakshmi Gupta", "9111000012"),
    ("Ajay Verma", "9111000013"),
    ("Deepa Menon", "9111000014"),
    ("Sunil Chandra", "9111000015"),
]
import uuid
vis_log_count = 0
for i, (name, phone) in enumerate(visitors_data):
    try:
        cursor.execute("INSERT INTO visitors (name, phone) VALUES (%s, %s)", (name, phone))
        vis_id = cursor.lastrowid
    except:
        cursor.execute("SELECT id FROM visitors WHERE phone=%s", (phone,))
        row = cursor.fetchone()
        if not row: continue
        vis_id = row[0]
    
    flat_id = all_flat_ids[i % len(all_flat_ids)]
    token = str(uuid.uuid4())
    entry = datetime.datetime.now() - datetime.timedelta(days=i, hours=2)
    exit_t = entry + datetime.timedelta(hours=2)
    statuses_vis = ['CHECKED_OUT', 'CHECKED_IN', 'EXPECTED', 'CHECKED_OUT']
    purposes = ['Family visit', 'Delivery - Amazon', 'Plumber service', 'Guest visit', 'Cab pickup', 'House help', 'Courier delivery', 'Friend visit']
    try:
        cursor.execute(
            "INSERT INTO visitor_logs (visitor_id, flat_id, purpose, expected_time, entry_time, exit_time, status, pass_token) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (vis_id, flat_id, purposes[i % len(purposes)], entry, entry, exit_t if statuses_vis[i%4]=='CHECKED_OUT' else None, statuses_vis[i%4], token)
        )
        vis_log_count += 1
    except Exception as e: print(f"Visitor log error: {e}")
conn.commit()
print(f"  Inserted {vis_log_count} visitor logs")

print("Step 8: Inserting Vehicles with Parking Slots...")
vehicles_data = [
    ("KA01AB1234", "4_WHEELER", "P-01"),
    ("KA02CD5678", "4_WHEELER", "P-02"),
    ("MH01EF9012", "4_WHEELER", "P-03"),
    ("TN03GH3456", "2_WHEELER", "P-04"),
    ("DL04IJ7890", "4_WHEELER", "P-05"),
    ("MH02KL1234", "2_WHEELER", "P-06"),
    ("KA05MN5678", "4_WHEELER", "P-07"),
    ("TS01OP9012", "4_WHEELER", "P-08"),
    ("AP02QR3456", "2_WHEELER", "P-09"),
    ("GJ01ST7890", "4_WHEELER", "P-10"),
    ("RJ02UV1234", "2_WHEELER", "P-11"),
    ("UP03WX5678", "4_WHEELER", "P-12"),
    ("HR04YZ9012", "4_WHEELER", "P-13"),
    ("PB05AB3456", "2_WHEELER", "P-14"),
    ("WB01CD7890", "4_WHEELER", "P-15"),
    ("OR02EF1234", "2_WHEELER", "P-16"),
    ("MP03GH5678", "4_WHEELER", "P-17"),
    ("CG01IJ9012", "4_WHEELER", "P-18"),
    ("KL02KL3456", "2_WHEELER", "P-19"),
    ("TN04MN7890", "4_WHEELER", "P-20"),
]
veh_count = 0
for i, (number, vtype, slot) in enumerate(vehicles_data):
    res_id = all_resident_ids[i % len(all_resident_ids)]
    try:
        cursor.execute(
            "INSERT IGNORE INTO vehicles (resident_id, vehicle_number, type, parking_slot) VALUES (%s,%s,%s,%s)",
            (res_id, number, vtype, slot)
        )
        veh_count += 1
    except Exception as e: print(f"Vehicle error: {e}")
conn.commit()
print(f"  Inserted {veh_count} vehicles")

print("Step 9: Inserting more Facility Bookings...")
cursor.execute("SELECT id FROM facilities")
facility_ids = [r[0] for r in cursor.fetchall()]
if not facility_ids: facility_ids = [1, 2, 3, 4]

slots_list = ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 22:00']
booking_statuses = ['CONFIRMED', 'CONFIRMED', 'CANCELLED', 'CONFIRMED']
fb_count = 0
for i, res_id in enumerate(all_resident_ids[:15]):
    fac_id = facility_ids[i % len(facility_ids)]
    bdate = datetime.date.today() + datetime.timedelta(days=i % 14)
    slot = slots_list[i % len(slots_list)]
    bstatus = booking_statuses[i % len(booking_statuses)]
    try:
        cursor.execute(
            "INSERT INTO facility_bookings (resident_id, facility_id, booking_date, time_slot, status) VALUES (%s,%s,%s,%s,%s)",
            (res_id, fac_id, bdate, slot, bstatus)
        )
        fb_count += 1
    except Exception as e: print(f"Booking error: {e}")
conn.commit()
print(f"  Inserted {fb_count} facility bookings")

print("Step 10: Inserting Feedback...")
feedback_comments = [
    (5, "Excellent response! Issue resolved within 2 hours. Very impressed."),
    (4, "Good service, took a day but resolved properly."),
    (3, "Average response. Took longer than expected."),
    (5, "Outstanding! The maintenance team was very professional and courteous."),
    (4, "Quick response, satisfied with the resolution."),
    (2, "Took too long, had to follow up multiple times."),
    (5, "Superb handling of the complaint. Highly recommend!"),
    (4, "Good job by the team. Issue sorted in timely manner."),
    (3, "Decent response but could be improved."),
    (5, "Very quick and professional. 5 stars!"),
]
feedback_count = 0
for i, (rating, comment) in enumerate(feedback_comments):
    res_id = all_resident_ids[i % len(all_resident_ids)]
    try:
        cursor.execute(
            "INSERT INTO feedback (resident_id, rating, comments) VALUES (%s,%s,%s)",
            (res_id, rating, comment)
        )
        feedback_count += 1
    except Exception as e: print(f"Feedback error: {e}")
conn.commit()
print(f"  Inserted {feedback_count} feedback records")

print("Step 11: Inserting more Events...")
events_data = [
    ("Diwali Celebration 2026", "Grand Diwali celebration with rangoli competition, lighting ceremony and dinner", datetime.datetime.now() + datetime.timedelta(days=12), "Community Hall"),
    ("Annual AGM Meeting", "Annual General Body Meeting for budget approval and committee elections", datetime.datetime.now() + datetime.timedelta(days=7), "Clubhouse Seminar Room"),
    ("Children's Day Funfest", "Fun activities, drawing competition and games for kids aged 3-15", datetime.datetime.now() + datetime.timedelta(days=20), "Children's Play Area"),
    ("Yoga & Wellness Camp", "Morning yoga and meditation sessions by certified instructor - 5 days camp", datetime.datetime.now() + datetime.timedelta(days=3), "Terrace Garden"),
    ("Blood Donation Camp", "Free health checkup and blood donation drive in association with Apollo Hospital", datetime.datetime.now() + datetime.timedelta(days=15), "Main Lobby"),
    ("Independence Day Celebration", "Flag hoisting, cultural program and breakfast for all residents", datetime.datetime.now() + datetime.timedelta(days=25), "Society Grounds"),
]
for title, desc, edate, loc in events_data:
    try:
        cursor.execute("INSERT IGNORE INTO events (title, description, event_date, location) VALUES (%s,%s,%s,%s)", (title, desc, edate, loc))
    except: pass
conn.commit()

print("Step 12: Inserting more Service Providers...")
providers_data = [
    ("Raju Plumber Services", "PLUMBER", "9876500001", 4.8),
    ("Sharma Electricals & Co", "ELECTRICIAN", "9876500002", 4.5),
    ("Sita Bai Cleaning", "MAID", "9876500003", 4.9),
    ("Expert Carpentry Works", "CARPENTER", "9876500004", 4.3),
    ("SafeGuard Security", "SECURITY", "9876500005", 4.7),
    ("QuickFix Plumbing", "PLUMBER", "9876500006", 4.2),
    ("BrightSpark Electricals", "ELECTRICIAN", "9876500007", 4.6),
    ("CleanHome Maids", "MAID", "9876500008", 4.8),
]
for name, cat, phone, rating in providers_data:
    try:
        cursor.execute("INSERT IGNORE INTO service_providers (name, category, phone, rating) VALUES (%s,%s,%s,%s)", (name, cat, phone, rating))
    except: pass
conn.commit()

print("Step 13: Inserting more Facilities...")
facilities_extra = [
    ("Swimming Pool", "Olympic-size swimming pool with lifeguard. Open 6 AM - 10 PM."),
    ("Gymnasium", "Fully equipped gym with treadmills, weights, and yoga space."),
    ("Tennis Court", "Professional hard court with lighting for evening games."),
    ("Party Hall", "Spacious hall with AC, projector, and catering kitchen. Capacity: 200."),
    ("Badminton Court", "Indoor synthetic court with proper lighting."),
    ("Reading Room", "Quiet library with newspapers, magazines, and books."),
]
for name, desc in facilities_extra:
    try:
        cursor.execute("INSERT IGNORE INTO facilities (name, description) VALUES (%s,%s)", (name, desc))
    except: pass
conn.commit()

print("\n✅ All seeding complete!")
cursor.execute("SELECT COUNT(*) FROM users"); print(f"  Total Users: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM residents"); print(f"  Total Residents: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM maintenance_bills"); print(f"  Total Bills: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM complaints"); print(f"  Total Complaints: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM visitors"); print(f"  Total Visitors: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM vehicles"); print(f"  Total Vehicles: {cursor.fetchone()[0]}")
cursor.close()
conn.close()
