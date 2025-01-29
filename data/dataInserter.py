import csv
import requests
import pandas as pd
import os 
from dotenv import load_dotenv
import time
import glob
import json

load_dotenv()
BASE_URL = os.getenv('POCKETBASE_URL')
ADMIN_EMAIL = os.getenv('POCKETBASE_ADMIN_USERNAME')
ADMIN_PASSWORD = os.getenv('POCKETBASE_ADMIN_PASSWORD')

def get_admin_token():
    """Get admin authentication token"""
    auth_data = {
        "identity": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/api/collections/_superusers/auth-with-password", json=auth_data)
    response.raise_for_status()
    return response.json()["token"]

def create_region_subregion_csv():
    # Read the country CSV file and extract unique regions and subregions
    regions = set()
    subregions = set()

    with open('data/data/country_rows.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            region = row['region']
            subregion = row['subregion']
            region_id = row['region_id']
            subregion_id = row['subregion_id']
            
            if region and region_id:  # Only add if both region and region_id exist
                regions.add((region, int(region_id)))
            
            if subregion and subregion_id:  # Only add if both subregion and subregion_id exist
                subregions.add((subregion, int(subregion_id), int(region_id)))

    # Write regions to CSV
    with open('data/data/region_rows.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['id', 'name'])
        
        # Sort regions by ID before writing
        sorted_regions = sorted(regions, key=lambda x: x[1])
        for region, region_id in sorted_regions:
            writer.writerow([region_id, region])

    # Write subregions to CSV
    with open('data/data/subregion_rows.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['id', 'name', 'region_id'])
        
        # Sort subregions by ID before writing
        sorted_subregions = sorted(subregions, key=lambda x: x[1])
        for subregion, subregion_id, region_id in sorted_subregions:
            writer.writerow([subregion_id, subregion, region_id])

    print("Created region_rows.csv and subregion_rows.csv successfully!")

def insert_region_data():
    ids = []
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    
    # Read CSV file
    with open('data/data/region_rows.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        # Iterate through rows and insert data
        for row in csv_reader:                
            data = {
                'name': row['name']
            }
            
            # Create new record
            response = requests.post(
                f"{BASE_URL}/api/collections/region/records",
                headers=headers,
                json={
                    **data
                }
                )
            response.raise_for_status()
            print(f"Created: {row['name']}")
            ids.append(response.json()['id'])
    
    # Save the mapping between original IDs and PocketBase IDs
    df = pd.read_csv('data/data/region_rows.csv')
    df['pb_id'] = ids
    df.to_csv('data/edit_data/region_rows.csv', index=False)
    print("Completed inserting/updating regions")

def insert_subregion_data():
    ids = []
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    
    # Load region ID mappings
    region_df = pd.read_csv('data/edit_data/region_rows.csv')
    region_id_map = dict(zip(region_df['id'], region_df['pb_id']))
    
    # Read subregions CSV file
    with open('data/data/subregion_rows.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        # Iterate through rows and insert data
        for row in csv_reader:
            # Map the region_id to PocketBase ID
            pb_region_id = region_id_map[int(row['region_id'])]
            
            data = {
                'name': row['name'],
                'region': pb_region_id
            }
            
            # Create new record
            response = requests.post(
                f"{BASE_URL}/api/collections/subregion/records",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            print(f"Created: {row['name']}")
            ids.append(response.json()['id'])
    
    # Save the mapping between original IDs and PocketBase IDs
    df = pd.read_csv('data/data/subregion_rows.csv')
    df['pb_id'] = ids
    df.to_csv('data/edit_data/subregion_rows.csv', index=False)
    print("Completed inserting/updating subregions")

def insert_country_data():
    ids = []
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    
    # Load region and subregion ID mappings
    region_df = pd.read_csv('data/edit_data/region_rows.csv')
    region_id_map = dict(zip(region_df['id'], region_df['pb_id']))
    
    subregion_df = pd.read_csv('data/edit_data/subregion_rows.csv')
    subregion_id_map = dict(zip(subregion_df['id'], subregion_df['pb_id']))
    
    # Read CSV file
    with open('data/data/country_rows.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        # Iterate through rows and insert data
        for row in csv_reader:
            # Map the region_id and subregion_id to PocketBase IDs
            try:
                pb_region_id = region_id_map[int(row['region_id'])]
            except ValueError:
                pb_region_id = None
            
            try:
                pb_subregion_id = subregion_id_map[int(row['subregion_id'])]
            except ValueError:
                pb_subregion_id = None
            
            data = {
                'name': row['name'],
                'native': row['native'],
                'region': pb_region_id,
                'subregion': pb_subregion_id,
                'iso2': row['iso2'],
                'iso3': row['iso3'],
                'numeric_code': row['numeric_code'],
                'phone_code': row['phone_code'],
                'capital': row['capital'],
                'currency': row['currency'],
                'currency_name': row['currency_name'],
                'currency_symbol': row['currency_symbol'],
                'tld': row['tld'],
                'nationality': row['nationality'],
                'timezones': row['timezones'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'emoji': row['emoji'],
                'emojiU': row['emojiU']
            }
            
            # Create new record
            response = requests.post(
                f"{BASE_URL}/api/collections/country/records",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            print(f"Created: {row['name']}")
            ids.append(response.json()['id'])
    
    # Save the mapping between original IDs and PocketBase IDs
    df = pd.read_csv('data/data/country_rows.csv')
    df['pb_id'] = ids
    df.to_csv('data/edit_data/country_rows.csv', index=False)
    print("Completed inserting/updating countries")

def insert_state_data():
    ids = []
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    
    # Load country ID mapping
    country_df = pd.read_csv('data/edit_data/country_rows.csv')
    country_id_map = dict(zip(country_df['id'], country_df['pb_id']))
    
    # Read CSV file
    with open('data/data/state_rows.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        # Iterate through rows and insert data
        for row in csv_reader:
            # Map the country_id to PocketBase ID
            try:
                pb_country_id = country_id_map[int(row['country_id'])]
            except ValueError:
                pb_country_id = None
                
            data = {
                'name': row['name'],
                'country': pb_country_id,
                'state_code': row['state_code'],
                'type': row['type'] if 'type' in row else None
            }
            
            # Create new record
            response = requests.post(
                f"{BASE_URL}/api/collections/state/records",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            print(f"Created: {row['name']}")
            ids.append(response.json()['id'])
    
    # Save the mapping between original IDs and PocketBase IDs
    df = pd.read_csv('data/data/state_rows.csv')
    df['pb_id'] = ids
    df.to_csv('data/edit_data/state_rows.csv', index=False)
    print("Completed inserting/updating states")

def insert_city_data(start_row=0, end_row=None):
    ids = []
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    
    # Load state and country ID mappings
    state_df = pd.read_csv('data/edit_data/state_rows.csv')
    state_id_map = dict(zip(state_df['id'], state_df['pb_id']))
    
    country_df = pd.read_csv('data/edit_data/country_rows.csv')
    country_id_map = dict(zip(country_df['id'], country_df['pb_id']))
    
    # Read CSV file
    with open('data/data/city_rows.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        rows = list(csv_reader)
        
        # Slice rows based on start and end parameters
        if end_row is None:
            end_row = len(rows)
        rows_to_process = rows[start_row:end_row]
        
        # Iterate through selected rows and insert data
        for row in rows_to_process:
            # Map the state_id and country_id to PocketBase IDs
            try:
                pb_state_id = state_id_map[int(row['state_id'])]
            except ValueError:
                pb_state_id = None
                
            try:
                pb_country_id = country_id_map[int(row['country_id'])]
            except ValueError:
                pb_country_id = None
                
            data = {
                'name': row['name'],
                'state': pb_state_id,
                'country': pb_country_id,
                'latitude': float(row['latitude']) if row['latitude'] else None,
                'longitude': float(row['longitude']) if row['longitude'] else None,
                'wikiDataId': row['wikiDataId'],
                'unaccented_name': row['unaccent_name']
            }
            
            max_retries = 3
            retry_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
                    # Create new record
                    response = requests.post(
                        f"{BASE_URL}/api/collections/city/records",
                        headers=headers,
                        json=data
                    )
                    response.raise_for_status()
                    ids.append(response.json()['id'])
                    break
                except requests.exceptions.ConnectionError:
                    if attempt < max_retries - 1:
                        print(f"Connection error, retrying in {retry_delay} seconds...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        print(f"Failed to insert city {data['name']} after {max_retries} attempts")
                        raise
    
    # Save the mapping between original IDs and PocketBase IDs
    df = pd.read_csv('data/data/city_rows.csv').iloc[start_row:end_row]
    df['pb_id'] = ids
    
    # Check if file exists and append or create new
    output_file = 'data/edit_data/city_rows.csv'
    if os.path.exists(output_file):
        existing_df = pd.read_csv(output_file)
        combined_df = pd.concat([existing_df, df], ignore_index=True)
        combined_df.to_csv(output_file, index=False)
    else:
        df.to_csv(output_file, index=False)
        
    print(f"Completed inserting/updating cities from row {start_row} to {end_row}")

def insert_city_data_all():
    # Read the CSV to get total number of rows
    df = pd.read_csv('data/data/city_rows.csv')
    total_rows = len(df)
    chunk_size = 12000
    
    # Process in chunks of 12000
    for start in range(0, total_rows, chunk_size):
        end = min(start + chunk_size, total_rows)
        print(f"Processing rows {start} to {end}")
        insert_city_data(start_row=start, end_row=end)
        time.sleep(60)

def insert_geojson_data(type: str):
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }
    #Read all geojson files in data/geoJson/WithStates and data/geoJson/Outline
    data = glob.glob(f'data/geoJson/{type}/*.geojson')
    for file in data:
        # Get the country ISO2 from the file name
        country_iso2 = file.split('\\')[-1].split('.')[0].upper()
        #Get country id from pocketbase
        country_id = requests.get(f"{BASE_URL}/api/collections/country/records?filter=iso2='{country_iso2}'", headers=headers)
        country_id = country_id.json()["items"][0]["id"]
        #Insert the geojson file into the country
        with open(file, 'r') as f:
            geojson_data = json.load(f)
            data = {
                'country': country_id,
                'json': geojson_data,
                'type': type
            }
            
            # Create new record
            response = requests.post(
                f"{BASE_URL}/api/collections/geo_json/records",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            print(f"Created: {country_iso2}")

def main():
    #create_region_subregion_csv()
    #insert_region_data()
    #insert_subregion_data()
    #insert_country_data()
    #insert_state_data()
    #insert_city_data_all()
    insert_geojson_data('Outline')
    insert_geojson_data('WithStates')

if __name__ == "__main__":
    main()
