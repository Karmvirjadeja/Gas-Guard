import requests
import psycopg2

# ThingSpeak read API parameters
channel_id = '2525394'
read_api_key = 'LYTGWKDDMMHGSTHD'
results = '2'

# PostgreSQL connection parameters
db_host = 'localhost'
db_name = 'AirMonitoring'
db_user = 'postgres'
db_password = 'K@rmvir20'

# Connect to PostgreSQL database
conn = psycopg2.connect(host=db_host, database=db_name, user=db_user, password=db_password)
cur = conn.cursor()

# Fetch data from ThingSpeak channels
url = f'https://api.thingspeak.com/channels/{channel_id}/feeds.json?api_key={read_api_key}&results={results}'
response = requests.get(url)
data = response.json()['feeds']

# Insert data into PostgreSQL database
for entry in data:
    lpg = float(entry['field1'])
    co2 = float(entry['field2'])
    alcohol = float(entry['field3'])
    smoke = float(entry['field4'])
    cur.execute('INSERT INTO airquality (lpg, co2, alcohol, smoke) VALUES (%s, %s, %s, %s)', (lpg, co2, alcohol, smoke))

# Commit the transaction and close the connection
conn.commit()
conn.close()
