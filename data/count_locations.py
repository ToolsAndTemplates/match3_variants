
import json

def count_unique_locations(json_file_path):
    with open(json_file_path, 'r') as f:
        locations = json.load(f)
    
    unique_names = set()
    for location in locations:
        unique_names.add(location[2])
    
    return len(unique_names)

if __name__ == '__main__':
    json_file = '/Users/ismatsamadov/obamiz/data/locations.json'
    unique_count = count_unique_locations(json_file)
    print(f"There are {unique_count} unique location names.")
