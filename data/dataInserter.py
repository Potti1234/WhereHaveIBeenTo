import csv
import requests
import pandas as pd
import os 
from dotenv import load_dotenv
import time
import glob
import json
import traceback

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
        # Create multipart form data with file and metadata
        files = {
            'json': (file, open(file, 'rb'), 'application/json')
        }
        data = {
            'country': country_id,
            'type': type
        }
            
        # Create new record using multipart/form-data
        response = requests.post(
            f"{BASE_URL}/api/collections/geo_json/records",
            headers=headers,
            data=data,
            files=files
        )
        response.raise_for_status()
        print(f"Created: {country_iso2}")

def enrich_geonames_cities():
    """
    Merges country_id and state_id from city_rows into the geonames dataset.

    Uses country codes for country matching and a two-step process for state matching:
    1. Rounded coordinates.
    2. Unique name within the country for remaining unmatched rows.
    """
    try:
        # Load datasets
        print("Loading datasets...")
        countries = pd.read_csv('data/edit_data/country_rows.csv', usecols=['id', 'iso2'])
        # Load necessary columns from cities, drop rows with missing essential data
        cities = pd.read_csv(
            'data/edit_data/city_rows.csv',
            usecols=['state_id', 'country_id', 'latitude', 'longitude', 'unaccent_name']
        )
        cities.dropna(subset=['latitude', 'longitude', 'unaccent_name', 'state_id', 'country_id'], inplace=True)
        cities = cities.drop_duplicates(subset=['state_id', 'country_id', 'latitude', 'longitude', 'unaccent_name'])
        # Ensure IDs are integers
        cities['state_id'] = cities['state_id'].astype(int)
        cities['country_id'] = cities['country_id'].astype(int)


        geonames = pd.read_csv('data/data/geonames-all-cities-with-a-population-1000.csv', sep=';')
        print(f"Loaded {len(geonames)} rows from geonames.")
        geonames.dropna(subset=['Coordinates', 'ASCII Name', 'Country Code'], inplace=True) # Drop rows missing essential info for matching
        print(f"{len(geonames)} geonames rows remaining after dropping NAs.")


        # Rename country ID for clarity during merge
        countries = countries.rename(columns={'id': 'country_id'})

        # 1. Add country_id to geonames
        print("Merging country information...")
        geonames_enriched = pd.merge(geonames, countries, left_on='Country Code', right_on='iso2', how='left')
        geonames_enriched = geonames_enriched.dropna(subset=['country_id']) # Remove cities from countries not in our countries list
        geonames_enriched['country_id'] = geonames_enriched['country_id'].astype(int)
        print(f"{len(geonames_enriched)} geonames rows matched with countries.")


        # 2. State Matching - Attempt 1: Coordinates
        print("Preparing coordinates...")
        # Parse geonames coordinates
        geonames_enriched[['lat_geonames', 'lon_geonames']] = geonames_enriched['Coordinates'].str.split(',', expand=True).astype(float)

        # Create rounded coordinates
        coord_precision = 5
        geonames_enriched['lat_round'] = geonames_enriched['lat_geonames'].round(coord_precision)
        geonames_enriched['lon_round'] = geonames_enriched['lon_geonames'].round(coord_precision)

        cities['lat_round'] = cities['latitude'].round(coord_precision)
        cities['lon_round'] = cities['longitude'].round(coord_precision)

        # Prepare cities lookup for coordinate merge
        cities_lookup_coords = cities[['state_id', 'country_id', 'lat_round', 'lon_round']].drop_duplicates()

        print("Attempt 1: Merging state information based on rounded coordinates...")
        geonames_merged1 = pd.merge(
            geonames_enriched,
            cities_lookup_coords,
            on=['country_id', 'lat_round', 'lon_round'],
            how='left'
        )

        # Keep only the first match if duplicates arise from coordinate rounding
        geonames_merged1 = geonames_merged1.drop_duplicates(subset=['Geoname ID'], keep='first')
        matched_coords_count = geonames_merged1['state_id'].notna().sum()
        print(f"{matched_coords_count} geonames rows matched with states via coordinates.")

        # 3. State Matching - Attempt 2: Unique Name within Country
        unmatched_mask = geonames_merged1['state_id'].isna()
        num_unmatched = unmatched_mask.sum()
        print(f"{num_unmatched} geonames rows still need state matching.")

        if num_unmatched > 0:
            print("Preparing name lookup for remaining rows...")
            # Prepare city names (lowercase, strip whitespace)
            cities['unaccent_name_clean'] = cities['unaccent_name'].str.lower().str.strip()
            geonames_merged1['ascii_name_clean'] = geonames_merged1['ASCII Name'].str.lower().str.strip()

            # Create name lookup table: Only keep names unique within their country
            cities_lookup_name = cities[['state_id', 'country_id', 'unaccent_name_clean']].copy()
            cities_lookup_name.dropna(subset=['unaccent_name_clean'], inplace=True)
            # Mark duplicates based on country and name
            duplicates_mask = cities_lookup_name.duplicated(subset=['country_id', 'unaccent_name_clean'], keep=False)
            cities_lookup_name = cities_lookup_name[~duplicates_mask] # Keep only non-duplicates
            cities_lookup_name = cities_lookup_name.drop_duplicates(subset=['country_id', 'unaccent_name_clean'], keep='first') # Should be unique now, but just in case
            print(f"Created unique name lookup table with {len(cities_lookup_name)} entries.")


            print("Attempt 2: Merging state information based on unique name...")
            # Merge based on clean names for the unmatched rows
            geonames_merged2 = pd.merge(
                geonames_merged1[unmatched_mask].drop(columns=['state_id']), # Drop empty state_id before merge
                cities_lookup_name,
                left_on=['country_id', 'ascii_name_clean'],
                right_on=['country_id', 'unaccent_name_clean'],
                how='left'
            )

            # Update the original dataframe with the newly found state_ids
            # Use .loc for safer index-based assignment
            geonames_merged1.loc[unmatched_mask, 'state_id'] = geonames_merged2['state_id'].values

            matched_name_count = geonames_merged2['state_id'].notna().sum()
            print(f"{matched_name_count} additional geonames rows matched with states via name.")


        # Final count
        total_matched_count = geonames_merged1['state_id'].notna().sum()
        final_unmatched_count = geonames_merged1['state_id'].isna().sum()
        print(f"Total matched states: {total_matched_count}")
        print(f"Remaining unmatched states: {final_unmatched_count}")


        # Select and clean up final columns
        # Keep original geonames columns + added country_id and state_id
        final_cols = list(geonames.columns) + ['country_id', 'state_id']
        # Define cols to remove more robustly
        cols_to_remove = ['iso2', 'lat_geonames', 'lon_geonames', 'lat_round', 'lon_round',
                          'ascii_name_clean', 'unaccent_name_clean', 'Coordinates'] # Coordinates removed as lat/lon extracted
        # Get columns present in the final dataframe
        current_cols = list(geonames_merged1.columns)
        # Filter final_cols to only include those present in current_cols OR the essential IDs
        final_cols = [col for col in current_cols if col in final_cols or col in ['country_id', 'state_id']]
        # Remove the temporary columns, but ensure country_id and state_id remain
        final_cols = [col for col in final_cols if col not in cols_to_remove or col in ['country_id', 'state_id']]
        # Make unique while preserving order (Python 3.7+)
        final_cols = list(dict.fromkeys(final_cols))


        geonames_output = geonames_merged1[final_cols].copy()
        geonames_output['state_id'] = geonames_output['state_id'].astype('Int64') # Use nullable integer type


        print("Enrichment complete.")
        # Optionally save the result
        output_path = 'data/edit_data/geonames_enriched.csv'
        geonames_output.to_csv(output_path, index=False, sep=';') # Save with semicolon separator
        print(f"Enriched data saved to {output_path}")

        return geonames_output

    except FileNotFoundError as e:
        print(f"Error loading file: {e}")
        return None
    except Exception as e:
        print(f"An error occurred during enrichment: {e}")
        # Print traceback for detailed debugging
        traceback.print_exc()
        return None

