import azure.functions as func
import nest_asyncio
from main import app as fastapi_app

# This allows the FastAPI app to run inside a Function
nest_asyncio.apply()

app = func.AsgiFunctionApp(
    app=fastapi_app, 
    http_auth_level=func.AuthLevel.ANONYMOUS
)
