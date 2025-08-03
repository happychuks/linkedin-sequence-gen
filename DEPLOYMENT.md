# Deployment Guide

This guide will help you deploy the LinkedIn Messaging AI project to Railway or Render.

## 🚂 Railway Deployment (Recommended)

Railway is easier to set up and has excellent GitHub integration.

### Prerequisites
1. GitHub account with your code pushed
2. Railway account (sign up at railway.app)
3. Your environment variables ready

### Steps

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add Database**
   - In your Railway project dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will provision a PostgreSQL database
   - Copy the `DATABASE_URL` from the database settings

3. **Configure Environment Variables**
   - Go to your web service settings
   - Add these variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your_railway_postgres_url>
   AI_PROVIDER=openai
   OPENAI_API_KEY=<your_openai_key>
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_TEMPERATURE=0.7
   OPENAI_MAX_TOKENS=2000
   OPENAI_SYSTEM_PROMPT=You are an expert LinkedIn outreach specialist. Generate personalized, natural messages without using ANY placeholders like [Company Name] or [Your Company]. Use specific details from the context provided.
   ```

4. **Deploy**
   - Railway will automatically detect the `railway.json` config
   - It will build using the Dockerfile
   - Your app will be available at the provided Railway URL

## 🎨 Render Deployment

Render offers a free tier and is great for production applications.

### Prerequisites
1. GitHub account with your code pushed
2. Render account (sign up at render.com)
3. Your environment variables ready

### Steps

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file

2. **Configure Environment Variables**
   - During setup, Render will prompt for environment variables
   - Add your API keys and configuration:
   ```
   OPENAI_API_KEY=<your_openai_key>
   ANTHROPIC_API_KEY=<your_anthropic_key> (optional)
   GROQ_API_KEY=<your_groq_key> (optional)
   ```

3. **Deploy**
   - Render will automatically:
     - Create a PostgreSQL database
     - Build your application using Docker
     - Set up health checks
     - Provide a public URL

## 🔧 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `3000` |
| `DATABASE_URL` | PostgreSQL connection | Yes | `postgresql://user:pass@host:5432/db` |
| `AI_PROVIDER` | AI service to use | Yes | `openai`, `anthropic`, or `groq` |
| `OPENAI_API_KEY` | OpenAI API key | If using OpenAI | `sk-...` |
| `OPENAI_MODEL` | OpenAI model | No | `gpt-3.5-turbo` |
| `ANTHROPIC_API_KEY` | Anthropic API key | If using Anthropic | `sk-ant-...` |
| `GROQ_API_KEY` | Groq API key | If using Groq | `gsk_...` |

## 🚀 Post-Deployment

After successful deployment:

1. **Test the API**
   - Visit `https://your-app-url.com/health` to check if it's running
   - Visit `https://your-app-url.com/api/docs` to see the Swagger documentation

2. **Test the Endpoints**
   ```bash
   # Test sequence generation
   curl -X POST "https://your-app-url.com/api/generate-sequence" \
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
   
   # Test history
   curl "https://your-app-url.com/api/history/1"
   ```

3. **Monitor Logs**
   - Railway: Check the deployment logs in your project dashboard
   - Render: View logs in the service dashboard

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure `DATABASE_URL` is correctly set
   - Check if database migrations ran successfully

2. **AI Provider Error**
   - Verify your API keys are correct
   - Check the `AI_PROVIDER` environment variable

3. **Build Failures**
   - Check if all dependencies are in `package.json`
   - Ensure Prisma schema is valid

4. **Health Check Failures**
   - Verify the `/health` endpoint is accessible
   - Check if the app is listening on the correct port

### Getting Help

- Railway: [Railway Docs](https://docs.railway.app/)
- Render: [Render Docs](https://render.com/docs)
- Check the application logs for detailed error messages

## 🎯 Recommended Next Steps

1. Set up monitoring and alerting
2. Configure custom domain (if needed)
3. Set up CI/CD pipeline for automatic deployments
4. Add environment-specific configurations
5. Set up database backups
