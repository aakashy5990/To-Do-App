const dayBox = document.getElementById("day-box");
const listContainer = document.getElementById("list-container");
const stats = document.getElementById("stats");

// Add event listener for the Enter key in the day input box
dayBox.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addDay();
    }
});

function addDay() {
    if (dayBox.value === '') {
        alert("You must write a day name.");
        return;
    }

    const currentTime = new Date().toLocaleString();
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    dayDiv.innerHTML = `
        <div class="day-header">
            <h3>${dayBox.value}</h3>
            <div class="addday_btn">
                <button onclick="addTaskFromButton(this)">Add Task</button>
                <button onclick="removeDay(this)">Remove Day</button>
            </div>
        </div>
        <span class="date-spam">${currentTime}</span>
        <ul class="task-list"></ul>
        <input type="text" class="task-input" placeholder="Add task">
    `;

    listContainer.appendChild(dayDiv);

    const taskInput = dayDiv.querySelector(".task-input");
    taskInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addTask(taskInput);
        }
    });

    dayBox.value = "";
    updateStats();
    saveData();
}

function addTask(taskInput) {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        alert("Task cannot be empty!");
        return;
    }

    const currentTime = new Date().toLocaleString();
    const taskList = taskInput.previousElementSibling;

    const li = document.createElement("li");
    li.innerHTML = `
        <div class="li_perents">
            <input type="checkbox" onclick="checkDayComplete(this)">
        </div>
        ${taskText}
        <button onclick="removeTask(this)">Remove Task</button>
        <span class="time">${currentTime}</span>
    `;

    taskList.appendChild(li);
    taskInput.value = "";
    checkDayComplete(taskList.closest(".day").querySelector(".day-header h3")); // Update day status
    updateStats();
    saveData();
}

function addTaskFromButton(button) {
    const taskInput = button.closest(".day").querySelector(".task-input");
    addTask(taskInput);
}

function checkDayComplete(checkbox) {
    const dayDiv = checkbox.closest(".day");
    const tasks = dayDiv.querySelectorAll("li input[type='checkbox']");
    const allCompleted = Array.from(tasks).every(task => task.checked);

    const dayHeader = dayDiv.querySelector(".day-header h3");
    if (allCompleted && tasks.length > 0) {
        dayHeader.classList.add("completed");
    } else {
        dayHeader.classList.remove("completed");
    }

    updateStats();
    saveData();
}

function removeTask(button) {
    button.parentElement.remove();
    checkDayComplete(button.closest(".day").querySelector(".day-header h3"));
    updateStats();
    saveData();
}

function removeDay(button) {
    button.closest(".day").remove();
    updateStats();
    saveData();
}

// Update stats for total days, tasks, marked/unmarked days, and task stats
function updateStats() {
    const totalDays = listContainer.querySelectorAll(".day").length;
    stats.style.display = totalDays === 0 ? "none" : "block";

    const allTasks = listContainer.querySelectorAll("li");
    const totalTasks = allTasks.length;
    const completedTasks = listContainer.querySelectorAll("li input[type='checkbox']:checked").length;
    const uncompletedTasks = totalTasks - completedTasks;

    const completedDays = listContainer.querySelectorAll(".day .day-header h3.completed").length;
    const uncompletedDays = totalDays - completedDays;

    stats.innerHTML = `
        <p>Total Days: ${totalDays}</p>
        <p>Marked Days: ${completedDays}</p>
        <p>Unmarked Days: ${uncompletedDays}</p>
        <p>Total Tasks: ${totalTasks}</p>
        <p>Completed Tasks: ${completedTasks}</p>
        <p>Uncompleted Tasks: ${uncompletedTasks}</p>
    `;
}

// Save data to Local Storage
function saveData() {
    const days = [];
    listContainer.querySelectorAll(".day").forEach(dayDiv => {
        const dayData = {
            dayName: dayDiv.querySelector(".day-header h3").textContent,
            date: dayDiv.querySelector(".date-spam").textContent,
            tasks: []
        };
        dayDiv.querySelectorAll("li").forEach(task => {
            dayData.tasks.push({
                text: task.childNodes[2].nodeValue.trim(),
                time: task.querySelector(".time").textContent,
                checked: task.querySelector("input[type='checkbox']").checked
            });
        });
        days.push(dayData);
    });
    localStorage.setItem("data", JSON.stringify(days));
}

// Load data from Local Storage on page load
function showTask() {
    const savedData = JSON.parse(localStorage.getItem("data") || "[]");
    savedData.forEach(dayData => {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");

        dayDiv.innerHTML = `
            <div class="day-header">
                <h3>${dayData.dayName}</h3>
                <div class="addday_btn">
                    <button onclick="addTaskFromButton(this)">Add Task</button>
                    <button onclick="removeDay(this)">Remove Day</button>
                </div>
            </div>
            <span class="date-spam">${dayData.date}</span>
            <ul class="task-list"></ul>
            <input type="text" class="task-input" placeholder="Add task">
        `;

        const taskList = dayDiv.querySelector(".task-list");
        dayData.tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="li_perents">
                    <input type="checkbox" ${task.checked ? "checked" : ""} onclick="checkDayComplete(this)">
                </div>
                ${task.text}
                <button onclick="removeTask(this)">Remove Task</button>
                <span class="time">${task.time}</span>
            `;
            taskList.appendChild(li);
        });

        const taskInput = dayDiv.querySelector(".task-input");
        taskInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                addTask(taskInput);
            }
        });

        listContainer.appendChild(dayDiv);
    });

    updateStats();
}

showTask();
