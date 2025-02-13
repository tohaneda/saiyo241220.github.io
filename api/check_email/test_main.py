# テストコード
# import pytest  # 未使用のため削除
from main import check_address
from unittest.mock import patch
import pandas as pd


def test_check_address_with_json():
    # get_jsonメソッドを修正してsilentパラメータに対応
    def mock_get_json(silent=False):
        return {"email": "test@example.com"}

    mock_request = type("Request", (), {"get_json": mock_get_json, "args": {}})
    response = check_address(mock_request)
    assert response == "email: test@example.com"


def test_check_address_with_args():
    mock_request = type(
        "Request",
        (),
        {
            "get_json": lambda silent=False: None,
            "args": {"email": "test@example.com"},
        },
    )
    response = check_address(mock_request)
    assert response[0] == "email: test@example.com"


def test_check_address_with_existing_email():
    # テスト用のDataFrame
    test_data = pd.DataFrame(
        {"email": ["test@example.com"], "name": ["Test User"], "age": [30]}
    )

    # Cloud Storage読み込みをモック
    with patch("main.load_csv_from_storage") as mock_load:
        mock_load.return_value = test_data

        # リクエストのモック
        mock_request = type(
            "Request",
            (),
            {
                "get_json": lambda silent=False: {"email": "test@example.com"},
                "args": {},
            },
        )

        response = check_address(mock_request)
        assert '"name": "Test User"' in response
        assert '"age": 30' in response


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
                "get_json": lambda silent=False: {"email": "test@example.com"},
                "args": {},
            },
        )

        response, status_code = check_address(mock_request)
        assert status_code == 404
        assert '"message":"User not found"' in response
