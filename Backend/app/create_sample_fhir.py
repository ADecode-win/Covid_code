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
    Creates an Observation resource for a single record of COVID-19 case data.
    """
    return {
        "resourceType": "Observation",
        "id": f"observation-{record['dateRep']}",
        "status": "final",
        "code": {
            "coding": [
                {"system": "http://loinc.org", "code": "94531-1", "display": "COVID-19 cases reported"}
            ]
        },
        "subject": {
            "reference": f"Country/{record['countriesAndTerritories']}"
        },
        "effectiveDateTime": record['dateRep'],
        "valueQuantity": {
            "value": record['cases'],
            "unit": "count",
            "system": "http://unitsofmeasure.org",
            "code": "count"
        }
    }

def create_fhir_observations(data_path: str, output_path: str):
    """
    Creates individual FHIR Observations from a JSON file containing filtered European COVID-19 data.
    """
    data = pd.read_json(data_path)
    fhir_observations = [
        create_observation(row) for index, row in data.iterrows()
    ]

    with open(output_path, 'w') as f:
        json.dump(fhir_observations, f, indent=4)

    print("FHIR observations created successfully.")
    return fhir_observations

def reverse_fhir_observations(observations_path: str) -> List[Dict]:
    """
    Reverses FHIR Observations back to a list of dictionaries representing the original data.
    """
    with open(observations_path, 'r') as f:
        fhir_observations = json.load(f)

    reversed_data = []
    for observation in fhir_observations:
        date_rep = observation.get('effectiveDateTime', '')
        try:
            parsed_date = datetime.strptime(date_rep, "%Y-%m-%d")
        except ValueError:
            parsed_date = datetime.strptime(date_rep, "%d/%m/%Y")
        date_rep = parsed_date.strftime("%d/%m/%Y")
        cases = observation.get('valueQuantity', {}).get('value', 0)
        reversed_entry = {
            'dateRep': date_rep,
            'cases': cases,
            'countryterritoryCode': observation.get('subject', {}).get('reference', '').split('/')[-1]
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
    fhir_observations = create_fhir_observations(data_path, output_path)
    response = send_fhir_observations(fhir_observations, server_url)
    print("Server response:", response)

    # Optional: Reverse FHIR Observations
    reversed_data = reverse_fhir_observations(output_path)
    print("Reversed data:", reversed_data)