import {
    appState
} from "./state.js";

import {
    createAssignment,
    deleteAssignment
} from "./api.js";

import {
    esc,
    academy,
    domain,
    assigned
} from "./utils.js";

// ============================================================
// CONFIGURACIÓN DE LOS DÍAS
// ============================================================

const ASSIGNMENT_DAYS = [
    {
        field: "horasLunes",
        inputId: "horasLunesAsignacion",
        label: "Lunes"
    },
    {
        field: "horasMartes",
        inputId: "horasMartesAsignacion",
        label: "Martes"
    },
    {
        field: "horasMiercoles",
        inputId: "horasMiercolesAsignacion",
        label: "Miércoles"
    },
    {
        field: "horasJueves",
        inputId: "horasJuevesAsignacion",
        label: "Jueves"
    },
    {
        field: "horasViernes",
        inputId: "horasViernesAsignacion",
        label: "Viernes"
    }
];


// ============================================================
// ESTADO LOCAL DEL MÓDULO
// ============================================================

let selectedAcademyId = null;
let selectedCourseId = null;
let selectedScheduleIds = [];


// ============================================================
// UTILIDADES DE HORARIOS
// ============================================================

// ------------------------------------------------------------
// NORMALIZAR NOMBRE DEL DÍA
// ------------------------------------------------------------

function normalizeDay(day) {

    return String(day || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

}

// ------------------------------------------------------------
// CONVERTIR HH:MM A MINUTOS
// ------------------------------------------------------------

function toMinutes(value) {

    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            String(value)
        );

    if (!match) {
        return null;
    }

    return (
        Number(match[1]) * 60 +
        Number(match[2])
    );

}


// ------------------------------------------------------------
// OBTENER DURACIÓN DEL BLOQUE
// ------------------------------------------------------------

function getScheduleDuration(schedule) {

    if (!schedule) {
        return null;
    }

    const start =
        toMinutes(schedule.horaInicio);

    const end =
        toMinutes(schedule.horaFin);

    if (
        start === null ||
        end === null ||
        end <= start
    ) {
        return null;
    }

    return end - start;

}


// ============================================================
// DISTRIBUCIÓN SEMANAL
// ============================================================

// ------------------------------------------------------------
// OBTENER HORAS CONFIGURADAS POR DÍA
// ------------------------------------------------------------

function getDistributionState() {

    const course =
        getSelectedCourse();

    const weeklyHours =
        Number(course?.horasSemanales);

    const values = {};

    let valid = true;
    let total = 0;

    for (const day of ASSIGNMENT_DAYS) {

        const input =
            document.getElementById(
                day.inputId
            );

        const rawValue =
            input?.value ?? "";

        const hours =
            rawValue.trim() === ""
                ? NaN
                : Number(rawValue);

        if (
            !Number.isInteger(hours) ||
            hours < 0 ||
            hours > 2
        ) {

            valid = false;

        }

        values[day.field] = hours;

        if (Number.isFinite(hours)) {
            total += hours;
        }

    }

    const validWeeklyHours =
        Number.isInteger(weeklyHours) &&
        weeklyHours >= 1 &&
        weeklyHours <= 10;

    const complete =
        valid &&
        validWeeklyHours &&
        total === weeklyHours;

    const requiredDays =
        ASSIGNMENT_DAYS.filter(
            day =>
                values[day.field] > 0
        );

    return {
        course,
        weeklyHours,
        values,
        total,
        valid,
        validWeeklyHours,
        complete,
        requiredDays
    };

}


// ------------------------------------------------------------
// ACTIVAR O DESACTIVAR CONTROLES DE DISTRIBUCIÓN
// ------------------------------------------------------------

function setDistributionControlsDisabled(disabled) {

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (templateSelect) {
        templateSelect.disabled = disabled;
    }

    for (const day of ASSIGNMENT_DAYS) {

        const input =
            document.getElementById(
                day.inputId
            );

        if (input) {
            input.disabled = disabled;
        }

    }

}


// ------------------------------------------------------------
// CARGAR PLANTILLAS SEGÚN HORAS SEMANALES
// ------------------------------------------------------------

function populateAssignmentTemplates(course) {

    const select =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const manualOption =
        document.createElement("option");

    manualOption.value = "";

    manualOption.textContent =
        "Distribución manual";

    select.appendChild(
        manualOption
    );

    const hours =
        Number(course?.horasSemanales);

    if (
        !Number.isInteger(hours) ||
        hours < 1 ||
        hours > 10
    ) {

        select.disabled = true;

        return;

    }

    const templates =
        (appState.plantillas || [])
            .filter(
                template =>
                    Number(template.horasSemanales) === hours &&
                    Number(template.activa) === 1
            )
            .sort(
                (a, b) =>
                    String(a.nombre).localeCompare(
                        String(b.nombre),
                        "es"
                    )
            );

    for (const template of templates) {

        const option =
            document.createElement("option");

        option.value =
            String(template.id);

        option.textContent =
            template.nombre;

        select.appendChild(option);

    }

    select.value = "";

    select.disabled = false;

}


// ------------------------------------------------------------
// APLICAR PLANTILLA
// ------------------------------------------------------------

function applyAssignmentTemplate(templateId) {

    const template =
        appState.plantillas.find(
            item =>
                String(item.id) ===
                String(templateId)
        );

    if (!template) {
        return;
    }

    selectedScheduleIds = [];

    for (const day of ASSIGNMENT_DAYS) {

        const input =
            document.getElementById(
                day.inputId
            );

        if (input) {

            input.value =
                Number(template[day.field] ?? 0);

        }

    }

    renderSelectedSchedules();

    updateDistributionSummary();

}


