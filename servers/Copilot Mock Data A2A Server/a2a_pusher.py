import requests
import json
from uuid import uuid4
from dotenv import load_dotenv 
import os 
load_dotenv()
token = os.environ['WXO_TOKEN']
url = os.environ['WXO_PUSH_NOTIFICATION_URL']

def pushNotification(id, task_id, context_id, corr_id, status, message=None): 
    # Surely this could be better? 
    try: 
        payload = json.dumps({
        "id": id,
        "jsonrpc": "2.0",
        "method": "pushNotifications/send",
        "params": {
            "task": {
            "id": task_id,
            "contextId": context_id,
            "kind": "task",
            "metadata": {
                "corr_id": corr_id
            },
            "status": {
                "message": {
                "contextId": context_id,
                "kind": "message",
                "messageId": str(uuid4()),
                "parts": [
                    {
                    "kind": "text",
                    "text": str(message) if message else 'Working on it'
                    }
                ],
                "role": "agent",
                "taskId": task_id
                },
                "state": status
            }
            }
        }
        })
        headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        return {'status':response.status, 'message':response.text}
    except Exception as e: 
        return {'status':'error', 'message':e}
