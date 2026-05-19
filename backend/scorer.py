import json
import re
from openai import OpenAI
import config

client = OpenAI(api_key=config.OPENAI_API_KEY)


def score_transcript(transcript_text):
    from prompts import SCORING_PROMPT_TEMPLATE
    prompt = SCORING_PROMPT_TEMPLATE.format(transcript=transcript_text)

    response = client.chat.completions.create(
        model=config.MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = response.choices[0].message.content

    try:
        return json.loads(raw)
    except Exception:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        return {"error": "Failed to parse scorecard", "raw": raw[:500]}
