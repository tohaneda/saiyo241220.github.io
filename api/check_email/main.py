import functions_framework
import pandas as pd
from google.cloud import storage
import json
from typing import Dict, Optional
from dotenv import load_dotenv
import os
import logging
from schemas import UserResult, ApiResponse

# ログの設定
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 環境変数の読み込み
load_dotenv()
BUCKET_NAME = os.getenv("BUCKET_NAME")
FILE_NAME = os.getenv("CSV_FILE_NAME")


def get_storage_blob(bucket_name: str, file_name: str) -> storage.Blob:
    """Cloud Storageからblobを取得"""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        return bucket.blob(file_name)
    except Exception as e:
        logger.error(f"Error getting storage blob: {e}")
        raise e


def download_csv(blob: storage.Blob, temp_path: str = "/tmp/data.csv") -> str:
    """blobからCSVファイルをダウンロード"""
    blob.download_to_filename(temp_path)
    return temp_path


def load_csv_to_dataframe(file_path: str) -> pd.DataFrame:
    """CSVファイルをDataFrameとして読み込み"""
    df = pd.read_csv(file_path)
    logger.debug(f"列名一覧: {df.columns.tolist()}")  # 列名を確認
    logger.debug(f"データの最初の数行:\n{df.head()}")  # 最初の数行を確認
    return df


def search_email_in_df(df: pd.DataFrame, email: str) -> Optional[Dict]:
    """DataFrameからemailを検索"""
    result = df[df["email"] == email]
    logger.debug(f"result: {result}")
    if len(result) > 0:
        return result.iloc[0].to_dict()
    return None


def load_csv_from_storage(bucket_name: str, file_name: str) -> pd.DataFrame:
    """上記の関数を組み合わせた統合関数"""
    blob = get_storage_blob(bucket_name, file_name)
    temp_path = download_csv(blob)
    return load_csv_to_dataframe(temp_path)


def cors_headers():
    """CORSヘッダーを設定"""
    # TODO: CORSヘッダーを設定
    headers = {
        "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json",
    }
    return headers


@functions_framework.http
def check_address(request):
    """メールアドレスの存在確認"""
    logger.debug(f"request: {request}")

    # CORSヘッダーを設定
    headers = cors_headers()

    # プリフライトリクエスト（OPTIONS）への対応
    if request.method == "OPTIONS":
        return ("", 204, headers)

    # リクエストデータの取得
    request_json = request.get_json(silent=True)
    logger.debug(f"request_json: {request_json}")
    request_args = request.args
    logger.debug(f"request_args: {request_args}")

    # メールアドレスの取得
    if request_json and "email" in request_json:
        email = request_json["email"]
    elif request_args and "email" in request_args:
        email = request_args["email"]
    else:
        response_data = ApiResponse(success=False, message="Email not provided")
        return (response_data.to_json(), 400, headers)

    try:
        # CSVファイルの読み込み
        df = load_csv_from_storage(BUCKET_NAME, FILE_NAME)
        # メールアドレスの検索
        result = search_email_in_df(df, email)
        logger.debug(f"result: {result}")

        if result:
            user_result = UserResult(**result)
            response_data = ApiResponse(success=True, data=user_result.to_dict())
            return (response_data.to_json(), 200, headers)

        response_data = ApiResponse(success=False, message="User not found")
        return (response_data.to_json(), 404, headers)

    except Exception as e:
        print(f"Error creating UserResult: {e}")
        print(f"Result data: {result}")
        response_data = ApiResponse(success=False, message=f"Server error: {str(e)}")
        return (response_data.to_json(), 500, headers)
