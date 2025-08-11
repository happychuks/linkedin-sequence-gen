# LinkedIn Messaging AI - Comprehensive Technical Documentation

## Overview

This project is a sophisticated AI-powered LinkedIn outreach sequence generator built with NestJS, featuring multi-provider AI integration, intelligent prompt engineering, comprehensive error handling, and a robust repository pattern architecture. The system generates personalized messaging sequences with confidence scoring, thinking process capture, detailed prospect analysis, and enterprise-grade error resilience through multi-layered exception handling.

## Key Features & Architectural Highlights

### 🏗️ **Enterprise-Grade Architecture**
- **Repository Pattern**: Clean separation of data access logic from business logic
- **Multi-Layer Error Handling**: Global exception filters with comprehensive error categorization
- **Type Safety**: Full TypeScript strict mode with ESLint enforcement
- **Modular Design**: Loosely coupled components with dependency injection

### 🔧 **Robust Error Handling**
- **Global Exception Filter**: Centralized handling of HTTP, Prisma, and generic errors
- **Input Validation**: Automatic DTO validation with detailed error messages
- **Graceful Degradation**: Multi-retry strategies with fallback mechanisms
- **Comprehensive Logging**: Structured error logging for debugging and monitoring

### 🤖 **AI Integration Excellence**
- **Multi-Provider Support**: OpenAI, Anthropic Claude, and Groq integration
- **Intelligent Model Selection**: Dynamic model routing based on task complexity
- **Cost Optimization**: Real-time token usage tracking and cost calculation
- **Retry Strategies**: Automatic fallbacks with model degradation on failure

