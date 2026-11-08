# 生詞接接樂

公開遊戲：https://ij-teacher.github.io/medical-chinese-taiwan-site/games/catch/

14 個看醫生生詞的接字遊戲。純 HTML、CSS、JavaScript，不需帳號、外部套件、外部字型或伺服器資料庫。所有教材與程式放在此 GitHub 資料夾。

## 玩法

- 入門：看解釋接生詞，附拼音。
- 進階：完成常見搭配，不顯示拼音。
- 挑戰：看生活情境選詞，不顯示拼音。
- 每輪三張詞卡向下移動。按左右鍵或 1、2、3，點位置按鈕，或拖曳遊戲區來移動藥籃。落到籃子高度自動判定，也可按空白鍵或「立即接住」。
- 下降時間可選 7、10 或 14 秒。P 暫停；切換到其他分頁會自動暫停。
- 答對首輪加 10 分，補練加 5 分。答錯顯示正解，每個錯詞會自動補練一次。作答後按下一題，沒有總時間限制。
- 成績頁列出本次曾答錯的生詞，可選擇只練錯題。
- 練習資料只保存在記憶體，重整即清除，沒有蒐集或傳送學生資料。

## 教材與修改

- `resources/vocabulary-reference.png`：使用者提供的原始教材圖片。
- `resources/vocabulary.json`：14 筆 `[生詞, 拼音, 解釋, 常見搭配]`；來源為同儲存庫 `data/lesson.json` 的生詞表，與圖片一致。
- `resources/vocabulary.csv`：可用 Excel 編輯的 UTF-8 BOM 生詞表。
- `game.js`：遊戲邏輯、搭配題與情境題，題目按生詞表順序對應。修改生詞順序時，須同步更新 `phrases` 和 `scenes`。
- `style.css`：介面與手機版排版。
- `index.html`：頁面結構。圖案以文字與 CSS 繪製，沒有額外圖像素材依賴。

用靜態網頁伺服器開啟儲存庫根目錄，再進入 `/games/catch/` 即可預覽。勿直接雙擊 HTML，瀏覽器可能封鎖 JSON 載入。推送 main 後由現有 GitHub Pages 發布。
