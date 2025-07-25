import { useEffect, useState } from "react";
import axios from "axios";
import UserManagement from "./components/UserManagement";

function App() {
  const [message, setMessage] = useState<string>("");
  const endPoint = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    // API呼び出し
    axios.get(`${endPoint}/api/hello`)
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("API呼び出しエラー:", error);
      });
  }, []);

  return (
    <div>
      <div style={{ padding: "20px", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
        <h1>FastAPIからのメッセージ:</h1>
        <p>{message}</p>
      </div>
      <UserManagement />
    </div>
  );
}

export default App;