### 📊 **Data Management**
- **Prisma ORM**: Type-safe database operations with migration support
- **Smart Caching**: Prompt caching with intelligent invalidation
- **Performance Optimization**: Composite database indexes for fast queries
- **JSONB with GIN**: Binary JSON storage with indexes for efficient querying

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [Prompt Engineering Strategy](#prompt-engineering-strategy)
4. [AI Integration Patterns](#ai-integration-patterns)
5. [API Endpoints Documentation](#api-endpoints-documentation)
6. [API Design & Data Validation](#api-design--data-validation)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Performance Optimizations](#performance-optimizations)
9. [Repository Pattern & Data Layer](#repository-pattern--data-layer)
10. [Global Exception Handling](#global-exception-handling)
11. [Future Improvements](#future-improvements)
12. [Setup & Configuration](#setup--configuration)

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONTROLLERS                                    │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐         │
│  │  AppController  │    │SequenceController│    │  (Other APIs)   │         │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ERROR HANDLING LAYER                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐        │
│  │GlobalExceptionFilter│ │ ValidationPipe   │    │  DTO Validation │        │
│  └──────────────────┘    └──────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                                SERVICES                                     │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│   │ SequenceService │    │   AiService     │    │  PromptService  │         │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                   │                                         │
│                          ┌─────────────────┐                                │
│                          │ AiAdapterFactory│                                │
│                          └─────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REPOSITORIES                                    │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐        │
│  │SequenceRepository│    │ProspectRepository│    │  PrismaService  │        │
│  └──────────────────┘    └──────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI ADAPTERS                                    │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│   │  OpenAiAdapter  │    │  GroqAdapter    │    │AnthropicAdapter │         │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AI PROVIDERS                                    │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│   │     OpenAI      │    │      Groq       │    │   Anthropic     │         │
│   │   GPT-4/3.5     │    │   Llama/Gemma   │    │   Claude 3.x    │         │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### System Design Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                               │
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │   Client    │────▶│   API Layer │────▶│  Business   │                   │
│   │ Application │     │ (NestJS)    │     │   Logic     │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
│                               │                   │                         │
│                               ▼                   ▼                         │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │  Validation │     │   Caching   │     │    Data     │                   │
│   │    Layer    │     │   Layer     │     │   Layer     │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
│                               │                   │                         │
│                               ▼                   ▼                         │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │ AI Provider │     │  Fallback   │     │ PostgreSQL  │                   │
│   │ Integration │     │  Strategy   │     │  Database   │                   │
│   └─────────────┘     └─────────────┘     └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REQUEST FLOW WITH ERROR HANDLING                   │
│                                                                             │
│    [1] Request                [2] Validation          [3] Business Logic    │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │   Client    │──────────▶ │ Controller  │────────▶│ Sequence    │         │
│  │  Request    │            │   + DTO     │         │  Service    │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│         │                           │                       │               │
│         ▼                           ▼                       ▼               │
│    [8] Response               [2.5] Validation        [4] Repository        │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │  Success/   │◀────────── │GlobalException        │ Data Access │         │
│  │   Error     │            │   Filter    │◀────────│  + Prisma   │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│                                     │                       │               │
│                                     ▲                       ▼               │
│    [7] Error Response         [Error Handling]        [5] AI Integration    │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │ Structured  │            │   Service   │         │ AI Service  │         │
│  │Error Format │            │   Errors    │         │   + Utils   │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│                                     ▲                       │               │
│                                     │                       ▼               │
│                               [Error Bubbling]        [6] Provider Call     │
│                              ┌─────────────┐         ┌─────────────┐         │
│                              │   HTTP      │         │ AI Adapter  │         │
│                              │ Exceptions  │         │   Factory   │         │
│                              └─────────────┘         └─────────────┘         │
│                                     ▲                       │               │
│                                     │                       ▼               │
│                               [Any Layer Error]      ┌─────────────┐         │
│                                                      │   OpenAI    │         │
│                                                      │    Groq     │         │
│                                                      │ Anthropic   │         │
│                                                      └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: PostgreSQL with Prisma ORM 6.13.0
  - **JSONB Storage**: Binary JSON with GIN indexes for fast queries
  - **Advanced Indexing**: Composite, partial, and expression indexes
- **AI Providers**: OpenAI, Anthropic Claude, Groq
- **Validation**: Zod 3.25.76 for schema validation
- **Testing**: Jest with Supertest for E2E testing
- **Error Handling**: Global exception filters with multi-layer error resilience
- **Architecture**: Repository pattern with clean separation of concerns
- **Type Safety**: Full TypeScript strict mode with ESLint enforcement

## Database Schema Design

### 1. Entity Relationship Design

```sql
-- Core entities with their relationships
Prospect (1) ←→ (N) Sequence
Prompt (1) ←→ (N) Sequence
```

### 2. Schema Decisions & Rationale

#### **Prospect Table**
```prisma
model Prospect {
  id        Int      @id @default(autoincrement())
  url       String   @unique
  createdAt DateTime @default(now())
  sequences Sequence[]
}
```

**Design Decisions:**
- **URL as unique identifier**: LinkedIn URLs are immutable and serve as natural primary keys
- **Minimal data storage**: Only store essential prospect metadata to respect privacy
- **Audit trail**: `createdAt` for tracking when prospects were first encountered

#### **Prompt Table**
```prisma
model Prompt {
  id        Int      @id @default(autoincrement())
  content   String
  version   Int      @default(1)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  sequences Sequence[]
}
```

**Design Decisions:**
- **Version control**: Track prompt evolution for A/B testing and performance analysis
- **Content immutability**: New prompts create new records rather than updating existing ones
- **Active flag**: Enable/disable prompts without deletion for rollback capabilities

#### **Sequence Table**
```prisma
model Sequence {
  id               Int      @id @default(autoincrement())
  prospectId       Int
  promptId         Int
  messages         Json     @db.JsonB // JSONB for message querying
  thinkingProcess  Json     // Keep as JSON (write-once, read-rarely)
  prospectAnalysis String?
  metadata         Json     @db.JsonB // JSONB for analytics queries
  createdAt        DateTime @default(now())
  
  prospect Prospect @relation(fields: [prospectId], references: [id])
  prompt   Prompt   @relation(fields: [promptId], references: [id])
  
  @@index([prospectId, createdAt])
  @@index([promptId])
  @@index([createdAt])
  // JSONB indexes for efficient querying
  @@index([metadata], type: Gin)
  @@index([messages], type: Gin)
}
```

**Design Decisions:**
- **JSONB vs JSON storage strategy**: Critical fields use JSONB for query performance, less-accessed data uses standard JSON
- **GIN indexes on JSONB**: Enable fast queries on JSON content for analytics and message searching
- **Composite indexing**: `[prospectId, createdAt]` for efficient history queries
- **Separate indexes**: Individual indexes on foreign keys and timestamps for query optimization
- **Detailed metadata**: Store AI usage metrics (tokens, cost) for cost tracking and optimization

### 3. Index Strategy

```sql
-- Optimized for common query patterns
CREATE INDEX idx_sequence_prospect_date ON Sequence(prospectId, createdAt DESC);
CREATE INDEX idx_sequence_prompt ON Sequence(promptId);
CREATE INDEX idx_sequence_created ON Sequence(createdAt DESC);
CREATE UNIQUE INDEX idx_prospect_url ON Prospect(url);

-- JSONB GIN indexes for efficient JSON querying
CREATE INDEX idx_sequence_metadata_gin ON Sequence USING GIN (metadata);
CREATE INDEX idx_sequence_messages_gin ON Sequence USING GIN (messages);
```

**Rationale:**
- **History queries**: Composite index on `[prospectId, createdAt]` enables fast prospect history retrieval
- **Analytics queries**: Date-based indexes support temporal analysis
- **Foreign key performance**: Dedicated indexes on all foreign key relationships
- **JSONB with GIN**: Enable efficient queries on JSON content (e.g., `WHERE metadata @> '{"cost": {"$gt": 0.01}}'`)

### 4. JSONB vs JSON Storage Strategy

**Why JSONB for Critical Fields:**
```typescript
// Efficient queries on JSONB fields
await prisma.sequence.findMany({
  where: {
    metadata: {
      path: ['cost'],
      gt: 0.01  // Find sequences costing more than $0.01
    }
  }
});

// Search within message content
await prisma.sequence.findMany({
  where: {
    messages: {
      path: ['$[*].message'],
      string_contains: 'partnership'  // Find sequences mentioning partnerships
    }
  }
});
```

**Storage Decision Matrix:**
- **`messages` (JSONB + GIN)**: Frequently queried for content analysis, message type filtering, confidence score analytics
- **`metadata` (JSONB + GIN)**: Essential for cost tracking, performance analytics, token usage monitoring
- **`thinkingProcess` (JSON)**: Write-once, read-rarely data doesn't need query optimization
- **`prospectAnalysis` (TEXT)**: Simple string searches, full-text search capabilities

**GIN Index Benefits:**
- **Fast JSON queries**: O(log n) lookup time for JSON path operations
- **Partial matching**: Efficient queries on nested JSON structures
- **Analytics support**: Enable complex aggregations on JSON data
- **Space efficient**: Compressed index storage for large JSON documents

## Prompt Engineering Strategy

### 1. Dynamic Prompt Construction

Our prompt engineering follows a structured approach:

```typescript
buildPrompt(prospectUrl, tov, context, sequenceLength) {
  // 1. Extract prospect name from LinkedIn URL
  const extractedName = this.extractNameFromLinkedInUrl(prospectUrl);
  
  // 2. Convert tone-of-voice config to descriptive instructions
  const tone = convertTOVtoDescriptors(tov);
  
  // 3. Build structured prompt with clear sections
  return structuredPrompt;
}
```

### 2. Prompt Components

#### **Critical Instructions**
```
CRITICAL INSTRUCTION: The prospect's name is "${extractedName}". You MUST use this exact name.
```
- Prevents generic "John" usage by emphasizing extracted names
- Provides fallback to "there" when name extraction fails

#### **Context Integration**
```
PROSPECT: ${extractedName}
URL: ${prospectUrl}
CONTEXT: ${context}
TONE: ${tone}
```
- Clear separation of input parameters
- Explicit labeling for AI comprehension

#### **Confidence Scoring Guidelines**
```
CONFIDENCE SCORING GUIDELINES:
- 0.9-1.0: Highly personalized with specific context
- 0.7-0.89: Well personalized with good context
- 0.5-0.69: Moderately personalized
- 0.3-0.49: Generic messaging
- 0.1-0.29: Poor quality
```
- Objective criteria for dynamic confidence scoring
- Aligned with business quality expectations

#### **Structured JSON Output**
```json
{
  "sequence": [...],
  "thinking_process": {...},
  "prospect_analysis": "...",
  "metadata": {...}
}
```
- Enforces consistent response structure
- Enables reliable parsing and validation

### 3. Name Extraction Algorithm

```typescript
extractNameFromLinkedInUrl(url: string): string {
  // 1. Extract username from LinkedIn URL pattern
  const regex = /linkedin\.com\/in\/([^/?]+)/i;
  
  // 2. Clean and process username
  let cleanUsername = username
    .replace(/-\d+$/, '')     // Remove trailing numbers
    .replace(/[^a-zA-Z-]/g, ''); // Keep only letters and hyphens
  
  // 3. Split strategy based on format
  if (!cleanUsername.includes('-')) {
    // Split by capital letters (camelCase)
    const parts = cleanUsername.split(/(?=[A-Z])/);
  } else {
    // Split by hyphens
    const parts = cleanUsername.split('-');
  }
  
  // 4. Format as proper name
  return formattedName || 'there';
}
```

**Algorithm Features:**
- **Pattern recognition**: Handles both hyphenated and camelCase LinkedIn usernames
- **Data cleaning**: Removes numbers and special characters
- **Graceful degradation**: Falls back to "there" when extraction fails
- **Comprehensive logging**: Debug traces for troubleshooting

### 4. Smart Caching Strategy

```typescript
// Always build fresh prompt, then compare with cached version
const freshPrompt = this.ai.buildPrompt(dto);

if (activePrompt && activePrompt.content === freshPrompt) {
  // Reuse cached prompt
  promptText = activePrompt.content;
} else {
  // Use fresh prompt and cache it
  promptText = freshPrompt;
  await this.promptService.savePrompt(promptText);
}
```

**Benefits:**
- **Performance**: Avoids redundant prompt generation
- **Consistency**: Ensures identical inputs produce identical prompts
- **Flexibility**: New request parameters always generate fresh prompts

## AI Integration Patterns

### 1. Multi-Provider Architecture

```typescript
interface AiAdapter {
  chat(prompt: string, options?: AiChatOptions): Promise<AiChatResponse>;
  getAvailableModels(): string[];
  calculateCost(usage: AiUsage, model: string): number;
  getProviderName(): string;
}
```

**Provider Implementations:**
- **OpenAI**: GPT-4, GPT-3.5-turbo with accurate cost calculation
- **Anthropic**: Claude models with message format handling
- **Groq**: Llama and Gemma models with high-speed inference

### 2. Intelligent Model Selection

```typescript
selectOptimalModel(sequenceLength: number, complexity: string): string {
  const adapter = this.aiAdapterFactory.getAdapter();
  
  // Provider-specific optimization
  if (adapter.getProviderName() === 'groq') {
    if (complexity === 'complex' || sequenceLength > 5) {
      return 'deepseek-r1-distill-llama-70b';
    } else if (complexity === 'medium') {
      return 'llama-3.3-70b-versatile';
    } else {
      return 'llama-3.1-8b-instant'; // Fast for simple tasks
    }
  }
  // Similar logic for OpenAI and Anthropic...
}
```

**Selection Criteria:**
- **Task complexity**: More sophisticated models for complex sequences
- **Performance vs. cost**: Balance between quality and efficiency
- **Provider strengths**: Leverage each provider's optimal models

### 3. Token Usage & Cost Tracking

```typescript
interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Cost calculation with 6-decimal precision
calculateCost(usage: AiUsage, model: string): number {
  const inputCost = (usage.promptTokens / 1000) * pricing[model].input;
  const outputCost = (usage.completionTokens / 1000) * pricing[model].output;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000;
}
```

**Tracking Features:**
- **Granular metrics**: Separate prompt and completion token counts
- **Real-time costing**: Immediate cost calculation per request
- **Historical analysis**: Store usage data for optimization insights
- **Budget monitoring**: Enable usage-based alerts and limits

### 4. Response Processing Pipeline

```typescript
async generate(prompt: string, options?: AiChatOptions): Promise<AiResponse> {
  // 1. Send request to AI provider
  const response = await adapter.chat(prompt, options);
  
  // 2. Extract JSON from potentially malformed response
  const jsonContent = this.extractJSON(response.content);
  
  // 3. Parse and validate against schema
  const parsed = JSON.parse(jsonContent);
  const validated = aiResponseSchema.safeParse(parsed);
  
  // 4. Enhance with metadata
  result.metadata.cost = adapter.calculateCost(response.usage, response.model);
  result.metadata.promptTokens = response.usage.promptTokens;
  // ... other enhancements
  
  return result;
}
```

## API Endpoints Documentation

### 1. Core Sequence Operations

#### **POST /api/generate-sequence**
Generate a personalized LinkedIn messaging sequence using AI.

**Request Body:**
```json
{
  "prospect_url": "https://linkedin.com/in/happy-felix",
  "tov_config": {
    "formality": 0.9,
    "warmth": 0.8,
    "directness": 0.7
  },
  "company_context": "We help B2B companies automate sales and generate leads",
  "sequence_length": 3
}
```

**Response:**
```json
{
  "sequence": [
    {
      "message": "Hi Happy, I noticed your expertise in...",
      "type": "opening",
      "confidence": 0.85,
      "aiReasoning": "Personalized opening based on..."
    }
  ],
  "thinking_process": { /* AI reasoning */ },
  "prospect_analysis": "Analysis of prospect profile...",
  "metadata": {
    "cost": 0.001234,
    "promptTokens": 150,
    "completionTokens": 200,
    "model": "llama-3.3-70b-versatile",
    "provider": "groq"
  }
}
```

#### **GET /api/history/{prospectId}**
Retrieve all previously generated sequences for a specific prospect.

**Parameters:**
- `prospectId` (path): Unique identifier of the prospect

**Response:**
```json
[
  {
    "sequence": [/* message array */],
    "thinking_process": { /* AI reasoning */ },
    "prospect_analysis": "Analysis...",
    "metadata": {
      "generated_at": "2025-08-11T19:30:00.000Z",
      "prompt_version": 1,
      "cost": 0.001234
    }
  }
]
```

### 2. Sequence Refinement & Versioning

#### **POST /api/refine-sequence**
Generate a refined version of an existing sequence with different TOV parameters.

**Request Body:**
```json
{
  "originalSequenceId": 1,
  "newTovConfig": {
    "formality": 0.5,
    "warmth": 0.9,
    "directness": 0.8
  },
  "newSequenceLength": 4
}
```

**Response:**
```json
{
  "refinedSequence": {
    "id": 4,
    "messages": [/* refined sequence */],
    "version": 2,
    "tovFormality": 0.5,
    "tovWarmth": 0.9,
    "tovDirectness": 0.8
  },
  "originalSequence": { /* original sequence data */ },
  "changes": {
    "tov": {
      "formality": { "old": 0.9, "new": 0.5, "change": -0.4 },
      "warmth": { "old": 0.8, "new": 0.9, "change": 0.1 },
      "directness": { "old": 0.7, "new": 0.8, "change": 0.1 }
    },
    "sequenceLength": {
      "old": 3,
      "new": 4,
      "changed": true
    }
  }
}
```

#### **GET /api/refinements/{sequenceId}**
Retrieve all refinements for a specific sequence.

**Parameters:**
- `sequenceId` (path): Unique identifier of the original sequence

**Response:**
```json
[
  {
    "id": 4,
    "version": 2,
    "tovFormality": 0.5,
    "tovWarmth": 0.9,
    "tovDirectness": 0.8,
    "messages": [/* refined messages */],
    "createdAt": "2025-08-11T19:35:00.000Z"
  }
]
```

### 3. Sequence Analysis & Comparison

#### **GET /api/compare**
Compare differences between sequence versions including TOV changes and message variations.

**Query Parameters:**
- `originalId`: ID of the original sequence
- `refinedId`: ID of the refined sequence

**Example:** `/api/compare?originalId=1&refinedId=4`

**Response:**
```json
{
  "sequences": [
    {
      "id": 1,
      "version": 1,
      "tovFormality": 0.9,
      "tovWarmth": 0.8,
      "tovDirectness": 0.7,
      "messages": [/* original messages */],
      "createdAt": "2025-08-11T19:30:00.000Z"
    },
    {
      "id": 4,
      "version": 2,
      "tovFormality": 0.5,
      "tovWarmth": 0.9,
      "tovDirectness": 0.8,
      "messages": [/* refined messages */],
      "createdAt": "2025-08-11T19:35:00.000Z"
    }
  ],
  "comparison": {
    "tovEvolution": [
      {
        "version": 1,
        "tov": { "formality": 0.9, "warmth": 0.8, "directness": 0.7 },
        "createdAt": "2025-08-11T19:30:00.000Z"
      },
      {
        "version": 2,
        "tov": { "formality": 0.5, "warmth": 0.9, "directness": 0.8 },
        "createdAt": "2025-08-11T19:35:00.000Z"
      }
    ],
    "messageQualityTrends": [
      {
        "version": 1,
        "averageConfidence": 0.82,
        "messageCount": 3
      },
      {
        "version": 2,
        "averageConfidence": 0.87,
        "messageCount": 4
      }
    ]
  }
}
```

## API Design & Data Validation

### 1. RESTful Endpoint Design

```typescript
@Controller('api')
export class SequenceController {
  @Post('generate-sequence')
  generate(@Body() dto: GenerateSequenceDto) {
    return this.seq.generate(dto);
  }

  @Get('history/:prospectId')
  history(@Param('prospectId', ParseIntPipe) prospectId: number) {
    return this.seq.history(prospectId);
  }

  @Post('refine-sequence')
  refine(@Body() dto: RefineSequenceDto) {
    return this.seq.refine(dto);
  }

  @Get('refinements/:sequenceId')
  getRefinements(@Param('sequenceId', ParseIntPipe) sequenceId: number) {
    return this.seq.getRefinements(sequenceId);
  }

  @Get('compare')
  compareVersions(
    @Query('originalId') originalId: string,
    @Query('refinedId') refinedId: string,
  ) {
    return this.seq.compareVersions([parseInt(originalId), parseInt(refinedId)]);
  }
}
```

**Design Principles:**
- **Resource-oriented URLs**: Clear, intuitive endpoint naming
- **HTTP method semantics**: POST for creation, GET for retrieval
- **Type safety**: Built-in validation with NestJS pipes
- **Consistent responses**: Standardized response structure across endpoints
- **Versioning Support**: Sequence refinement and comparison capabilities

### 2. Request Validation with Zod

```typescript
export const generateSequenceDto = z.object({
  prospect_url: z.string().url(),
  tov_config: z.object({
    formality: z.number().min(0).max(1),
    warmth: z.number().min(0).max(1),
    directness: z.number().min(0).max(1),
  }),
  company_context: z.string().min(10),
  sequence_length: z.number().int().min(1).max(4),
});
```

**Validation Strategy:**
- **Input sanitization**: URL validation, length constraints
- **Business rule enforcement**: Sequence length limits
- **Type coercion**: Automatic type conversion where appropriate
- **Detailed error messages**: Clear feedback for invalid inputs

### 3. Response Schema Design

```typescript
export const aiResponseSchema = z.object({
  sequence: z.array(aiMessageSchema),
  thinking_process: thinkingProcessSchema,
  prospect_analysis: z.string(),
  metadata: metadataSchema.extend({
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional(),
  }),
});
```

**Schema Features:**
- **Comprehensive data**: All AI outputs captured and validated
- **Optional fields**: Graceful handling of missing AI-generated fields
- **Extensible metadata**: Support for additional metrics and debugging info
- **Type safety**: Full TypeScript integration with inferred types

### 4. Repository Pattern Implementation

```typescript
@Injectable()
export class SequenceRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSequenceData): Promise<Sequence> {
    return this.prisma.sequence.create({ data });
  }

  async findManyByProspectId(prospectId: number): Promise<Sequence[]> {
    return this.prisma.sequence.findMany({
      where: { prospectId },
      include: { prompt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

**Benefits:**
- **Separation of concerns**: Database logic isolated from business logic
- **Testability**: Easy mocking for unit tests
- **Reusability**: Common queries abstracted into reusable methods
- **Type safety**: Full TypeScript support with Prisma-generated types

## Repository Pattern & Data Layer

### 1. Repository Architecture

Our application implements the Repository pattern to achieve clean separation of data access logic from business logic:

```typescript
@Injectable()
export class SequenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSequenceData) {
    return this.prisma.sequence.create({ data });
  }

  async findManyByProspectId(prospectId: number) {
    return this.prisma.sequence.findMany({
      where: { prospectId },
      include: { prompt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.sequence.findUnique({
      where: { id },
      include: { prompt: true, prospect: true },
    });
  }

  async findByIdWithProspect(id: number): Promise<SequenceWithProspect | null> {
    return this.prisma.sequence.findUnique({
      where: { id },
      include: { prospect: { select: { url: true } } },
    }) as Promise<SequenceWithProspect | null>;
  }

  async findManyByIds(ids: number[]) {
    return this.prisma.sequence.findMany({
      where: { id: { in: ids } },
      include: { prompt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 2. Repository Benefits

**Clean Architecture:**
- **Business Logic Separation**: Services focus on business rules, repositories handle data access
- **Testability**: Easy mocking of data layer for unit testing
- **Maintainability**: Centralized database queries with consistent patterns
- **Type Safety**: Full TypeScript integration with Prisma-generated types

**Query Optimization:**
- **Selective Includes**: Load related data only when needed
- **Indexed Queries**: Leverage database indexes for optimal performance
- **Batch Operations**: Efficient handling of multiple records

### 3. Service Layer Integration

```typescript
@Injectable()
export class SequenceService {
  constructor(
    private readonly sequenceRepository: SequenceRepository,
    private readonly prospectRepository: ProspectRepository,
    private readonly aiService: AiService,
  ) {}

  async generate(dto: GenerateSequenceDto) {
    try {
      // Business logic using repository pattern
      const prospect = await this.prospectRepository.upsert(dto.prospect_url);
      const result = await this.aiService.generateSequence(dto);
      
      return await this.sequenceRepository.create({
        prospectId: prospect.id,
        promptId: result.promptId,
        messages: result.sequence,
        thinkingProcess: result.thinking_process,
        prospectAnalysis: result.prospect_analysis,
        metadata: result.metadata,
      });
    } catch (error) {
      // Comprehensive error handling
      throw new Error(`Failed to generate sequence: ${error.message}`);
    }
  }
}
```

## Global Exception Handling

### 1. Multi-Layer Exception Strategy

Our application implements a comprehensive, multi-layered error handling strategy that gracefully handles all types of errors:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    // Handle different exception types
    if (exception instanceof HttpException) {
      // NestJS HTTP exceptions (BadRequestException, NotFoundException, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // ... detailed handling
    } else if (exception instanceof PrismaClientValidationError) {
      // Prisma validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
      error = 'Validation Error';
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Prisma known request errors (unique constraints, etc.)
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
      error = 'Database Error';
    } else {
      // Generic JavaScript errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    // Comprehensive logging and response
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
```

### 2. Application Bootstrap with Global Filters

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));
  
  // Global exception filter for comprehensive error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ... additional setup
  await app.listen(port, '0.0.0.0');
}
```

### 3. Controller-Level Error Handling

```typescript
@Controller('api')
export class SequenceController {
  @Post('generate-sequence')
  async generate(@Body() dto: GenerateSequenceDto) {
    try {
      // Input validation happens automatically via DTOs
      return await this.sequenceService.generate(dto);
    } catch (error) {
      // Service-level errors are caught by global filter
      throw new BadRequestException(
        `Failed to generate sequence: ${error.message}`
      );
    }
  }

  @Get('history/:prospectId')
  async history(@Param('prospectId', ParseIntPipe) prospectId: number) {
    try {
      const sequences = await this.sequenceService.history(prospectId);
      if (!sequences.length) {
        throw new NotFoundException(
          `No sequences found for prospect ${prospectId}`
        );
      }
      return sequences;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to retrieve history: ${error.message}`
      );
    }
  }
}
```

### 4. Service-Level Error Handling

```typescript
@Injectable()
export class AiService {
  async generateSequence(dto: GenerateSequenceDto) {
    try {
      const prompt = await this.buildPrompt(dto);
      const result = await this.generateWithRetries(prompt, dto.sequence_length);
      
      // Validate AI response structure
      const validated = aiResponseSchema.safeParse(result);
      if (!validated.success) {
        throw new Error('AI response validation failed');
      }
      
      return validated.data;
    } catch (error) {
      this.logger.error('AI generation failed', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  private async generateWithRetries(prompt: string, sequenceLength: number) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await this.adapter.chat(prompt, {
          model: this.selectOptimalModel(sequenceLength, attempt),
        });
        return result;
      } catch (error) {
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt === 2) {
          throw error;
        }
      }
    }
  }
}
```

### 5. Error Response Structure

All errors return a consistent response structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed: prospect_url must be a valid URL",
  "error": "Bad Request",
  "timestamp": "2025-08-11T19:30:00.000Z",
  "path": "/api/generate-sequence",
  "method": "POST"
}
```

**Error Categories Handled:**
- **HTTP Exceptions**: BadRequest, NotFound, Unauthorized, etc.
- **Prisma Errors**: Database validation, unique constraints, connection issues
- **AI Provider Errors**: Rate limits, invalid responses, service unavailability
- **Validation Errors**: DTO validation, schema mismatches
- **Generic Errors**: Unexpected JavaScript errors with safe fallbacks

## Error Handling & Resilience

### 1. Multi-Level Retry Strategy

```typescript
async generateWithRetries(prompt: string, sequenceLength: number): Promise<any> {
  for (let i = 0; i < 2; i++) {
    try {
      // First attempt: Use optimal model
      let modelToUse = this.selectOptimalModel(sequenceLength);
      
      if (i === 1) {
        // Retry: Use simpler, more reliable model
        modelToUse = this.getFallbackModel();
      }
      
      return await this.generate(prompt, { model: modelToUse });
    } catch (err) {
      this.logger.warn(`AI generation attempt ${i + 1} failed: ${err.message}`);
    }
  }
  
  // Final fallback: Return static sequence
  return DefaultSequenceFallback;
}
```

**Retry Logic:**
- **Model degradation**: Try simpler models on retry
- **Provider failover**: Switch providers if configured
- **Static fallback**: Ensure service never fully fails
- **Comprehensive logging**: Track failure patterns for optimization

### 2. JSON Extraction & Parsing

```typescript
private extractJSON(content: string): string {
  // Try to find JSON object in potentially malformed response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  
  // Fallback to array pattern
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  
  // Let JSON.parse handle the error if no pattern found
  return content.trim();
}
```

**Resilience Features:**
- **Pattern matching**: Extract JSON from responses with extra text
- **Multiple formats**: Handle both object and array responses
- **Graceful degradation**: Clear error messages for unparseable content

### 3. Schema Validation Error Handling

```typescript
const validated = aiResponseSchema.safeParse(parsed);
if (!validated.success) {
  this.logger.error('AI response validation error', validated.error.format());
  this.logger.error('Raw parsed data:', JSON.stringify(parsed, null, 2));
  throw new Error('AI response schema mismatch');
}
```

**Error Context:**
- **Detailed logging**: Full validation error details
- **Raw data preservation**: Log original response for debugging
- **Clear error messages**: Actionable error information

### 4. Database Error Handling

```typescript
async upsert(url: string): Promise<Prospect> {
  try {
    return await this.prisma.prospect.upsert({
      where: { url },
      update: {},
      create: { url },
    });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint violation
      // Handle race condition gracefully
      return await this.prisma.prospect.findUniqueOrThrow({ where: { url } });
    }
    throw error;
  }
}
```

## Performance Optimizations

### 1. Database Query Optimization

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_sequence_prospect_date ON Sequence(prospectId, createdAt DESC);
CREATE INDEX idx_sequence_prompt ON Sequence(promptId);

-- Query optimization example
SELECT s.*, p.version as prompt_version 
FROM Sequence s 
JOIN Prompt p ON s.promptId = p.id 
WHERE s.prospectId = ? 
ORDER BY s.createdAt DESC;
```

### 2. Smart Caching Implementation

```typescript
// Cache prompt content to avoid regeneration
if (activePrompt && activePrompt.content === freshPrompt) {
  // Reuse existing prompt
  promptRecord = activePrompt;
  shouldSaveNewPrompt = false;
} else {
  // Generate and cache new prompt
  promptRecord = await this.promptService.savePrompt(freshPrompt);
}
```

### 3. Efficient JSON Storage

```typescript
// Store complex data as JSONB for flexibility AND performance
{
  messages: [
    {
      message: "Hi John, ...",
      type: "opening",
      confidence: 0.85,
      aiReasoning: "..."
    }
  ],
  metadata: {
    cost: 0.001234,
    promptTokens: 150,
    completionTokens: 200,
    totalTokens: 350,
    model: "llama-3.3-70b-versatile",
    provider: "groq"
  }
}
```

**JSONB Advantages:**
- **Query Performance**: GIN indexes enable fast JSON path queries
- **Analytics Capabilities**: Complex aggregations on nested JSON data
- **Storage Efficiency**: Binary format reduces storage overhead
- **Index Support**: Partial and expression indexes on JSON fields
- **Type Safety**: PostgreSQL validates JSON structure on insert

**Example JSONB Queries:**
```sql
-- Find high-cost sequences
SELECT * FROM sequences 
WHERE metadata @> '{"cost": {"$gt": 0.01}}';

-- Analyze model performance
SELECT metadata->>'model' as model, 
       AVG((metadata->>'cost')::float) as avg_cost
FROM sequences 
GROUP BY metadata->>'model';

-- Search message content
SELECT * FROM sequences 
WHERE messages @@ '$.*.message like_regex "partnership"';
```

## Future Improvements

### 1. Enhanced AI Integration

**Advanced Model Selection**
- Implement A/B testing framework for model performance comparison
- Dynamic model routing based on real-time performance metrics
- Cost-performance optimization algorithms
- Support for fine-tuned models specific to LinkedIn outreach

**Multi-Step Reasoning**
- Implement chain-of-thought prompting for complex scenarios
- Add reflection and self-correction capabilities
- Integrate retrieval-augmented generation (RAG) for company research
- Implement iterative refinement based on user feedback

### 2. Performance & Scalability

**Caching Strategy**
- Implement Redis for distributed caching
- Add vector embeddings for semantic prompt similarity
- Cache frequently accessed prospect data
- Implement cache warming strategies

**Database Optimizations**
- Partition large tables by date for improved query performance
- Implement read replicas for analytics workloads
- Add database connection pooling optimization
- Consider time-series database for metrics storage

**API Performance**
- Add request queuing and rate limiting
- Implement background job processing for non-urgent requests
- Add response compression and CDN integration
- Implement API response caching

### 3. Observability & Monitoring

**Comprehensive Logging**
- Structured logging with correlation IDs
- Performance metrics collection (P95, P99 latencies)
- AI model performance tracking
- Cost analytics and budget alerting

**Monitoring & Alerting**
- Health checks for all AI providers
- Custom metrics for business KPIs (confidence scores, conversion rates)
- Real-time dashboards for system health
- Automated alerting for anomalies

### 4. Feature Enhancements

**Advanced Personalization**
- LinkedIn profile scraping integration (with consent)
- Company research automation
- Industry-specific messaging templates
- Sentiment analysis of previous interactions

**User Experience**
- Real-time sequence generation status
- Bulk sequence generation
- Template management and versioning
- A/B testing interface for different approaches

**Analytics & Insights**
- Sequence performance analytics
- Cost optimization recommendations
- Model performance comparisons
- User behavior analytics

### 5. Security & Compliance

**Data Protection**
- Implement data encryption at rest and in transit
- Add PII detection and masking
- GDPR compliance for prospect data handling
- Audit logging for all data access

**API Security**
- Rate limiting per user/API key
- Request signing and validation
- Input sanitization and validation
- OAuth2/JWT authentication

### 6. Integration Capabilities

**CRM Integration**
- Salesforce, HubSpot, Pipedrive connectors
- Lead scoring integration
- Campaign management synchronization
- Contact enrichment services

**Communication Platforms**
- LinkedIn Sales Navigator integration
- Email sequence coordination
- Multi-channel outreach orchestration
- Follow-up scheduling automation

### 7. Machine Learning Enhancements

**Feedback Loops**
- Response rate tracking and learning
- Confidence score calibration based on outcomes
- Automated prompt optimization
- Personalization model training

**Advanced Analytics**
- Predictive response rate modeling
- Optimal timing recommendations
- Content performance analysis
- Competitive intelligence integration

## Setup & Configuration

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- AI Provider API keys (OpenAI, Anthropic, or Groq)

### Environment Setup

```bash
# Clone repository
git clone <https://github.com/happychuks/linkedin-sequence-gen.git>
cd linkedin-sequence-gen

# Install dependencies
npm install

# Database setup
npx prisma migrate dev
npx prisma generate

# Environment configuration
cp .env.example .env
# Configure your environment variables
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/linkedin_ai"

# AI Providers (configure at least one)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."

# Default provider selection
DEFAULT_AI_PROVIDER="groq"  # or "openai" or "anthropic"

# Optional: Model overrides
OPENAI_DEFAULT_MODEL="gpt-3.5-turbo"
GROQ_DEFAULT_MODEL="llama-3.3-70b-versatile"
```

### Development Commands

```bash
# Development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test
npm run test:e2e

# Database operations
npx prisma studio          # Database GUI
npx prisma migrate reset   # Reset database
npx prisma db push        # Push schema changes
```

### API Usage Examples

#### **Live Demo & Testing**

The application is deployed on Railway and can be tested live using Swagger UI:

🚀 **Live API Documentation:** [https://linkedin-sequence-gen-production.up.railway.app/api/docs](https://linkedin-sequence-gen-production.up.railway.app/api/docs)

**Interactive Testing:**

1. Visit the Swagger UI link above
2. Click on any endpoint to expand it
3. Click "Try it out" to test with sample data
4. Execute requests and see real-time responses

#### **cURL Examples**

```bash
# Generate sequence (Live endpoint)
curl -X POST https://linkedin-sequence-gen-production.up.railway.app/api/generate-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_url": "https://linkedin.com/in/happy-felix",
    "tov_config": {
      "formality": 0.9,
      "warmth": 0.8,
      "directness": 0.7
    },
    "company_context": "We help B2B companies automate sales and generate leads",
    "sequence_length": 3
  }'

# Get history (Live endpoint)
curl https://linkedin-sequence-gen-production.up.railway.app/api/history/1

# Refine sequence with new TOV parameters (Live endpoint)
curl -X POST https://linkedin-sequence-gen-production.up.railway.app/api/refine-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "originalSequenceId": 1,
    "newTovConfig": {
      "formality": 0.5,
      "warmth": 0.9,
      "directness": 0.8
    },
    "newSequenceLength": 4
  }'

# Get refinement history (Live endpoint)
curl https://linkedin-sequence-gen-production.up.railway.app/api/refinements/1

# Compare sequence versions (Live endpoint)
curl "https://linkedin-sequence-gen-production.up.railway.app/api/compare?originalId=1&refinedId=4"
```

#### **Local Development Examples**

```bash
# Generate sequence (Local)
curl -X POST http://localhost:3000/api/generate-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_url": "https://linkedin.com/in/happy-felix",
    "tov_config": {
      "formality": 0.9,
      "warmth": 0.8,
      "directness": 0.7
    },
    "company_context": "We help B2B companies automate sales and generate leads",
    "sequence_length": 3
  }'

# Get history (Local)
curl http://localhost:3000/api/history/1

# Refine sequence with new TOV parameters (Local)
curl -X POST http://localhost:3000/api/refine-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "originalSequenceId": 1,
    "newTovConfig": {
      "formality": 0.5,
      "warmth": 0.9,
      "directness": 0.8
    },
    "newSequenceLength": 4
  }'

# Get refinement history (Local)
curl http://localhost:3000/api/refinements/1

# Compare sequence versions (Local)
curl "http://localhost:3000/api/compare?originalId=1&refinedId=4"
```

### Testing Strategy

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test specific modules
npm run test -- ai-service
npm run test -- sequence-service
```

---

## Contributing

This project follows clean architecture principles with comprehensive testing and documentation. All contributions should maintain the established patterns for error handling, validation, and observability.

## License

[Your License Here]
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
