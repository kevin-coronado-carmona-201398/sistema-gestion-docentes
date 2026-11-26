
import {
    appState
} from "./state.js";

import {
    createAssignment,
    updateAssignmentSchedules,
    deleteAssignment
} from "./api.js";

import {
    esc,
    academy,
    domain
} from "./utils.js";


// ============================================================
// CONFIGURACIÓN DE LOS DÍAS
// ============================================================

const ASSIGNMENT_DAYS = [
    {
        field: "horasLunes",
        hoursId: "horasLunesAsignacion",
        blockId: "bloqueLunesAsignacion",
        label: "Lunes"
    },
    {
        field: "horasMartes",
        hoursId: "horasMartesAsignacion",
        blockId: "bloqueMartesAsignacion",
        label: "Martes"
    },
    {
        field: "horasMiercoles",
        hoursId: "horasMiercolesAsignacion",
        blockId: "bloqueMiercolesAsignacion",
        label: "Miércoles"
    },
    {
        field: "horasJueves",
        hoursId: "horasJuevesAsignacion",
        blockId: "bloqueJuevesAsignacion",
        label: "Jueves"
    },
    {
        field: "horasViernes",
        hoursId: "horasViernesAsignacion",
        blockId: "bloqueViernesAsignacion",
        label: "Viernes"
    }
];


// ============================================================
// ESTADO LOCAL DEL MÓDULO
// ============================================================

let selectedCourseId = null;
let selectedAssignmentId = null;
let isSavingSchedule = false;


// ============================================================
// UTILIDADES DE HORARIOS
// ============================================================

// ------------------------------------------------------------
// NORMALIZAR DÍA
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


// ------------------------------------------------------------
// BUSCAR MATERIA SELECCIONADA
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// BUSCAR ASIGNACIÓN POR ID
// ------------------------------------------------------------

function getAssignmentById(id) {

    return appState.asignaciones.find(
        assignment =>
            String(assignment.id) ===
            String(id)
    );

}


// ============================================================
// DISTRIBUCIÓN Y CONFIGURACIÓN DE HORARIOS
// ============================================================

// ------------------------------------------------------------
// OBTENER DISTRIBUCIÓN ACTUAL
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
                day.hoursId
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
// ACTIVAR O DESACTIVAR CONTROLES
// ------------------------------------------------------------

function setConfigurationControlsEnabled(enabled) {

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (templateSelect) {
        templateSelect.disabled = !enabled;
    }

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        if (hoursSelect) {
            hoursSelect.disabled = !enabled;
        }

    }

}


// ------------------------------------------------------------
// CARGAR PLANTILLAS SEGÚN LAS HORAS DE LA MATERIA
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
// ACTUALIZAR OPCIONES DE BLOQUES DE UN DÍA
// ------------------------------------------------------------

function updateDayBlockOptions(
    day,
    selectedScheduleId = ""
) {

    const hoursSelect =
        document.getElementById(
            day.hoursId
        );

    const blockSelect =
        document.getElementById(
            day.blockId
        );

    if (
        !hoursSelect ||
        !blockSelect
    ) {
        return;
    }

    const requiredHours =
        Number(hoursSelect.value);

    blockSelect.innerHTML = "";

    // No se requiere una sesión ese día.

    if (requiredHours === 0) {

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent =
            "No aplica";

        blockSelect.appendChild(option);

        blockSelect.disabled = true;

        return;

    }

    const placeholder =
        document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
        "Seleccionar bloque...";

    blockSelect.appendChild(placeholder);

    const requiredDuration =
        requiredHours * 60;

    const schedules =
        appState.horarios
            .filter(
                schedule =>
                    normalizeDay(schedule.dia) ===
                        normalizeDay(day.label) &&
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

        placeholder.textContent =
            "No hay bloques disponibles.";

        blockSelect.disabled = true;

        return;

    }

    schedules.forEach(schedule => {

        const option =
            document.createElement("option");

        option.value =
            String(schedule.id);

        option.textContent =
            `${schedule.horaInicio} - ${schedule.horaFin}`;

        blockSelect.appendChild(option);

    });

    blockSelect.disabled = false;

    if (selectedScheduleId) {

        blockSelect.value =
            String(selectedScheduleId);

    }

}