// ============================================================
// SELECTORES DE BLOQUES HORARIOS
// ============================================================

// ------------------------------------------------------------
// ACTUALIZAR SELECTOR DE DÍAS
// ------------------------------------------------------------

function populateAssignmentDays() {

    const daySelect =
        document.getElementById(
            "diaAsignacion"
        );

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    const addButton =
        document.getElementById(
            "agregarHorarioAsignacion"
        );

    if (
        !daySelect ||
        !hourSelect ||
        !addButton
    ) {
        return;
    }

    const distribution =
        getDistributionState();

    daySelect.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "Seleccionar día...";

    daySelect.appendChild(
        defaultOption
    );

    hourSelect.innerHTML = `
        <option value="">
            Seleccionar bloque horario...
        </option>
    `;

    const selectedDays =
        selectedScheduleIds
            .map(
                id =>
                    appState.horarios.find(
                        schedule =>
                            String(schedule.id) ===
                            String(id)
                    )
            )
            .filter(Boolean)
            .map(
                schedule =>
                    normalizeDay(schedule.dia)
            );

    if (
        !distribution.complete
    ) {

        daySelect.disabled = true;
        hourSelect.disabled = true;
        addButton.disabled = true;

        return;

    }

    const availableDays =
        distribution.requiredDays.filter(
            day =>
                !selectedDays.includes(
                    normalizeDay(day.label)
                )
        );

    availableDays.forEach(day => {

        const option =
            document.createElement("option");

        option.value =
            day.label;

        option.textContent =
            `${day.label} (${distribution.values[day.field]} h)`;

        daySelect.appendChild(option);

    });

    daySelect.disabled =
        availableDays.length === 0;

    if (availableDays.length === 0) {

        defaultOption.textContent =
            "Todos los días están configurados.";

    }

    hourSelect.disabled = true;

    addButton.disabled = true;

}


// ------------------------------------------------------------
// ACTUALIZAR SELECTOR DE BLOQUES
// SEGÚN DÍA Y DURACIÓN REQUERIDA
// ------------------------------------------------------------

function populateAssignmentHours(day) {

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    const addButton =
        document.getElementById(
            "agregarHorarioAsignacion"
        );

    if (
        !hourSelect ||
        !addButton
    ) {
        return;
    }

    hourSelect.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "Seleccionar bloque horario...";

    hourSelect.appendChild(
        defaultOption
    );

    addButton.disabled = true;

    if (!day) {

        hourSelect.disabled = true;

        return;

    }

    const distribution =
        getDistributionState();

    if (!distribution.complete) {

        hourSelect.disabled = true;

        return;

    }

    const dayConfig =
        ASSIGNMENT_DAYS.find(
            item =>
                normalizeDay(item.label) ===
                normalizeDay(day)
        );

    if (!dayConfig) {

        hourSelect.disabled = true;

        return;

    }

    const requiredDuration =
        distribution.values[dayConfig.field] * 60;

    if (requiredDuration <= 0) {

        hourSelect.disabled = true;

        return;

    }

    const schedules =
        appState.horarios
            .filter(
                schedule =>
                    normalizeDay(schedule.dia) ===
                    normalizeDay(day) &&
                    getScheduleDuration(schedule) ===
                    requiredDuration
            )
            .sort(
                (a, b) =>
                    String(a.horaInicio).localeCompare(
                        String(b.horaInicio)
                    )
            );

    if (schedules.length === 0) {

        defaultOption.textContent =
            "No hay bloques compatibles para este día.";

        hourSelect.disabled = true;

        return;

    }

    schedules.forEach(schedule => {

        const option =
            document.createElement("option");

        option.value =
            String(schedule.id);

        option.textContent =
            `${schedule.horaInicio} - ${schedule.horaFin}`;

        hourSelect.appendChild(option);

    });

    hourSelect.disabled = false;

}


// ------------------------------------------------------------
// ACTUALIZAR ESTADO DEL BOTÓN AGREGAR
// ------------------------------------------------------------

function updateAddScheduleButton() {

    const daySelect =
        document.getElementById(
            "diaAsignacion"
        );

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    const addButton =
        document.getElementById(
            "agregarHorarioAsignacion"
        );

    if (
        !daySelect ||
        !hourSelect ||
        !addButton
    ) {
        return;
    }

    addButton.disabled =
        !daySelect.value ||
        !hourSelect.value;

}


// ============================================================
// RESUMEN DE DISTRIBUCIÓN
// ============================================================

