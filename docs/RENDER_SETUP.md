# ThinkFirst — Render Cloud & Render Workflows Setup Guide

**Project**: ThinkFirst  
**Platform**: Render Cloud (PaaS)  
**Document Version**: 1.0.0  
**Blueprint File**: [`render.yaml`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/render.yaml)  

---

## 1. Overview & Strategy

ThinkFirst leverages **Render Cloud** using hackathon credits to decouple lightweight real-time traffic from heavy AI processing:

1. **Render Web Service (`thinkfirst-api`)**:
   - Hosts the Express.js API gateway.
   - Handles authentication, fast database queries ($< 50\text{ ms}$), and **real-time Socratic Tutor dialogue streaming via Server-Sent Events (SSE)**.
2. **Render Workflows (`learning-material-ingestion`)**:
   - Executes multi-step, durable background AI pipelines:
     - **Step 1**: Fetch teacher PDF / slides from Supabase Storage and extract plaintext.
     - **Step 2**: Semantic chunking (~500 tokens with 100-token overlap).
     - **Step 3**: Batch vector embeddings generation using **Gemini Embedding 2** (768 dimensions).
     - **Step 4**: Bulk insertion into Supabase `note_embeddings` and updating `learning_materials.processing_status` to `'ready'`.
   - **Step Resumption**: If an external API hits a rate limit on chunk 40, Render Workflows retries that step automatically without restarting from scratch.
3. **Render Workflows (`classroom-insights-synthesis`)**:
   - Scheduled / on-demand background workflow aggregating student quiz responses and chat evidence to compute `teacher_insights`.

---

## 2. Connecting the Official Render MCP Server

Render provides an **official hosted Model Context Protocol (MCP) server**. Once connected, your AI assistant can directly:
- Check service status and health.
- Stream and filter live server logs.
- Trigger deployments and restart services.
- Manage environment variables.

### Step-by-Step Connection Instructions:

#### Step 1: Generate a Render API Key
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click your profile avatar in the top right $\rightarrow$ **Account Settings**.
3. In the left navigation, click **API Keys**.
4. Click **Create API Key**, name it `ThinkFirst-Agent`, and copy the generated token.

#### Step 2: Add MCP Server to your IDE / Agent Settings
Add the following configuration into your MCP configuration file (e.g. `claude_desktop_config.json`, Cursor Settings $\rightarrow$ MCP, or your agent MCP settings):

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_RENDER_API_KEY>"
      }
    }
  }
}
```

*Note*: Since Render's MCP server is hosted remotely (`https://mcp.render.com/mcp`), you don't need to install or run any local Docker containers or Python scripts to use it!

---

## 3. Render CLI Installation (Windows)

You can also install the official **Render CLI** on Windows to run commands locally:

```powershell
winget install render.cli
```

Once installed, authenticate with:
```powershell
render login
```

### Useful CLI Commands:
- `render services`: List all running services.
- `render logs <service-id>`: Stream live application logs.
- `render deploys create <service-id>`: Trigger a fresh deploy.
- `render blueprints validate render.yaml`: Verify your blueprint configuration.

---

## 4. 1-Click Deployment via Render Blueprint

1. Push your repository to GitHub.
2. In the Render Dashboard, click **New +** $\rightarrow$ **Blueprint**.
3. Connect your `https://github.com/Srinanth/ThinkFirst.git` repository.
4. Render will read [`render.yaml`](file:///c:/Users/Srinanth%20MV/Personal%20Projects/realm-hack/render.yaml) and automatically configure the web service and environment variables.
5. In the dashboard, fill in your secret environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
6. Click **Apply**.
