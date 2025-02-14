# テストコード
# import pytest  # 未使用のため削除
from main import check_address, search_email_in_df, load_csv_to_dataframe
from unittest.mock import Mock, patch
import pandas as pd
import json


def test_check_address_with_json():
    test_data = pd.DataFrame(
        {
            "email": ["test@example.com"],
            "name": ["Test User"],
            "department": ["開発部"],
            "position": ["エンジニア"],
            "phone": ["03-1234-5678"],
            "join_date": ["2023-04-01"],  # 全てのフィールドが必要
        }
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
        assert response_data["success"] is True
        assert response_data["data"]["name"] == "Test User"
        assert response_data["data"]["department"] == "開発部"


def test_check_address_with_args():
    test_data = pd.DataFrame(
        {
            "email": ["test@example.com"],
            "name": ["Test User"],
            "department": ["開発部"],
            "position": ["エンジニア"],
            "phone": ["03-1234-5678"],
            "join_date": ["2023-04-01"],
        }
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
        assert response_data["success"] is True
        assert response_data["data"]["name"] == "Test User"
        assert response_data["data"]["department"] == "開発部"


def test_check_address_with_nonexistent_email():
    test_data = pd.DataFrame(
        {
            "email": ["other@example.com"],
            "name": ["Other User"],
            "department": ["営業部"],
            "position": ["マネージャー"],
            "phone": ["03-1234-5678"],
            "join_date": ["2023-04-01"],
        }
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
        assert response_data["success"] is False
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
    assert response_data["success"] is False
    assert response_data["message"] is not None  # エラーメッセージの存在を確認


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
    assert response == ""
    assert headers["Access-Control-Allow-Origin"] == "http://127.0.0.1:3000"
    assert "Access-Control-Allow-Methods" in headers


def test_search_email_in_df():
    test_data = pd.DataFrame(
        {
            "email": ["test@example.com"],
            "name": ["Test User"],
            "department": ["開発部"],
            "position": ["エンジニア"],
            "phone": ["03-1234-5678"],
            "join_date": ["2023-04-01"],
        }
    )

    result = search_email_in_df(test_data, "test@example.com")
    assert result is not None
    assert isinstance(result, dict)
    assert result["name"] == "Test User"
    assert result["department"] == "開発部"

    result = search_email_in_df(test_data, "nonexistent@example.com")
    assert result is None


def test_load_csv_to_dataframe(tmp_path):
    test_csv = tmp_path / "test.csv"
    test_csv.write_text(
        "email,name,department,position,phone,join_date\n"
        "test@example.com,Test User,開発部,エンジニア,03-1234-5678,2023-04-01"
    )

    df = load_csv_to_dataframe(str(test_csv))
    assert len(df) == 1
    assert df.iloc[0]["email"] == "test@example.com"
    assert df.iloc[0]["department"] == "開発部"


def test_check_address_integration():
    test_data = pd.DataFrame(
        {
            "email": ["test@example.com"],
            "name": ["Test User"],
            "department": ["開発部"],
            "position": ["エンジニア"],
            "phone": ["03-1234-5678"],
            "join_date": ["2023-04-01"],
        }
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
        assert response_data["success"] is True
        assert response_data["data"]["name"] == "Test User"
