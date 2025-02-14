from dataclasses import dataclass
from typing import Dict, Optional
import json


@dataclass
class UserResult:
    email: str
    name: str
    department: str
    position: str
    phone: str
    join_date: str

    def to_dict(self) -> Dict:
        """JavaScriptで使用するための辞書形式に変換"""
        return {
            "email": self.email,
            "name": self.name,
            "department": self.department,
            "position": self.position,
            "phone": self.phone,
            "join_date": self.join_date,
        }


@dataclass
class ApiResponse:
    success: bool
    data: Optional[Dict] = None
    message: Optional[str] = None

    def to_dict(self) -> Dict:
        return {
            "success": self.success,
            "data": self.data,
            "message": self.message,
        }

    def to_json(self) -> str:
        """JSONシリアライズを行うメソッド"""
        return json.dumps(self.to_dict(), ensure_ascii=False)