// ------------------------------------------------------------
// ACTUALIZAR TODOS LOS SELECTORES DE BLOQUES
// ------------------------------------------------------------

function updateAllDayBlockOptions() {

    for (const day of ASSIGNMENT_DAYS) {

        updateDayBlockOptions(day);

    }

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

    const course =
        getSelectedCourse();

    if (
        !course ||
        Number(template.horasSemanales) !==
            Number(course.horasSemanales) ||
        Number(template.activa) !== 1
    ) {

        alert(
            "La plantilla no corresponde a las horas semanales de la materia."
        );

        return;

    }

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        if (hoursSelect) {

            hoursSelect.value =
                String(
                    Number(template[day.field] ?? 0)
                );

        }

    }

    updateAllDayBlockOptions();

    updateConfigurationSummary();

}


// ============================================================
// VALIDAR CONFIGURACIÓN
// ============================================================

// ------------------------------------------------------------
// OBTENER BLOQUES SELECCIONADOS
// ------------------------------------------------------------

function getSelectedScheduleIds() {

    const ids = [];

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        const blockSelect =
            document.getElementById(
                day.blockId
            );

        const hours =
            Number(hoursSelect?.value ?? 0);

        if (hours > 0 && blockSelect?.value) {

            ids.push(
                String(blockSelect.value)
            );

        }

    }

    return ids;

}


// ------------------------------------------------------------
// VALIDAR DISTRIBUCIÓN Y BLOQUES
// ------------------------------------------------------------

function validateScheduleConfiguration() {

    const distribution =
        getDistributionState();

    if (!selectedAssignmentId) {

        return {
            valid: false,
            message: "Primero seleccione un docente asignado."
        };

    }

    if (!distribution.course) {

        return {
            valid: false,
            message: "No se encontró la materia seleccionada."
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
            message: "Cada día debe tener una duración de 0, 1 o 2 horas."
        };

    }

    if (!distribution.complete) {

        const difference =
            distribution.weeklyHours -
            distribution.total;

        return {
            valid: false,
            message:
                difference > 0
                    ? `La distribución tiene ${distribution.total} de ${distribution.weeklyHours} horas. Faltan ${difference} horas.`
                    : `La distribución tiene ${distribution.total} de ${distribution.weeklyHours} horas. Hay ${Math.abs(difference)} horas excedentes.`
        };

    }

    const scheduleIds = [];

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        const blockSelect =
            document.getElementById(
                day.blockId
            );

        const hours =
            Number(hoursSelect?.value ?? 0);

        const scheduleId =
            blockSelect?.value || "";

        // No se requiere horario para este día.

        if (hours === 0) {

            if (scheduleId) {

                return {
                    valid: false,
                    message: `${day.label} no debe tener un bloque horario porque tiene cero horas asignadas.`
                };

            }

            continue;

        }

        // Se requiere un bloque para cada día con horas.

        if (!scheduleId) {

            return {
                valid: false,
                message: `Seleccione un bloque horario para ${day.label}.`
            };

        }

        const schedule =
            appState.horarios.find(
                item =>
                    String(item.id) ===
                    String(scheduleId)
            );

        if (!schedule) {

            return {
                valid: false,
                message: `El bloque seleccionado para ${day.label} ya no está disponible.`
            };

        }

        // Validar día.

        if (
            normalizeDay(schedule.dia) !==
            normalizeDay(day.label)
        ) {

            return {
                valid: false,
                message: `El bloque seleccionado no corresponde a ${day.label}.`
            };

        }

        // Validar duración.

        const duration =
            getScheduleDuration(schedule);

        if (duration !== hours * 60) {

            return {
                valid: false,
                message: `El bloque de ${day.label} debe durar exactamente ${hours} hora(s).`
            };

        }

        scheduleIds.push(
            String(schedule.id)
        );

    }

    if (
        scheduleIds.length !==
        distribution.requiredDays.length
    ) {

        return {
            valid: false,
            message: "Debe seleccionar un bloque por cada día que tenga horas asignadas."
        };

    }

    if (
        new Set(scheduleIds).size !==
        scheduleIds.length
    ) {

        return {
            valid: false,
            message: "No se puede repetir un mismo bloque horario."
        };

    }

    return {
        valid: true,
        horarioIds: scheduleIds
    };

}


