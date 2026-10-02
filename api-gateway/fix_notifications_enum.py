import mysql.connector
conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor()

# 1. Check current ENUM values for notifications.type
cur.execute("SHOW COLUMNS FROM notifications LIKE 'type'")
row = cur.fetchone()
print("Current type column:", row)

# 2. Alter to add missing values
alter_sql = """
ALTER TABLE notifications 
MODIFY COLUMN type ENUM(
    'BILLING', 'COMPLAINT', 'VISITOR', 'NOTICE', 'GENERAL',
    'FACILITY_BOOKING', 'COMPLAINT_UPDATED', 'VISITOR_ARRIVAL', 
    'PAYMENT_DUE', 'ANNOUNCEMENT', 'SECURITY_ALERT', 'SYSTEM'
) NOT NULL DEFAULT 'GENERAL'
"""
cur.execute(alter_sql)
conn.commit()
print("notifications.type ENUM updated successfully")

# 3. Verify
cur.execute("SHOW COLUMNS FROM notifications LIKE 'type'")
print("Updated type column:", cur.fetchone())
conn.close()
