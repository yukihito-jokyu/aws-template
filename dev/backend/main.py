from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
from dotenv import load_dotenv
from typing import List, Optional
import uuid
import os

load_dotenv()

app = FastAPI()

# CORS設定（React側からアクセスできるようにする）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("DB_ORIGIN")],  # ReactのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベース接続設定
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE"),
        charset=os.getenv("DB_CHARSET"),
        cursorclass=pymysql.cursors.DictCursor
    )

# Pydantic モデル定義
class UserCreate(BaseModel):
    username: str

class UserUpdate(BaseModel):
    username: str

class UserResponse(BaseModel):
    uuid: str
    username: str

# Users CRUD API エンドポイント

@app.get("/api/users", response_model=List[UserResponse])
async def get_users():
    """全ユーザーを取得"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT uuid, username FROM users")
            users = cursor.fetchall()
        connection.close()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    """ユーザーを作成"""
    try:
        user_uuid = str(uuid.uuid4())
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (uuid, username) VALUES (%s, %s)",
                (user_uuid, user.username)
            )
        connection.commit()
        connection.close()
        return UserResponse(uuid=user_uuid, username=user.username)
    except pymysql.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{user_uuid}", response_model=UserResponse)
async def update_user(user_uuid: str, user: UserUpdate):
    """ユーザー名を更新"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE users SET username = %s WHERE uuid = %s",
                (user.username, user_uuid)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="User not found")
        connection.commit()
        connection.close()
        return UserResponse(uuid=user_uuid, username=user.username)
    except HTTPException:
        raise
    except pymysql.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{user_uuid}")
async def delete_user(user_uuid: str):
    """ユーザーを削除"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE uuid = %s", (user_uuid,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="User not found")
        connection.commit()
        connection.close()
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)