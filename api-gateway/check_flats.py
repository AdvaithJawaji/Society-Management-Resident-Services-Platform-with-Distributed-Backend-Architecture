import mysql.connector
import random

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor(dictionary=True)

# First, check actual flat IDs and numbers in DB
cur.execute("SELECT id, flat_number FROM flats ORDER BY flat_number")
flats = cur.fetchall()
print("Flats in DB:")
for f in flats:
    print(f"  id={f['id']}, flat_number={f['flat_number']}")

# Check users table to understand structure
cur.execute("SELECT id, username FROM users LIMIT 5")
print("\nSample users:", cur.fetchall())

# Check residents table
cur.execute("SELECT id, name, flat_id, user_id FROM residents LIMIT 5")
print("\nSample residents:", cur.fetchall())

conn.close()
