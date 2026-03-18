import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import os

def train():
    data_path = os.path.join(os.path.dirname(__file__), "traffic_history.csv")
    model_path = os.path.join(os.path.dirname(__file__), "traffic_model.pkl")
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run generate_training_data.py first.")
        return

    print("Loading historical CSV dataset...")
    df = pd.read_csv(data_path)
    
    # We must treat node_id as a category or integer so the RandomForest can use it
    # For a real pipeline, we'd one-hot encode. For simplicity, we convert string ID to int hash
    df['node_id_hash'] = df['node_id'].apply(lambda x: hash(str(x)) % 10000)
    
    # Features (X)
    X = df[['node_id_hash', 'day_of_week', 'hour', 'minute', 'is_raining', 'is_holiday']]
    
    # Targets (Y). We predict BOTH current exact volume and future volume
    y = df[['volume_count', 'volume_10m']]

    print("Splitting dataset into Training and Validation sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor model (This may take a moment)...")
    # Quick, robust model. 
    model = RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("Validating model accuracy...")
    y_pred = model.predict(X_test)
    
    r2 = r2_score(y_test, y_pred, multioutput='variance_weighted')
    mse = mean_squared_error(y_test, y_pred)
    
    print(f"Model Performance:")
    print(f"   R^2 Score (Accuracy): {r2:.4f} (1.0 is perfect)")
    print(f"   Mean Squared Error:   {mse:.2f}")
    
    if r2 < 0.5:
        print("Warning: Model accuracy is low. The simulation data might be too noisy.")
    else:
        print("Model trained successfully!")

    print(f"Saving compiled AI model to {model_path}...")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print("Ready for live production inference.")

if __name__ == "__main__":
    train()
