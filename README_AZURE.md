# FlowSync AI - Azure Deployment Guide

This project is built to deploy natively into the Microsoft Azure Cloud ecosystem using **Azure Container Apps** (for the real-time WebSocket FastAPI backend) and **Azure Static Web Apps** (for the React Frontend). The background ML data aggregation uses **Azure Functions** and **Azure Cosmos DB**.

## 1. Deploying the Database (Azure Cosmos DB)
To store the historical Traffic AI Action Logs and massive 10-minute forecasting arrays:
1. Go to the Azure Portal -> Create a resource -> **Azure Cosmos DB for NoSQL**.
2. Create a Database named `FlowSyncAI` and a container named `TrafficLogs` with partition key `/node_id`.
3. Copy the **URI** and **Primary Key**. 
4. Paste these into your `backend/cosmos_db.py` environment variables or `local.settings.json`.

## 2. Deploying the Real-Time ML Engine (FastAPI)
FastAPI uses WebSockets, which are fully supported on Azure Container Apps or Azure App Service (Linux).
1. Open the terminal in `backend/`
2. Run `az login`
3. Run `az webapp up --runtime "PYTHON:3.11" --os-type linux --name flowsync-ai-backend --sku F1`
   - *(Note: Ensure WebSockets are toggled ON in the App Service Configuration settings in the portal).*

## 3. Deploying the Serverless Background Workers (Azure Functions)
The `azure_cloud` directory contains the scaffold for deploying cron-job ML data workers that can run every 5 minutes and dump historical analytics to Cosmos DB without bogging down the main real-time WebSocket loop.
1. Navigate to `azure_cloud/`
2. `func azure functionapp publish <YourFunctionAppName>`

## 4. Deploying the Frontend (Azure Static Web Apps)
1. Push your code to GitHub.
2. In Azure Portal, search for **Static Web Apps**.
3. Create a new app, link your GitHub repository.
4. Set the Build Details:
   - App Location: `frontend_v2`
   - Output Location: `dist`
5. Azure will automatically build the beautiful React Glassmorphism V4 dashboard and give you a public URL.

## 5. Integrating Azure Machine Learning (V14 Migration)
For enterprise-scale traffic forecasting, you can migrate the Scikit-Learn model to a managed Azure ML endpoint:
1. Ensure `azure-ai-ml` and `azure-identity` are installed in the backend.
2. Use `backend/azure_ml_utils.py` to register the model:
   ```python
   # Example usage in a deployment script
   from azure_ml_utils import register_flowsync_model
   register_flowsync_model("YourWS", "YourRG", "YourSubID")
   ```
3. Update `ml_model.py` to use `predict_remote_azure()` instead of local inference to offload heavy city-wide compute to Azure's managed GPU/CPU clusters.
