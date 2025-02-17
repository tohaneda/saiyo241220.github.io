import functions_framework
import logging
from dotenv import load_dotenv
import os
from schemas import ReferralResult, ApiResponse
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from datetime import datetime
import pickle
from googleapiclient.errors import HttpError

# ログの設定
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 環境変数の読み込み
load_dotenv()
GOOGLE_ACCOUNT_KEY = os.getenv("GOOGLE_ACCOUNT_KEY")
ACCESS_CONTROL_ALLOW_ORIGIN = os.getenv("ACCESS_CONTROL_ALLOW_ORIGIN")
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def cors_headers():
    """CORSヘッダーを設定"""
    headers = {
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
        "Content-Type": "application/json",
    }
    return headers


def get_credentials():
    """環境に応じた認証情報の取得"""
    env = os.getenv("ENVIRONMENT", "development")
    print(f"Current environment: {env}")  # デバッグ用

    try:
        if env == "development":
            creds = get_oauth_credentials()
        else:
            creds = get_service_account_credentials()

        # 認証情報の有効性チェック
        print(f"Credentials type: {type(creds)}")
        print(f"Credentials valid: {creds.valid if hasattr(creds, 'valid') else 'N/A'}")
        return creds
    except Exception as e:
        print(f"Error getting credentials: {e}")
        raise


def get_oauth_credentials():
    """開発環境用のOAuth認証"""
    creds = None
    token_path = os.getenv("TOKEN_PATH", "token.pickle")

    # 保存済みトークンがあれば読み込む
    if os.path.exists(token_path):
        with open(token_path, "rb") as token:
            creds = pickle.load(token)

    # 有効な認証情報がない場合は新規作成
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_secrets_path = os.getenv(
                "CLIENT_SECRETS_PATH", "client_secrets.json"
            )
            flow = InstalledAppFlow.from_client_secrets_file(
                client_secrets_path, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # トークンを保存
        with open(token_path, "wb") as token:
            pickle.dump(creds, token)

    return creds


def get_service_account_credentials():
    """ステージング/本番環境用のサービスアカウント認証"""
    service_account_path = os.getenv("GOOGLE_ACCOUNT_KEY")
    if not service_account_path:
        raise ValueError("GOOGLE_ACCOUNT_KEY environment variable is not set")

    return service_account.Credentials.from_service_account_file(
        service_account_path, scopes=SCOPES
    )


def get_sheet():
    """シートの取得"""
    credentials = get_credentials()
    logger.debug(f"credentials: {credentials}")
    service = build("sheets", "v4", credentials=credentials)
    sheet = service.spreadsheets()
    return sheet


@functions_framework.http
def spreadsheet_api(request):
    """スプレッドシートAPI"""
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

    # リクエストデータのバリデーション
    # if not request_json or not request_args:
    #     response_data = ApiResponse(success=False, message="Invalid request")
    #     return (response_data.to_json(), 400, headers)

    # リクエストデータの取得
    referral_data = ReferralResult(**request_json)

    # スプレッドシートへの登録
    result = add_referral_to_spreadsheet(SPREADSHEET_ID, referral_data)
    logger.debug(f"result: {result}")

    if result:
        response_data = ApiResponse(success=True, data=referral_data.to_dict())
        return (response_data.to_json(), 200, headers)

    response_data = ApiResponse(success=False, message="User not found")
    return (response_data.to_json(), 404, headers)


def add_referral_to_spreadsheet(spreadsheet_id, referral_data: ReferralResult):
    try:
        service = build("sheets", "v4", credentials=get_credentials())

        # スプレッドシートIDの確認
        print(f"Using Spreadsheet ID: {spreadsheet_id}")

        # スプレッドシートの存在確認
        try:
            sheet_metadata = (
                service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
            )
            print(
                f"Spreadsheet title: {sheet_metadata.get('properties', {}).get('title')}"
            )
        except HttpError as e:
            print(f"Error accessing spreadsheet: {e}")
            raise

        # 範囲指定を最もシンプルな形式に変更
        range_ = "A1"  # 単一セルを指定

        values = [
            [
                referral_data.company,
                referral_data.name,
                referral_data.email,
                referral_data.phone,
                referral_data.address,
                referral_data.notes,
                referral_data.situation,
                referral_data.interest,
                referral_data.consent,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            ]
        ]

        body = {"values": values}

        # デバッグ用のログ追加
        print(f"Spreadsheet ID: {spreadsheet_id}")
        print(f"Range: {range_}")
        print(f"Values: {values}")

        result = (
            service.spreadsheets()
            .values()
            .append(
                spreadsheetId=spreadsheet_id,
                range=range_,
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body=body,
            )
            .execute()
        )

        return result

    except HttpError as error:
        print(f"An error occurred: {error}")
        raise error


def verify_spreadsheet_access(service, spreadsheet_id):
    """スプレッドシートへのアクセス権限を確認"""
    try:
        # 読み取り権限の確認
        service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id, range="Sheet1!A1"
        ).execute()
        print("Read access: OK")

        # 書き込み権限の確認
        test_value = [["Test"]]
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!A1",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": test_value},
        ).execute()
        print("Write access: OK")

    except HttpError as e:
        print(f"Access verification failed: {e}")
        raise
