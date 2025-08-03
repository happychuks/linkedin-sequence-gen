# LinkedIn Messaging AI - Comprehensive Technical Documentation

## Overview

This project is a sophisticated AI-powered LinkedIn outreach sequence generator built with NestJS, featuring multi-provider AI integration, intelligent prompt engineering, and comprehensive error handling. The system generates personalized messaging sequences with confidence scoring, thinking process capture, and detailed prospect analysis.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [Prompt Engineering Strategy](#prompt-engineering-strategy)
4. [AI Integration Patterns](#ai-integration-patterns)
5. [API Design & Data Validation](#api-design--data-validation)
6. [Error Handling & Resilience](#error-handling--resilience)
7. [Performance Optimizations](#performance-optimizations)
8. [Future Improvements](#future-improvements)
9. [Setup & Configuration](#setup--configuration)

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
│                              DATA FLOW                                      │
│                                                                             │
│    [1] Request                [2] Validation          [3] Business Logic    │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │   Client    │──────────▶ │ Controller  │────────▶│ Sequence    │         │
│  │  Request    │            │   + DTO     │         │  Service    │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│                                                             │               │
│                                                             ▼               │
│    [8] Response               [7] Data Storage       [4] Name Extraction    │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │  Generated  │◀────────── │ Repository  │◀────────│ AI Service  │         │
│  │  Sequence   │            │   Layer     │         │   + Utils   │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│                                                             │               │
│                                                             ▼               │
│    [6] AI Response            [5] Provider Call      [4.5] Prompt Build     │
│  ┌─────────────┐            ┌─────────────┐         ┌─────────────┐         │
│  │ JSON Parse  │◀────────── │ AI Adapter  │◀────────│ Prompt      │         │
│  │ + Validate  │            │   Factory   │         │  Service    │         │
│  └─────────────┘            └─────────────┘         └─────────────┘         │
│                                     │                                       │
│                                     ▼                                       │
│                              ┌─────────────┐                                │
│                              │   OpenAI    │                                │
│                              │    Groq     │                                │
│                              │ Anthropic   │                                │
│                              └─────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: PostgreSQL with Prisma ORM 6.13.0
- **AI Providers**: OpenAI, Anthropic Claude, Groq
- **Validation**: Zod 3.25.76 for schema validation
- **Testing**: Jest with Supertest for E2E testing

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
  messages         Json
  thinkingProcess  Json
  prospectAnalysis String
  metadata         Json
  createdAt        DateTime @default(now())
  
  prospect Prospect @relation(fields: [prospectId], references: [id])
  prompt   Prompt   @relation(fields: [promptId], references: [id])
  
  @@index([prospectId, createdAt])
  @@index([promptId])
  @@index([createdAt])
}
```

**Design Decisions:**
- **JSON storage for flexibility**: Messages, thinking process, and metadata stored as JSON for schema flexibility
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
```

**Rationale:**
- **History queries**: Composite index on `[prospectId, createdAt]` enables fast prospect history retrieval
- **Analytics queries**: Date-based indexes support temporal analysis
- **Foreign key performance**: Dedicated indexes on all foreign key relationships

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
}
```

**Design Principles:**
- **Resource-oriented URLs**: Clear, intuitive endpoint naming
- **HTTP method semantics**: POST for creation, GET for retrieval
- **Type safety**: Built-in validation with NestJS pipes
- **Consistent responses**: Standardized response structure across endpoints

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
  sequence_length: z.number().int().min(1).max(10),
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
// Store complex data as JSON for flexibility vs. normalization
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
    totalTokens: 350
  }
}
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

```bash
# Generate sequence
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

# Get history
curl http://localhost:3000/api/history/1
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
