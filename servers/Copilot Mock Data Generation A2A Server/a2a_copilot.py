import requests
import time
from dotenv import load_dotenv 
import os 

load_dotenv() 
DIRECT_LINE_SECRET = os.environ['COPILOT_DIRECT_LINE_SECRET']
BASE_URL = os.environ['COPILOT_BASE_URL']

class CopilotAgent: 
    def start_conversation(self, token):
        """Start a new conversation and return conversationId + token."""
        res = requests.post(
            f"{BASE_URL}/conversations",
            headers={"Authorization": f"Bearer {token}"}
        )
        res.raise_for_status()
        return res.json() 


    def send_message(self, token, conversation_id, text):
        """Send a message to the bot."""
        res = requests.post(
            f"{BASE_URL}/conversations/{conversation_id}/activities",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "type": "message",
                "from": {"id": "user1", "name": "User"},
                "text": text
            }
        )
        res.raise_for_status()
        return res.json()  


    def get_activities(self, token, conversation_id, watermark=None):
        """Poll for new activities (messages) from the bot."""
        url = f"{BASE_URL}/conversations/{conversation_id}/activities"
        if watermark is not None:
            url += f"?watermark={watermark}"
        res = requests.get(url, headers={"Authorization": f"Bearer {token}"})
        res.raise_for_status()
        return res.json() 


    def wait_for_reply(self, token, conversation_id, watermark, timeout=100):
        """Poll until we get a response from the bot, returning (reply, new_watermark)."""
        deadline = time.time() + timeout

        while time.time() < deadline:
            data = self.get_activities(token, conversation_id, watermark)
            new_watermark = data.get("watermark", watermark)

            for activity in data.get("activities", []):
                if activity.get("from", {}).get("id") == "user1":
                    continue
                if activity.get("type") == "message":
                    return activity.get("text"), new_watermark

            watermark = new_watermark
            time.sleep(1)

        return None, watermark

    
    def invoke(self, task: str):
        convo = self.start_conversation(DIRECT_LINE_SECRET)
        token = convo["token"]
        conversation_id = convo["conversationId"]
        watermark = None
        print(convo)
        self.send_message(token, conversation_id, task)
        reply, watermark = self.wait_for_reply(token, conversation_id, watermark, timeout=60)
        print(reply)
        return reply if reply else "(no response)"