function updateDistributionSummary() {

    const summary =
        document.getElementById(
            "resumenDistribucionAsignacion"
        );

    if (!summary) {
        return;
    }

    const distribution =
        getDistributionState();

    if (!distribution.course) {

        summary.textContent =
            "Seleccione una materia para configurar su distribución.";

        populateAssignmentDays();

        return;

    }

    if (!distribution.validWeeklyHours) {

        summary.textContent =
            "La materia no tiene configuradas correctamente sus horas semanales.";

        populateAssignmentDays();

        return;

    }

    if (!distribution.valid) {

        summary.textContent =
            "Cada día debe contener un número entero entre 0 y 2.";

        populateAssignmentDays();

        return;

    }

    if (!distribution.complete) {

        const difference =
            distribution.weeklyHours -
            distribution.total;

        summary.textContent =
            difference > 0
                ? `Horas distribuidas: ${distribution.total} de ${distribution.weeklyHours}. Faltan ${difference} horas.`
                : `Horas distribuidas: ${distribution.total} de ${distribution.weeklyHours}. Hay ${Math.abs(difference)} horas excedentes.`;

        populateAssignmentDays();

        return;

    }

    const requiredDays =
        distribution.requiredDays.length;

    const selectedCount =
        selectedScheduleIds.length;

    summary.textContent =
        `Distribución completa: ${distribution.total} de ${distribution.weeklyHours} horas. ` +
        `Bloques seleccionados: ${selectedCount} de ${requiredDays} días.`;

    populateAssignmentDays();

}


// ============================================================
// INICIALIZAR CONFIGURACIÓN DE UNA MATERIA
// ============================================================

function initializeCourseConfiguration() {

    selectedScheduleIds = [];

    const course =
        getSelectedCourse();

    // Limpiar distribución anterior.

    for (const day of ASSIGNMENT_DAYS) {

        const input =
            document.getElementById(
                day.inputId
            );

        if (input) {
            input.value = "0";
        }

    }

    populateAssignmentTemplates(course);

    const validHours =
        course &&
        Number.isInteger(
            Number(course.horasSemanales)
        ) &&
        Number(course.horasSemanales) >= 1 &&
        Number(course.horasSemanales) <= 10;

    setDistributionControlsDisabled(
        !validHours
    );

    renderSelectedSchedules();

    updateDistributionSummary();

}


// ============================================================
// RENDERIZAR HORARIOS SELECCIONADOS
// ============================================================

function renderSelectedSchedules() {

    const container =
        document.getElementById(
            "horariosSeleccionadosAsignacion"
        );

    if (!container) {
        return;
    }

    if (selectedScheduleIds.length === 0) {

        container.innerHTML = `
            <p class="w3-small">
                No se han agregado horarios.
            </p>
        `;

        return;

    }

    const schedules =
        selectedScheduleIds
            .map(
                id =>
                    appState.horarios.find(
                        schedule =>
                            String(schedule.id) ===
                            String(id)
                    )
            )
            .filter(Boolean)
            .sort(
                (a, b) => {

                    const dayA =
                        ASSIGNMENT_DAYS.findIndex(
                            day =>
                                normalizeDay(day.label) ===
                                normalizeDay(a.dia)
                        );

                    const dayB =
                        ASSIGNMENT_DAYS.findIndex(
                            day =>
                                normalizeDay(day.label) ===
                                normalizeDay(b.dia)
                        );

                    if (dayA !== dayB) {
                        return dayA - dayB;
                    }

                    return String(a.horaInicio).localeCompare(
                        String(b.horaInicio)
                    );

                }
            );

    container.innerHTML = `
        <p class="w3-small">
            <strong>Horarios seleccionados:</strong>
        </p>

        ${schedules.map(schedule => `

            <div class="w3-padding-small w3-border-bottom">

                <span>
                    ${esc(schedule.dia)}
                    ${esc(schedule.horaInicio)}
                    - ${esc(schedule.horaFin)}
                    (${getScheduleDuration(schedule) / 60} h)
                </span>

                <button
                    type="button"
                    class="w3-button w3-small w3-red w3-margin-left"
                    onclick='removeSelectedSchedule(${JSON.stringify(String(schedule.id))})'
                >
                    Quitar
                </button>

            </div>

        `).join("")}
    `;

}


// ============================================================
// AGREGAR HORARIO
// ============================================================

function addSelectedSchedule() {

    const daySelect =
        document.getElementById(
            "diaAsignacion"
        );

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    if (
        !daySelect ||
        !hourSelect
    ) {
        return;
    }

    const distribution =
        getDistributionState();

    if (!distribution.complete) {

        alert(
            "Primero configure una distribución semanal válida."
        );

        return;

    }

    const day =
        daySelect.value;

    const scheduleId =
        hourSelect.value;

    if (!day || !scheduleId) {

        alert(
            "Seleccione un día y un bloque horario."
        );

        return;

    }

    const schedule =
        appState.horarios.find(
            item =>
                String(item.id) ===
                String(scheduleId)
        );

    if (!schedule) {

        alert(
            "El horario seleccionado no es válido."
        );

        return;

    }

    if (
        normalizeDay(schedule.dia) !==
        normalizeDay(day)
    ) {

        alert(
            "El horario seleccionado no corresponde al día elegido."
        );

        return;

    }

    const dayConfig =
        ASSIGNMENT_DAYS.find(
            item =>
                normalizeDay(item.label) ===
                normalizeDay(day)
        );

    if (!dayConfig) {
        return;
    }

    const expectedDuration =
        distribution.values[dayConfig.field] * 60;

    const actualDuration =
        getScheduleDuration(schedule);

    if (
        actualDuration !== expectedDuration
    ) {

        alert(
            `El bloque seleccionado debe durar exactamente ${expectedDuration / 60} hora(s).`
        );

        return;

    }

    const alreadySelectedDay =
        selectedScheduleIds.some(
            id => {

                const existing =
                    appState.horarios.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );

                return existing &&
                    normalizeDay(existing.dia) ===
                    normalizeDay(day);

            }
        );

    if (alreadySelectedDay) {

        alert(
            `Ya se seleccionó una sesión para ${day}. Solo se permite una sesión diaria.`
        );

        return;

    }

    if (
        selectedScheduleIds.some(
            id =>
                String(id) ===
                String(scheduleId)
        )
    ) {

        alert(
            "Ese horario ya fue agregado."
        );

        return;

    }

    selectedScheduleIds.push(
        String(scheduleId)
    );

    renderSelectedSchedules();

    daySelect.value = "";

    hourSelect.innerHTML = `
        <option value="">
            Seleccionar bloque horario...
        </option>
    `;

    hourSelect.disabled = true;

    updateDistributionSummary();

}


