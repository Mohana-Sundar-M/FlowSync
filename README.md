# FlowSync AI 🚦 (v2 - Real-Time React Upgraded)
**Real-Time Traffic Prediction & Multi-Junction Signal Coordination**
*"Predicting and preventing traffic before it happens."*

## Output Delivered
1. **React + Vite Frontend (`frontend_v2`)**: A beautiful, premium glassmorphism dark mode UI separated into a Public Dashboard and a Management Control System.
2. **WebSocket Real-Time Backend (`backend`)**: A robust FastAPI stream constantly feeding real-time anomaly data without UI polling.
3. **Advanced Azure Architecture Strategy**: Ready for Azure Maps and SignalR scale out.

---

## ⚙️ How to Run Locally

### 1. Start the WebSocket Backend
The Python backend uses FastAPI to provide live predictive signal states over WebSockets.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
You should see: `Uvicorn running on http://127.0.0.1:8000`

### 2. Start the React Frontend
```bash
cd frontend_v2
npm install
npm run dev
```
You should see: `Local: http://localhost:5173/`

---

## ☁️ Azure Cloud Integration Guide

FlowSync AI utilizes **Azure Maps** optimally, and is built to integrate with modern scale-out real-time cloud patterns on Azure.

### 🌐 Integrating Azure Maps
1. Log in to the [Azure Portal](https://portal.azure.com/).
2. Search for **"Azure Maps accounts"**.
3. Click "Create" and set it up (Free/Standard Gen2 tier).
4. Once deployed, open the resource, and go to **Settings > Authentication**.
5. Copy your **Primary Key**.
6. Open the codebase: `frontend_v2/src/components/AzureMap.jsx`.
7. Overwrite line 4:
   ```javascript
   const AZURE_MAPS_KEY = "YOUR_AZURE_MAPS_KEY";
   ```

### ⚡ Architectural Path Forward (Azure Services)
If migrating this prototype to production, the architecture has been prepared for the following:
1. **Azure Web PubSub / Azure SignalR Service**: As traffic spikes, handling thousands of concurrent WebSockets securely requires offloading. The current `ConnectionManager` class inside `main.py` can be easily substituted with Azure Web PubSub event handlers using `azure-messaging-webpubsub`.
2. **Azure Functions**: Moving the `traffic.py` heuristics to a timer-triggered Azure Function that pushes to the PubSub hub, acting as an IoT sensory ingestion point.
3. **Azure Container Apps**: You can easily Dockerize the Vite container and the FastAPI app, deploying them seamlessly for serverless scaling.
