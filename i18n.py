import json

def load_translations(lang='de'):
    try:
        with open(f'translations/{lang}.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}  # Fallback to empty dict