// frontend/static/js/script.js
// JavaScript для динамического поведения страницы

document.addEventListener('DOMContentLoaded', function () {

    // --- Инициализация элементов ---
    const taskForm = document.getElementById('taskForm');
    const taskDateInput = document.getElementById('taskDate');
    const weekdayDisplay = document.getElementById('weekdayDisplay');
    const taskTimeInput = document.getElementById('taskTime');
    const subtractHourBtn = document.getElementById('subtractHourBtn');
    const partOfDayDisplay = document.getElementById('partOfDayDisplay');
    const taskTypeSelect = document.getElementById('taskType');
    const difficultyButtonsContainer = document.getElementById('difficultyButtons');
    const taskDifficultyHidden = document.getElementById('taskDifficulty');
    const taskDescriptionTextarea = document.getElementById('taskDescription');

    const tasksCountInput = document.getElementById('tasksCount');
    const refreshTasksBtn = document.getElementById('refreshTasksBtn');
    const tasksTableBody = document.querySelector('#tasksTable tbody');
    const noTasksMessage = document.getElementById('noTasksMessage');

    const saveAllBtn = document.getElementById('saveAllBtn');
    // const openTxtBtn = document.getElementById('openTxtBtn');
    // const openExcelBtn = document.getElementById('openExcelBtn');


    // --- Установка текущей даты и времени по умолчанию ---
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяцы с 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    taskDateInput.value = `${year}-${month}-${day}`;
    updateWeekday(); // Обновляем день недели при загрузке
    taskTimeInput.value = `${hours}:${minutes}`;
    updatePartOfDay(); // Обновляем часть дня при загрузке


    // --- Обработчики событий для формы ---

    taskDateInput.addEventListener('change', updateWeekday);
    taskTimeInput.addEventListener('change', updatePartOfDay);
    subtractHourBtn.addEventListener('click', subtractHour);

    // --- Функции обновления отображения ---

    function updateWeekday() {
        const dateStr = taskDateInput.value;
        if (!dateStr) {
            weekdayDisplay.textContent = '??';
            return;
        }
        // Отправляем запрос на сервер для получения дня недели
        // В целях упрощения можно сделать это и на клиенте, но сервер точнее
        fetch(`/api/utils/weekday?date=${encodeURIComponent(dateStr.split('-').reverse().join('.'))}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    weekdayDisplay.textContent = data.data;
                } else {
                    weekdayDisplay.textContent = '??';
                }
            })
            .catch(() => {
                // Резервный вариант на клиенте (менее надежный из-за локали)
                try {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
                    weekdayDisplay.textContent = weekdays[dateObj.getDay()];
                } catch {
                    weekdayDisplay.textContent = '??';
                }
            });
    }

    function updatePartOfDay() {
        const timeStr = taskTimeInput.value;
        if (!timeStr) {
            partOfDayDisplay.textContent = '';
            return;
        }
        const [hours] = timeStr.split(':').map(Number);
        if (isNaN(hours)) {
            partOfDayDisplay.textContent = '';
            return;
        }
        let partOfDay = '';
        if (hours >= 0 && hours < 9) partOfDay = 'До начала дня';
        else if (hours >= 9 && hours < 12) partOfDay = 'Утро';
        else if (hours >= 12 && hours < 15) partOfDay = 'Обед';
        else if (hours >= 15 && hours < 18) partOfDay = 'Вечер';
        else partOfDay = 'После работы';

        partOfDayDisplay.textContent = partOfDay;
    }

    function subtractHour() {
        let [hours, minutes] = taskTimeInput.value.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            hours = 0;
            minutes = 0;
        }
        let newHours = (hours - 1 + 24) % 24; // Обеспечивает переход через полночь
        taskTimeInput.value = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        updatePartOfDay(); // Обновляем часть дня после изменения времени
    }


    // --- Создание кнопок сложности ---
    function createDifficultyButtons() {
        difficultyButtonsContainer.innerHTML = ''; // Очищаем контейнер
        for (let i = 0; i < 6; i++) {
            const button = document.createElement('button');
            button.type = 'button'; // Важно: type="button", чтобы не сабмитить форму
            button.textContent = i;
            button.dataset.value = i;
            if (i == taskDifficultyHidden.value) {
                button.classList.add('selected');
            }
            button.addEventListener('click', function () {
                // Убираем выделение со всех кнопок
                document.querySelectorAll('#difficultyButtons button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Выделяем нажатую кнопку
                this.classList.add('selected');
                // Обновляем скрытое поле
                taskDifficultyHidden.value = this.dataset.value;
            });
            difficultyButtonsContainer.appendChild(button);
        }
    }
    createDifficultyButtons(); // Инициализируем кнопки при загрузке


    // --- Работа с таблицей задач ---

    function loadTasks() {
        const count = parseInt(tasksCountInput.value) || 5;
        // Ограничиваем значение count на клиенте
        const safeCount = Math.min(Math.max(count, 1), 50);

        fetch(`/api/tasks?count=${safeCount}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayTasks(data.data);
                } else {
                    console.error('Ошибка загрузки задач:', data.message);
                    tasksTableBody.innerHTML = '<tr><td colspan="7" style="color:red;">Ошибка загрузки задач</td></tr>';
                    noTasksMessage.style.display = 'none';
                    tasksTableBody.style.display = '';
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                tasksTableBody.innerHTML = '<tr><td colspan="7" style="color:red;">Ошибка соединения</td></tr>';
                noTasksMessage.style.display = 'none';
                tasksTableBody.style.display = '';
            });
    }

    function displayTasks(tasks) {
        tasksTableBody.innerHTML = ''; // Очищаем таблицу
        if (tasks.length === 0) {
            noTasksMessage.style.display = '';
            tasksTableBody.style.display = 'none';
        } else {
            noTasksMessage.style.display = 'none';
            tasksTableBody.style.display = '';
            tasks.forEach(task => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(task.date)}</td>
                    <td>${escapeHtml(task.time)}</td>
                    <td>${escapeHtml(task.weekday)}</td>
                    <td>${escapeHtml(task.part_of_day)}</td>
                    <td>${escapeHtml(task.task_type)}</td>
                    <td title="${escapeHtml(task.description)}">${escapeHtml(truncateString(task.description, 100))}</td>
                    <td>${escapeHtml(task.difficulty)}</td>
                `;
                tasksTableBody.appendChild(row);
            });
        }
    }

    // Вспомогательные функции для безопасности и форматирования
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return String(unsafe);
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function truncateString(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }


    // --- Обработчики событий для таблицы и кнопок ---
    refreshTasksBtn.addEventListener('click', loadTasks);
    // Инициализируем загрузку задач при старте
    loadTasks();


    // --- Обработка отправки формы ---
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Предотвращаем стандартную отправку формы

        const formData = {
            date: taskDateInput.value.split('-').reverse().join('.'), // Преобразуем YYYY-MM-DD в DD.MM.YYYY
            time: taskTimeInput.value,
            weekday: weekdayDisplay.textContent,
            part_of_day: partOfDayDisplay.textContent,
            task_type: taskTypeSelect.value,
            description: taskDescriptionTextarea.value.trim(),
            difficulty: taskDifficultyHidden.value
        };

        // Базовая валидация на клиенте
        if (!formData.description) {
            alert('Описание задачи не может быть пустым!');
            return;
        }

        // Отправляем данные на сервер
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // alert('Задача добавлена!');
                // Очищаем форму, кроме даты и времени
                // taskDateInput.value = ''; // Можно не очищать
                // taskTimeInput.value = ''; // Можно не очищать
                // updateWeekday();
                // updatePartOfDay();
                // taskTypeSelect.value = 'Р';
                taskDescriptionTextarea.value = '';
                taskDifficultyHidden.value = '1';
                createDifficultyButtons(); // Переинициализируем кнопки, чтобы сбросить выделение

                // Обновляем таблицу задач
                loadTasks();
            } else {
                alert('Ошибка при добавлении задачи: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных.');
        });
    });


    // --- Обработка кнопки "Сохранить всё" ---
    saveAllBtn.addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите сохранить все текущие данные?')) {
             // В текущей архитектуре каждая задача сохраняется сразу в Excel при добавлении.
             // Эта кнопка может быть заглушкой или выполнять другую функцию (например, обновить файл принудительно).
             // Для MVP просто покажем сообщение.
             alert('Все задачи уже сохраняются в Excel при добавлении. Эта кнопка зарезервирована для будущих функций.');

            // fetch('/api/tasks/save_all', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            //     // body: JSON.stringify({}) // Возможно, понадобятся данные
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.status === 'success') {
            //         alert(data.message);
            //         loadTasks(); // Обновляем таблицу
            //     } else {
            //         alert('Ошибка: ' + data.message);
            //     }
            // })
            // .catch(error => {
            //     console.error('Ошибка:', error);
            //     alert('Произошла ошибка при сохранении.');
            // });
        }
    });

    // --- (Опционально) Обработка кнопок открытия файлов ---
    // Эти функции требуют дополнительной серверной логики, так как браузер
    // не может напрямую открыть файлы на компьютере пользователя.
    // Возможные решения: открытие в новой вкладке (если файл доступен по URL),
    // скачивание файла, или использование сервера для открытия (если сервер запущен локально).
    //
    // openTxtBtn.addEventListener('click', function() {
    //     // Пример: открытие файла для скачивания
    //     // window.location.href = '/download/txt'; // Нужен соответствующий маршрут на сервере
    //     alert('Функция открытия текстового файла будет реализована позже.');
    // });
    //
    // openExcelBtn.addEventListener('click', function() {
    //     // window.location.href = '/download/xlsx';
    //     alert('Функция открытия Excel файла будет реализована позже.');
    // });

});
