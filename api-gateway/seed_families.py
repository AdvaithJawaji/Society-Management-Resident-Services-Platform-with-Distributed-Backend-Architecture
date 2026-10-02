import mysql.connector
import random

conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor(dictionary=True)

# Get all flats
cur.execute("SELECT id, flat_number, block FROM flats")
flats = cur.fetchall()

# Rich Indian names for families
FIRST_NAMES_M = ["Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Advik", "Kabir", "Ansh", "Rudra", "Dhruv", "Ishaan", "Virat", "Arjun", "Sai", "Ayaan", "Krishna", "Rohan", "Yash", "Rahul", "Aditya", "Amit", "Ravi", "Sanjay", "Suresh", "Ramesh", "Mukesh", "Rajesh"]
FIRST_NAMES_F = ["Priya", "Neha", "Pooja", "Aarti", "Kavita", "Sunita", "Anita", "Riya", "Sneha", "Kriti", "Shruti", "Swati", "Nisha", "Megha", "Shikha", "Jyoti", "Rekha", "Sushma", "Geeta", "Seema", "Shalini", "Preeti", "Kiran", "Nandini"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Kumar", "Das", "Kaur", "Gupta", "Yadav", "Verma", "Chauhan", "Joshi", "Reddy", "Nair", "Iyer", "Pillai", "Bose", "Banerjee", "Chatterjee", "Mishra", "Pandey", "Shukla", "Tiwari", "Yadav", "Bhatia", "Kapoor", "Malhotra", "Agarwal", "Jain", "Shah", "Desai"]

def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"

added = 0
for flat in flats:
    # Let's add 2-3 more residents to each flat to make it feel like a family/shared apartment
    num_to_add = random.randint(2, 4)
    family_name = random.choice(LAST_NAMES)
    
    for _ in range(num_to_add):
        # 50/50 chance for male/female name
        if random.random() > 0.5:
            first = random.choice(FIRST_NAMES_M)
        else:
            first = random.choice(FIRST_NAMES_F)
            
        name = f"{first} {family_name}"
        phone = generate_phone()
        
        flat_num = flat['flat_number'].lower().replace('-', '_')
        # make username unique by appending a random number
        username = f"res_{flat_num}_{random.randint(100, 999)}"
        
        # Create user
        cur.execute("""
            INSERT INTO users (username, password_hash, role_id, created_at) 
            VALUES (%s, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uHnmrm9gfG', 2, NOW())
        """, (username,))
        new_uid = cur.lastrowid
        
        # Create resident
        cur.execute("""
            INSERT INTO residents (user_id, flat_id, name, phone, email, move_in_date) 
            VALUES (%s, %s, %s, %s, %s, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*1000) DAY))
        """, (new_uid, flat['id'], name, phone, f"{first.lower()}.{family_name.lower()}@email.com"))
        
        added += 1

conn.commit()
print(f"Added {added} new residents across {len(flats)} flats!")

cur.execute("SELECT COUNT(*) as total FROM residents")
print(f"Total residents in DB now: {cur.fetchone()['total']}")
conn.close()
