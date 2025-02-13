import functions_framework
import pandas as pd
from google.cloud import storage
import json
from typing import Dict, Optional
from dotenv import load_dotenv
import os

load_dotenv()

BUCKET_NAME = os.getenv("BUCKET_NAME")
FILE_NAME = os.getenv("CSV_FILE_NAME")


def get_storage_blob(bucket_name: str, file_name: str) -> storage.Blob:
    """Cloud Storageからblobを取得"""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    return bucket.blob(file_name)


def download_csv(blob: storage.Blob, temp_path: str = "/tmp/data.csv") -> str:
    """blobからCSVファイルをダウンロード"""
    blob.download_to_filename(temp_path)
    return temp_path


def load_csv_to_dataframe(file_path: str) -> pd.DataFrame:
    """CSVファイルをDataFrameとして読み込み"""
    return pd.read_csv(file_path)


def search_email_in_df(df: pd.DataFrame, email: str) -> Optional[Dict]:
    """DataFrameからemailを検索"""
    result = df[df["email"] == email]
    if len(result) > 0:
        return result.iloc[0].to_dict()
    return None


def load_csv_from_storage(bucket_name: str, file_name: str) -> pd.DataFrame:
    """上記の関数を組み合わせた統合関数"""
    blob = get_storage_blob(bucket_name, file_name)
    temp_path = download_csv(blob)
    return load_csv_to_dataframe(temp_path)


@functions_framework.http
def check_address(request):
    # CORSヘッダーを設定
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
    }

    # プリフライトリクエスト（OPTIONS）への対応
    if request.method == "OPTIONS":
        return ("", 204, headers)

    request_json = request.get_json(silent=True)
    request_args = request.args

    # メールアドレスの取得
    if request_json and "email" in request_json:
        email = request_json["email"]
    elif request_args and "email" in request_args:
        email = request_args["email"]
    else:
        return (json.dumps({"error": "Email not provided"}), 400, headers)

    try:
        df = load_csv_from_storage(BUCKET_NAME, FILE_NAME)
        result = search_email_in_df(df, email)

        if result:
            return (json.dumps(result, ensure_ascii=False), 200, headers)
        return (json.dumps({"message": "User not found"}), 404, headers)

    except Exception as e:
        return (json.dumps({"error": str(e)}), 500, headers)
