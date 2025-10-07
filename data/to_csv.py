
import json
import csv

def convert_json_to_csv(json_file_path, csv_file_path):
    with open(json_file_path, 'r') as f:
        locations = json.load(f)

    with open(csv_file_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['latitude', 'longitude', 'name'])
        writer.writerows(locations)

if __name__ == '__main__':
    json_file = '/Users/ismatsamadov/obamiz/data/locations.json'
    csv_file = '/Users/ismatsamadov/obamiz/locations.csv'
    convert_json_to_csv(json_file, csv_file)
    print(f"Successfully converted {json_file} to {csv_file}")
