import re
from pydantic import BaseModel, field_validator
from typing import Optional


class ConnectRequest(BaseModel):
    syncCode: str

    @field_validator("syncCode")
    @classmethod
    def validate_sync_code(cls, v: str) -> str:
        v = v.strip()
        if not (3 <= len(v) <= 64):
            raise ValueError("共有コードは 3 文字以上 64 文字以下で入力してください。")
        return v


class TaskInput(BaseModel):
    id: str
    date: str
    startTime: str
    endTime: str
    content: str

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v.strip()):
            raise ValueError("日付の形式が不正です (YYYY-MM-DD)。")
        return v.strip()

    @field_validator("startTime", "endTime")
    @classmethod
    def validate_time(cls, v: str) -> str:
        if not re.match(r"^\d{2}:\d{2}$", v.strip()):
            raise ValueError("時刻の形式が不正です (HH:MM)。")
        return v.strip()

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        v = v.strip()
        if not (1 <= len(v) <= 500):
            raise ValueError("内容は 1 文字以上 500 文字以下で入力してください。")
        return v


class CreateTaskRequest(BaseModel):
    syncCode: str
    task: TaskInput

    @field_validator("syncCode")
    @classmethod
    def validate_sync_code(cls, v: str) -> str:
        v = v.strip()
        if not (3 <= len(v) <= 64):
            raise ValueError("共有コードが不正です。")
        return v


class UsernameTaskRequest(BaseModel):
    task: TaskInput


class CreateUserRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-z0-9_-]{3,32}$", v):
            raise ValueError("ユーザー名は英数字・ハイフン・アンダースコアで3〜32文字にしてください。")
        return v
