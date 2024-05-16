import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import asyncio
import httpx
import logging
import json

logger = logging.getLogger(__name__)

class SampleJsonHandler(FileSystemEventHandler):
    def __init__(self, file_path: str, post_url: str):
        self.file_path = file_path
        self.post_url = post_url

    def on_modified(self, event):
        if event.src_path == self.file_path:
            logger.info(f"{self.file_path} has been modified. Sending POST request to update fhir_sample.json.")
            asyncio.run(self.send_post_request())

    async def send_post_request(self):
        try:
            with open(self.file_path, 'r') as file:
                data = json.load(file)
            async with httpx.AsyncClient() as client:
                response = await client.post(self.post_url, json=data)
                if response.status_code == 200:
                    logger.info(f"POST request successful: {response.json()}")
                else:
                    logger.error(f"POST request failed: Status code {response.status_code}")
        except Exception as e:
            logger.error(f"Error in sending POST request: {e}")

def start_file_watcher(file_path: str, post_url: str):
    event_handler = SampleJsonHandler(file_path, post_url)
    observer = Observer()
    observer.schedule(event_handler, path=file_path, recursive=False)
    observer.start()
    logger.info(f"Started file watcher for {file_path}")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()