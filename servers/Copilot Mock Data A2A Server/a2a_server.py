import os
import uvicorn
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware import Middleware
from dotenv import load_dotenv

from a2a.server.routes import (
    create_agent_card_routes,
    create_jsonrpc_routes,
)
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a_agent_executor import CopilotAgentExecutor
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentInterface,
    AgentSkill,
)

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    # Get port from environment variable
    port = int(os.getenv('A2A_PORT', '9997'))
    
    skill = AgentSkill(
        id='copilotmockdataagent_agent',
        name='CopilotMockDataAgent',
        description='This agent is great at generating synthetic finance data using its mock finance data tool.',
        tags=['mock data', 'synthetic data', 'generate finance data'],
        examples=[
            'Create some synthetic credit card profiles.',
            'Generate some finance personas',
        ],
    )

    public_agent_card = AgentCard(
        name='CopilotMockDataAgent',
        description='This agent is great at generating synthetic finance data using its mock finance data tool.',
        version='0.0.1',
        default_input_modes=['text/plain'],
        default_output_modes=['text/plain'],
        capabilities=AgentCapabilities(
            streaming=False, extended_agent_card=False
        ),
        supported_interfaces=[
            AgentInterface(
                protocol_binding='JSONRPC',
                url=f'http://127.0.0.1:{port}',
            )
        ],
        skills=[skill],
    )

    request_handler = DefaultRequestHandler(
        agent_executor=CopilotAgentExecutor(),
        task_store = InMemoryTaskStore(),
        agent_card = public_agent_card
    )

routes = [*create_agent_card_routes(public_agent_card), *create_jsonrpc_routes(request_handler, '/', enable_v0_3_compat=True )]

class LogRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        body = await request.body()
        print(f"Incoming request: {body.decode()}")
        return await call_next(request)

app = Starlette(routes=routes, middleware=[
    Middleware(LogRequestMiddleware)
])

print(f"Starting A2A server on port {port}")
uvicorn.run(app, host="0.0.0.0", port=port, access_log=True, log_level="debug")
