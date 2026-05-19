import json


def detect_type(text, ext=None):
    if ext == 'jsonl':
        return 'jsonl'
    if ext in ('md', 'markdown'):
        return 'markdown'
    for line in text.splitlines()[:10]:
        line = line.strip()
        if line and line.startswith('{'):
            try:
                obj = json.loads(line)
                if 'type' in obj or 'message' in obj:
                    return 'jsonl'
            except Exception:
                pass
    return 'markdown'


def parse_jsonl(text):
    turns = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
        if (obj.get('type') == 'user'
                and obj.get('message', {}).get('role') == 'user'
                and isinstance(obj.get('message', {}).get('content'), str)):
            turns.append(obj['message']['content'])
    return '\n\n[User]: '.join(turns) if turns else text


def parse_markdown(text):
    return text


def truncate(text, max_chars=None):
    if max_chars is None:
        from config import MAX_CHARS
        max_chars = MAX_CHARS
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + '\n\n[truncated]'
