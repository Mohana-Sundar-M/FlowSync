import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions
import datetime
import traceback

# For production, these would be in local.settings.json / environment variables
COSMOS_ENDPOINT = os.environ.get("COSMOS_ENDPOINT", "https://your-cosmos-db-account.documents.azure.com:443/")
COSMOS_KEY = os.environ.get("COSMOS_KEY", "your_primary_key_here")
DATABASE_NAME = "FlowSyncAI"
CONTAINER_NAME = "TrafficLogs"

# Initialize Client lazily to prevent crashing local dev if keys aren't set
_client = None
_container = None

def get_cosmos_container():
    global _client, _container
    if _container is not None:
        return _container
        
    if COSMOS_KEY == "your_primary_key_here":
        return None # Return None gracefully if not configured
        
    try:
        _client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
        database = _client.create_database_if_not_exists(id=DATABASE_NAME)
        _container = database.create_container_if_not_exists(
            id=CONTAINER_NAME,
            partition_key=PartitionKey(path="/node_id"),
            offer_throughput=400
        )
        return _container
    except Exception as e:
        print(f"Cosmos DB Init Error: {e}")
        return None

def log_action_to_cosmos(node_id: str, action_message: str, current_vol: int, predicted_vol: int):
    """Asynchronously logs an AI action to Azure Cosmos DB"""
    container = get_cosmos_container()
    if not container:
        return
        
    item = {
        "id": f"{node_id}_{datetime.datetime.now().timestamp()}",
        "node_id": node_id,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "action": action_message,
        "volume_current": current_vol,
        "volume_forecast": predicted_vol
    }
    
    try:
        container.upsert_item(item)
    except exceptions.CosmosHttpResponseError as e:
        print(f"Failed to upsert to Cosmos DB: {e}")
