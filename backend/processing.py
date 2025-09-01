# backend/processing.py
# Логика обработки данных (переиспользуем из старого проекта)

from datetime import datetime
# Предполагается, что Babel установлен
from babel.dates import format_date
import locale

# === УСТАНОВКА ЛОКАЛИ ДЛЯ РУССКОГО ЯЗЫКА ===
# Это можно оставить здесь или перенести в app.py, если используется только там
try:
    locale.setlocale(locale.LC_TIME, "ru_RU.UTF-8")  # Linux/macOS
except:
    try:
        locale.setlocale(locale.LC_TIME, "russian")  # Windows
    except:
        pass

# === ФУНКЦИЯ: ОПРЕДЕЛЕНИЕ ЧАСТИ ДНЯ ПО ЧАСУ ===
def get_part_of_day(hour):
    """Определяет часть дня по часу."""
    if 0 <= hour < 9:
        return "До начала дня"
    elif 9 <= hour < 12:
        return "Утро"
    elif 12 <= hour < 15:
        return "Обед"
    elif 15 <= hour < 18:
        return "Вечер"
    else:
        return "После работы"

# === ФУНКЦИЯ: ПОЛУЧЕНИЕ ДНЯ НЕДЕЛИ НА РУССКОМ ===
def get_weekday_rus(date_str):
    """Получает день недели на русском языке по дате в формате dd.mm.yyyy."""
    try:
        dt = datetime.strptime(date_str, "%d.%m.%Y")
        weekday = format_date(dt, "EEE", locale='ru').capitalize()
        return {
            "Понедельник": "пн", "Вторник": "вт", "Среда": "ср", "Четверг": "чт",
            "Пятница": "пт", "Суббота": "сб", "Воскресенье": "вс"
        }.get(weekday, weekday[:2].lower())
    except:
        return "??"

# === ФУНКЦИЯ: ЧТЕНИЕ ПОСЛЕДНИХ СТРОК ИЗ ФАЙЛА ===
# Эта функция пока не используется напрямую в новом бэкенде,
# так как логика чтения перенесена в storage.py для Excel.
# Но может быть полезна в будущем или для других целей.
def read_last_lines_from_txt(filename, num_lines):
    """Читает последние num_lines строк из текстового файла."""
    # (Логика из старого проекта)
    import os
    if not os.path.exists(filename):
        return []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            return lines[-num_lines:] if lines else []
    except Exception as e:
        print(f"Ошибка при чтении файла {filename}: {e}")
        return []
