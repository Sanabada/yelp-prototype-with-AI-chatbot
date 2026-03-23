import { clearHistory, getHistory } from "../utils/storage";

function History() {
  const items = getHistory();

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h2 className="fw-bold mb-0">Activity History</h2>
        {items.length > 0 && (
          <button className="btn btn-outline-dark btn-sm" onClick={() => {
            clearHistory();
            window.location.reload();
          }}>
            Clear History
          </button>
        )}
      </div>

      <div className="card p-4 shadow-sm border-0">
        {items.length === 0 ? (
          <p className="text-muted mb-0">No activity yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border-bottom pb-3 mb-3">
              <strong>{item.restaurantName}</strong>
              <p className="text-muted mb-1">{item.action}</p>
              <small className="text-muted">
                {item.city ? `${item.city} • ` : ""}
                {new Date(item.timestamp).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default History;
