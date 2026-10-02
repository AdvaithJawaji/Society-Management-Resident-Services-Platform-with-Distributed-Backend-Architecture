import mysql.connector
import random

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor(dictionary=True)

# Get all vacant flats (no resident linked)
cur.execute("""
    SELECT f.id, f.flat_number, f.block FROM flats f
    LEFT JOIN residents r ON r.flat_id = f.id
    WHERE r.id IS NULL
    ORDER BY f.flat_number
""")
vacant_flats = cur.fetchall()
print(f"Found {len(vacant_flats)} vacant flats: {[f['flat_number'] for f in vacant_flats]}")

# Rich resident data for seeding
NAMES = [
    ("Ishaan Mehta", "9910001001"), ("Deepa Krishnan", "9910001002"),
    ("Rajan Tiwari", "9910001003"), ("Smita Joshi", "9910001004"),
    ("Harish Patel", "9910001005"), ("Kavitha Nair", "9910001006"),
    ("Suresh Kumar", "9910001007"), ("Anita Reddy", "9910001008"),
    ("Vikrant Singh", "9910001009"), ("Pallavi Sharma", "9910001010"),
    ("Rajesh Gupta", "9910001011"), ("Sunanda Roy", "9910001012"),
    ("Aakash Verma", "9910001013"), ("Neelam Saxena", "9910001014"),
    ("Gaurav Malhotra", "9910001015"), ("Preethi Iyer", "9910001016"),
    ("Manoj Bansal", "9910001017"), ("Rekha Sinha", "9910001018"),
    ("Sachin Bose", "9910001019"), ("Lata Choudhary", "9910001020"),
    ("Abhishek Das", "9910001021"), ("Sunita Pillai", "9910001022"),
]

added = 0
for i, flat in enumerate(vacant_flats):
    if i >= len(NAMES):
        break
    name, phone = NAMES[i]
    flat_num = flat['flat_number'].lower().replace('-', '_')
    username = f"resident_{flat_num}"
    
    # Create user
    cur.execute("""
        INSERT INTO users (username, password_hash, role_id, created_at) 
        VALUES (%s, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uHnmrm9gfG', 2, NOW())
    """, (username,))
    new_uid = cur.lastrowid
    
    # Create resident
    cur.execute("""
        INSERT INTO residents (user_id, flat_id, name, phone, email, move_in_date) 
        VALUES (%s, %s, %s, %s, %s, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*730) DAY))
    """, (new_uid, flat['id'], name, phone, f"{name.lower().replace(' ','.')}@email.com"))
    
    added += 1
    print(f"  Added {name} -> Flat {flat['flat_number']} (user: {username})")

conn.commit()
print(f"\nDone! Added {added} residents to vacant flats.")

# Final count
cur.execute("SELECT COUNT(*) as total FROM flats")
total = cur.fetchone()['total']
cur.execute("SELECT COUNT(DISTINCT flat_id) as occ FROM residents")
occ = cur.fetchone()['occ']
print(f"Flats: {total} total, {occ} occupied, {total-occ} still vacant")
conn.close()
