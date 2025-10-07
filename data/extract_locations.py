import re
import json

def extract_locations_from_html(html_content):
    match = re.search(r'var my_Coords = (\[\[.*?\]\]);', html_content, re.DOTALL)
    if not match:
        return None
    
    json_like_data = match.group(1)
    # The extracted data is a JavaScript array, which is very close to JSON.
    # We can load it with Python's json module.
    locations = json.loads(json_like_data)
    return locations

def filter_location_data(locations):
    return [[loc[0], loc[1], loc[2]] for loc in locations]

def main():
    with open('locations.html', 'r') as f:
        html_content = f.read()
    
    locations = extract_locations_from_html(html_content)
    
    if locations:
        filtered_locations = filter_location_data(locations)
        with open('locations.json', 'w') as f:
            json.dump(filtered_locations, f, indent=2)
        print("Successfully extracted and saved filtered locations to locations.json")
    else:
        print("Could not find location data in the HTML file.")

if __name__ == '__main__':
    main()
