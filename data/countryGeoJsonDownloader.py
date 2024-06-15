import json as JSON
import requests

sourceWithStates = "https://simplemaps.com/static/svg/country/{}/admin1/{}.json"
sourceForOutline = "https://simplemaps.com/static/svg/country/{}/all/{}.json"
countries = JSON.load(open("data/countryCodes.json"))

def downloadCountryWithStatesGeoJson(countryCode):
    print("Downloading GeoJson for " + countryCode)
    url = sourceWithStates.format(countryCode, countryCode)
    try:
        response = requests.get(url)
        geojson_data = response.json()
        
        with open(f"data/geoJson/WithStates/{countryCode}.geojson", "w") as file:
            JSON.dump(geojson_data, file)
    except:
        print("Error downloading " + countryCode)

def downloadCountryOutlineGeoJson(countryCode):
    print("Downloading GeoJson for " + countryCode)
    url = sourceForOutline.format(countryCode, countryCode)
    try:
        response = requests.get(url)
        geojson_data = response.json()
        
        with open(f"data/geoJson/Outline/{countryCode}.geojson", "w") as file:
            JSON.dump(geojson_data, file)
    except:
        print("Error downloading " + countryCode)

def downloadAllCountriesGeoJson():
    for country in countries:
        downloadCountryWithStatesGeoJson(country["alpha-2"].lower())
        downloadCountryOutlineGeoJson(country["alpha-2"].lower())

def main():
    downloadAllCountriesGeoJson()

if __name__ == "__main__":
    main()