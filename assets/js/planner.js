let allTasks = [];
let currentMonth = new Date();

document.addEventListener("DOMContentLoaded", fetchData);

async function fetchData() {
    try {
        const res = await fetch("api/tasks.php", {
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error("No autorizado o error API");
        }

        allTasks = await res.json();
        renderAll();
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}


function renderAll() {
    renderList();     
    renderCalendar(); 
    // Aquí disparamos la barra centralizada
    updateProgressBar();
    
    const dayCont = document.getElementById('dayContainer');
    if (dayCont && dayCont.style.display === 'block') {
        const selectedDate = document.getElementById('task_date').value || new Date().toISOString().split('T')[0];
        renderDayView(selectedDate);
    }
}


// --- VISTAS Y NAVEGACIÓN ---
function changeView(viewType) {
    const monthCont = document.getElementById('monthContainer');
    const dayCont = document.getElementById('dayContainer');

    if (viewType === 'month') {
        monthCont.style.display = 'block';
        dayCont.style.display = 'none';
        renderCalendar(); 
    } else {
        monthCont.style.display = 'none';
        dayCont.style.display = 'block';
        const selectedDate = document.getElementById('task_date').value || new Date().toISOString().split('T')[0];
        renderDayView(selectedDate); 
    }
    // Llamada crucial para que la barra cambie de Mes a Día inmediatamente
    updateProgressBar(); 
}
// --- VISTA DIARIA (HORAS) ---
function renderDayView(date) {
    const grid = document.getElementById('timeGrid');
    if (!grid) return; 
    
    grid.innerHTML = ''; 

    // 1. Crear las 24 filas de horas
    for (let h = 0; h < 24; h++) {
        const row = document.createElement('div');
        row.className = "time-row";
        row.innerHTML = `
            <div class="time-slot-label">${h}:00</div>
            <div class="time-slot-content" id="slot-${h}"></div>
        `;
        grid.appendChild(row);
    }

    // 2. Filtrar y colocar las tareas
    const tasks = allTasks.filter(t => t.task_date === date);
    
    tasks.forEach(task => {
        const hour = parseInt(task.task_time.split(':')[0]); 
        const slot = document.getElementById(`slot-${hour}`);
        
        if (slot) {
            const taskDiv = document.createElement('div');
            taskDiv.className = `month-task ${task.priority} ${task.completed == 1 ? 'completed' : ''}`;
            taskDiv.style.position = "relative";
            taskDiv.innerHTML = `<strong>${task.task_time.substring(0,5)}</strong> - ${task.title}`;
            
            taskDiv.onclick = () => toggleTask(task.id, task.completed);
            slot.appendChild(taskDiv);
        }
    });

    // CORRECCIÓN: Esta línea debe estar dentro de la función
    updateDayProgress(tasks);
    document.getElementById("currentDayTitle").textContent = "Tareas para: " + date;
}

// --- VISTA MENSUAL ---
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // CORRECCIÓN: Generamos el todayStr LOCAL exacto dentro de la función
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');
    
    document.getElementById("monthTitle").textContent = 
        currentMonth.toLocaleString("es", { month: "long", year: "numeric" });

    const grid = document.getElementById("monthView");
    grid.innerHTML = "";

    const existingHeader = document.querySelector(".day-headers");
    if (existingHeader) existingHeader.remove();

    const daysName = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const headerContainer = document.createElement("div");
    headerContainer.className = "day-headers";
    daysName.forEach(d => {
        const div = document.createElement("div");
        div.textContent = d;
        headerContainer.appendChild(div);
    });
    grid.before(headerContainer); 

    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i < firstDay; i++) {
        grid.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const cell = document.createElement("div");
        cell.className = "month-day";
        
        // La comparación ahora será exacta contra el 2026-01-13
        if (dateString === todayStr) {
            cell.classList.add("is-today");
        }

        cell.innerHTML = `<header><span>${day}</span></header>`;
        
        cell.onclick = (e) => {
            if (e.target === cell || e.target.tagName === 'HEADER' || e.target.tagName === 'SPAN') {
                document.getElementById("task_date").value = dateString;
                changeView('day'); 
            }
        };

        allTasks.filter(t => t.task_date === dateString).forEach(t => {
            const taskDiv = document.createElement("div");
            taskDiv.className = `month-task ${t.priority} ${t.completed == 1 ? 'completed' : ''}`;
            taskDiv.textContent = t.title;
            taskDiv.onclick = (e) => {
                e.stopPropagation();
                toggleTask(t.id, t.completed);
            };
            taskDiv.oncontextmenu = async (e) => {
                e.preventDefault();
                if(confirm(`¿Borrar: "${t.title}"?`)) await deleteTask(t.id);
            };
            cell.appendChild(taskDiv);
        });
        grid.appendChild(cell);
    }
}

// --- PROGRESO ---
// Variable para evitar que el confeti se dispare infinitamente si ya está al 100%
let lastPercentage = 0;

