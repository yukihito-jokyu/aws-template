import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  uuid: string;
  username: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [error, setError] = useState("");
  const endPoint = import.meta.env.VITE_ENDPOINT;

  const API_BASE_URL = `${endPoint}/api`;

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
      setError("");
    } catch (error) {
      setError("ユーザー一覧の取得に失敗しました");
      console.error("Error fetching users:", error);
    }
  };

  // ユーザーを作成
  const createUser = async () => {
    if (!newUsername.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/users`, {
        username: newUsername,
      });
      setNewUsername("");
      setError("");
      fetchUsers();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError("そのユーザー名は既に使用されています");
      } else {
        setError("ユーザーの作成に失敗しました");
      }
      console.error("Error creating user:", error);
    }
  };

  // ユーザーを更新
  const updateUser = async () => {
    if (!editingUser || !editUsername.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/users/${editingUser.uuid}`, {
        username: editUsername,
      });
      setEditingUser(null);
      setEditUsername("");
      setError("");
      fetchUsers();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError("そのユーザー名は既に使用されています");
      } else if (error.response?.status === 404) {
        setError("ユーザーが見つかりません");
      } else {
        setError("ユーザーの更新に失敗しました");
      }
      console.error("Error updating user:", error);
    }
  };

  // ユーザーを削除
  const deleteUser = async (uuid: string) => {
    if (!confirm("このユーザーを削除しますか？")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/users/${uuid}`);
      setError("");
      fetchUsers();
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError("ユーザーが見つかりません");
      } else {
        setError("ユーザーの削除に失敗しました");
      }
      console.error("Error deleting user:", error);
    }
  };

  // 編集開始
  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setError("");
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingUser(null);
    setEditUsername("");
    setError("");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>ユーザー管理</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", padding: "10px", backgroundColor: "#ffe6e6", border: "1px solid red" }}>
          {error}
        </div>
      )}

      {/* ユーザー作成フォーム */}
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h2>新しいユーザーを作成</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="ユーザー名を入力"
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", flex: 1 }}
          />
          <button
            onClick={createUser}
            style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            作成
          </button>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div>
        <h2>ユーザー一覧</h2>
        {users.length === 0 ? (
          <p>ユーザーが登録されていません</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {users.map((user) => (
              <div key={user.uuid} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                {editingUser?.uuid === user.uuid ? (
                  // 編集モード
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", flex: 1 }}
                    />
                    <button
                      onClick={updateUser}
                      style={{ padding: "6px 12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  // 表示モード
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{user.username}</strong>
                      <br />
                      <small style={{ color: "#666" }}>UUID: {user.uuid}</small>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => startEdit(user)}
                        style={{ padding: "6px 12px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteUser(user.uuid)}
                        style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;