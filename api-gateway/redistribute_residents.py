import mysql.connector
import random

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor(dictionary=True)

# 1. Get all flats
cur.execute("SELECT id, flat_number FROM flats ORDER BY flat_number")
flats = cur.fetchall()

# 2. Get all residents
cur.execute("SELECT id, name FROM residents ORDER BY RAND()")
residents = cur.fetchall()

# 3. Distribute strictly 4-6 residents per flat
flat_index = 0
current_flat_count = 0
target_count = random.randint(4, 6)

for r in residents:
    # Update flat_id for resident
    cur.execute("UPDATE residents SET flat_id = %s WHERE id = %s", (flats[flat_index]['id'], r['id']))
    current_flat_count += 1
    
    # Move to next flat if full
    if current_flat_count >= target_count:
        flat_index = (flat_index + 1) % len(flats)
        current_flat_count = 0
        target_count = random.randint(4, 6)

conn.commit()

# Verify distribution
cur.execute("""
    SELECT f.flat_number, COUNT(r.id) as res_count
    FROM flats f
    LEFT JOIN residents r ON f.id = r.flat_id
    GROUP BY f.id
    ORDER BY f.flat_number
""")
distribution = cur.fetchall()
print("\nPerfect Distribution:")
for d in distribution:
    print(f"Flat {d['flat_number']}: {d['res_count']} residents")

conn.close()
