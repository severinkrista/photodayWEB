# app.py
# Основной файл Flask-приложения

from flask import Flask, render_template, request, jsonify
import os
# Импортируем конфигурацию
from config import config
# Импортируем модули бэкенда
from backend.storage import Storage
from backend.models import TaskRecord
from backend.processing import get_weekday_rus, get_part_of_day

def create_app(config_name=None):
    """Фабричная функция для создания экземпляра Flask-приложения."""
    app = Flask(__name__)

    # Загружаем конфигурацию
    config_name = config_name or os.getenv('FLASK_CONFIG', 'default')
    app.config.from_object(config[config_name])

    # Инициализируем хранилище
    storage = Storage(app.config)

    # --- Маршруты (Routes) ---

    @app.route('/')
    def index():
        """Главная страница."""
        return render_template('index.html')

    @app.route('/api/tasks', methods=['GET'])
    def get_last_tasks():
        """API: Получить последние N задач."""
        try:
            count = min(request.args.get('count', 5, type=int), app.config['MAX_LAST_TASKS'])
            tasks = storage.get_last_tasks(count)
            # Преобразуем объекты TaskRecord в словари для JSON
            tasks_data = [task.to_dict() for task in tasks]
            return jsonify({'status': 'success', 'data': tasks_data})
        except Exception as e:
            app.logger.error(f"Ошибка при получении задач: {e}")
            return jsonify({'status': 'error', 'message': str(e)}), 500

    @app.route('/api/tasks', methods=['POST'])
    def add_task():
        """API: Добавить новую задачу."""
        try:
            data = request.get_json()
            if not 
                return jsonify({'status': 'error', 'message': 'Некорректные данные'}), 400

            # Создаем объект TaskRecord из полученных данных
            task = TaskRecord(
                date=data.get('date', ''),
                time=data.get('time', ''),
                weekday=data.get('weekday', ''), # Можно вычислять на фронте или бэке
                part_of_day=data.get('part_of_day', ''), # Можно вычислять на фронте или бэке
                task_type=data.get('task_type', 'Р'),
                description=data.get('description', '').strip(),
                difficulty=data.get('difficulty', '1')
            )

            # Валидация (простая)
            if not task.description:
                 return jsonify({'status': 'error', 'message': 'Описание задачи не может быть пустым'}), 400

            # Сохраняем задачу
            storage.save_task(task)
            return jsonify({'status': 'success', 'message': 'Задача сохранена'})
        except Exception as e:
            app.logger.error(f"Ошибка при добавлении задачи: {e}")
            return jsonify({'status': 'error', 'message': 'Внутренняя ошибка сервера'}), 500

    @app.route('/api/tasks/save_all', methods=['POST'])
    def save_all_tasks():
        """API: Сохранить все задачи из буфера (в данном случае просто в Excel)."""
        # В текущей реализации все задачи сразу идут в Excel через add_task.
        # Этот эндпоинт может быть заглушкой или для других действий в будущем.
        try:
            # Например, можно добавить логику обновления отображения последних задач без добавления новой
            # Но для MVP это не обязательно.
            # Пока просто возвращаем успех.
            return jsonify({'status': 'success', 'message': 'Все задачи сохранены (MVP)'})
        except Exception as e:
            app.logger.error(f"Ошибка при сохранении всех задач: {e}")
            return jsonify({'status': 'error', 'message': 'Внутренняя ошибка сервера'}), 500


    return app

# Создаем экземпляр приложения при запуске скрипта напрямую
if __name__ == '__main__':
    app = create_app()
    app.run(debug=app.config['DEBUG'], port=app.config['PORT'])
