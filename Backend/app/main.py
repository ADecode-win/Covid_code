from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import pandas as pd
import json
from io import StringIO
from typing import Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/style", StaticFiles(directory="./style"), name="style")

async def startup_event_handler():
    file_path = 'style/sample.json'
    output_path = 'style/fhir_sample.json'
    with open(file_path, 'r') as file:
        json_data = file.read()
    await create_fhir_bundle_from_json(json_data, output_path)
    logger.info("FHIR bundle created and loaded at startup.")

async def shutdown_event_handler():
    logger.info("Application is shutting down.")

app.add_event_handler("startup", startup_event_handler)
app.add_event_handler("shutdown", shutdown_event_handler)

async def create_fhir_bundle_from_json(json_data: str, output_file: str):
    logger.info("JSON data to be parsed: %s", json_data)
    
    try:
        data = pd.read_json(StringIO(json_data))
    except ValueError as e:
        logger.error("Error parsing JSON: %s", e)
        return None

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

    with open(output_file, 'w') as f:
        json.dump(fhir_bundle, f, indent=4)
    logger.info(f"FHIR bundle created and saved to {output_file}")
    return fhir_bundle

def create_observation(record: pd.Series) -> dict:
    """Creates a FHIR Observation for a single record."""
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
            "reference": f"Country/{record['countriesAndTerritories']}"
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

@app.post('/api/data')
async def handle_post_request(background_tasks: BackgroundTasks, request: Request):
    data = await request.json()
    logger.info("POST request received with data: %s", data)
    background_tasks.add_task(create_fhir_bundle_from_json, json.dumps(data), 'style/fhir_sample.json')
    return JSONResponse(content={"status": "success", "data_received": data})

@app.get("/")
async def main():
    return FileResponse("style/index.html")


@app.get("/filtered_european_data.json")
async def get_filtered_european_data():
    return FileResponse("style/filtered_european_data.json")

@app.get("/script.js")
async def get_script_js():
    return FileResponse("style/script.js")

@app.get("/fhir_bundle.json") 
async def get_fhir_bundle():
    return FileResponse("style/fhir_bundle.json")

@app.get("/fhir_sample.json")  
async def get_fhir_sample():
    return FileResponse("style/fhir_sample.json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
