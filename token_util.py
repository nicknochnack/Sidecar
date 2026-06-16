import requests
import json
from dotenv import load_dotenv 
import os 
load_dotenv() 


class TokenGenerator(): 
  def __init__(self): 
    self.deployment_type = os.environ.get('WXO_DEPLOYMENT_TYPE', 'AWS')
    self.wxo_api_key = os.environ.get('WXO_API_KEY', 'AWS')
  
  def _get_aws_token(self) -> str: 
    url = "https://iam.platform.saas.ibm.com/siusermgr/api/1.0/apikeys/token"

    payload = json.dumps({
      "apikey": self.wxo_api_key
    })
    headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    token = response.json()['token']
    return token
  
  def _get_saas_token(self) -> str:
    # Update your api token here to generate 
    url = "https://iam.cloud.ibm.com/identity/token"

    payload = f'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey={self.wxo_api_key}'
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    token = response.json()['access_token']
    return token

  def get_token(self): 
    if self.deployment_type == 'AWS': 
      return self._get_aws_token()
    else: 
      return self._get_saas_token() 
    
if __name__ == '__main__': 
  generator = TokenGenerator()
  print(generator.get_token())
