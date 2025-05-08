import os
import requests
from dotenv import load_dotenv
import pandas as pd
import json
import math
import time
import csv

# Load environment variables from .env file
load_dotenv()

# Viator API Configuration
PAPI_HOST = os.getenv("PAPI_HOST", "https://api.viator.com/partner")
API_VERSION = os.getenv("API_VERSION", "2.0")
VIATOR_API_KEY = os.getenv("VIATOR_API_KEY") # Renamed for clarity

# PocketBase Configuration
POCKETBASE_URL = os.getenv('POCKETBASE_URL')
POCKETBASE_ADMIN_EMAIL = os.getenv('POCKETBASE_ADMIN_USERNAME')
POCKETBASE_ADMIN_PASSWORD = os.getenv('POCKETBASE_ADMIN_PASSWORD')

# Headers common to most Viator requests
COMMON_HEADERS = {
    "Accept-Language": "en-US",
    "Accept": f"application/json;version={API_VERSION}",
    "exp-api-key": VIATOR_API_KEY
}

# Headers for Viator POST requests
POST_HEADERS = {
    **COMMON_HEADERS,
    "Content-Type": "application/json",
}

def get_admin_token_pb():
    """Get admin authentication token"""
    auth_data = {
        "identity": POCKETBASE_ADMIN_EMAIL,
        "password": POCKETBASE_ADMIN_PASSWORD
    }
    response = requests.post(f"{POCKETBASE_URL}/api/collections/_superusers/auth-with-password", json=auth_data)
    response.raise_for_status()
    return response.json()["token"]

