SCORING_PROMPT_TEMPLATE = """You are evaluating an AI-native software engineer based on their Claude Code / Cursor / Windsurf session transcript. This shows how they actually work with AI coding assistants.

TRANSCRIPT:
{transcript}

Score 1–10 on each axis with specific feedback citing evidence from the transcript.

1. Planning & Design (planning_design)
Evidence: use of /plan mode or structured planning before coding, breaking down problems architecturally, considering trade-offs, designing before implementing.
Low (1-3): Jumps straight into coding. High (8-10): Explicitly plans, architectural thinking visible before any code is written.

2. AI Collaboration (ai_collaboration)
Evidence: prompt quality (specific, contextual, clear), iterating on AI output, critically evaluating suggestions vs blind copy-paste, effective context-setting.
Low: Vague prompts, accepts all output uncritically. High: Precise prompts with context, challenges AI, iterates intelligently.

3. Agent Orchestration (agent_orchestration)
Evidence: launching parallel agents for independent work, writing scoped task briefs, managing sub-agents, multi-agent delegation patterns.
Low: Only single-turn prompts. High: Orchestrates parallel agents, writes clear scoped briefs, thinks about delegation scope.

4. Debugging (debugging)
Evidence: systematic diagnosis (reads error → traces logic → hypothesis → targeted fix) vs random trial-and-error.
Low: Randomly tries things, asks AI to "just fix it". High: Reads errors carefully, isolates root cause, surgical fixes.

5. Code Quality (code_quality)
Evidence: reviewing diffs before accepting, asking for tests, avoiding shortcuts, clean implementations, attention to edge cases.
Low: Accepts all AI output without review. High: Reviews diffs, requests tests, asks about edge cases.

6. Communication (communication)
Evidence: clear task descriptions when briefing agents, concise and complete prompts, explicit about constraints and context.
Low: Vague or incomplete briefs. High: Every prompt is self-contained, explicit about scope and constraints.

Respond ONLY in this exact JSON (no markdown, no extra text):
{{
  "scores": {{
    "planning_design": {{ "score": 8, "feedback": "Specific evidence from transcript..." }},
    "ai_collaboration": {{ "score": 7, "feedback": "..." }},
    "agent_orchestration": {{ "score": 6, "feedback": "..." }},
    "debugging": {{ "score": 8, "feedback": "..." }},
    "code_quality": {{ "score": 7, "feedback": "..." }},
    "communication": {{ "score": 9, "feedback": "..." }}
  }},
  "overall_summary": "2-3 sentence summary of the candidate's AI-native engineering ability and standout characteristics.",
  "strengths": ["Specific strength with evidence from transcript", "..."],
  "areas_for_improvement": ["Specific area to improve with context", "..."]
}}"""