// ============================================================
// QUITAR HORARIO
// ============================================================

function removeSelectedSchedule(id) {

    selectedScheduleIds =
        selectedScheduleIds.filter(
            scheduleId =>
                String(scheduleId) !==
                String(id)
        );

    renderSelectedSchedules();

    updateDistributionSummary();

}


// ============================================================
// LIMPIAR HORARIOS SELECCIONADOS
// ============================================================

function resetScheduleSelection() {

    selectedScheduleIds = [];

    renderSelectedSchedules();

    const daySelect =
        document.getElementById(
            "diaAsignacion"
        );

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    if (daySelect) {
        daySelect.value = "";
    }

    if (hourSelect) {

        hourSelect.innerHTML = `
            <option value="">
                Seleccionar bloque horario...
            </option>
        `;

        hourSelect.disabled = true;

    }

    updateDistributionSummary();

}


// ============================================================
// EVENTOS DE HORARIOS
// ============================================================

function bindScheduleEvents() {

    const daySelect =
        document.getElementById(
            "diaAsignacion"
        );

    const hourSelect =
        document.getElementById(
            "horaAsignacion"
        );

    const addButton =
        document.getElementById(
            "agregarHorarioAsignacion"
        );

    daySelect?.addEventListener(
        "change",
        () => {

            populateAssignmentHours(
                daySelect.value
            );

            updateAddScheduleButton();

        }
    );

    hourSelect?.addEventListener(
        "change",
        updateAddScheduleButton
    );

    addButton?.addEventListener(
        "click",
        addSelectedSchedule
    );

}


// ============================================================
// CAMBIOS MANUALES EN LA DISTRIBUCIÓN
// ============================================================

function handleDistributionChange() {

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (templateSelect) {
        templateSelect.value = "";
    }

    // Los horarios anteriores pueden dejar de coincidir
    // con la nueva distribución.

    selectedScheduleIds = [];

    renderSelectedSchedules();

    updateDistributionSummary();

}


// ============================================================
// CARGAR CURSOS SEGÚN ACADEMIA
// ============================================================

function fillAssignmentCourses() {

    const academySelect =
        document.getElementById(
            "academiaAsignacion"
        );

    const courseSelect =
        document.getElementById(
            "cursoAsignacion"
        );

    if (
        !academySelect ||
        !courseSelect
    ) {
        return;
    }

    const academyId =
        academySelect.value;

    courseSelect.innerHTML = `
        <option value="">
            Seleccionar materia...
        </option>
    `;

    selectedCourseId = null;

    if (!academyId) {

        courseSelect.disabled = true;

        return;

    }

    const courses =
        appState.cursos
            .filter(
                course =>
                    String(course.academiaId) ===
                    String(academyId)
            )
            .sort(
                (a, b) =>
                    a.nombre.localeCompare(
                        b.nombre,
                        "es"
                    )
            );

    if (courses.length === 0) {

        courseSelect.innerHTML += `
            <option value="">
                No hay materias registradas para esta academia.
            </option>
        `;

        courseSelect.disabled = true;

        return;

    }

    courses.forEach(course => {

        const option =
            document.createElement("option");

        option.value =
            String(course.id);

        option.textContent =
            course.nombre;

        courseSelect.appendChild(option);

    });

    courseSelect.disabled = false;

}


// ============================================================
// OBTENER MATERIA SELECCIONADA
// ============================================================

function getSelectedCourse() {

    if (!selectedCourseId) {
        return null;
    }

    return appState.cursos.find(
        course =>
            String(course.id) ===
            String(selectedCourseId)
    );

}


// ============================================================
// MOSTRAR INFORMACIÓN DE LA MATERIA
// ============================================================

function renderCourseDetails() {

    const nombreElement =
        document.getElementById(
            "detalleNombreCurso"
        );

    const academiaElement =
        document.getElementById(
            "detalleAcademiaCurso"
        );

    const hoursElement =
        document.getElementById(
            "detalleHorasSemanales"
        );

    const estadoElement =
        document.getElementById(
            "detalleEstadoCurso"
        );

    const docentesElement =
        document.getElementById(
            "detalleDocentesAsignados"
        );

    if (
        !nombreElement ||
        !academiaElement ||
        !estadoElement ||
        !docentesElement
    ) {
        return;
    }

    const course =
        getSelectedCourse();

    if (!course) {

        nombreElement.textContent = "—";
        academiaElement.textContent = "—";
        estadoElement.textContent = "—";
        docentesElement.textContent = "—";

        if (hoursElement) {
            hoursElement.textContent = "—";
        }

        return;

    }

    const courseAcademy =
        academy(
            appState,
            course.academiaId
        );

    const assignedTeacherIds =
        appState.asignaciones
            .filter(
                assignment =>
                    String(assignment.cursoId) ===
                    String(course.id)
            )
            .map(
                assignment =>
                    String(assignment.docenteId)
            );

    const assignedNames =
        appState.docentes
            .filter(
                teacher =>
                    assignedTeacherIds.includes(
                        String(teacher.id)
                    )
            )
            .map(
                teacher =>
                    teacher.nombre
            );

    nombreElement.textContent =
        course.nombre || "—";

    academiaElement.textContent =
        courseAcademy
            ? courseAcademy.nombre
            : "Sin academia";

    if (hoursElement) {

        hoursElement.textContent =
            course.horasSemanales != null
                ? `${course.horasSemanales} horas`
                : "Pendiente de configurar";

    }

    estadoElement.textContent =
        assignedNames.length > 0
            ? "Asignado"
            : "Disponible";

    docentesElement.textContent =
        assignedNames.length > 0
            ? assignedNames.join(", ")
            : "Ninguno";

}