def deduplicate_geonames_by_population():
    """
    Processes the Geonames dataset to keep only the most populous city
    for each unique city name within the same country. Also adds the internal
    country_id based on the country's iso2 code.
    """
    try:
        print("Deduplicating Geonames cities by population within countries...")
        # Load the Geonames dataset
        geonames_df = pd.read_csv('data/data/geonames-all-cities-with-a-population-1000.csv', sep=';')

        # Load country mapping data
        countries = pd.read_csv('data/edit_data/country_rows.csv', usecols=['pb_id', 'iso2'])
        countries = countries.rename(columns={'pb_id': 'country_id'})

        # Merge country_id into geonames
        print("Adding country_id mapping...")
        geonames_df = pd.merge(geonames_df, countries, left_on='Country Code', right_on='iso2', how='left')

        # Drop geonames rows that didn't match a country in our list
        original_geonames_count = len(geonames_df)
        geonames_df = geonames_df.dropna(subset=['country_id'])
        dropped_no_country_match = original_geonames_count - len(geonames_df)
        if dropped_no_country_match > 0:
            print(f"Dropped {dropped_no_country_match} rows with no matching country_id.")

        # Normalize name for better matching (lowercase, strip whitespace)
        geonames_df['name_clean'] = geonames_df['ASCII Name'].str.lower().str.strip()

        # Convert Population to numeric, coercing errors to NaN, then fill NaN with 0
        # This ensures non-numeric or missing populations are treated as the lowest
        geonames_df['Population'] = pd.to_numeric(geonames_df['Population'], errors='coerce').fillna(0).astype(int)

        geonames_df.dropna(subset=['name_clean', 'Country Code'], inplace=True)

        # Sort by Country, Name, and then Population DESCENDING
        geonames_df = geonames_df.sort_values(
            by=['Country Code', 'name_clean', 'Population'],
            ascending=[True, True, False] # Population descending
        )

        # Drop duplicates, keeping the first entry (which is the highest population due to sorting)
        deduplicated_cities = geonames_df.drop_duplicates(subset=['Country Code', 'name_clean'], keep='first')

        num_original = len(geonames_df)
        num_deduplicated = len(deduplicated_cities)
        num_dropped = num_original - num_deduplicated

        print(f"Original Geonames rows processed: {num_original}")
        print(f"Rows remaining after deduplication by population: {num_deduplicated}")
        print(f"Rows dropped: {num_dropped}")

        # Save the result
        output_path = 'data/edit_data/geonames_deduplicated_by_population.csv'
        deduplicated_cities.to_csv(output_path, index=False, sep=';') # Use semicolon separator for consistency
        print(f"Deduplicated Geonames data saved to {output_path}")

        return deduplicated_cities

    except FileNotFoundError as e:
        print(f"Error loading file: {e}")
        return None
    except Exception as e:
        print(f"An error occurred during deduplication: {e}")
        traceback.print_exc()
        return None

