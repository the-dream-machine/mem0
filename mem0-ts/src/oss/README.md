A TypeScript implementation of the mem0 memory system, using OpenAI for embeddings and completions.

## Features

- Memory storage and retrieval using vector embeddings
- Fact extraction from text using GPT-4
- SQLite-based history tracking
- Optional graph-based memory relationships
- TypeScript type safety
- Built-in OpenAI integration with default configuration
- In-memory vector store implementation
- Extensible architecture with interfaces for custom implementations

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mem0-ts
```

2. Install dependencies:

```bash
npm install
```

Note: sqlite support is opt-in. If you plan to use the sqlite history provider, install sqlite3 in your application:

```bash
npm install sqlite3
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

4. Build the project:

```bash
npm run build
```