function updateProgressBar() {
    const monthCont = document.getElementById('monthContainer');
    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressPercentage");
    if (!bar || !text) return;

    let targetTasks = [];
    let label = "";

    if (monthCont && monthCont.style.display !== 'none') {
        const viewYear = currentMonth.getFullYear();
        const viewMonth = currentMonth.getMonth() + 1;
        targetTasks = allTasks.filter(t => {
            const tDate = t.task_date.split('-');
            return parseInt(tDate[0]) === viewYear && parseInt(tDate[1]) === viewMonth;
        });
        label = "del Mes";
    } else {
        const selectedDate = document.getElementById('task_date').value || new Date().toISOString().split('T')[0];
        targetTasks = allTasks.filter(t => t.task_date === selectedDate);
        label = "del Día";
    }

    if (targetTasks.length === 0) {
        bar.style.width = "0%";
        text.textContent = `0% (Sin tareas ${label})`;
        lastPercentage = 0; // Reiniciar
        return;
    }

    const completed = targetTasks.filter(t => t.completed == 1).length;
    const percentage = Math.round((completed / targetTasks.length) * 100);
    
    bar.style.width = percentage + "%";
    text.textContent = `${percentage}% ${label}`;

    // --- EFECTO CONFETI ---
    // Si llegamos al 100% y antes no estábamos ahí, ¡CELEBRAMOS!
    if (percentage === 100 && lastPercentage < 100) {
        lanzarConfeti();
    }
    
    lastPercentage = percentage; // Guardar el estado actual
}

function lanzarConfeti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4285f4', '#34a853', '#fbbc05', '#ea4335'] // Colores estilo Google
    });
}

function updateDayProgress(dayTasks) {
    const bar = document.getElementById('dayProgressBar');
    if (!bar) return;
    if (dayTasks.length === 0) {
        bar.style.width = "0%";
        return;
    }
    const completed = dayTasks.filter(t => t.completed == 1).length;
    const percent = Math.round((completed / dayTasks.length) * 100);
    bar.style.width = percent + "%";
}

// --- ACCIONES API ---
document.getElementById("taskForm").addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
        title: document.getElementById("title").value,
        task_date: document.getElementById("task_date").value,
        task_time: document.getElementById("task_time").value,
        priority: document.getElementById("priority").value,
        category: document.getElementById("category").value
    };

    await fetch("api/tasks.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    e.target.reset();
    fetchData();
});

async function toggleTask(id, currentStatus) {
    await fetch("api/tasks.php", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: currentStatus == 1 ? 0 : 1 })
    });
    fetchData();
}

async function deleteTask(id) {
    await fetch("api/tasks.php", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    fetchData();
}

function changeMonth(offset) {
    currentMonth.setMonth(currentMonth.getMonth() + offset);
    renderCalendar();
}

function renderList() {
    const filterDate = document.getElementById("filterDate").value;
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = "";

    let filtered = filterDate ? allTasks.filter(t => t.task_date === filterDate) : allTasks;
    
    filtered.forEach(t => {
        const li = document.createElement("li");
        li.className = `${t.priority} ${t.completed == 1 ? 'completed' : ''}`;
        li.style.color = "white"; 
        li.textContent = `${t.task_time.substring(0,5)} - ${t.title}`;
        li.onclick = () => toggleTask(t.id, t.completed);
        list.appendChild(li);
    });
}


// Forzamos la fecha local exacta sin desfase de horas
const now = new Date();
const todayStr = now.getFullYear() + '-' + 
                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(now.getDate()).padStart(2, '0');


function changeDay(offset) {
    const dateInput = document.getElementById("task_date");
    // Usamos el valor del input para calcular el desplazamiento
    let currentDate = new Date(dateInput.value + "T00:00:00");
    currentDate.setDate(currentDate.getDate() + offset);

    const newDateStr = currentDate.getFullYear() + '-' + 
                       String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(currentDate.getDate()).padStart(2, '0');

    // Sincronizamos el input y disparamos la vista
    dateInput.value = newDateStr;
    renderDayView(newDateStr);
    updateProgressBar();
}

function goToToday() {
    // 1. Obtenemos fecha actual exacta
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');

    // 2. Sincronizamos variables y UI
    currentMonth = new Date();
    document.getElementById("task_date").value = todayStr;

    // 3. Cambiamos a vista día y refrescamos
    changeView('day');
    renderCalendar(); // Refresca el círculo azul
}


function renderList() {
    const filterDate = document.getElementById("filterDate").value;
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let filtered = allTasks;

    if (filterDate) {
        filtered = allTasks.filter(t => {
            return t.task_date.split(" ")[0] === filterDate;
        });
    }

    if (filtered.length === 0) {
        taskList.innerHTML = "<p id='noTasksMsg'>No hay tareas.</p>";
        return;
    }

    filtered.forEach(t => {
    const li = document.createElement("li");
    li.className = t.priority;
    if (t.completed == 1) li.classList.add("completed");

    // HACEMOS QUE TODA LA PÍLDORA SEA CLICKEABLE
    li.style.cursor = "pointer"; 
    li.onclick = () => toggleTask(t.id, t.completed);

    // Simplificamos el contenido (sin el botón cuadrado)
    li.innerHTML = `<span>${t.task_time} - ${t.title}</span>`;

    taskList.appendChild(li);
});
}
