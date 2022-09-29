import csv
import json


def save_csv_from_json(csv_file_path, json_file_path):
    json_array = []

    # Read csv file
    with open(csv_file_path) as csv_file:
        # Load csv file data using csv library's dictionary reader
        csv_reader = csv.DictReader(csv_file)

        # Convert each csv row into python dict
        for row in csv_reader:
            # Add this python dict to json array
            json_array.append(row)

    # Convert python json_array to JSON String and write to file
    with open(json_file_path, "w") as json_file:
        json_string = json.dumps(json_array, indent=4, ensure_ascii=False)
        json_file.write(json_string)


csv_file_path = "radios_data.csv"
json_file_path = "radios_data.json"

save_csv_from_json(csv_file_path, json_file_path)
