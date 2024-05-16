from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging
import json
import asyncio
from typing import Any, Dict, List
from .file_watcher import start_file_watcher 
import threading

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
    await load_and_convert_data(file_path, output_path)
    logger.info("FHIR bundle created and loaded at startup.")
    
    # Start file watcher in a separate thread
    post_url = "http://localhost:8000/api/data"
    threading.Thread(target=start_file_watcher, args=(file_path, post_url), daemon=True).start()
    
    # Delay the test POST request until the server is likely to be ready
    asyncio.create_task(delayed_post_request(file_path))

async def delayed_post_request(file_path: str):
    await asyncio.sleep(5)  # Wait for the server to fully start up
    await send_test_post_request(file_path)

async def load_and_convert_data(file_path: str, output_file: str):
    try:
        with open(file_path, 'r') as file:
            json_data = json.load(file)
        logger.info(f"Loaded JSON data: {json_data}")

        if not json_data:
            logger.error("No data found in the file.")
            return

        fhir_bundle = create_fhir_bundle_from_json(json_data)
        if fhir_bundle:
            with open(output_file, 'w') as f:
                json.dump(fhir_bundle, f, indent=4)
            logger.info(f"FHIR bundle created and saved to {output_file}")
        else:
            logger.error("Failed to create FHIR bundle from data.")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error: {e}")
    except FileNotFoundError:
        logger.error("The specified file path does not exist.")
    except Exception as e:
        logger.error(f"An error occurred: {e}")

def create_fhir_bundle_from_json(data: List[Dict[str, Any]]):
    try:
        entries = [{
            "fullUrl": f"urn:uuid:observation-{item['dateRep']}",
            "resource": create_observation(item)
        } for item in data if validate_item(item)]
        return {
            "resourceType": "Bundle",
            "type": "collection",
            "entry": entries
        }
    except KeyError as e:
        logger.error(f"Missing expected key in data: {e}")
        return {"resourceType": "Bundle", "type": "collection", "entry": []}

def create_observation(record: Dict[str, Any]) -> Dict[str, Any]:
    try:
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
    except KeyError as e:
        logger.error(f"Missing expected key in record: {e}")
        return {}

def validate_item(item: Dict[str, Any]) -> bool:
    required_keys = ['dateRep', 'cases', 'deaths', 'countriesAndTerritories']
    for key in required_keys:
        if key not in item:
            logger.error(f"Missing key '{key}' in item: {item}")
            return False
    return True

async def send_test_post_request(file_path: str):
    url = "http://localhost:8000/api/data"
    try:
        with open(file_path, 'r') as file:
            test_data = json.load(file)
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=test_data)
            if response.status_code == 200:
                logger.info(f"Test POST request sent successfully, received response: {response.json()}")
            else:
                logger.error(f"Failed to send test POST request: Status code {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to read sample.json or send POST request: {e}")

@app.post('/api/data')
async def handle_post_request(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    logger.info(f"POST request received with data: {data}")
    
    if not data:
        logger.error("POST request received empty data.")
        return JSONResponse(content={"status": "failure", "reason": "empty data"}, status_code=400)
    
    try:
        fhir_bundle = create_fhir_bundle_from_json(data)
        if fhir_bundle and fhir_bundle['entry']:
            background_tasks.add_task(save_fhir_bundle, fhir_bundle, 'style/fhir_sample.json')
            return JSONResponse(content={"status": "success", "data_received": data})
        else:
            logger.error("Failed to create FHIR bundle from POSTed data.")
            return JSONResponse(content={"status": "failure", "reason": "invalid data"}, status_code=400)
    except Exception as e:
        logger.error(f"Error processing POST request: {e}")
        return JSONResponse(content={"status": "failure", "reason": "internal error"}, status_code=500)

async def save_fhir_bundle(fhir_bundle: Dict[str, Any], output_file: str):
    try:
        with open(output_file, 'w') as f:
            json.dump(fhir_bundle, f, indent=4)
        logger.info(f"FHIR bundle saved to {output_file}")
    except Exception as e:
        logger.error(f"Failed to save FHIR bundle: {e}")

app.router.on_startup.append(startup_event_handler)

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
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)