import re
from typing import Optional

TRANSLIT_MAP: dict[str, str] = {
    'а': 'a',  'б': 'b',  'в': 'v',  'г': 'g',  'д': 'd',
    'е': 'e',  'ё': 'yo', 'ж': 'zh', 'з': 'z',  'и': 'i',
    'й': 'y',  'к': 'k',  'л': 'l',  'м': 'm',  'н': 'n',
    'о': 'o',  'п': 'p',  'р': 'r',  'с': 's',  'т': 't',
    'у': 'u',  'ф': 'f',  'х': 'kh', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'shch','ъ': '',  'ы': 'y',  'ь': '',
    'э': 'e',  'ю': 'yu', 'я': 'ya',
}


def slugify(text: str) -> str:
    """Транслитерирует кириллицу и превращает строку в URL-slug."""
    text = text.lower().strip()
    result: list[str] = []
    for ch in text:
        if ch in TRANSLIT_MAP:
            result.append(TRANSLIT_MAP[ch])
        elif ch.isascii() and (ch.isalnum() or ch in ' -_'):
            result.append(ch)
        else:
            result.append('')
    slug = re.sub(r'[\s_-]+', '-', ''.join(result))
    slug = slug.strip('-')
    return slug or 'product'


def generate_unique_slug(db, name: str, exclude_id: Optional[str] = None) -> str:
    """Генерирует уникальный slug на основе названия товара."""
    from sqlalchemy import text

    base = slugify(name)
    candidate = base
    counter = 2
    while True:
        query = "SELECT id FROM products WHERE slug = :slug"
        params: dict = {"slug": candidate}
        if exclude_id:
            query += " AND id != :eid"
            params["eid"] = exclude_id
        row = db.execute(text(query), params).fetchone()
        if row is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1
