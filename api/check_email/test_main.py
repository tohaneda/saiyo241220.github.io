# テストコード
# import pytest  # 未使用のため削除
from main import check_address, search_email_in_df, load_csv_to_dataframe
from unittest.mock import Mock, patch
import pandas as pd
import json


def test_check_address_with_json():
    test_data = pd.DataFrame(
        {"email": ["test@example.com"], "name": ["Test User"], "age": [30]}
    )

    with patch("main.load_csv_from_storage") as mock_load:
        # Cloud Storage読み込みをモック
        mock_load.return_value = test_data

        mock_request = type(
            "Request",
            (),
            {
                "method": "POST",
                "get_json": lambda silent=False: {"email": "test@example.com"},
                "args": {},
            },
        )

        response, status_code, headers = check_address(mock_request)
        response_data = json.loads(response)
        assert status_code == 200
        assert response_data["name"] == "Test User"
        assert response_data["age"] == 30


def test_check_address_with_args():
    test_data = pd.DataFrame(
        {"email": ["test@example.com"], "name": ["Test User"], "age": [30]}
    )

    with patch("main.load_csv_from_storage") as mock_load:
        mock_load.return_value = test_data

        mock_request = type(
            "Request",
            (),
            {
                "method": "GET",
                "get_json": lambda silent=False: None,
                "args": {"email": "test@example.com"},
            },
        )

        response, status_code, headers = check_address(mock_request)
        response_data = json.loads(response)
        assert status_code == 200
        assert response_data["name"] == "Test User"
        assert response_data["age"] == 30


def test_check_address_with_nonexistent_email():
    test_data = pd.DataFrame(
        {"email": ["other@example.com"], "name": ["Other User"], "age": [25]}
    )

    with patch("main.load_csv_from_storage") as mock_load:
        mock_load.return_value = test_data

        mock_request = type(
            "Request",
            (),
            {
                "method": "POST",
                "get_json": lambda silent=False: {"email": "test@example.com"},
                "args": {},
            },
        )

        response, status_code, headers = check_address(mock_request)
        response_data = json.loads(response)
        assert status_code == 404
        assert response_data["message"] == "User not found"


def test_check_address_without_email():
    mock_request = type(
        "Request",
        (),
        {
            "method": "POST",
            "get_json": lambda silent=False: {},
            "args": {},
        },
    )

    response, status_code, headers = check_address(mock_request)
    response_data = json.loads(response)
    assert status_code == 400
    assert "error" in response_data


def test_check_address_options_request():
    mock_request = type(
        "Request",
        (),
        {
            "method": "OPTIONS",
            "get_json": lambda silent=False: {},
            "args": {},
        },
    )

    response, status_code, headers = check_address(mock_request)
    assert status_code == 204
    assert headers["Access-Control-Allow-Origin"] == "*"
    assert "Access-Control-Allow-Methods" in headers


def test_search_email_in_df():
    # DataFrameの検索機能のテスト
    test_data = pd.DataFrame(
        {"email": ["test@example.com"], "name": ["Test User"], "age": [30]}
    )

    # 存在するメールアドレスの検索
    result = search_email_in_df(test_data, "test@example.com")
    assert result is not None
    assert result["name"] == "Test User"

    # 存在しないメールアドレスの検索
    result = search_email_in_df(test_data, "nonexistent@example.com")
    assert result is None


def test_load_csv_to_dataframe(tmp_path):
    # CSVファイル読み込みのテスト
    test_csv = tmp_path / "test.csv"
    test_csv.write_text("email,name\ntest@example.com,Test User")

    df = load_csv_to_dataframe(str(test_csv))
    assert len(df) == 1
    assert df.iloc[0]["email"] == "test@example.com"


def test_check_address_integration():
    test_data = pd.DataFrame(
        {"email": ["test@example.com"], "name": ["Test User"], "age": [30]}
    )

    with patch("main.load_csv_from_storage") as mock_load:
        mock_load.return_value = test_data

        mock_request = type(
            "Request",
            (),
            {
                "method": "POST",
                "get_json": lambda silent=False: {"email": "test@example.com"},
                "args": {},
            },
        )

        response, status_code, headers = check_address(mock_request)
        response_data = json.loads(response)
        assert status_code == 200
        assert response_data["name"] == "Test User"
