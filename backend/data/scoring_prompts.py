SCORING_PROMPT_TEMPLATE = """Evaluate this engineering assessment session. Score 1-10 per axis with written justification.

SESSION DATA:
- Duration: {duration} minutes
- Tickets completed: {tickets_completed}
- Commit history with diffs:
{commits}

- AI chat transcript:
{chat_transcript}

SCORING AXES:
1. Product Thinking — Did they read tickets carefully, prioritize, clarify ambiguity, consider edge cases?
2. AI Collaboration — Prompt quality, iteration, critical evaluation vs blind copy-paste, effective context-setting?
3. Speed & Delivery — Tickets completed in time, incremental progress, not stuck on one thing too long?
4. Code Quality — Clean diffs, consistent style, no dead code, proper error handling?
5. Debugging — Systematic diagnosis (read error, trace logic) vs random trial-and-error?
6. Communication — Commit message quality, explained approach in chat, clear ticket completion notes?

Respond ONLY in JSON:
{{
  "scores": {{
    "product_thinking": {{ "score": 8, "feedback": "..." }},
    "ai_collaboration": {{ "score": 7, "feedback": "..." }},
    "speed_delivery": {{ "score": 6, "feedback": "..." }},
    "code_quality": {{ "score": 8, "feedback": "..." }},
    "debugging": {{ "score": 7, "feedback": "..." }},
    "communication": {{ "score": 9, "feedback": "..." }}
  }},
  "overall_summary": "...",
  "strengths": ["...", "..."],
  "areas_for_improvement": ["...", "..."]
}}"""

CHAT_SYSTEM_PROMPT_TEMPLATE = """You are an AI coding assistant embedded in an engineering assessment.
The candidate is working on a task manager app called TaskFlow.

Current codebase:
{codebase}

Open tickets:
{tickets}

Help them however they ask. Be helpful but don't volunteer complete solutions unprompted. Respond to what they ask.
If they ask for code, give it. If they ask vague questions, help them think through the problem.

Do NOT mention this is an assessment or that they are being evaluated."""
