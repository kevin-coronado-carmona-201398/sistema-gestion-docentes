import {
    appState,
    editState
} from "./state.js";


import {
    createCourse,
    updateCourse,
    deleteCourse
} from "./api.js";


import {
    esc,
    academy,
    assignedTeachers
} from "./utils.js";


import {
    initSelects,
    fillScheduleHours
} from "./selects.js";

// ============================================================
// HORARIOS SELECCIONADOS DEL CURSO
// ============================================================

let selectedScheduleIds = [];


// ============================================================
// RENDERIZAR HORARIOS SELECCIONADOS
// ============================================================

function renderSelectedSchedules() {

    const container =
        document.getElementById(
            "horariosSeleccionadosCurso"
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
            .slice()
            .sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            )
            .map(
                id =>
                    appState.horarios.find(
                        horario =>
                            String(horario.id) ===
                            String(id)
                    )
            )
            .filter(Boolean);


    container.innerHTML = `
        <p class="w3-small">
            <strong>Horarios seleccionados:</strong>
        </p>

        ${schedules.map(horario => `
            <div class="w3-padding-small w3-border-bottom">

                <span>
                    ${esc(horario.dia)}
                    ${esc(horario.horaInicio)}
                    -${esc(horario.horaFin)}
                </span>

                <button
                    type="button"
                    class="w3-button w3-small w3-red w3-margin-left"
                    onclick='removeSelectedSchedule(${JSON.stringify(String(horario.id))})'
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
            "diaCurso"
        );


    const hourSelect =
        document.getElementById(
            "horaCurso"
        );


    if (!daySelect || !hourSelect) {
        return;
    }


    const day =
        daySelect.value;


    const scheduleId =
        hourSelect.value;


    if (!day || !scheduleId) {

        alert(
            "Seleccione un día y una hora antes de agregar el horario."
        );

        return;
    }


    const schedule =
        appState.horarios.find(
            horario =>
                String(horario.id) ===
                String(scheduleId)
        );


    if (!schedule) {

        alert(
            "El horario seleccionado no es válido."
        );

        return;
    }


    if (schedule.dia !== day) {

        alert(
            "El horario seleccionado no corresponde al día elegido."
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
            "Ese horario ya fue agregado al curso."
        );

        return;
    }


    selectedScheduleIds.push(
        String(scheduleId)
    );


    renderSelectedSchedules();


    hourSelect.value = "";

}


// ============================================================
// QUITAR HORARIO
// ============================================================

function removeSelectedSchedule(
    id
) {

    selectedScheduleIds =
        selectedScheduleIds.filter(
            scheduleId =>
                String(scheduleId) !==
                String(id)
        );


    renderSelectedSchedules();

}


// ============================================================
// LIMPIAR SELECCIÓN DE HORARIOS
// ============================================================

function resetScheduleSelection() {

    selectedScheduleIds = [];


    renderSelectedSchedules();


    const daySelect =
        document.getElementById(
            "diaCurso"
        );


    if (daySelect) {
        daySelect.value = "";
    }


    fillScheduleHours(
        "horaCurso",
        "",
        "Seleccionar hora..."
    );

}


// ============================================================
// CONFIGURAR SELECTOR DÍA → HORA
// ============================================================

function bindScheduleEvents() {

    const daySelect =
        document.getElementById(
            "diaCurso"
        );


    const hourSelect =
        document.getElementById(
            "horaCurso"
        );


    const addButton =
        document.getElementById(
            "agregarHorarioCurso"
        );


    if (daySelect) {

        daySelect.addEventListener(
            "change",
            () => {

                fillScheduleHours(
                    "horaCurso",
                    daySelect.value,
                    "Seleccionar hora..."
                );

            }
        );

    }


    if (addButton) {

        addButton.addEventListener(
            "click",
            addSelectedSchedule
        );

    }

}


// ============================================================
// COMPARAR LISTAS DE HORARIOS
// ============================================================

function sameScheduleIds(
    first,
    second
) {

    const firstIds =
        Array.isArray(first)
            ? first.map(String).sort()
            : [];


    const secondIds =
        Array.isArray(second)
            ? second.map(String).sort()
            : [];


    return (
        firstIds.length ===
            secondIds.length &&
        firstIds.every(
            (id, index) =>
                id === secondIds[index]
        )
    );

}


// ============================================================
// CONFLICTO DE HORARIO AL EDITAR CURSO
// ============================================================