def insert_deduplicated_geonames_data(start_row=0, end_row=None):
    """
    Inserts deduplicated Geonames city data into the PocketBase 'city' collection.
    Assumes 'country_id' in the input CSV is the PocketBase country record ID.
    State information is omitted as it's not reliably mapped in the source.
    """
    token = get_admin_token()
    headers = {
        "Authorization": "{}".format(token)
    }

    # Load deduplicated Geonames data
    input_file = 'data/edit_data/geonames_deduplicated_by_population.csv'
    try:
        df = pd.read_csv(input_file, sep=';')
    except FileNotFoundError:
        print(f"Error: Input file not found: {input_file}")
        return

    # Prepare needed columns, handle potential missing columns gracefully
    required_cols = ['Geoname ID', 'ASCII Name', 'Coordinates', 'Population', 'country_id']
    if not all(col in df.columns for col in required_cols):
        print(f"Error: Input file {input_file} is missing required columns. Needed: {required_cols}")
        return

    # Prepare unaccented name (use lowercase ASCII Name)
    df['unaccented_name'] = df['ASCII Name'].str.lower().str.strip()

    # Extract lat/lon
    try:
        coords = df['Coordinates'].str.split(',', expand=True)
        df['latitude'] = pd.to_numeric(coords[0], errors='coerce')
        df['longitude'] = pd.to_numeric(coords[1], errors='coerce')
    except Exception as e:
        print(f"Error parsing Coordinates column: {e}")
        # Decide how to handle: drop rows with bad coords or try to continue?
        df.dropna(subset=['Coordinates'], inplace=True) # Drop rows with totally missing coords
        coords = df['Coordinates'].str.split(',', expand=True)
        df['latitude'] = pd.to_numeric(coords[0], errors='coerce')
        df['longitude'] = pd.to_numeric(coords[1], errors='coerce')

    # Drop rows where lat/lon parsing failed
    rows_before_drop = len(df)
    df.dropna(subset=['latitude', 'longitude'], inplace=True)
    if len(df) < rows_before_drop:
        print(f"Dropped {rows_before_drop - len(df)} rows due to invalid coordinates.")

    # --- Row Slicing for Chunking ---
    if end_row is None:
        end_row = len(df)
    # Ensure slicing respects DataFrame index after potential drops
    df_to_process = df.iloc[start_row:end_row]

    # --- API Insertion --- 
    print(f"Starting insertion for rows {start_row} to {end_row}...")
    successful_inserts = 0
    failed_inserts = 0
    for index, row in df_to_process.iterrows():
        data = {
            'name': row['Name'],
            'unaccented_name': row['unaccented_name'],
            'country': row['country_id'], # Assumes this is the PB ID
            # 'state': pb_state_id, # State omitted
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'population': int(row['Population']) if pd.notna(row['Population']) else None
            # 'wikiDataId': Omitted - not available
        }

        # Remove None values from payload, PocketBase might prefer fields omitted
        payload = {k: v for k, v in data.items() if v is not None}

        max_retries = 3
        retry_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{BASE_URL}/api/collections/city/records",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
                successful_inserts += 1
                break # Exit retry loop on success
            except requests.exceptions.ConnectionError as e:
                print(f"Warning: Connection error for city '{data['name']}': {e}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    print(f"Error: Failed to insert city '{data['name']}' after {max_retries} attempts due to ConnectionError.")
                    failed_inserts += 1
            except requests.exceptions.HTTPError as e:
                 print(f"Error: HTTP error for city '{data['name']}': {e.response.status_code} {e.response.text}")
                 failed_inserts += 1
                 break # Don't retry on HTTP errors like bad data
            except Exception as e:
                 print(f"Error: An unexpected error occurred for city '{data['name']}': {e}")
                 failed_inserts += 1
                 traceback.print_exc()
                 break # Don't retry unknown errors

    print(f"Completed inserting/updating cities from row {start_row} to {end_row}. Success: {successful_inserts}, Failed: {failed_inserts}")

def insert_deduplicated_geonames_data_all():
    """Processes the entire deduplicated Geonames file in chunks."""
    input_file = 'data/edit_data/geonames_deduplicated_by_population.csv'
    try:
        df = pd.read_csv(input_file, sep=';')
        total_rows = len(df)
        chunk_size = 10000 # Adjust chunk size as needed
        print(f"Total rows to process from {input_file}: {total_rows}")

        for start in range(0, total_rows, chunk_size):
            end = min(start + chunk_size, total_rows)
            print(f"--- Processing chunk: rows {start} to {end} --- ")
            insert_deduplicated_geonames_data(start_row=start, end_row=end)
            if end < total_rows:
                print(f"--- Waiting 60 seconds before next chunk --- ")
                time.sleep(60) # Pause between chunks if desired
        print("Finished processing all chunks.")

    except FileNotFoundError:
         print(f"Error: Input file not found: {input_file}")
    except Exception as e:
        print(f"An error occurred during batch insertion: {e}")
        traceback.print_exc()

def main():
    #create_region_subregion_csv()
    #insert_region_data()
    #insert_subregion_data()
    #insert_country_data()
    #insert_state_data()
    #insert_city_data_all()
    #insert_geojson_data('Outline')
    #insert_geojson_data('WithStates')
    # enrich_geonames_cities()
    #deduplicate_geonames_by_population()
    insert_deduplicated_geonames_data_all()

if __name__ == "__main__":
    main()
