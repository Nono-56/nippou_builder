from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

import database as db
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    first_error = exc.errors()[0] if exc.errors() else {}
    msg = first_error.get("msg", "入力値が不正です。")
    return JSONResponse(status_code=400, content={"error": msg})


# ── Health ─────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Username-based tasks ───────────────────────────────────────

def _validated_username(raw: str) -> str:
    try:
        return models.CreateUserRequest(username=raw).username
    except Exception:
        raise HTTPException(status_code=400, detail="ユーザー名が不正です。")


@app.get("/api/u/{username}/tasks")
def get_tasks_by_username(username: str):
    username = _validated_username(username)
    result = db.require_space_by_username(username)
    if result is None:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません。")
    return result


@app.post("/api/u/{username}/tasks")
def create_task_by_username(username: str, body: models.UsernameTaskRequest):
    username = _validated_username(username)
    result = db.insert_task_by_username(username, body.task.model_dump())
    if result is None:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません。")
    return result


@app.delete("/api/u/{username}/tasks/{task_id}")
def delete_task_by_username(username: str, task_id: str):
    username = _validated_username(username)
    if not task_id.strip():
        raise HTTPException(status_code=400, detail="削除対象のタスク ID が不正です。")
    result = db.delete_task_by_username(username, task_id.strip())
    if result is None:
        raise HTTPException(status_code=404, detail="ユーザーまたはタスクが見つかりません。")
    return result


# ── User management ────────────────────────────────────────────

@app.get("/api/users")
def get_users():
    return {"users": db.list_users()}


@app.post("/api/users", status_code=201)
def post_user(body: models.CreateUserRequest):
    user = db.create_user(body.username)
    if user is None:
        raise HTTPException(status_code=400, detail="そのユーザー名は既に使用されています。")
    return {"user": user}


@app.delete("/api/users/{username}")
def del_user(username: str):
    username = _validated_username(username)
    if not db.delete_user(username):
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません。")
    return {"success": True}