function findScheduleConflict(
    courseId,
    newScheduleIds
) {

    const normalizedNewSchedules =
        new Set(
            newScheduleIds.map(
                id => String(id)
            )
        );


    const assignments =
        appState.asignaciones.filter(
            asignacion =>
                String(asignacion.cursoId) ===
                String(courseId)
        );


    for (const assignment of assignments) {

        const otherAssignments =
            appState.asignaciones.filter(
                otherAssignment =>
                    String(
                        otherAssignment.docenteId
                    ) ===
                        String(
                            assignment.docenteId
                        ) &&
                    String(
                        otherAssignment.cursoId
                    ) !==
                        String(courseId)
            );


        for (
            const otherAssignment
            of otherAssignments
        ) {

            const otherCourse =
                appState.cursos.find(
                    curso =>
                        String(curso.id) ===
                        String(
                            otherAssignment.cursoId
                        )
                );


            if (!otherCourse) {
                continue;
            }


            const otherScheduleIds =
                Array.isArray(
                    otherCourse.horarioIds
                )
                    ? otherCourse.horarioIds.map(
                        id => String(id)
                    )
                    : [];


            const conflictingScheduleId =
                otherScheduleIds.find(
                    id =>
                        normalizedNewSchedules.has(
                            id
                        )
                );


            if (
                conflictingScheduleId
            ) {

                const docente =
                    appState.docentes.find(
                        item =>
                            String(item.id) ===
                            String(
                                assignment.docenteId
                            )
                    );

                return {
                    docente,
                    otherCourse,
                    horario
                };

            }

        }

    }


    return null;

}


// ============================================================
// FUNCIÓN GLOBAL PARA QUITAR HORARIO
// ============================================================

window.removeSelectedSchedule =
    removeSelectedSchedule;

// ============================================================
// RENDERIZAR CURSOS
// ============================================================

export function renderCourses() {

    const tableBody =
        document.getElementById(
            "tbodyCursos"
        );


    if (!tableBody) {
        return;
    }


    if (appState.cursos.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="w3-center"
                >
                    No hay cursos registrados.
                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        appState.cursos
            .map(
                curso => {

                    const cursoAcademia =
                        academy(
                            appState,
                            curso.academiaId
                        );
                    
                    const schedules =
                        Array.isArray(curso.horarioIds)
                            ? curso.horarioIds
                                .map(
                                    id =>
                                        appState.horarios.find(
                                            horario =>
                                                String(horario.id) ===
                                                String(id)
                                        )
                                )
                                .filter(Boolean)
                            : [];

                    const horario =
                        appState.horarios.find(
                            item =>
                                String(item.id) ===
                                String(curso.horarioId)
                            );
        
                    const teachers =
                        assignedTeachers(
                            appState,
                            curso.id
                        );

                    const estado =
                        teachers.length > 0
                            ? "Asignado"
                            : "Disponible";


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    curso.nombre
                                )}
                            </td>

                            <td>
                                ${esc(
                                    curso.descripcion || ""
                                )}
                            </td>

                            <td>
                                ${esc(
                                    cursoAcademia
                                        ? cursoAcademia.nombre
                                        : "Sin academia"
                                )}
                            </td>

                            <td>
                                ${
                                    schedules.length
                                        ? schedules
                                            .map(
                                                horario =>
                                                    `${esc(horario.dia)} ${esc(horario.horaInicio)}-${esc(horario.horaFin)}`
                                            )
                                            .join("<br>")
                                        : "Sin horario"
                                }
                            </td>

                            <td>
                                ${estado}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-blue w3-margin-right"
                                    onclick='editCourse(${JSON.stringify(curso.id)})'
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-red"
                                    onclick='removeCourse(${JSON.stringify(curso.id)})'
                                >
                                    Eliminar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}

// ============================================================
// EDITAR CURSO
// ============================================================

export function editCourse(id) {

    const curso =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!curso) {
        return;
    }


    const confirmed =
        confirm(
            `¿Desea editar el curso "${curso.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    const form =
        document.getElementById(
            "formCurso"
        );


    if (!form) {
        return;
    }


    document.getElementById(
        "nombreCurso"
    ).value =
        curso.nombre || "";


    document.getElementById(
        "descripcionCurso"
    ).value =
        curso.descripcion || "";


    document.getElementById(
        "academiaCurso"
    ).value =
        curso.academiaId || "";
 
    selectedScheduleIds =
        Array.isArray(curso.horarioIds)
            ? [
                ...new Set(
                    curso.horarioIds.map(
                        id => String(id)
                    )
                )
            ]
            : [];

    renderSelectedSchedules();

    editState.courseId =
        String(curso.id);


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Actualizar curso";

    }


    const clearButton =
        document.getElementById(
            "limpiarCurso"
        );


    if (clearButton) {

        clearButton.textContent =
            "Cancelar edición";

    }


    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

// ============================================================
// CANCELAR EDICIÓN
// ============================================================

export function cancelCourseEdit() {

    editState.courseId = null;


    const form =
        document.getElementById(
            "formCurso"
        );


    if (!form) {
        return;
    }


    form.reset();
    resetScheduleSelection();

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Registrar curso";

    }


    const clearButton =
        document.getElementById(
            "limpiarCurso"
        );


    if (clearButton) {

        clearButton.textContent =
            "Limpiar";

    }

}

// ============================================================
// ELIMINAR CURSO
// ============================================================

export async function removeCourse(id) {

    const curso =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!curso) {
        return;
    }


    const hasDomains =
        appState.dominios.some(
            dominio =>
                String(dominio.cursoId) ===
                String(curso.id)
        );


    const hasAssignments =
        appState.asignaciones.some(
            asignacion =>
                String(asignacion.cursoId) ===
                String(curso.id)
        );


    if (
        hasDomains ||
        hasAssignments
    ) {

        alert(
            "No se puede eliminar el curso porque tiene dominios o asignaciones asociadas."
        );

        return;
    }


    const confirmed =
        confirm(
            `¿Está seguro de eliminar el curso "${curso.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteCourse(
            curso.id
        );


        appState.cursos =
            appState.cursos.filter(
                item =>
                    String(item.id) !==
                    String(curso.id)
            );


        if (
            editState.courseId &&
            String(editState.courseId) ===
                String(curso.id)
        ) {

            editState.courseId = null;

        }


        initSelects();

        renderCourses();


        alert(
            "Curso eliminado correctamente."
        );


    } catch (error) {

        console.error(
            "Error al eliminar curso:",
            error
        );


        alert(
            "No se pudo eliminar el curso.\n\n" +
            error.message
        );

    }

}

