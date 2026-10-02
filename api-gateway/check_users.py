import mysql.connector
conn = mysql.connector.connect(host='localhost', user='root', password='root', database='society_management')
cur = conn.cursor(dictionary=True)
cur.execute("SELECT id, username, role_name FROM users LIMIT 15")
for r in cur.fetchall():
    print(r)