// ============================================================
// OBTENER NIVEL DE DOMINIO
// ============================================================

function getDomainLevel(
    docenteId,
    cursoId
) {

    const relation =
        domain(
            appState,
            docenteId,
            cursoId
        );

    if (!relation) {
        return null;
    }

    const nivel =
        Number(relation.nivel);

    return Number.isFinite(nivel)
        ? nivel
        : null;

}


// ============================================================
// RENDERIZAR DOCENTES CANDIDATOS
// ============================================================

function renderCandidates() {

    const tableBody =
        document.getElementById(
            "tbodyCandidatos"
        );

    const course =
        getSelectedCourse();

    if (!tableBody) {
        return;
    }

    if (!course) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="w3-center">
                    Seleccione una academia y una materia para mostrar candidatos.
                </td>
            </tr>
        `;

        return;

    }

    let candidates =
        appState.docentes.filter(
            teacher =>
                String(teacher.academiaId) ===
                String(course.academiaId)
        );

    const order =
        document.getElementById(
            "ordenDominio"
        )?.value || "desc";

    candidates.sort((a, b) => {

        const domainA =
            getDomainLevel(
                a.id,
                course.id
            );

        const domainB =
            getDomainLevel(
                b.id,
                course.id
            );

        if (domainA === null) {
            return 1;
        }

        if (domainB === null) {
            return -1;
        }

        return order === "asc"
            ? domainA - domainB
            : domainB - domainA;

    });

    if (candidates.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="w3-center">
                    No hay docentes en esta academia.
                </td>
            </tr>
        `;

        return;

    }

    tableBody.innerHTML =
        candidates
            .map(teacher => {

                const teacherAcademy =
                    academy(
                        appState,
                        teacher.academiaId
                    );

                const domainLevel =
                    getDomainLevel(
                        teacher.id,
                        course.id
                    );

                const isAssigned =
                    assigned(
                        appState,
                        course.id,
                        teacher.id
                    );

                const sni =
                    String(teacher.sni || "no")
                        .trim()
                        .toLowerCase();

                const hasSni =
                    sni === "si";

                const prodep =
                    String(teacher.prodep || "no")
                        .trim()
                        .toLowerCase();

                const certificationText =
                    teacher.certificaciones
                        ? esc(
                            teacher.certificaciones
                        ).replace(/\n/g, "<br>")
                        : "—";

                return `

                    <tr>

                        <td>
                            ${esc(teacher.nombre)}
                            <br>
                            <span class="w3-small">
                                N.º ${esc(teacher.numeroEmpleado)}
                            </span>
                        </td>

                        <td>
                            ${esc(
                                teacherAcademy
                                    ? teacherAcademy.nombre
                                    : "Sin academia"
                            )}
                        </td>

                        <td>
                            ${esc(teacher.nivelAcademico || "—")}
                        </td>

                        <td>
                            ${esc(teacher.tituloAcademico || "—")}
                        </td>

                        <td>
                            ${esc(teacher.especialidad || "—")}
                        </td>

                        <td>
                            ${prodep === "si" ? "Sí" : "No"}
                        </td>

                        <td>
                            ${hasSni ? "Sí" : "No"}
                        </td>

                        <td>
                            ${
                                hasSni
                                    ? esc(teacher.nivelSni || "Sin nivel")
                                    : "—"
                            }
                        </td>

                        <td>
                            ${certificationText}
                        </td>

                        <td>
                            ${
                                domainLevel !== null
                                    ? `${domainLevel}/10`
                                    : "Sin registrar"
                            }
                        </td>

                        <td>
                            ${isAssigned ? "Asignado" : "Disponible"}
                        </td>

                        <td>

                            ${
                                isAssigned

                                    ? `

                                        <button
                                            type="button"
                                            class="w3-button w3-small w3-red"
                                            onclick='unassignCourse(
                                                ${JSON.stringify(course.id)},
                                                ${JSON.stringify(teacher.id)}
                                            )'
                                        >
                                            Desasignar
                                        </button>

                                    `

                                    : `

                                        <button
                                            type="button"
                                            class="w3-button w3-small w3-blue"
                                            onclick='assignCourse(
                                                ${JSON.stringify(course.id)},
                                                ${JSON.stringify(teacher.id)}
                                            )'
                                        >
                                            Asignar
                                        </button>

                                    `
                            }

                        </td>

                    </tr>

                `;

            })
            .join("");

}


// ============================================================
// RENDERIZAR DOCENTES ASIGNADOS
// ============================================================

