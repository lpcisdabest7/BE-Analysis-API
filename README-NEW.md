# 3D Action Analysis API

A modern NestJS-based API that analyzes text input and generates appropriate 3D character actions using OpenAI GPT. The system has been refactored from WebSocket-based communication to a standard HTTP REST API with proper TypeScript architecture.

## 🏗️ Architecture

The application follows a clean, modular architecture:

```
src/
├── controllers/           # HTTP request handlers
│   └── action.controller.ts
├── services/             # Business logic
│   └── gpt.service.ts
├── modules/              # NestJS modules
│   └── action.module.ts
├── dto/                  # Data Transfer Objects
│   └── action-analysis.dto.ts
├── types/                # TypeScript interfaces
│   └── index.ts
├── app.module.ts         # Root module
└── main.ts              # Application entry point
```

## 🚀 Features

- **HTTP REST API**: Standard HTTP endpoints instead of WebSocket
- **TypeScript**: Full type safety and modern development experience
- **NestJS Framework**: Robust, scalable architecture with dependency injection
- **OpenAI Integration**: GPT-powered text analysis for action generation
- **API Documentation**: Auto-generated Swagger documentation
- **Input Validation**: Request validation using class-validator
- **CORS Support**: Cross-origin resource sharing enabled
- **Static File Serving**: Frontend served directly from the API

## 📋 API Endpoints

### POST `/api/actions/analyze`
Analyzes text input and returns appropriate 3D character action.

**Request Body:**
```json
{
  "text": "nhảy múa vui vẻ"
}
```

**Response:**
```json
{
  "action": "dance",
  "success": true,
  "message": "Action analysis completed successfully",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "originalText": "nhảy múa vui vẻ",
  "actions": ["dance", "happy", "jump"],
  "gptMessage": "Identified dance and happy actions from the input"
}
```

### GET `/api/actions/health`
Returns health status of the service.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "service": "Action Analysis API",
  "version": "1.0.0"
}
```

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. **Build the application:**
```bash
npm run build
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/actions
- **Documentation**: http://localhost:3000/api/docs

## 🧪 Testing

### Run tests
```bash
npm run test
```

### Run tests with coverage
```bash
npm run test:cov
```

### Run e2e tests
```bash
npm run test:e2e
```

## 🔧 Development

### Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Structure

The application follows NestJS best practices:

1. **Controllers** handle HTTP requests and responses
2. **Services** contain business logic
3. **DTOs** define request/response schemas with validation
4. **Modules** organize related functionality
5. **Types** provide TypeScript interfaces

## 🔄 Migration from WebSocket

The application has been migrated from WebSocket-based communication to HTTP REST API:

### Before (WebSocket)
```javascript
// Client sends text via WebSocket
websocket.emit('text-input', { text: 'nhảy múa' });

// Server responds via WebSocket
websocket.on('action', (data) => {
  // Handle action data
});
```

### After (HTTP API)
```javascript
// Client sends HTTP request
const response = await fetch('/api/actions/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'nhảy múa' })
});

const actionData = await response.json();
// Handle action data directly
```

## 🌟 Key Improvements

1. **Standard Architecture**: Follows REST API conventions
2. **Better Error Handling**: Proper HTTP status codes and error responses
3. **Type Safety**: Full TypeScript support with interfaces and DTOs
4. **Documentation**: Auto-generated API documentation
5. **Validation**: Request validation with meaningful error messages
6. **Scalability**: NestJS provides excellent scalability features
7. **Testing**: Built-in testing framework and utilities

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- [NestJS Documentation](https://docs.nestjs.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Three.js Documentation](https://threejs.org/docs/)
