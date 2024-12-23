import csv
import json
import sys
import os


def convert_csv_to_json(input_file, output_file):
    # 都道府県ごとの市区町村を格納する辞書
    prefecture_dict = {}

    try:
        # CSVファイルを読み込む
        with open(input_file, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            for row in reader:
                if not row:  # 空行をスキップ
                    continue

                # 市区町村名と都道府県名を取得
                city_name = row[0].strip('"')
                prefecture = row[1].strip('"')

                # 都道府県ごとにリストを作成
                if prefecture not in prefecture_dict:
                    prefecture_dict[prefecture] = []

                # 市区町村を追加
                prefecture_dict[prefecture].append(city_name)

        # JSONファイルに書き出し
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(prefecture_dict, f, ensure_ascii=False, indent=2)

        print(f"変換が完了しました。出力ファイル: {output_file}")

    except FileNotFoundError:
        print(f"エラー: 入力ファイル '{input_file}' が見つかりません。")
        sys.exit(1)
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        sys.exit(1)


def main():
    # コマンドライン引数をチェック
    if len(sys.argv) != 3:
        print(
            "使用方法: python city_data_convert_csv_to_json.py 入力CSVファイル 出力JSONファイル"
        )
        print("例: python city_data_convert_csv_to_json.py city.csv cities.json")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    convert_csv_to_json(input_file, output_file)


if __name__ == "__main__":
    main()
