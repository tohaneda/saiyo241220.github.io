from dataclasses import dataclass
from typing import Dict, Optional
import json


@dataclass
class ReferralResult:
    company: str
    name: str
    email: str
    phone: str
    address: str
    notes: str
    situation: str
    interest: str
    consent: bool

    def to_dict(self) -> Dict:
        """JavaScriptで使用するための辞書形式に変換"""
        return {
            "company": self.company,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "notes": self.notes,
            "situation": self.situation,
            "interest": self.interest,
            "consent": self.consent,
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
