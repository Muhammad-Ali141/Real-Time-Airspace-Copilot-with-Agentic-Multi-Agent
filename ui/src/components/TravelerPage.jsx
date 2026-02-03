import React, { useState } from "react";
import axios from "axios";
import { MCP_SERVER_URL } from "../App.jsx";
import TravelerForm from "./TravelerForm.jsx";
import ChatWindow from "./ChatWindow.jsx";

const TravelerPage = ({ mcpConnected }) => {
  const [callsign, setCallsign] = useState("");
  const [question, setQuestion] = useState("");
  const [region, setRegion] = useState("region1");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!callsign || !question) return;

    if (!mcpConnected) {
      setChat((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Cannot connect to MCP server. Please ensure it is running on localhost:8000.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    const userMsg = {
      role: "user",
      callsign,
      content: question,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChat((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const res = await axios.post(`${MCP_SERVER_URL}/traveler/query`, {
        callsign,
        question,
        region,
      });
      const data = res.data;
      const agentMsg = {
        role: "agent",
        content:
          data.traveler_response || "No response received from traveler agent.",
        timestamp: new Date().toLocaleTimeString(),
        need_ops: data.need_ops,
      };
      setChat((prev) => [...prev, agentMsg]);
    } catch (e) {
      const detail =
        e.response?.data?.detail ??
        e.response?.data ??
        e.message ??
        "Unknown error";
      setChat((prev) => [
        ...prev,
        {
          role: "agent",
          content: `Error processing query: ${JSON.stringify(detail)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setChat([]);
    setCallsign("");
    setQuestion("");
  };

  return (
    <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TravelerForm
        callsign={callsign}
        setCallsign={setCallsign}
        question={question}
        setQuestion={setQuestion}
        region={region}
        setRegion={setRegion}
        loading={loading}
        onSend={handleSend}
        onClear={handleClear}
      />
      <ChatWindow messages={chat} />
    </section>
  );
};

export default TravelerPage;


