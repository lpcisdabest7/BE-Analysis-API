# 3D Princess Action Bot – Text → 3D Animation (VN)

Biểu diễn pipeline chuyển văn bản thành hành động 3D theo thời gian thực. Frontend (Three.js) kết nối Backend (Express + Socket.IO). Backend gọi OpenAI GPT để phân tích câu lệnh và phát sóng danh sách hành động cho nhân vật 3D.

### Công nghệ chính
- Backend: Node.js, Express, Socket.IO, cross-fetch (gọi OpenAI)
- AI: OpenAI Chat Completions (`gpt-4o-mini`)
- Frontend: Three.js (Scene, OrbitControls), Socket.IO client

### Yêu cầu
- Node.js >= 16
- Biến môi trường `OPENAI_API_KEY`

## Cách chạy nhanh

1. Cài phụ thuộc:

```bash
npm install
```

2. Cấu hình khóa OpenAI (khuyến nghị dùng biến môi trường):

```bash
export OPENAI_API_KEY="YOUR_OPENAI_KEY"
```

3. Khởi động ứng dụng (backend + phục vụ FE):

```bash
npm start
```

4. Mở trình duyệt:

```text
http://localhost:3001
```

Gợi ý: Có thể chạy chế độ server WebSocket độc lập (không khởi tạo flow phân tích văn bản) bằng:

```bash
npm run server
```

## Kiến trúc & cấu trúc thư mục

```text
BE-Bot-Socket/
├── app.js                    # Entry chính: khởi tạo GPTService, WebSocketServer, InputHandler
├── websocket-server.js       # Express + Socket.IO + API REST và static FE
├── services/
│   └── gpt-service.js        # Gọi OpenAI, phân tích response → danh sách actions
├── handlers/
│   └── input-handler.js      # Hàng đợi xử lý text → gọi GPT → broadcast actions
├── FE/                       # Frontend 3D + UI
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── main.js           # App controller, kết nối WS, UI, mock mode
│       ├── websocket.js      # Quản lý Socket.IO/WebSocket client
│       ├── princess3d.js     # Tạo nhân vật 3D bằng primitive geometry
│       └── animations.js     # Mapping hành động VN/EN → animation, thực thi chuỗi
└── package.json
```

## Flow hoạt động (từng bước)

### 1) Startup flow
1. `app.js` tạo `GPTService`, `WebSocketServer(3001)`, `InputHandler` và gắn `inputHandler` vào server.
2. `websocket-server.js`:
   - Cấu hình Express, phục vụ static `FE/`, và route `/` → `index.html`.
   - Khởi tạo Socket.IO, quản lý danh sách client.
   - Mở API REST: `/api/analyze-text`, `/api/action`, `/api/health`.
3. Console hiển thị URL FE và API khi server sẵn sàng.

### 2) WebSocket text → hành động
1. FE kết nối Socket.IO tới `http://localhost:3001` (`FE/js/websocket.js`).
2. Người dùng nhập câu lệnh trong UI (`FE/index.html` + `FE/js/main.js`).
3. FE phát sự kiện `text-input` lên socket: `{ text: "..." }`.
4. Backend nhận tại `websocket-server.js` → gọi `inputHandler.handleTextInput()`.
5. `InputHandler` đưa yêu cầu vào hàng đợi và lần lượt xử lý:
   - Gọi `GPTService.analyzeTextForActions(text)` → OpenAI
   - Parse kết quả thành `{ actions: string[], message }`
   - Phát sóng qua `socketServer.broadcastAction({ actions, ... })`
6. FE nhận sự kiện `action` và gọi `AnimationManager.executeActions(actions)` để chạy animation trên nhân vật (`Princess3D`).

### 3) Fallback HTTP API (khi WS chưa kết nối)
1. FE thử kết nối WS; nếu thất bại sau ~5s, chuyển sang "mock mode" (tạo hành động demo định kỳ) và vẫn cho phép gửi HTTP.
2. Khi người dùng gửi lệnh, FE gọi `POST /api/analyze-text` (JSON: `{ text }`).
3. Backend xử lý giống flow WS (GPT → actions) và broadcast qua WS cho mọi client đang kết nối.

### 4) Gửi hành động trực tiếp (bỏ qua GPT)
1. Gọi `POST /api/action` với `{ actions: ["dance", ...], text?: "ghi chú" }`.
2. Server broadcast `action` tới tất cả client.

## API REST

- `GET /api/health`
  - Trả về `{ status: "ok", clients, timestamp }`.

- `POST /api/analyze-text`
  - Body: `{ "text": "Vui vẻ lên nào" }`
  - Trả về: `{ success, message, text, clientCount, queueLength }` (lưu ý hành động được phát sóng qua WS).

- `POST /api/action`
  - Body: `{ "actions": ["nhảy múa", "vẫy tay"], "text": "tuỳ chọn" }`
  - Trả về: `{ success, message, clientCount }` và đồng thời broadcast ngay.

Ví dụ nhanh:
```bash
curl -X POST http://localhost:3001/api/analyze-text \
  -H 'Content-Type: application/json' \
  -d '{"text":"Bay lên trời như siêu nhân"}'

curl -X POST http://localhost:3001/api/action \
  -H 'Content-Type: application/json' \
  -d '{"actions":["nhảy múa","vẫy tay"],"text":"demo"}'
```

## Sự kiện WebSocket

- Từ client → server
  - `text-input`: `{ text: string }` – yêu cầu phân tích GPT.
  - `message`: bất kỳ payload – debug/log.

- Từ server → client
  - `action`: `{ actions: string[], originalText?, gptMessage?, type?, timestamp }`
  - Khi client kết nối lần đầu hệ thống gửi welcome: `actions: ["vẫy tay"], text: "Chào mừng..."`

## Ghi chú bảo mật & cấu hình

- Thiết lập biến môi trường `OPENAI_API_KEY` trước khi chạy. Không commit khóa thật vào mã nguồn.
- File `services/gpt-service.js` đang có giá trị khóa mặc định để phát triển nội bộ; nên bỏ và chỉ lấy từ `process.env.OPENAI_API_KEY` trong môi trường thực tế.
- CORS của Socket.IO hiện để `origin: *` nhằm demo; hãy hạn chế origin trong môi trường production.

## Mẹo phát triển

- FE có "mock mode" (tự sinh hành động) nếu không kết nối được backend sau 5s.
- `animations.js` ánh xạ linh hoạt từ tiếng Việt/tiếng Anh và có cơ chế fuzzy/pattern để luôn tìm được hành động phù hợp.
- Có thể mở rộng `Princess3D` để tải model GLTF/FBX (đã nhúng loader trong HTML) thay vì primitive hiện tại.

## License

MIT