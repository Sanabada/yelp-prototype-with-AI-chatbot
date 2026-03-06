function History() {

  const historyItems = [
    { id: 1, name: "Pasta Palace", action: "Reviewed" },
    { id: 2, name: "Sushi Zen", action: "Added to Favorites" }
  ];

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">Activity History</h2>

      <div className="card p-4 shadow-sm">
        {historyItems.map((item, index) => (
          <div key={index} className="border-bottom pb-3 mb-3">
            <strong>{item.name}</strong>
            <p className="text-muted mb-0">{item.action}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default History;