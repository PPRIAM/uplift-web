---
name: creating-antigravity-agents
description: Creates, configures, and orchestrates autonomous AI agents tailored for the Google Antigravity developer environment. Use when designing custom agents, multi-agent systems, instructions, specialized tools, operational guardrails, or escalation paths in Antigravity.
---

# Creating Antigravity Agents

This skill provides comprehensive instructions, architectural design patterns, and concrete templates for engineering autonomous AI agents optimized for the Google Antigravity agent-first development environment.

---

## When to use this skill
Use this skill when you need to:
- Design or configure a new autonomous agent in Antigravity.
- Set up a single-agent workspace or coordinate multi-agent systems.
- Define agent instructions, operational guardrails, and toolsets.
- Implement human-in-the-loop escalation paths and safety verification.
- Establish observability and artifact generation for agent execution.

---

## Workflow

### 1. Scope & Feasibility Analysis
- **Reasoning Verification**: Determine if the task requires autonomous reasoning, context adaptation, or handling unstructured data, or if a deterministic system is sufficient.
- **Workflow Scope**: Identify if the agent will operate in a single-agent workspace (recommended first step) or if a multi-agent orchestration pattern is needed.

### 2. Base Agent Configuration
- **Model Selection**: Select the engine based on intelligence vs. cost/latency trade-offs. Start with the strongest model to establish a functional baseline, then optimize.
- **Tool Mapping**: Group tools into Data, Action, and Orchestration categories depending on the agent's responsibilities.
- **Instructions Draft**: Write clear, explicit, and bounded instructions that define the agent's objective, operational limits, and failure handling.

### 3. Orchestration Architecture
- **Orchestration Pattern**: Choose the correct setup:
  - **Single-Agent Workspace**: Maximize single-agent capabilities for simplicity and debuggability.
  - **Manager Pattern**: Introduce a coordinator agent that dynamically delegates tasks to specialized subagents (Research, Coding, Testing, Deployment) and synthesizes their outputs.
  - **Decentralized Pattern**: Allow agents to pass execution control directly from one to the next (e.g., Triage → Debugger → Deployer). Use this only for highly specialized, independent tasks where central coordination is not required.

### 4. Safety, Guardrails & Trust Configuration
- **Layered Guardrails**: Set up relevance filtering, safety classification, permission boundaries, and execution limits.
- **Human Escalation**: Define clear escalation triggers (e.g., repeated failures, high-risk operations, extreme uncertainty, ambiguous instructions) where the agent halts and requests human intervention.
- **Trust Artifacts**: Ensure the agent generates logs, reports, summaries, diffs, and inspectable execution traces.

---

## Instructions

### 1. Model Selection Strategy
Select and optimize models using the following matrix:
- **High-Reasoning Models**: For complex architectural design, debugging distributed systems, and resolving ambiguous requirements.
- **Efficient/Fast Models**: For simple data retrieval, classification, text processing, or parallel micro-tasks.
- **Optimization Strategy**: Always start with the strongest model (e.g. Gemini 1.5 Pro or similar premium model) to verify the pipeline. Establish performance baselines, then selectively replace sub-components with smaller, faster, or cheaper models.

### 2. Tool Classification & Selection
Limit tool access to only what is necessary for the agent's role:
- **Data Tools** (Information gathering): Search repositories, query APIs, inspect logs, read browser pages, or read files.
- **Action Tools** (State-changing operations): Edit files, run compiler/build commands, execute tests, deploy code, or open pull requests.
- **Orchestration Tools** (Agent communication): Spawn subagents, delegate tasks, monitor background execution, or send/receive messages between agents.

### 3. Prompting & Instruction Guidelines
Write robust agent instructions that minimize autonomous chaos. Always include:
- **Role & Persona**: Define what the agent is and the scope of its workspace.
- **Explicit Goals**: Define the exact desired output state. Avoid vague objectives.
- **Operational Boundaries**: Specify what the agent is NOT allowed to do (e.g., do not modify files outside a specific directory, do not run arbitrary scripts).
- **Error & Failure Recovery**: Give instructions on what to do when a tool fails or a command returns an error. Instruct the agent to adapt plans, retry with different parameters, or escalate.
- **Escalation Rules**: Mandate halting execution and asking for human intervention when encountering high-risk operations or repeated failures.

### 4. Orchestration Implementation Patterns

#### Single-Agent Runner
```python
workspace_agent = Agent(
    name="Workspace Agent",
    instructions="You are an autonomous engineering agent operating inside Antigravity.",
    tools=[terminal, browser, github, filesystem],
)

Runner.run(workspace_agent, "Diagnose the build failure and fix it.")
```

#### Multi-Agent Manager
Use a central coordinator to manage specialized roles, ensuring clean context segregation:
```python
manager_agent = Agent(
    name="Project Manager",
    instructions="Coordinate the development of the feature by delegating to specialized agents.",
    tools=[spawn_subagent, send_message, monitor_tasks],
)

research_agent = Agent(
    name="Research Agent",
    instructions="Retrieve technical documentation and analyze API references.",
    tools=[browser, web_search],
)

coding_agent = Agent(
    name="Coding Agent",
    instructions="Modify code based on research notes and verify syntactical correctness.",
    tools=[filesystem, terminal],
)
```

### 5. Implementing Guardrails
High-risk operations MUST NOT run completely autonomously. Apply these boundaries:
- **Tool Restrictions**: Restrict access to destructive terminal commands or system-wide operations.
- **Permission Boundaries**: Configure read/write rules to limit folder/repository scopes.
- **Human-in-the-Loop Triggers**:
  - Halting system/network/database destructive changes.
  - Modifying security-sensitive production configurations.
  - Repeated failures of the same step (3+ times).
  - Out of budget/token limits.

---

## Validation

Verify that your designed agent conforms to these requirements:
- [ ] **Instruction Clarity**: There are zero vague instructions (e.g., no "handle appropriately", no "use your best judgment for error recovery").
- [ ] **Tool Boundaries**: The agent is equipped only with the exact tools it needs for its role.
- [ ] **Failure Handling**: The instructions explicitly define the maximum retries (e.g., 3 retries) and the escalation path.
- [ ] **Escalation Triggers**: Clear, deterministic situations under which the agent halts and prompts the user are documented.
- [ ] **Observability & Tracing**: The agent outputs structured artifacts (diffs, summaries, execution traces) detailing *what* it changed and *why*.
- [ ] **Model Appropriateness**: The selected model is matched to the complexity of the agent's logic.

---

## Resources

### Template: Base Antigravity Agent Configuration
Use this template to bootstrap new agent definitions:

```yaml
---
name: [Agent Name]
instructions: |
  You are [Agent Persona] operating within Google Antigravity.
  Your primary objective is to: [Define Goal clearly].
  
  Operational Rules:
  1. Scope: You are only allowed to read/write under [Specified Directory].
  2. Tools: Use [Tool A] for data lookup and [Tool B] for code modifications.
  
  Failure & Recovery:
  - If a command fails, inspect the stack trace, adapt your plan, and retry.
  - Do not retry the exact same command more than 3 times.
  
  Escalation Boundaries (IMMEDIATE HALT):
  - Any request to modify [Sensitive System Config/Production Database].
  - Encountering ambiguous instructions that cannot be resolved through workspace context.
  - Reaching the maximum retry limit without success.
---
```
