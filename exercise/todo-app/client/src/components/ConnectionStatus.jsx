import { useState, useEffect } from "react";

function ConnectionStatus({ apiUrl }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/status`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching API status:", error);
        setError("Failed to connect to the API");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (loading) {
    return <div className="connection-status loading">Checking connections...</div>;
  }

  if (error) {
    return <div className="connection-status error">{error}</div>;
  }

  return (
    <div className="connection-status">
      <h3>Service Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">API:</span>
          <span className={`status-value ${status ? "connected" : "disconnected"}`}>
            {status ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Database:</span>
          <span 
            className={`status-value ${status?.database?.connected ? "connected" : "disconnected"}`}
          >
            {status?.database?.connected ? "Connected" : "Disconnected"}
            {status?.database?.type && ` (${status.database.type})`}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Cache:</span>
          <span 
            className={`status-value ${status?.cache?.connected ? "connected" : "disconnected"}`}
          >
            {status?.cache?.connected ? "Connected" : "Disconnected"}
            {status?.cache?.version && ` (Redis ${status.cache.version})`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConnectionStatus;
