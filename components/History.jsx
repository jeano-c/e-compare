"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ComparisonTable from "@/components/ComparisonTable";
import { toast } from "sonner";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get("/api/history");
        setHistory(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  async function deleteComparison(id) {
    try {
      await axios.delete(`/api/history`, {
        data: { id },
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {history.length === 0 ? (
        <p className="text-white/60 text-center">No comparisons saved yet</p>
      ) : (
        history.map((item) => (
          <div
            key={item.id}
            className="mb-12 backdrop-blur-lg border border-white/20 rounded-lg p-6 relative"
          >
            <button
              onClick={() => deleteComparison(item.id)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-2xl"
              title="Delete"
            >
              ✕
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Comparison - {item.snapshot.length} Products
              </h2>
              <span className="text-sm text-white/60">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            <ComparisonTable snapshot={item.snapshot} showActions={true} />
          </div>
        ))
      )}
    </div>
  );
}