def get_all_pb_records(token, collection_name, fields=None, filter_str=None, page_size=500):
    """
    Fetches all records from a PocketBase collection with pagination.

    Args:
        token (str): PocketBase auth token.
        collection_name (str): Name of the collection to fetch from.
        fields (list, optional): List of fields to retrieve. Defaults to all.
        filter_str (str, optional): PocketBase filter string. Defaults to None.
        page_size (int): Number of records per page (max 500 for PocketBase).

    Returns:
        list: A list of all records from the collection, or None if an error occurs.
    """
    if not token:
        print("Error: PocketBase token not provided for get_all_pb_records.")
        return None

    all_records = []
    page = 1
    headers = {"Authorization": f"Bearer {token}"} # PocketBase typically uses Bearer token

    while True:
        params = {"page": page, "perPage": page_size}
        if fields:
            params["fields"] = ",".join(fields)
        if filter_str:
            params["filter"] = filter_str
        
        try:
            # print(f"Fetching page {page} for {collection_name} with params: {params}")
            response = requests.get(
                f"{POCKETBASE_URL}/api/collections/{collection_name}/records",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            all_records.extend(data.get("items", []))
            
            if data.get("page", 0) >= data.get("totalPages", 0):
                break
            page += 1
            time.sleep(0.1) # Brief pause to be nice to the API
        except requests.exceptions.RequestException as e:
            print(f"Error fetching records from PocketBase collection {collection_name} (page {page}): {e}")
            if response is not None:
                print(f"Response content: {response.text}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred in get_all_pb_records: {e}")
            return None
            
    return all_records

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth (specified in decimal degrees)."""
    if None in [lat1, lon1, lat2, lon2]:
        return float('inf')
    R = 6371  # Radius of earth in kilometers
    
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

def get_destinations():
    """
    Fetches the list of destinations from the Viator API.

    Returns:
        dict: The JSON response from the API containing destinations,
              or None if an error occurs.
    """
    if not VIATOR_API_KEY: # Updated variable name
        print("Error: VIATOR_API_KEY not found in environment variables.")
        return None

    url = f"{PAPI_HOST}/destinations/"
    try:
        response = requests.get(url, headers=COMMON_HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching destinations: {e}")
        if response is not None:
            print(f"Response content: {response.text}")
        return None

def search_products(payload):
    """
    Searches for products using the Viator API.

    Args:
        payload (dict): The search criteria.

    Returns:
        dict: The JSON response from the API, or None if an error occurs.
    """
    if not VIATOR_API_KEY: # Updated variable name
        print("Error: VIATOR_API_KEY not found in environment variables.")
        return None

    url = f"{PAPI_HOST}/products/search"
    try:
        response = requests.post(url, headers=POST_HEADERS, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching products: {e}")
        if response is not None:
            print(f"Response content: {response.text}")
        return None

def fetch_and_save_destinations_csv(filepath="data/data/viator_destinations.csv"):
    """
    Fetches destinations from the Viator API, stores them in a Pandas DataFrame,
    extracts latitude and longitude from the 'center' column,
    and saves the DataFrame to a CSV file.
    """
    print(f"Attempting to fetch destinations for CSV export...")
    destinations_response = get_destinations()

    if destinations_response and "destinations" in destinations_response:
        destinations_list = destinations_response["destinations"]
        if isinstance(destinations_list, list):
            if not destinations_list:
                print("No destinations found in the API response.")
                return False
            try:
                df = pd.DataFrame(destinations_list)
                
                # Process 'center' column to extract latitude and longitude
                if 'center' in df.columns:
                    def extract_coord(center_data, coord_key):
                        if isinstance(center_data, dict):
                            return center_data.get(coord_key)
                        elif isinstance(center_data, str):
                            try:
                                data = json.loads(center_data)
                                return data.get(coord_key)
                            except json.JSONDecodeError:
                                return None
                        return None

                    df['latitude'] = df['center'].apply(lambda x: extract_coord(x, 'latitude'))
                    df['longitude'] = df['center'].apply(lambda x: extract_coord(x, 'longitude'))
                    df.drop(columns=['center'], inplace=True, errors='ignore')
                    print("Extracted latitude and longitude from 'center' column and dropped 'center'.")
                
                # Create directory if it doesn't exist (path includes 'data/data/')
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                df.to_csv(filepath, index=False, quoting=csv.QUOTE_NONNUMERIC)
                print(f"Successfully saved {len(df)} destinations to {filepath}")
                if "totalCount" in destinations_response:
                    print(f"API reported totalCount: {destinations_response['totalCount']}")
                return True
            except Exception as e:
                print(f"Error creating DataFrame or saving CSV: {e}")
                return False
        else:
            print(f"Expected 'destinations' to be a list, but got: {type(destinations_list)}")
            return False
    elif destinations_response:
        print("Error: 'destinations' key not found in API response.")
        print(f"Response keys: {list(destinations_response.keys())}")
        return False
    else:
        print("Failed to fetch destinations from API (get_destinations returned None).")
        return False

def get_products_by_destination(destination_id, currency="USD", count=5):
    """
    Fetches products for a specific destination ID and prints their details.
    Includes sorting by TRAVELER_RATING.
    """
    print(f"\nSearching for products in destination: {destination_id}, Currency: {currency}, Count: {count}")
    payload = {
        "filtering": {
            "destination": str(destination_id)
        },
        "pagination": {
            "start": 1,
            "count": count
        },
        "sorting": { # Added based on user's modification
            "sort": "TRAVELER_RATING",
            "order": "DESCENDING"
        },
        "currency": currency
    }

    response_data = search_products(payload) # search_products already checks VIATOR_API_KEY

    if response_data and "products" in response_data:
        products = response_data["products"]
        total_found = response_data.get("totalCount", len(products))
        print(f"Found {len(products)} product(s) (out of {total_found} total) for destination {destination_id}:")

        if not products:
            print("No products returned for this destination with the current filters.")
            return

        for i, product in enumerate(products):
            print(f"\n--- Product {i+1} ---")
            print(f"  Product Code: {product.get('productCode')}")
            print(f"  Title: {product.get('title')}")
            description = product.get('description', '')
            print(f"  Description: {description[:150] + '...' if len(description) > 150 else description}")
            
            reviews = product.get('reviews', {})
            print(f"  Total Reviews: {reviews.get('totalReviews')}")
            print(f"  Average Rating: {reviews.get('combinedAverageRating')}")
            
            duration = product.get('duration', {})
            if 'fixedDurationInMinutes' in duration:
                print(f"  Duration: {duration['fixedDurationInMinutes']} minutes")
            elif 'variableDuration' in duration: 
                print(f"  Duration: Variable (from {duration['variableDuration'].get('from')} to {duration['variableDuration'].get('to')} minutes)")

            pricing = product.get('pricing', {})
            summary = pricing.get('summary', {})
            print(f"  Price: {summary.get('fromPrice')} {pricing.get('currency')}")
            print(f"  Product URL: {product.get('productUrl')}")
            
    elif response_data:
        print(f"'products' key not found in response. Available keys: {list(response_data.keys())}")
    else:
        print(f"Failed to fetch products for destination {destination_id}.")

def map_viator_destinations_to_pb_cities(
    viator_csv_path="data/data/viator_destinations.csv",
    output_csv_path="data/data/viator_to_pb_city_mapping.csv",
    pb_cities_cache_path="data/data/pb_cities_cache.csv", # Added cache path
    strong_dist_threshold_km=10,
    coord_dist_threshold_km=1.5
    ):
    """
    Maps Viator destinations to PocketBase cities based on name and coordinates.
    Uses a local cache for PocketBase cities to speed up subsequent runs.
    Saves the mapping results to a CSV file.
    """
    print("Starting Viator to PocketBase city mapping process...")

    pb_cities_df = None
    os.makedirs(os.path.dirname(pb_cities_cache_path), exist_ok=True)

    if os.path.exists(pb_cities_cache_path):
        print(f"Loading PocketBase cities from cache: {pb_cities_cache_path}")
        try:
            pb_cities_df = pd.read_csv(pb_cities_cache_path)
            # Ensure correct types, especially for coordinates if they were empty and became NaN
            pb_cities_df['latitude'] = pd.to_numeric(pb_cities_df['latitude'], errors='coerce')
            pb_cities_df['longitude'] = pd.to_numeric(pb_cities_df['longitude'], errors='coerce')
            print(f"Loaded {len(pb_cities_df)} cities from cache.")
        except Exception as e:
            print(f"Error loading PocketBase cities from cache: {e}. Will attempt to fetch from API.")
            pb_cities_df = None # Ensure we fetch if cache loading fails

    if pb_cities_df is None:
        print("PocketBase cities cache not found or failed to load. Fetching from API...")
        pb_token = get_admin_token_pb()
        if not pb_token:
            print("Could not get PocketBase admin token. Aborting mapping.")
            return

        print("Fetching all cities from PocketBase API...")
        # Fetching all fields by default, assuming 'alternative_names' is present if it exists in the collection
        pb_cities_raw = get_all_pb_records(pb_token, "city") 
        if pb_cities_raw is None:
            print("Failed to fetch cities from PocketBase API. Aborting mapping.")
            return
        
        print(f"Fetched {len(pb_cities_raw)} cities from PocketBase API.")
        if not pb_cities_raw:
            print("No cities found in PocketBase. Aborting mapping.")
            return
        
        pb_cities_df = pd.DataFrame(pb_cities_raw)
        try:
            # Include 'alternative_names' in cache_columns if it exists in the DataFrame
            cache_columns = ['id', 'name', 'unaccented_name', 'latitude', 'longitude', 'alternative_names']
            existing_cache_columns = [col for col in cache_columns if col in pb_cities_df.columns]
            pb_cities_df_to_cache = pb_cities_df[existing_cache_columns].copy()

            pb_cities_df_to_cache['latitude'] = pd.to_numeric(pb_cities_df_to_cache.get('latitude'), errors='coerce')
            pb_cities_df_to_cache['longitude'] = pd.to_numeric(pb_cities_df_to_cache.get('longitude'), errors='coerce')
            # 'alternative_names' is likely a string, so no special numeric conversion needed here for the cache.

            pb_cities_df_to_cache.to_csv(pb_cities_cache_path, index=False, quoting=csv.QUOTE_NONNUMERIC)
            print(f"Saved PocketBase cities to cache: {pb_cities_cache_path}")
        except Exception as e:
            print(f"Error saving PocketBase cities to cache: {e}")

    pb_cities = []
    for index, city_row in pb_cities_df.iterrows():
        try:
            lat = city_row.get('latitude')
            lon = city_row.get('longitude')
            alt_names = city_row.get('alternative_names') # Get alternative names
            pb_cities.append({
                'id': city_row['id'],
                'name': str(city_row.get('name', '')).lower().strip(),
                'unaccented_name': str(city_row.get('unaccented_name', '')).lower().strip(),
                'latitude': float(lat) if pd.notna(lat) else None, 
                'longitude': float(lon) if pd.notna(lon) else None,
                'alternative_names': str(alt_names) if pd.notna(alt_names) else "" # Store as string, empty if NaN/None
            })
        except (ValueError, TypeError, KeyError) as e:
            continue
    
    if not pb_cities:
        print("No valid PocketBase city data to process after loading/fetching. Aborting.")
        return

    # Ensure viator_destinations.csv exists, generate if not
    os.makedirs(os.path.dirname(viator_csv_path), exist_ok=True)
    if not os.path.exists(viator_csv_path):
        print(f"Error: Viator destinations CSV not found at {viator_csv_path}")
        print(f"Attempting to generate {viator_csv_path}...")
        if not fetch_and_save_destinations_csv(filepath=viator_csv_path):
             print(f"Failed to generate {viator_csv_path}. Aborting mapping.")
             return
        else:
            print(f"Successfully generated {viator_csv_path}.")

    print(f"Reading Viator destinations from {viator_csv_path}...")
    try:
        viator_df = pd.read_csv(viator_csv_path)
        # Ensure lat/lon are numeric, coercing errors
        viator_df['latitude'] = pd.to_numeric(viator_df.get('latitude'), errors='coerce')
        viator_df['longitude'] = pd.to_numeric(viator_df.get('longitude'), errors='coerce')

        # Filter Viator destinations by type
        if 'type' in viator_df.columns:
            original_count = len(viator_df)
            allowed_types = ["CITY", "VILLAGE", "TOWN"]
            # Normalize the 'type' column to uppercase for case-insensitive comparison
            viator_df = viator_df[viator_df['type'].astype(str).str.upper().isin(allowed_types)]
            print(f"Filtered Viator destinations by type. Kept {len(viator_df)} out of {original_count} records.")
            if len(viator_df) == 0:
                print("No Viator destinations remaining after filtering by type. Aborting mapping.")
                return
        else:
            print("Warning: 'type' column not found in Viator destinations CSV. Proceeding without type filtering.")

    except FileNotFoundError:
        print(f"Error: {viator_csv_path} not found even after attempting generation.")
        return
    except Exception as e:
        print(f"Error reading {viator_csv_path}: {e}")
        return

    mappings = []
    matched_count = 0
    unmatched_count = 0

    print(f"Processing {len(viator_df)} Viator destinations for mapping...")

    for index, v_row in viator_df.iterrows():
        v_id = v_row.get('destinationId')
        v_name_raw = str(v_row.get('name', ''))
        v_name_normalized = v_name_raw.lower().strip()
        
        v_lat = v_row.get('latitude') 
        v_lon = v_row.get('longitude')

        v_lat = float(v_lat) if pd.notna(v_lat) else None
        v_lon = float(v_lon) if pd.notna(v_lon) else None

        best_match = None
        min_dist_strong = float('inf')
        min_dist_coord = float('inf')
        
        if v_lat is None or v_lon is None:
            pass 

        for pb_city in pb_cities:
            name_matched = False
            # 1. Check primary name / unaccented name
            pb_primary_name_match_target = pb_city['unaccented_name'] if pb_city['unaccented_name'] else pb_city['name']
            if v_name_normalized == pb_primary_name_match_target:
                name_matched = True
            
            # 2. If no primary match, check alternative names
            if not name_matched and pb_city.get('alternative_names'):
                # alternative_names is already a string from the processing above
                alt_names_str = pb_city['alternative_names'] 
                if alt_names_str.strip(): # Check if not empty string
                    for alt_name_item in alt_names_str.split(','):
                        normalized_alt_name = alt_name_item.lower().strip()
                        if v_name_normalized == normalized_alt_name:
                            name_matched = True
                            break # Found a match in alternative names
            
            current_distance = float('inf')
            if v_lat is not None and v_lon is not None and \
               pb_city['latitude'] is not None and pb_city['longitude'] is not None:
                 try:
                    if not (math.isnan(pb_city['latitude']) or math.isnan(pb_city['longitude'])):
                        current_distance = calculate_haversine_distance(v_lat, v_lon, pb_city['latitude'], pb_city['longitude'])
                 except Exception as e:
                    current_distance = float('inf')

            # Proceed with distance checks only if a name was matched (either primary or alternative)
            if name_matched:
                if current_distance < strong_dist_threshold_km:
                    if current_distance < min_dist_strong:
                        min_dist_strong = current_distance
                        best_match = {**pb_city, 'match_type': 'Strong (Name & Coords)', 'distance_km': current_distance}
            
            # This logic for coord-only match should remain independent of name matching status for now, or be re-evaluated.
            # For now, we keep it as is: if no strong match was found (due to name OR distance), it considers a pure coordinate match.
            # If a name *was* matched but distance was too far for a strong match, this coord-only block will also be checked.
            if best_match is None or best_match['match_type'] != 'Strong (Name & Coords)':
                if current_distance < coord_dist_threshold_km: 
                    if current_distance < min_dist_coord: 
                        min_dist_coord = current_distance
                        # Only assign as Coordinate-Only if there isn't already a Strong match found (e.g. name matched but was far, then a different city is very close by coords)
                        if best_match is None or best_match['match_type'] != 'Strong (Name & Coords)':
                             best_match = {**pb_city, 'match_type': 'Coordinate-Only', 'distance_km': current_distance}

        if best_match:
            matched_count += 1
            mappings.append({
                'viatorDestinationId': v_id, 'viatorName': v_name_raw, 
                'viatorLat': v_lat, 'viatorLon': v_lon,
                'pbCityId': best_match['id'], 
                'pbCityName': str(best_match.get('name', '')).upper(), 
                'pbCityUnaccentedName': str(best_match.get('unaccented_name', '')).upper(),
                'pbCityLat': best_match['latitude'], 'pbCityLon': best_match['longitude'],
                'matchType': best_match['match_type'], 
                'distanceKm': round(best_match['distance_km'], 2) if best_match['distance_km'] != float('inf') and pd.notna(best_match['distance_km']) else None
            })
        else:
            unmatched_count += 1
            mappings.append({
                'viatorDestinationId': v_id, 'viatorName': v_name_raw, 
                'viatorLat': v_lat, 'viatorLon': v_lon,
                'pbCityId': None, 'pbCityName': None, 'pbCityUnaccentedName': None, 
                'pbCityLat': None, 'pbCityLon': None,
                'matchType': 'No Match', 'distanceKm': None
            })
        
        if (index + 1) % 100 == 0:
            print(f"  Processed {index + 1}/{len(viator_df)} Viator destinations...")

    print(f"Mapping complete. Matched: {matched_count}, Unmatched: {unmatched_count}")

    if mappings:
        output_df = pd.DataFrame(mappings)
        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        output_df.to_csv(output_csv_path, index=False, quoting=csv.QUOTE_NONNUMERIC)
        print(f"Mapping results saved to {output_csv_path}")
    else:
        print("No mappings generated.")
    
    return output_csv_path if matched_count > 0 or unmatched_count > 0 else None

def update_pb_cities_with_viator_ids(
    mapping_csv_path="data/data/viator_to_pb_city_mapping.csv",
    batch_size=100 # PocketBase recommends up to 500, but smaller can be safer for updates
    ):
    """
    Updates PocketBase city records with Viator Destination IDs based on the mapping CSV.
    Uses the PocketBase batch API.

    Args:
        mapping_csv_path (str): Path to the CSV file containing the mappings.
        batch_size (int): Number of update operations per batch request.
    """
    print(f"\nStarting PocketBase city update with Viator IDs from: {mapping_csv_path}")

    if not os.path.exists(mapping_csv_path):
        print(f"Error: Mapping CSV file not found at {mapping_csv_path}. Cannot proceed with updates.")
        return

    pb_token = get_admin_token_pb()
    if not pb_token:
        print("Could not get PocketBase admin token. Aborting update.")
        return

    headers = {
        "Authorization": f"Bearer {pb_token}",
        "Content-Type": "application/json",
    }
    batch_api_url = f"{POCKETBASE_URL}/api/batch"
    update_record_base_url = "/api/collections/city/records"

    try:
        mappings_df = pd.read_csv(mapping_csv_path)
    except Exception as e:
        print(f"Error reading mapping CSV {mapping_csv_path}: {e}")
        return

    # Filter for successful strong matches
    # Ensure pbCityId and viatorDestinationId are not NaN before using them
    successful_matches = mappings_df[
        (mappings_df['matchType'] == 'Strong (Name & Coords)') &
        mappings_df['pbCityId'].notna() &
        mappings_df['viatorDestinationId'].notna()
    ].copy() # Use .copy() to avoid SettingWithCopyWarning

    if successful_matches.empty:
        print("No successful strong matches found in the mapping file to update.")
        return

    # Convert viatorDestinationId to string for the payload, and ensure pbCityId is string
    successful_matches['viatorDestinationIdStr'] = successful_matches['viatorDestinationId'].astype(str)
    successful_matches['pbCityIdStr'] = successful_matches['pbCityId'].astype(str)

    print(f"Found {len(successful_matches)} city records to update in PocketBase with Viator IDs.")

    batch_requests = []
    total_updates_attempted = 0
    successful_updates = 0
    failed_updates = 0

    for index, row in successful_matches.iterrows():
        pb_city_id = row['pbCityIdStr']
        viator_id = row['viatorDestinationIdStr']
        
        payload_body = {"viatorId": viator_id} # Assuming 'viatorId' is the field name in PocketBase
        
        batch_requests.append({
            "method": "PATCH",
            "url": f"{update_record_base_url}/{pb_city_id}",
            "body": payload_body,
        })
        total_updates_attempted += 1

        if len(batch_requests) >= batch_size or total_updates_attempted == len(successful_matches):
            if not batch_requests: # Should not happen if loop condition is correct, but as a safeguard
                continue

            print(f"  Sending batch of {len(batch_requests)} update requests...")
            max_retries = 3
            retry_delay = 2

            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        batch_api_url,
                        headers=headers,
                        json={"requests": batch_requests}
                    )
                    response.raise_for_status()
                    results = response.json()
                    
                    batch_success_count = 0
                    batch_fail_count = 0
                    for i, result in enumerate(results):
                        status_code = result.get('status')
                        if 200 <= status_code < 300:
                            batch_success_count += 1
                        else:
                            batch_fail_count += 1
                            failed_req_body = batch_requests[i].get('body', {})
                            failed_req_url = batch_requests[i].get('url', '')
                            print(f"    ERROR in batch update: Status {status_code}, URL: {failed_req_url}, Body: {json.dumps(failed_req_body)}, Response: {result.get('data', 'N/A')}")
                    
                    successful_updates += batch_success_count
                    failed_updates += batch_fail_count
                    print(f"  Batch finished: {batch_success_count} successful, {batch_fail_count} failed.")
                    batch_requests = [] # Clear for the next batch
                    break # Exit retry loop on success

                except requests.exceptions.RequestException as e:
                    print(f"  Warning: RequestException sending batch: {e}")
                    if attempt < max_retries - 1:
                        print(f"  Retrying batch in {retry_delay} seconds...")
                        time.sleep(retry_delay)
                        retry_delay *= 2
                    else:
                        print(f"  Error: Failed to send batch after {max_retries} attempts. {len(batch_requests)} updates in this batch failed.")
                        failed_updates += len(batch_requests)
                        batch_requests = [] 
                except Exception as e:
                    print(f"  Error: An unexpected error occurred sending batch: {e}")
                    failed_updates += len(batch_requests)
                    batch_requests = []
                    break 

    print("\nPocketBase city update process completed.")
    print(f"  Total Mapped Records to Attempt Update: {len(successful_matches)}")
    print(f"  Successful Updates: {successful_updates}")
    print(f"  Failed Updates: {failed_updates}")


if __name__ == '__main__':
    # Comment out previous tests if not needed for current run
    print("\n--- Testing fetch_and_save_destinations_csv ---")
    # Ensure the CSV is created in the 'data' subdirectory
    viator_csv_file = "data/data/viator_destinations.csv"
    if not os.path.exists(viator_csv_file):
        print(f"{viator_csv_file} not found, attempting to generate it...")
        fetch_and_save_destinations_csv(filepath=viator_csv_file)
    else:
        print(f"{viator_csv_file} found.")

    print("\n--- Testing map_viator_destinations_to_pb_cities ---")
    map_viator_destinations_to_pb_cities(
        viator_csv_path="data/data/viator_destinations.csv",
        output_csv_path="data/data/viator_to_pb_city_mapping.csv",
        strong_dist_threshold_km=50,
        coord_dist_threshold_km=2.5
    )

    mapped_csv_output_path = "data/data/viator_to_pb_city_mapping.csv"

    print(f"\n--- Updating PocketBase cities with Viator IDs using {mapped_csv_output_path} ---")
    update_pb_cities_with_viator_ids(mapping_csv_path=mapped_csv_output_path)
