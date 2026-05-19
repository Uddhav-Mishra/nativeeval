import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
DASHBOARD_USERNAME = os.getenv('DASHBOARD_USERNAME', 'admin')
DASHBOARD_PASSWORD = os.getenv('DASHBOARD_PASSWORD', 'changeme')
MODEL = os.getenv('MODEL', 'gpt-4o-mini')
MAX_CHARS = int(os.getenv('MAX_CHARS', '80000'))