// ============================================================
// DETECTAR CONFLICTOS DE HORARIO
// ============================================================

function findScheduleConflict(
    docenteId,
    newScheduleIds,
    currentAssignmentId
) {

    const newSchedules =
        newScheduleIds
            .map(
                id =>
                    appState.horarios.find(
                        schedule =>
                            String(schedule.id) ===
                            String(id)
                    )
            )
            .filter(Boolean);

    const otherAssignments =
        appState.asignaciones.filter(
            assignment =>
                String(assignment.docenteId) ===
                    String(docenteId) &&
                String(assignment.id) !==
                    String(currentAssignmentId)
        );

    for (const assignment of otherAssignments) {

        const existingIds =
            Array.isArray(assignment.horarioIds)
                ? assignment.horarioIds
                : [];

        for (const existingId of existingIds) {

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
// RESUMEN DE CONFIGURACIÓN
// ============================================================

function updateConfigurationSummary() {

    const summary =
        document.getElementById(
            "resumenDistribucionAsignacion"
        );

    const confirmButton =
        document.getElementById(
            "confirmarHorarioAsignacion"
        );

    if (!summary || !confirmButton) {
        return;
    }

    const distribution =
        getDistributionState();

    if (!distribution.course) {

        summary.textContent =
            "No se encontró la materia seleccionada.";

        confirmButton.disabled = true;

        return;

    }

    const selectedCount =
        getSelectedScheduleIds().length;

    const requiredCount =
        distribution.requiredDays.length;

    summary.textContent =
        `Horas configuradas: ${distribution.total} de ${distribution.weeklyHours}. ` +
        `Sesiones seleccionadas: ${selectedCount} de ${requiredCount}.`;

    const validation =
        validateScheduleConfiguration();

    confirmButton.disabled =
        !validation.valid ||
        isSavingSchedule;

}


// ============================================================
// RESTABLECER CONFIGURACIÓN
// ============================================================

function resetScheduleConfiguration() {

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (templateSelect) {
        templateSelect.value = "";
    }

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        if (hoursSelect) {
            hoursSelect.value = "0";
        }

        updateDayBlockOptions(day);

    }

    updateConfigurationSummary();

}


// ============================================================
// MOSTRAR CONFIGURACIÓN DE UNA ASIGNACIÓN
// ============================================================

export function openScheduleConfiguration(assignmentId) {

    const assignment =
        getAssignmentById(assignmentId);

    if (!assignment) {

        alert(
            "No se encontró la asignación solicitada."
        );

        return;

    }

    if (
        String(assignment.cursoId) !==
        String(selectedCourseId)
    ) {

        alert(
            "La asignación no corresponde a la materia seleccionada."
        );

        return;

    }

    const course =
        getSelectedCourse();

    const teacher =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(assignment.docenteId)
        );

    if (
        !course ||
        !teacher
    ) {

        alert(
            "No se encontró la información de la materia o del docente."
        );

        return;

    }

    selectedAssignmentId =
        String(assignment.id);

    const panel =
        document.getElementById(
            "configuracionHorario"
        );

    if (!panel) {
        return;
    }

    // --------------------------------------------
    // MOSTRAR INFORMACIÓN DE LA ASIGNACIÓN
    // --------------------------------------------

    document.getElementById(
        "detalleMateriaHorario"
    ).textContent =
        course.nombre;

    document.getElementById(
        "detalleDocenteHorario"
    ).textContent =
        teacher.nombre;

    document.getElementById(
        "detalleHorasHorario"
    ).textContent =
        `${course.horasSemanales} horas semanales`;

    // --------------------------------------------
    // HABILITAR CONTROLES
    // --------------------------------------------

    setConfigurationControlsEnabled(true);

    // --------------------------------------------
    // CARGAR PLANTILLAS
    // --------------------------------------------

    populateAssignmentTemplates(course);

    // --------------------------------------------
    // LIMPIAR CONFIGURACIÓN ANTERIOR
    // --------------------------------------------

    resetScheduleConfiguration();

    // --------------------------------------------
    // RECUPERAR HORARIOS EXISTENTES
    // CUANDO SE MODIFICA UNA ASIGNACIÓN
    // --------------------------------------------

    const existingIds =
        Array.isArray(assignment.horarioIds)
            ? assignment.horarioIds
            : [];

    const selectedByDay = new Map();

    for (const id of existingIds) {

        const schedule =
            appState.horarios.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!schedule) {
            continue;
        }

        const dayConfig =
            ASSIGNMENT_DAYS.find(
                item =>
                    normalizeDay(item.label) ===
                    normalizeDay(schedule.dia)
            );

        const duration =
            getScheduleDuration(schedule);

        if (
            !dayConfig ||
            (
                duration !== 60 &&
                duration !== 120
            )
        ) {
            continue;
        }

        selectedByDay.set(
            dayConfig.field,
            String(schedule.id)
        );

        const hoursSelect =
            document.getElementById(
                dayConfig.hoursId
            );

        if (hoursSelect) {

            hoursSelect.value =
                String(duration / 60);

        }

    }

    // Reconstruir las opciones de cada día
    // y restaurar los bloques existentes.

    for (const day of ASSIGNMENT_DAYS) {

        updateDayBlockOptions(
            day,
            selectedByDay.get(day.field) || ""
        );

    }

    // No se conserva una plantilla asociada,
    // porque la distribución real se deriva
    // de los horarios concretos guardados.

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    if (templateSelect) {
        templateSelect.value = "";
    }

    // --------------------------------------------
    // TEXTO DEL BOTÓN
    // --------------------------------------------

    const confirmButton =
        document.getElementById(
            "confirmarHorarioAsignacion"
        );

    if (confirmButton) {

        confirmButton.textContent =
            existingIds.length > 0
                ? "Guardar cambios"
                : "Confirmar horario";

    }

    panel.hidden = false;

    updateConfigurationSummary();

    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// CERRAR CONFIGURACIÓN
// ============================================================

function closeScheduleConfiguration() {

    const panel =
        document.getElementById(
            "configuracionHorario"
        );

    if (panel) {
        panel.hidden = true;
    }

    selectedAssignmentId = null;

    isSavingSchedule = false;

    setConfigurationControlsEnabled(false);

}


// ============================================================
// REGISTRAR ASIGNACIÓN PENDIENTE
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

    if (
        String(selectedCourseId) !==
        String(courseId)
    ) {

        alert(
            "La materia seleccionada ya no coincide con la asignación solicitada."
        );

        return;

    }

    // --------------------------------------------
    // VALIDAR ACADEMIA
    // --------------------------------------------

    if (
        String(course.academiaId) !==
        String(teacher.academiaId)
    ) {

        alert(
            "El docente y la materia deben pertenecer a la misma academia."
        );

        return;

    }

    // --------------------------------------------
    // VALIDAR DUPLICADO
    // --------------------------------------------

    const existing =
        appState.asignaciones.find(
            assignment =>
                String(assignment.cursoId) ===
                    String(courseId) &&
                String(assignment.docenteId) ===
                    String(teacherId)
        );

    if (existing) {

        alert(
            "El docente ya tiene una asignación para esta materia."
        );

        return;

    }

    // --------------------------------------------
    // CREAR ASIGNACIÓN SIN HORARIOS
    // --------------------------------------------

    try {

        const newAssignment =
            await createAssignment({

                cursoId:
                    String(courseId),

                docenteId:
                    String(teacherId)

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

        renderAssignmentPage();

        // Abrir inmediatamente la configuración
        // correspondiente al docente recién asignado.

        openScheduleConfiguration(
            newAssignment.id
        );

    } catch (error) {

        console.error(
            "Error al registrar asignación:",
            error
        );

        alert(
            "No se pudo asignar el docente.\n\n" +
            error.message
        );

    }

}


// ============================================================
// CONFIRMAR O ACTUALIZAR HORARIO
// ============================================================

async function confirmAssignmentSchedule() {

    if (
        !selectedAssignmentId ||
        isSavingSchedule
    ) {
        return;
    }

    const assignment =
        getAssignmentById(
            selectedAssignmentId
        );

    if (!assignment) {

        alert(
            "La asignación ya no existe."
        );

        closeScheduleConfiguration();
        renderAssignmentPage();

        return;

    }

    const teacher =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(assignment.docenteId)
        );

    // --------------------------------------------
    // VALIDAR CONFIGURACIÓN
    // --------------------------------------------

    const validation =
        validateScheduleConfiguration();

    if (!validation.valid) {

        alert(
            validation.message
        );

        return;

    }

    // --------------------------------------------
    // COMPROBAR CONFLICTOS LOCALMENTE
    // --------------------------------------------

    const conflict =
        findScheduleConflict(
            assignment.docenteId,
            validation.horarioIds,
            assignment.id
        );

    if (conflict) {

        alert(
            "No se puede confirmar el horario porque el docente tiene otra materia en un intervalo superpuesto.\n\n" +
            `Docente: ${conflict.docente?.nombre || "No identificado"}\n` +
            `Materia en conflicto: ${conflict.otherCourse?.nombre || "No identificada"}\n` +
            `Horario existente: ${conflict.horario.dia} ${conflict.horario.horaInicio}-${conflict.horario.horaFin}\n` +
            `Nuevo horario: ${conflict.newSchedule.dia} ${conflict.newSchedule.horaInicio}-${conflict.newSchedule.horaFin}`
        );

        return;

    }

    // --------------------------------------------
    // GUARDAR EN EL SERVIDOR
    // --------------------------------------------

    const confirmButton =
        document.getElementById(
            "confirmarHorarioAsignacion"
        );

    try {

        isSavingSchedule = true;

        if (confirmButton) {
            confirmButton.disabled = true;
        }

        const updatedAssignment =
            await updateAssignmentSchedules(
                assignment.id,
                validation.horarioIds
            );

        updatedAssignment.id =
            String(updatedAssignment.id);

        updatedAssignment.cursoId =
            String(updatedAssignment.cursoId);

        updatedAssignment.docenteId =
            String(updatedAssignment.docenteId);

        updatedAssignment.horarioIds =
            Array.isArray(updatedAssignment.horarioIds)
                ? updatedAssignment.horarioIds.map(
                    id => String(id)
                )
                : [];

        const index =
            appState.asignaciones.findIndex(
                item =>
                    String(item.id) ===
                    String(assignment.id)
            );

        if (index !== -1) {

            appState.asignaciones[index] =
                updatedAssignment;

        }

        closeScheduleConfiguration();

        renderAssignmentPage();

        alert(
            `El horario de ${teacher?.nombre || "el docente"} fue confirmado correctamente.`
        );

    } catch (error) {

        console.error(
            "Error al confirmar horario:",
            error
        );

        alert(
            "No se pudo confirmar el horario.\n\n" +
            error.message
        );

        // Se conserva la configuración abierta.
        // El servidor no modifica los horarios anteriores
        // si la validación falla.

    } finally {

        isSavingSchedule = false;

        if (confirmButton && !selectedAssignmentId) {
            confirmButton.disabled = false;
        } else {
            updateConfigurationSummary();
        }

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

        if (
            String(selectedAssignmentId) ===
            String(assignment.id)
        ) {

            closeScheduleConfiguration();

        }

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
// CARGAR MATERIAS SEGÚN ACADEMIA
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

    const assignments =
        appState.asignaciones.filter(
            assignment =>
                String(assignment.cursoId) ===
                String(course.id)
        );

    const teacherNames =
        assignments
            .map(assignment => {

                const teacher =
                    appState.docentes.find(
                        item =>
                            String(item.id) ===
                            String(assignment.docenteId)
                    );

                if (!teacher) {
                    return null;
                }

                const scheduled =
                    Array.isArray(assignment.horarioIds) &&
                    assignment.horarioIds.length > 0;

                return scheduled
                    ? teacher.nombre
                    : `${teacher.nombre} (pendiente de horario)`;

            })
            .filter(Boolean);

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
        assignments.length === 0
            ? "Disponible"
            : assignments.every(
                assignment =>
                    Array.isArray(assignment.horarioIds) &&
                    assignment.horarioIds.length > 0
            )
                ? "Asignado"
                : "Con asignaciones pendientes";

    docentesElement.textContent =
        teacherNames.length > 0
            ? teacherNames.join(", ")
            : "Ninguno";

}


// ============================================================
// OBTENER NIVEL DE DOMINIO
// ============================================================

function getDomainLevel(
    teacherId,
    courseId
) {

    const relation =
        domain(
            appState,
            teacherId,
            courseId
        );

    if (
        !relation ||
        relation.nivel === null ||
        relation.nivel === undefined
    ) {
        return null;
    }

    const level =
        Number(relation.nivel);

    return (
        Number.isInteger(level) &&
        level >= 1 &&
        level <= 10
    )
        ? level
        : null;

}


// ============================================================
// RENDERIZAR DOCENTES CANDIDATOS
// Orden descendente por dominio.
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

    const candidates =
        appState.docentes
            .filter(
                teacher =>
                    String(teacher.academiaId) ===
                    String(course.academiaId)
            )
            .sort((a, b) => {

                const levelA =
                    getDomainLevel(a.id, course.id);

                const levelB =
                    getDomainLevel(b.id, course.id);

                // Docentes sin dominio al final.

                if (levelA === null && levelB !== null) {
                    return 1;
                }

                if (levelB === null && levelA !== null) {
                    return -1;
                }

                // Mayor dominio primero.

                if (levelA !== levelB) {
                    return (levelB ?? 0) - (levelA ?? 0);
                }

                // Desempate alfabético.

                return String(a.nombre).localeCompare(
                    String(b.nombre),
                    "es"
                );

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

                const assignment =
                    appState.asignaciones.find(
                        item =>
                            String(item.cursoId) ===
                                String(course.id) &&
                            String(item.docenteId) ===
                                String(teacher.id)
                    );

                const isAssigned =
                    Boolean(assignment);

                const isScheduled =
                    isAssigned &&
                    Array.isArray(assignment.horarioIds) &&
                    assignment.horarioIds.length > 0;

                const status =
                    !isAssigned
                        ? "Disponible"
                        : isScheduled
                            ? "Programado"
                            : "Pendiente de horario";

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

                let actions = "";

                if (!isAssigned) {

                    actions = `
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
                    `;

                } else {

                    actions = `

                        <button
                            type="button"
                            class="w3-button w3-small w3-blue w3-margin-bottom"
                            onclick='openScheduleConfiguration(
                                ${JSON.stringify(assignment.id)}
                            )'
                        >
                            ${isScheduled ? "Modificar horario" : "Configurar horario"}
                        </button>

                        <br>

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

                    `;

                }

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
                            ${status}
                        </td>

                        <td>
                            ${actions}
                        </td>

                    </tr>

                `;

            })
            .join("");

}


// ============================================================
// RENDERIZAR HORARIO SEMANAL DE ASIGNACIONES
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
    const pendingTeachers = [];

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

        if (scheduleIds.length === 0) {

            pendingTeachers.push(
                teacher.nombre
            );

            return;

        }

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

    const slotMap = new Map();

    occupiedSlots.forEach(slot => {

        const key =
            `${slot.horaInicio}|${slot.horaFin}`;

        if (!slotMap.has(key)) {

            slotMap.set(key, {
                horaInicio: slot.horaInicio,
                horaFin: slot.horaFin,
                docentesPorDia: Object.fromEntries(
                    days.map(day => [day, []])
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

    let html = rows.map(row => {

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
                            name => `<div>${esc(name)}</div>`
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

    if (pendingTeachers.length > 0) {

        html += `
            <tr>
                <td colspan="6">
                    <strong>Asignaciones pendientes de horario:</strong>
                    ${pendingTeachers.map(esc).join(", ")}
                </td>
            </tr>
        `;

    }

    if (!html) {

        html = `
            <tr>
                <td colspan="6" class="w3-center">
                    No hay docentes asignados a esta materia.
                </td>
            </tr>
        `;

    }

    tableBody.innerHTML = html;

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
// EVENTOS DE CONFIGURACIÓN DEL HORARIO
// ============================================================

function bindScheduleConfigurationEvents() {

    const templateSelect =
        document.getElementById(
            "plantillaAsignacion"
        );

    const confirmButton =
        document.getElementById(
            "confirmarHorarioAsignacion"
        );

    const cancelButton =
        document.getElementById(
            "cancelarConfiguracionHorario"
        );

    templateSelect?.addEventListener(
        "change",
        () => {

            const templateId =
                templateSelect.value;

            if (templateId) {

                applyAssignmentTemplate(
                    templateId
                );

            }

            // Si se selecciona distribución manual,
            // se conservan los valores actuales.

            updateConfigurationSummary();

        }
    );

    for (const day of ASSIGNMENT_DAYS) {

        const hoursSelect =
            document.getElementById(
                day.hoursId
            );

        const blockSelect =
            document.getElementById(
                day.blockId
            );

        hoursSelect?.addEventListener(
            "change",
            () => {

                updateDayBlockOptions(day);

                updateConfigurationSummary();

                // Al cambiar las horas del día,
                // se elimina el bloque anterior si ya no coincide.

            }
        );

        blockSelect?.addEventListener(
            "change",
            updateConfigurationSummary
        );

    }

    confirmButton?.addEventListener(
        "click",
        confirmAssignmentSchedule
    );

    cancelButton?.addEventListener(
        "click",
        closeScheduleConfiguration
    );

}


// ============================================================
// EVENTOS PRINCIPALES
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

    if (
        !academySelect ||
        !courseSelect
    ) {
        return;
    }

    // --------------------------------------------------------
    // CARGAR ACADEMIAS
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // INICIALIZAR CONTROLES
    // --------------------------------------------------------

    selectedCourseId = null;

    selectedAssignmentId = null;

    const panel =
        document.getElementById(
            "configuracionHorario"
        );

    if (panel) {
        panel.hidden = true;
    }

    setConfigurationControlsEnabled(false);

    bindScheduleConfigurationEvents();

    // --------------------------------------------------------
    // CAMBIAR ACADEMIA
    // --------------------------------------------------------

    academySelect.addEventListener(
        "change",
        () => {

            closeScheduleConfiguration();

            selectedCourseId = null;

            fillAssignmentCourses();

            renderAssignmentPage();

        }
    );

    // --------------------------------------------------------
    // CAMBIAR MATERIA
    // --------------------------------------------------------

    courseSelect.addEventListener(
        "change",
        () => {

            closeScheduleConfiguration();

            selectedCourseId =
                courseSelect.value || null;

            renderAssignmentPage();

        }
    );

    // --------------------------------------------------------
    // ACTUALIZAR CANDIDATOS CUANDO CAMBIE UN DOMINIO
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

window.openScheduleConfiguration =
    openScheduleConfiguration;

window.unassignCourse =
    unassignCourse;