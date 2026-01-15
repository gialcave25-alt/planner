<?php require "../app/auth.php"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planner Pro</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<h1>Mi Planner</h1>

<form id="taskForm">
    <input type="text" id="title" placeholder="Actividad" required>
    <input type="date" id="task_date" required>
    <input type="time" id="task_time" value="09:00" required> <select id="priority">
        <option value="importante-urgente">Importante / Urgente</option>
        <option value="importante-no-urgente">Importante / No urgente</option>
        <option value="no-importante-urgente">No importante / Urgente</option>
        <option value="no-importante-no-urgente">No importante / No urgente</option>
    </select>
    <input type="text" id="category" placeholder="Categoría">
    <button type="submit">Agregar</button>
</form>

<div class="progress-container">
    <div class="progress-label">Progreso del día: <span id="progressPercentage">0%</span></div>
    <div class="progress-bar-bg">
        <div id="progressBar" class="progress-bar-fill"></div>
    </div>
</div>

<div class="view-controls">
    <button onclick="changeView('month')">Mes</button>
    <button onclick="changeView('day')">Día</button>
    <button onclick="goToToday()" class="btn-today">Hoy</button>
</div>

<div id="dayContainer" class="view-section" style="display: none;">
    <div class="day-view-container">
        <div class="day-navigation">
            <button onclick="changeDay(-1)" class="btn-nav">◀</button>
            <h2 id="currentDayTitle">Día Seleccionado</h2>
            <button onclick="changeDay(1)" class="btn-nav">▶</button>
        </div>
        
        <div class="day-header-info">
            <div id="dayProgressBar" class="mini-bar-fill"></div>
        </div>
        <div class="time-grid" id="timeGrid"></div> 
    </div>
</div>

<div id="monthContainer" class="view-section">
    <hr>
    <h3>Filtro de tareas</h3>
    <div class="filter-controls">
        <input type="date" id="filterDate">
        <button onclick="renderList()">Filtrar</button>
    </div>
    
    <ul id="taskList"></ul> 

    <hr>
    <div class="month-header">
        <button onclick="changeMonth(-1)" class="btn-nav">◀</button>
        <h2 id="monthTitle" style="display: inline-block; min-width: 200px; text-align: center;"></h2>
        <button onclick="changeMonth(1)" class="btn-nav">▶</button>
    </div>

    <div id="monthView" class="month-grid"></div>
</div>

<script src="assets/js/planner.js" defer></script>

<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

</body>
</html>