import functions_framework
import pandas as pd
from google.cloud import storage
import json

BUCKET_NAME = "test-bucket"
FILE_NAME = "users.csv"


# Cloud Storageからファイルを読み込む関数
def load_csv_from_storage(bucket_name, file_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    # 一時ファイルとしてダウンロード
    temp_file_path = "/tmp/data.csv"
    blob.download_to_filename(temp_file_path)

    # pandasでCSVを読み込む
    df = pd.read_csv(temp_file_path)
    return df


@functions_framework.http
def check_address(request):
    request_json = request.get_json(silent=True)
    request_args = request.args

    # メールアドレスの取得
    if request_json and "email" in request_json:
        email = request_json["email"]
    elif request_args and "email" in request_args:
        email = request_args["email"]
    else:
        return json.dumps({"error": "Email not provided"}), 400

    try:
        # Cloud Storageからデータを読み込む
        df = load_csv_from_storage(BUCKET_NAME, FILE_NAME)

        # emailで検索
        result = df[df["email"] == email]

        if len(result) > 0:
            # 最初の一致行を辞書形式で返す
            user_data = result.iloc[0].to_dict()
            return json.dumps(user_data, ensure_ascii=False)
        else:
            return json.dumps({"message": "User not found"}), 404

    except Exception as e:
        return json.dumps({"error": str(e)}), 500