function renderAssigned() {

    const tableBody =
        document.getElementById(
            "tbodyAsignados"
        );

    const course =
        getSelectedCourse();

    if (!tableBody) {
        return;
    }

    const days = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes"
    ];

    if (!course) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="w3-center">
                    Seleccione una materia para mostrar
                    el horario semanal.
                </td>
            </tr>
        `;

        return;

    }

    const assignments =
        appState.asignaciones.filter(
            assignment =>
                String(assignment.cursoId) ===
                String(course.id)
        );

    const occupiedSlots = [];

    assignments.forEach(assignment => {

        const teacher =
            appState.docentes.find(
                item =>
                    String(item.id) ===
                    String(assignment.docenteId)
            );

        if (!teacher) {
            return;
        }

        const scheduleIds =
            Array.isArray(assignment.horarioIds)
                ? assignment.horarioIds
                : [];

        scheduleIds.forEach(id => {

            const schedule =
                appState.horarios.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );

            if (!schedule) {
                return;
            }

            const day =
                days.find(
                    item =>
                        normalizeDay(item) ===
                        normalizeDay(schedule.dia)
                );

            if (!day) {
                return;
            }

            occupiedSlots.push({
                day,
                horaInicio: String(schedule.horaInicio),
                horaFin: String(schedule.horaFin),
                docente: teacher.nombre
            });

        });

    });

    if (occupiedSlots.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="w3-center">
                    No hay docentes asignados con horarios
                    registrados para esta materia.
                </td>
            </tr>
        `;

        return;

    }

    const slotMap = new Map();

    occupiedSlots.forEach(slot => {

        const key =
            `${slot.horaInicio}|${slot.horaFin}`;

        if (!slotMap.has(key)) {

            slotMap.set(key, {
                horaInicio: slot.horaInicio,
                horaFin: slot.horaFin,
                docentesPorDia: Object.fromEntries(
                    days.map(
                        day => [day, []]
                    )
                )
            });

        }

        const row =
            slotMap.get(key);

        const teachers =
            row.docentesPorDia[slot.day];

        if (!teachers.includes(slot.docente)) {
            teachers.push(slot.docente);
        }

    });

    const rows =
        Array.from(slotMap.values())
            .sort(
                (a, b) =>
                    a.horaInicio.localeCompare(b.horaInicio)
            );

    tableBody.innerHTML =
        rows.map(row => {

            const cells =
                days.map(day => {

                    const teachers =
                        row.docentesPorDia[day];

                    if (teachers.length === 0) {

                        return `
                            <td class="celda-horario-vacia">
                                —
                            </td>
                        `;

                    }

                    return `
                        <td class="celda-horario-ocupada">
                            ${teachers.map(
                                name =>
                                    `<div>${esc(name)}</div>`
                            ).join("")}
                        </td>
                    `;

                }).join("");

            return `
                <tr>

                    <th>
                        ${esc(row.horaInicio)}–${esc(row.horaFin)}
                    </th>

                    ${cells}

                </tr>
            `;

        }).join("");

}


// ============================================================
// RENDERIZAR TODA LA PÁGINA
// ============================================================

function renderAssignmentPage() {

    renderCourseDetails();

    renderCandidates();

    renderAssigned();

}


// ============================================================
// VALIDAR QUE LOS HORARIOS SELECCIONADOS
// CUMPLAN LA DISTRIBUCIÓN
// ============================================================

function validateSelectedSchedules() {

    const distribution =
        getDistributionState();

    if (!distribution.course) {

        return {
            valid: false,
            message: "Seleccione una materia."
        };

    }

    if (!distribution.validWeeklyHours) {

        return {
            valid: false,
            message: "La materia no tiene configuradas correctamente sus horas semanales."
        };

    }

    if (!distribution.valid) {

        return {
            valid: false,
            message: "Cada día debe contener un número entero entre 0 y 2."
        };

    }

    if (!distribution.complete) {

        return {
            valid: false,
            message: "La distribución diaria debe sumar exactamente las horas semanales requeridas."
        };

    }

    const selectedSchedules =
        selectedScheduleIds.map(
            id =>
                appState.horarios.find(
                    schedule =>
                        String(schedule.id) ===
                        String(id)
                )
        );

    if (
        selectedSchedules.some(
            schedule => !schedule
        )
    ) {

        return {
            valid: false,
            message: "Uno o más horarios seleccionados ya no existen."
        };

    }

    if (
        selectedSchedules.length !==
        distribution.requiredDays.length
    ) {

        return {
            valid: false,
            message: "Debe seleccionar exactamente un bloque horario para cada día que tenga horas asignadas."
        };

    }

    let totalMinutes = 0;

    const usedDays = new Set();

    for (const schedule of selectedSchedules) {

        const dayConfig =
            ASSIGNMENT_DAYS.find(
                item =>
                    normalizeDay(item.label) ===
                    normalizeDay(schedule.dia)
            );

        if (!dayConfig) {

            return {
                valid: false,
                message: "Se encontró un horario con un día no permitido."
            };

        }

        if (usedDays.has(normalizeDay(schedule.dia))) {

            return {
                valid: false,
                message: `Solo se permite una sesión diaria. Revise ${schedule.dia}.`
            };

        }

        usedDays.add(
            normalizeDay(schedule.dia)
        );

        const expectedDuration =
            distribution.values[dayConfig.field] * 60;

        const actualDuration =
            getScheduleDuration(schedule);

        if (
            actualDuration !== expectedDuration
        ) {

            return {
                valid: false,
                message: `El bloque de ${schedule.dia} no corresponde a la duración requerida.`
            };

        }

        totalMinutes += actualDuration;

    }

    if (
        totalMinutes !==
        distribution.weeklyHours * 60
    ) {

        return {
            valid: false,
            message: "Los horarios seleccionados no completan las horas semanales requeridas."
        };

    }

    return {
        valid: true
    };

}


