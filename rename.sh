#!/bin/bash

# 現在のディレクトリ内のすべてのサブディレクトリをループ処理
for dir in */; do
  # ディレクトリが存在しない場合の対策と、末尾のスラッシュを削除
  [[ -d "$dir" ]] || continue
  dir=${dir%/}

  echo "📂 チェック中: ${dir}/"

  # mp3ファイルがディレクトリ内に存在するか確認
  if ls "${dir}"/*.mp3 1> /dev/null 2>&1; then

    # 現在の最大の連番を調べる（初期値は0）
    max_num=0
    for file in "${dir}"/[0-9]*.mp3; do
      if [[ -f "$file" ]]; then
        # ファイル名から数字部分のみを抽出
        base=$(basename "$file" .mp3)
        # 完全に数字だけで構成されているかチェック
        if [[ "$base" =~ ^[0-9]+$ ]]; then
          if (( base > max_num )); then
            max_num=$base
          fi
        fi
      fi
    done

    # 次に割り当てる番号
    next_num=$((max_num + 1))

    # 数字以外の名前がついているファイルをリネーム
    for file in "${dir}"/*.mp3; do
      if [[ -f "$file" ]]; then
        base=$(basename "$file" .mp3)

        # すでに数字だけの名前ならスキップ
        if [[ "$base" =~ ^[0-9]+$ ]]; then
          continue
        fi

        # 新しいファイル名を決定してリネーム
        new_name="${dir}/${next_num}.mp3"
        mv "$file" "$new_name"
        echo "  ✅ リネーム: $(basename "$file") -> ${next_num}.mp3"

        # 次の番号へインクリメント
        next_num=$((next_num + 1))
      fi
    done

  else
    echo "  ※ mp3ファイルがありません。スキップします。"
  fi
done

echo "🎉 全ディレクトリの処理が完了しました！"
