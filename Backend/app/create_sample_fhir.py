import pandas as pd
import json
import requests
from datetime import datetime
from typing import Dict, List
from fhir.resources.observation import Observation
from fhir.resources.quantity import Quantity
from fhir.resources.coding import Coding
from fhir.resources.codeableconcept import CodeableConcept

def create_observation(record: pd.Series) -> Dict:
    """
    Creates an Observation resource for a single record of COVID-19 case and death data.
    """
    return {
        "resourceType": "Observation",
        "id": f"observation-{record['dateRep']}",
        "status": "final",
        "code": {
            "coding": [
                {"system": "http://loinc.org", "code": "94500-6", "display": "COVID-19 case report"}
            ]
        },
        "subject": {
            "reference": f"Country/{record['countryterritoryCode']}"
        },
        "effectiveDateTime": record['dateRep'],
        "component": [
            {
                "code": {
                    "coding": [
                        {"system": "http://loinc.org", "code": "94531-1", "display": "Number of COVID-19 cases"}
                    ]
                },
                "valueQuantity": {
                    "value": record['cases'],
                    "unit": "count",
                    "system": "http://unitsofmeasure.org",
                    "code": "count"
                }
            },
            {
                "code": {
                    "coding": [
                        {"system": "http://loinc.org", "code": "9279-1", "display": "Number of deaths"}
                    ]
                },
                "valueQuantity": {
                    "value": record['deaths'],
                    "unit": "count",
                    "system": "http://unitsofmeasure.org",
                    "code": "count"
                }
            }
        ]
    }

def create_fhir_bundle(data_path: str, output_path: str):
    """
    Creates a FHIR bundle from a JSON file containing filtered European COVID-19 data,
    including cases and deaths.
    """
    data = pd.read_json(data_path)
    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "fullUrl": f"urn:uuid:observation-{row['dateRep']}",
                "resource": create_observation(row)
            } for index, row in data.iterrows()
        ]
    }

    with open(output_path, 'w') as f:
        json.dump(fhir_bundle, f, indent=4)

    print("FHIR bundle created successfully.")
    return fhir_bundle

def reverse_fhir_observations(observations_path: str) -> List[Dict]:
    """
    Reverses FHIR Observations back to a list of dictionaries representing the original data.
    """
    with open(observations_path, 'r') as f:
        fhir_observations = json.load(f)["entry"]

    reversed_data = []
    for entry in fhir_observations:
        observation = entry["resource"]
        date_rep = observation["effectiveDateTime"]
        try:
            parsed_date = datetime.strptime(date_rep, "%Y-%m-%d")
        except ValueError:
            parsed_date = datetime.strptime(date_rep, "%d/%m/%Y")
        date_rep = parsed_date.strftime("%d/%m/%Y")

        cases_component = next(comp for comp in observation["component"] if comp["code"]["coding"][0]["code"] == "94531-1")
        deaths_component = next(comp for comp in observation["component"] if comp["code"]["coding"][0]["code"] == "9279-1")

        reversed_entry = {
            'dateRep': date_rep,
            'cases': cases_component["valueQuantity"]["value"],
            'deaths': deaths_component["valueQuantity"]["value"],
            'countryterritoryCode': observation["subject"]["reference"].split('/')[-1]
        }
        reversed_data.append(reversed_entry)

    return reversed_data

def send_fhir_observations(fhir_observations, server_url):
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(server_url, json=fhir_observations, headers=headers)
        response.raise_for_status()  # Raises HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Failed to send data: {e}")
        return None

if __name__ == "__main__":
    # File paths and server URL
    data_path = 'style/sample.json'
    output_path = 'style/fhir_sample.json'
    server_url = 'http://127.0.0.1:8000/receive_fhir/'

    # Create and send FHIR Observations
    fhir_observations = create_fhir_bundle(data_path, output_path)
    response = send_fhir_observations(fhir_observations, server_url)
    print("Server response:", response)

    # Optional: Reverse FHIR Observations
    reversed_data = reverse_fhir_observations(output_path)
    print("Reversed data:", reversed_data)