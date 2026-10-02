import mysql.connector
import os

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="society_management"
)
cursor = conn.cursor()

with open('C:/Users/HP/Downloads/DBSE-Project/society-management-platform/database/ultimate_features.sql', 'r') as f:
    sql_script = f.read()

for statement in sql_script.split(';'):
    if statement.strip():
        print(f"Executing: {statement[:50]}...")
        cursor.execute(statement)
        
conn.commit()
cursor.close()
conn.close()
print("Ultimate Database schema successfully updated!")
