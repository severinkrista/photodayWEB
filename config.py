# config.py
# Конфигурационный файл для веб-сервера

import os

class Config:
    """Базовая конфигурация."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess-this-secret-key-change-it'

    # Порт, на котором будет запущен сервер
    PORT = int(os.environ.get('PORT', 5000))

    # Режим отладки (включать только в разработке!)
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

    # Путь к папке с данными
    DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'data')

    # Имя файла Excel для хранения записей
    EXCEL_FILENAME = 'Фотодня.xlsx'

    # Полный путь к файлу Excel
    @property
    def EXCEL_FILEPATH(self):
        return os.path.join(self.DATA_FOLDER, self.EXCEL_FILENAME)

    # Максимальное количество отображаемых последних задач
    MAX_LAST_TASKS = 50

    # Тип хранилища: 'excel' или 'database' (заглушка для будущего PostgreSQL)
    STORAGE_TYPE = os.environ.get('STORAGE_TYPE', 'excel')


class DevelopmentConfig(Config):
    """Конфигурация для разработки."""
    DEBUG = True


class ProductionConfig(Config):
    """Конфигурация для продакшена."""
    DEBUG = False


# Словарь для выбора конфигурации
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
