# backend/models.py
# Модели данных

from datetime import datetime

class TaskRecord:
    """Модель записи о задаче."""

    def __init__(self, date, time, weekday, part_of_day, task_type, description, difficulty):
        self.date = date
        self.time = time
        self.weekday = weekday
        self.part_of_day = part_of_day
        self.task_type = task_type
        self.description = description
        self.difficulty = difficulty

    def to_dict(self):
        """Преобразует объект в словарь."""
        return {
            'date': self.date,
            'time': self.time,
            'weekday': self.weekday,
            'part_of_day': self.part_of_day,
            'task_type': self.task_type,
            'description': self.description,
            'difficulty': self.difficulty
        }

    @classmethod
    def from_dict(cls, data):
        """Создает объект из словаря."""
        return cls(
            date=data.get('date', ''),
            time=data.get('time', ''),
            weekday=data.get('weekday', ''),
            part_of_day=data.get('part_of_day', ''),
            task_type=data.get('task_type', 'Р'),
            description=data.get('description', ''),
            difficulty=data.get('difficulty', '1')
        )

    def __repr__(self):
        return f"<TaskRecord(date='{self.date}', task_type='{self.task_type}', description='{self.description[:20]}...')>"