// ============================================================
// DETECTAR CONFLICTOS ENTRE INTERVALOS
// ============================================================

function findScheduleConflict(
    docenteId,
    newScheduleIds
) {

    const newSchedules =
        newScheduleIds.map(
            id =>
                appState.horarios.find(
                    item =>
                        String(item.id) ===
                        String(id)
                )
        ).filter(Boolean);

    const assignments =
        appState.asignaciones.filter(
            assignment =>
                String(assignment.docenteId) ===
                String(docenteId)
        );

    for (const assignment of assignments) {

        const otherScheduleIds =
            Array.isArray(assignment.horarioIds)
                ? assignment.horarioIds
                : [];

        for (const existingId of otherScheduleIds) {

            const existingSchedule =
                appState.horarios.find(
                    item =>
                        String(item.id) ===
                        String(existingId)
                );

            if (!existingSchedule) {
                continue;
            }

            const existingStart =
                toMinutes(existingSchedule.horaInicio);

            const existingEnd =
                toMinutes(existingSchedule.horaFin);

            if (
                existingStart === null ||
                existingEnd === null
            ) {
                continue;
            }

            for (const newSchedule of newSchedules) {

                if (
                    normalizeDay(existingSchedule.dia) !==
                    normalizeDay(newSchedule.dia)
                ) {
                    continue;
                }

                const newStart =
                    toMinutes(newSchedule.horaInicio);

                const newEnd =
                    toMinutes(newSchedule.horaFin);

                if (
                    newStart === null ||
                    newEnd === null
                ) {
                    continue;
                }

                const overlaps =
                    newStart < existingEnd &&
                    newEnd > existingStart;

                if (overlaps) {

                    const teacher =
                        appState.docentes.find(
                            item =>
                                String(item.id) ===
                                String(docenteId)
                        );

                    const otherCourse =
                        appState.cursos.find(
                            course =>
                                String(course.id) ===
                                String(assignment.cursoId)
                        );

                    return {
                        docente: teacher,
                        otherCourse,
                        horario: existingSchedule,
                        newSchedule
                    };

                }

            }

        }

    }

    return null;

}


// ============================================================
// ASIGNAR DOCENTE A MATERIA
// ============================================================

export async function assignCourse(
    courseId,
    teacherId
) {

    const course =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(courseId)
        );

    const teacher =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(teacherId)
        );

    if (
        !course ||
        !teacher
    ) {
        return;
    }

    // --------------------------------------------------------
    // VALIDAR MATERIA SELECCIONADA
    // --------------------------------------------------------

    if (
        String(selectedCourseId) !==
        String(courseId)
    ) {

        alert(
            "La materia seleccionada ya no coincide con la asignación solicitada."
        );

        return;

    }

    // --------------------------------------------------------
    // VALIDAR MISMA ACADEMIA
    // --------------------------------------------------------

    if (
        String(course.academiaId) !==
        String(teacher.academiaId)
    ) {

        alert(
            "El docente y la materia deben pertenecer a la misma academia."
        );

        return;

    }

    // --------------------------------------------------------
    // EVITAR DUPLICADOS
    // --------------------------------------------------------

    if (
        assigned(
            appState,
            courseId,
            teacherId
        )
    ) {

        alert(
            "El docente ya está asignado a esta materia."
        );

        return;

    }

    // --------------------------------------------------------
    // VALIDAR DISTRIBUCIÓN Y BLOQUES
    // --------------------------------------------------------

    const scheduleValidation =
        validateSelectedSchedules();

    if (!scheduleValidation.valid) {

        alert(
            scheduleValidation.message
        );

        return;

    }

    // --------------------------------------------------------
    // VALIDAR CONFLICTOS DE HORARIO
    // --------------------------------------------------------

    const scheduleConflict =
        findScheduleConflict(
            teacher.id,
            selectedScheduleIds
        );

    if (scheduleConflict) {

        const teacherName =
            scheduleConflict.docente
                ? scheduleConflict.docente.nombre
                : "Docente no identificado";

        const courseName =
            scheduleConflict.otherCourse
                ? scheduleConflict.otherCourse.nombre
                : "Materia no identificada";

        const existingSchedule =
            scheduleConflict.horario;

        alert(
            "No se puede asignar al docente porque ya tiene otra materia en un horario superpuesto.\n\n" +
            `Docente: ${teacherName}\n` +
            `Materia en conflicto: ${courseName}\n` +
            `Horario existente: ${existingSchedule.dia} ${existingSchedule.horaInicio}-${existingSchedule.horaFin}\n` +
            `Nuevo horario: ${scheduleConflict.newSchedule.dia} ${scheduleConflict.newSchedule.horaInicio}-${scheduleConflict.newSchedule.horaFin}`
        );

        return;

    }

    // --------------------------------------------------------
    // GUARDAR ASIGNACIÓN
    // --------------------------------------------------------

    try {

        const newAssignment =
            await createAssignment({

                cursoId:
                    String(courseId),

                docenteId:
                    String(teacherId),

                horarioIds:
                    selectedScheduleIds.map(
                        id => String(id)
                    )

            });

        newAssignment.id =
            String(newAssignment.id);

        newAssignment.cursoId =
            String(newAssignment.cursoId);

        newAssignment.docenteId =
            String(newAssignment.docenteId);

        newAssignment.horarioIds =
            Array.isArray(newAssignment.horarioIds)
                ? newAssignment.horarioIds.map(
                    id => String(id)
                )
                : [];

        appState.asignaciones.push(
            newAssignment
        );

        // Limpiar bloques concretos.
        // La distribución queda disponible como referencia
        // para configurar una asignación de otro docente.

        resetScheduleSelection();

        renderAssignmentPage();

        alert(
            `El docente ${teacher.nombre} fue asignado correctamente a ${course.nombre}.`
        );

    } catch (error) {

        console.error(
            "Error al asignar docente:",
            error
        );

        alert(
            "No se pudo asignar el docente.\n\n" +
            error.message
        );

    }

}


