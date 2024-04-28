import requests
import psycopg2
import time

# ThingSpeak read API parameters
channel_id = ''
read_api_key = ''

# PostgreSQL connection parameters
db_host = 'localhost'
db_name = ''
db_user = ''
db_password = ''

# Connect to PostgreSQL database
conn = psycopg2.connect(host=db_host, port=5432, database=db_name, user=db_user, password=db_password)
cur = conn.cursor()

while True:
    # Fetch data from ThingSpeak channels
    url = f'https://api.thingspeak.com/channels/{channel_id}/feeds.json?api_key={read_api_key}&results=1'
    response = requests.get(url)
    data = response.json()['feeds']

    # Insert data into PostgreSQL database
    for entry in data:
        values = [entry['field1'], entry['field2'], entry['field3'], entry['field4']]
        cur.execute('INSERT INTO airquality (lpg, co2, alcohol, smoke) VALUES (%s, %s, %s, %s)', values)

    # Commit the transaction and wait for 30 minutes before fetching data again
    conn.commit()
     # Sleep for 30 minutes (30 * 60 seconds)

# Close the connection (this won't be reached in an infinite loop)
conn.close()