// ============================================================
// FORMULARIO DE CURSO
// ============================================================

export function bindCourseEvents() {

    const form =
        document.getElementById(
            "formCurso"
        );


    if (!form) {
        return;
    }


    // --------------------------------------------------------
    // GUARDAR CURSO
    // --------------------------------------------------------

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const nombre =
                document
                    .getElementById(
                        "nombreCurso"
                    )
                    .value
                    .trim();


            const descripcion =
                document
                    .getElementById(
                        "descripcionCurso"
                    )
                    .value
                    .trim();


            const academiaId =
                document
                    .getElementById(
                        "academiaCurso"
                    )
                    .value;
  

            // ------------------------------------------------
            // VALIDACIÓN
            // ------------------------------------------------

            if (
                !nombre ||
                !academiaId ||
                selectedScheduleIds.length === 0
            ) {

                alert(
                    "Complete los campos obligatorios del curso."
                );

                return;
            }

            const wasEditing =
                Boolean(
                    editState.courseId
                );


            // ------------------------------------------------
            // BUSCAR CURSO ACTUAL
            // ------------------------------------------------

            const currentCourse =
                wasEditing
                    ? appState.cursos.find(
                        curso =>
                            String(curso.id) ===
                            String(
                                editState.courseId
                            )
                    )
                    : null;

            if (
                wasEditing &&
                currentCourse &&
                !sameScheduleIds(
                    currentCourse.horarioIds,
                    selectedScheduleIds
                )
            ) {

                const scheduleConflict =
                    findScheduleConflict(
                        currentCourse.id,
                        selectedScheduleIds
                    );


                if (scheduleConflict) {

                    const docenteNombre =
                        scheduleConflict.docente
                            ? scheduleConflict.docente.nombre
                            : "Docente no identificado";


                    const cursoNombre =
                        scheduleConflict.otherCourse
                            ? scheduleConflict.otherCourse.nombre
                            : "Curso no identificado";


                    const horarioTexto =
                        scheduleConflict.horario
                            ? `${scheduleConflict.horario.dia} ${scheduleConflict.horario.horaInicio}-${scheduleConflict.horario.horaFin}`
                            : "Horario no identificado";


                    alert(
                        "No se puede cambiar el horario del curso porque se generaría un conflicto.\n\n" +
                        `Docente: ${docenteNombre}\n` +
                        `Curso en conflicto: ${cursoNombre}\n` +
                        `Horario: ${horarioTexto}`
                    );

                    return;

                }

            }

            // ------------------------------------------------
            // VALIDAR NOMBRE DUPLICADO
            // DENTRO DE LA MISMA ACADEMIA
            // ------------------------------------------------

            const duplicateCourse =
                appState.cursos.some(
                    curso =>
                        String(curso.id) !==
                            String(
                                editState.courseId
                            ) &&
                        String(curso.academiaId) ===
                            String(academiaId) &&
                        curso.nombre
                            .trim()
                            .toLowerCase() ===
                            nombre.toLowerCase()
                );


            if (duplicateCourse) {

                alert(
                    "Ya existe un curso con ese nombre dentro de la academia seleccionada."
                );

                return;
            }


            // ------------------------------------------------
            // VALIDAR CAMBIO DE ACADEMIA
            // ------------------------------------------------

            if (
                wasEditing &&
                currentCourse &&
                String(currentCourse.academiaId) !==
                    String(academiaId)
            ) {

                const hasDomains =
                    appState.dominios.some(
                        dominio =>
                            String(
                                dominio.cursoId
                            ) ===
                            String(
                                currentCourse.id
                            )
                    );


                const hasAssignments =
                    appState.asignaciones.some(
                        asignacion =>
                            String(
                                asignacion.cursoId
                            ) ===
                            String(
                                currentCourse.id
                            )
                    );


                if (
                    hasDomains ||
                    hasAssignments
                ) {

                    alert(
                        "No se puede cambiar de academia un curso que tiene dominios o asignaciones asociadas."
                    );

                    return;
                }

            }


            try {

                const courseData = {

                    nombre,
                    descripcion,

                    academiaId:
                        String(academiaId),

                    horarioIds:
                        selectedScheduleIds.map(
                            id => String(id)
                        )

                };

                // ============================================
                // ACTUALIZAR
                // ============================================

                if (wasEditing) {

                    const updatedCourse =
                        await updateCourse(
                            editState.courseId,
                            courseData
                        );


                    updatedCourse.id =
                        String(
                            updatedCourse.id
                        );


                    updatedCourse.academiaId =
                        String(
                            updatedCourse.academiaId
                        );

                    updatedCourse.horarioIds =
                        Array.isArray(
                            updatedCourse.horarioIds
                        )
                            ? updatedCourse.horarioIds.map(
                                id => String(id)
                            )
                            : [];

                    const index =
                        appState.cursos.findIndex(
                            item =>
                                String(item.id) ===
                                String(
                                    editState.courseId
                                )
                        );


                    if (index !== -1) {

                        appState.cursos[index] =
                            updatedCourse;

                    }

                    editState.courseId =
                        null;

                    console.log(
                        "Curso actualizado:",
                        updatedCourse
                    );

                }

                // ============================================
                // CREAR
                // ============================================

                else {

                    const newCourse =
                        await createCourse(
                            courseData
                        );


                    newCourse.id =
                        String(
                            newCourse.id
                        );


                    newCourse.academiaId =
                        String(
                            newCourse.academiaId
                        );

                    newCourse.horarioIds =
                        Array.isArray(
                            newCourse.horarioIds
                        )
                            ? newCourse.horarioIds.map(
                                id => String(id)
                            )
                            : [];

                    appState.cursos.push(
                        newCourse
                    );


                    console.log(
                        "Curso creado:",
                        newCourse
                    );

                }


                // ============================================
                // ACTUALIZAR INTERFAZ
                // ============================================

                form.reset();
                resetScheduleSelection();

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.textContent =
                        "Registrar curso";

                }


                const clearButton =
                    document.getElementById(
                        "limpiarCurso"
                    );


                if (clearButton) {

                    clearButton.textContent =
                        "Limpiar";

                }


                initSelects();

                renderCourses();


                alert(
                    wasEditing
                        ? "Curso actualizado correctamente."
                        : "Curso registrado correctamente."
                );


            } catch (error) {

                console.error(
                    "Error al guardar curso:",
                    error
                );


                alert(
                    "No se pudo guardar el curso.\n\n" +
                    error.message
                );

            }

        }
    );


    // --------------------------------------------------------
    // LIMPIAR / CANCELAR
    // --------------------------------------------------------

    document
        .getElementById(
            "limpiarCurso"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    editState.courseId
                ) {

                    event.preventDefault();

                    cancelCourseEdit();

                }

            }
        );
    bindScheduleEvents();
}

// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.editCourse =
    editCourse;

window.removeCourse =
    removeCourse;