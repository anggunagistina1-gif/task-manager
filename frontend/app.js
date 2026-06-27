const API = "https://task-manager-production-7742.up.railway.app/tasks";

const taskContainer = document.getElementById("taskContainer");
const taskForm = document.getElementById("taskForm");
const modal = document.getElementById("taskModal");

const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressTasks = document.getElementById("progressTasks");
const completedTasks = document.getElementById("completedTasks");

const taskIdInput = document.getElementById("taskId");


// =====================
// NOTIFICATION PERMISSION
// =====================
if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
        console.log("Notification Permission:", permission);
    });
}

function showNotification(title, body) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
                reg.showNotification(title, {
                    body: body,
                    icon: "./icon-192.png",
                    badge: "./icon-192.png"
                });
            }
        });
    }
}


// =====================
// MODAL
// =====================
openModal.addEventListener("click", () => {
    taskForm.reset();
    taskIdInput.value = "";
    modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});


// =====================
// LOAD TASKS
// =====================
async function loadTasks() {
    try {
        const response = await fetch(API);
        const tasks = await response.json();

        renderTasks(tasks);
        updateStats(tasks);
    } catch (error) {
        console.error("Gagal load tasks:", error);
    }
}


// =====================
// RENDER TASKS
// =====================
function renderTasks(tasks) {
    taskContainer.innerHTML = "";

    tasks.forEach(task => {
        const safeTitle = JSON.stringify(task.title);
        const safeDesc = JSON.stringify(task.description || "");
        const safePriority = JSON.stringify(task.priority);
        const safeStatus = JSON.stringify(task.status);

        taskContainer.innerHTML += `
            <div class="task-card">
                <h3>${task.title}</h3>
                <p>${task.description || "-"}</p>

                <span class="badge ${task.priority}">
                    ${task.priority}
                </span>

                <span class="badge ${task.status}">
                    ${task.status}
                </span>

                <br><br>

                <button class="edit-btn"
                    onclick='editTask(${task.id}, ${safeTitle}, ${safeDesc}, ${safePriority}, ${safeStatus})'>
                    ✏ Edit
                </button>

                ${task.status !== "completed" ? `
                <button class="complete-btn"
                    onclick='completeTask(${task.id}, ${safeTitle}, ${safeDesc}, ${safePriority})'>
                    ✔ Selesai
                </button>
                ` : ""}

                <button class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    🗑 Delete
                </button>
            </div>
        `;
    });
}


// =====================
// STATS
// =====================
function updateStats(tasks) {
    totalTasks.textContent = tasks.length;
    pendingTasks.textContent = tasks.filter(t => t.status === "pending").length;
    progressTasks.textContent = tasks.filter(t => t.status === "progress").length;
    completedTasks.textContent = tasks.filter(t => t.status === "completed").length;
}


// =====================
// EDIT TASK
// =====================
function editTask(id, title, description, priority, status) {
    taskIdInput.value = id;
    document.getElementById("title").value = title;
    document.getElementById("description").value = description;
    document.getElementById("priority").value = priority;
    document.getElementById("status").value = status;

    modal.classList.remove("hidden");
}


// =====================
// COMPLETE TASK
// =====================
async function completeTask(id, title, description, priority) {
    const confirmComplete = confirm("Tandai task sebagai selesai?");

    if (!confirmComplete) return;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            priority: priority,
            status: "completed"
        })
    });

    alert("Task berhasil diselesaikan");
    showNotification("Task Completed", title);
    loadTasks();
}


// =====================
// CREATE / UPDATE TASK
// =====================
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskId = taskIdInput.value;

    const data = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value
    };

    if (taskId) {
        await fetch(`${API}/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        alert("Task berhasil diupdate");
    } else {
        await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        alert("Task berhasil dibuat");
        showNotification("Task Baru Ditambahkan", data.title);
    }

    taskForm.reset();
    taskIdInput.value = "";
    modal.classList.add("hidden");
    loadTasks();
});


// =====================
// DELETE TASK
// =====================
async function deleteTask(id) {
    const confirmDelete = confirm("Hapus task ini?");

    if (!confirmDelete) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    alert("Task berhasil dihapus");
    loadTasks();
}


// =====================
// INIT
// =====================
loadTasks();


// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(reg => {
                console.log("Service Worker registered", reg);
            })
            .catch(err => {
                console.log("Service Worker gagal", err);
            });
    });
}