// ============================================================
// DESASIGNAR DOCENTE
// ============================================================

export async function unassignCourse(
    courseId,
    teacherId
) {

    const assignment =
        appState.asignaciones.find(
            item =>
                String(item.cursoId) ===
                String(courseId) &&
                String(item.docenteId) ===
                String(teacherId)
        );

    if (!assignment) {
        return;
    }

    const teacher =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(teacherId)
        );

    const course =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(courseId)
        );

    const confirmed =
        confirm(
            `¿Está seguro de desasignar a "${teacher?.nombre || "este docente"}" de la materia "${course?.nombre || "esta materia"}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteAssignment(
            assignment.id
        );

        appState.asignaciones =
            appState.asignaciones.filter(
                item =>
                    String(item.id) !==
                    String(assignment.id)
            );

        renderAssignmentPage();

        alert(
            "El docente fue desasignado correctamente."
        );

    } catch (error) {

        console.error(
            "Error al desasignar docente:",
            error
        );

        alert(
            "No se pudo desasignar el docente.\n\n" +
            error.message
        );

    }

}


// ============================================================
// EVENTOS DE ASIGNACIÓN
// ============================================================

export function bindAssignmentEvents() {

    const academySelect =
        document.getElementById(
            "academiaAsignacion"
        );

    const courseSelect =
        document.getElementById(
            "cursoAsignacion"
        );

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    // --------------------------------------------------------
    // CARGAR ACADEMIAS
    // --------------------------------------------------------

    if (academySelect) {

        academySelect.innerHTML = `
            <option value="">
                Seleccionar academia...
            </option>
        `;

        appState.academias
            .slice()
            .sort(
                (a, b) =>
                    a.nombre.localeCompare(
                        b.nombre,
                        "es"
                    )
            )
            .forEach(academyItem => {

                const option =
                    document.createElement("option");

                option.value =
                    String(academyItem.id);

                option.textContent =
                    academyItem.nombre;

                academySelect.appendChild(option);

            });

    }

    // --------------------------------------------------------
    // INICIALIZAR SELECTORES Y DISTRIBUCIÓN
    // --------------------------------------------------------

    selectedAcademyId =
        academySelect?.value || null;

    selectedCourseId =
        courseSelect?.value || null;

    initializeCourseConfiguration();

    bindScheduleEvents();

    // --------------------------------------------------------
    // EVENTOS DE DISTRIBUCIÓN
    // --------------------------------------------------------

    templateSelect?.addEventListener(
        "change",
        () => {

            const templateId =
                templateSelect.value;

            if (templateId) {

                applyAssignmentTemplate(
                    templateId
                );

            } else {

                // Al seleccionar distribución manual,
                // se conservan los valores actuales.

                resetScheduleSelection();

            }

        }
    );

    for (const day of ASSIGNMENT_DAYS) {

        document
            .getElementById(day.inputId)
            ?.addEventListener(
                "input",
                handleDistributionChange
            );

    }

    // --------------------------------------------------------
    // CAMBIAR ACADEMIA
    // --------------------------------------------------------

    academySelect?.addEventListener(
        "change",
        () => {

            selectedAcademyId =
                academySelect.value || null;

            selectedCourseId = null;

            resetScheduleSelection();

            fillAssignmentCourses();

            initializeCourseConfiguration();

            renderAssignmentPage();

        }
    );

    // --------------------------------------------------------
    // CAMBIAR MATERIA
    // --------------------------------------------------------

    courseSelect?.addEventListener(
        "change",
        () => {

            selectedCourseId =
                courseSelect.value || null;

            initializeCourseConfiguration();

            renderAssignmentPage();

        }
    );

    // --------------------------------------------------------
    // ORDENAR CANDIDATOS
    // --------------------------------------------------------

    const orderSelect =
        document.getElementById(
            "ordenDominio"
        );

    orderSelect?.addEventListener(
        "change",
        renderCandidates
    );

    // --------------------------------------------------------
    // ACTUALIZAR CANDIDATOS DESPUÉS DE CAMBIAR DOMINIO
    // --------------------------------------------------------

    document.addEventListener(
        "dominioActualizado",
        renderAssignmentPage
    );

    // --------------------------------------------------------
    // RENDER INICIAL
    // --------------------------------------------------------

    renderAssignmentPage();

}


// ============================================================
// COMPATIBILIDAD CON onclick
// ============================================================

window.assignCourse =
    assignCourse;

window.unassignCourse =
    unassignCourse;

window.removeSelectedSchedule =
    removeSelectedSchedule;