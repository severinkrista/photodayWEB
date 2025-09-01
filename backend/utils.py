# backend/utils.py
# Вспомогательные функции для бэкенда

# Пока пусто, но сюда можно добавить общие функции,
# например, для валидации данных, логгирования и т.д.

def validate_date_format(date_string):
    """Проверяет, соответствует ли строка формату dd.mm.yyyy."""
    from datetime import datetime
    try:
        datetime.strptime(date_string, '%d.%m.%Y')
        return True
    except ValueError:
        return False

def validate_time_format(time_string):
    """Проверяет, соответствует ли строка формату HH:MM."""
    try:
        hour, minute = time_string.split(':')
        h, m = int(hour), int(minute)
        if 0 <= h <= 23 and 0 <= m <= 59:
            return True
        return False
    except (ValueError, IndexError):
        return False
