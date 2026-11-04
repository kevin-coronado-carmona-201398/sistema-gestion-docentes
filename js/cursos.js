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
} from "./selects.js";

// ============================================================
// DISTRIBUCIÓN HORARIA DE MATERIAS
// ============================================================

const COURSE_DAY_INPUTS = [
    {
        id: "horasLunes",
        field: "horasLunes"
    },
    {
        id: "horasMartes",
        field: "horasMartes"
    },
    {
        id: "horasMiercoles",
        field: "horasMiercoles"
    },
    {
        id: "horasJueves",
        field: "horasJueves"
    },
    {
        id: "horasViernes",
        field: "horasViernes"
    }
];


// ------------------------------------------------------------
// OBTENER DISTRIBUCIÓN DEL FORMULARIO
// ------------------------------------------------------------

function getCourseScheduleValues() {

    const schedule = {};

    for (const day of COURSE_DAY_INPUTS) {

        const input =
            document.getElementById(day.id);

        schedule[day.field] =
            Number(input?.value ?? 0);

    }

    return schedule;

}


// ------------------------------------------------------------
// COLOCAR DISTRIBUCIÓN EN EL FORMULARIO
// ------------------------------------------------------------

function setCourseScheduleValues(course = {}) {

    for (const day of COURSE_DAY_INPUTS) {

        const input =
            document.getElementById(day.id);

        if (input) {

            input.value =
                Number(course[day.field] ?? 0);

        }

    }

    updateCourseScheduleSummary();

}


// ------------------------------------------------------------
// RESUMEN DE HORAS DISTRIBUIDAS
// ------------------------------------------------------------

function updateCourseScheduleSummary() {

    const summary =
        document.getElementById(
            "resumenDistribucionCurso"
        );

    const weeklyInput =
        document.getElementById(
            "horasSemanales"
        );

    if (!summary || !weeklyInput) {
        return;
    }

    const required =
        Number(weeklyInput.value);

    const schedule =
        getCourseScheduleValues();

    const distributed =
        Object.values(schedule).reduce(
            (total, hours) => total + hours,
            0
        );

    if (!Number.isInteger(required) || required < 1) {

        summary.textContent =
            "Primero indique las horas semanales requeridas.";

        return;

    }

    summary.textContent =
        `Horas distribuidas: ${distributed} de ${required}. ` +
        (
            distributed === required
                ? "Distribución completa."
                : `Faltan ${required - distributed} horas o hay horas excedentes.`
        );

}


// ------------------------------------------------------------
// CARGAR PLANTILLAS DISPONIBLES
// ------------------------------------------------------------

function populateCourseTemplates(
    horasSemanales,
    selectedTemplateId = ""
) {

    const select =
        document.getElementById(
            "plantillaCurso"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const customOption =
        document.createElement("option");

    customOption.value = "";

    customOption.textContent =
        "Distribución personalizada";

    select.appendChild(customOption);

    const hours = Number(horasSemanales);

    if (
        !Number.isInteger(hours) ||
        hours < 1 ||
        hours > 10
    ) {

        updateCourseScheduleSummary();
        return;

    }

    const templates =
        (appState.plantillas || []).filter(
            plantilla =>
                Number(plantilla.horasSemanales) === hours &&
                Number(plantilla.activa) === 1
        );

    for (const plantilla of templates) {

        const option =
            document.createElement("option");

        option.value =
            String(plantilla.id);

        option.textContent =
            plantilla.nombre;

        select.appendChild(option);

    }

    const requestedId =
        selectedTemplateId == null
            ? ""
            : String(selectedTemplateId);

    if (
        [...select.options].some(
            option => option.value === requestedId
        )
    ) {

        select.value = requestedId;

    } else {

        select.value = "";

    }

}


// ------------------------------------------------------------
// APLICAR UNA PLANTILLA
// ------------------------------------------------------------

function applyCourseTemplate(templateId) {

    const template =
        (appState.plantillas || []).find(
            item =>
                String(item.id) === String(templateId)
        );

    if (!template) {
        return;
    }

    setCourseScheduleValues(template);

}


// ------------------------------------------------------------
// BLOQUEAR CONTROLES DE DISTRIBUCIÓN
// ------------------------------------------------------------

function setCourseScheduleControlsDisabled(disabled) {

    const controlIds = [
        "horasSemanales",
        "plantillaCurso",
        ...COURSE_DAY_INPUTS.map(
            day => day.id
        )
    ];

    for (const id of controlIds) {

        const control =
            document.getElementById(id);

        if (control) {
            control.disabled = disabled;
        }

    }

}

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
                    colspan="5"
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
                                ${
                                    curso.horasSemanales != null
                                        ? `${esc(curso.horasSemanales)} h/semana`
                                        : "Pendiente de configurar"
                                }
                            </td>

                            <td>
                                ${esc(
                                    cursoAcademia
                                        ? cursoAcademia.nombre
                                        : "Sin academia"
                                )}
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
        "horasSemanales"
    ).value =
        curso.horasSemanales ?? "";

    // Cargar plantillas correspondientes a las horas semanales.

    populateCourseTemplates(
        curso.horasSemanales,
        curso.plantillaId
    );


    // Restaurar la distribución guardada.

    setCourseScheduleValues(curso);


    // Comprobar si el curso tiene asignaciones.

    const hasAssignments =
        appState.asignaciones.some(
            asignacion =>
                String(asignacion.cursoId) ===
                String(curso.id)
        );


    // Si tiene asignaciones, bloquear la distribución.

    setCourseScheduleControlsDisabled(
        hasAssignments
    );

    const scheduleWarning =
        document.getElementById(
            "avisoDistribucionBloqueada"
        );

    if (scheduleWarning) {
        scheduleWarning.hidden = !hasAssignments;
    }

    document.getElementById(
        "academiaCurso"
    ).value =
        curso.academiaId || "";

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

    setCourseScheduleControlsDisabled(false);

    const scheduleWarning =
        document.getElementById(
            "avisoDistribucionBloqueada"
        );

    if (scheduleWarning) {
        scheduleWarning.hidden = true;
    }

    populateCourseTemplates("");

    updateCourseScheduleSummary();

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
    // INICIALIZAR CONTROLES DE DISTRIBUCIÓN
    // --------------------------------------------------------

    const weeklyInput =
        document.getElementById(
            "horasSemanales"
        );

    const templateSelect =
        document.getElementById(
            "plantillaCurso"
        );


    // Cargar opciones iniciales.

    populateCourseTemplates(
        weeklyInput?.value
    );


    // Cuando cambien las horas semanales,
    // actualizar plantillas y reiniciar distribución.

    weeklyInput?.addEventListener(
        "change",
        () => {

            populateCourseTemplates(
                weeklyInput.value
            );

            if (templateSelect) {
                templateSelect.value = "";
            }

            setCourseScheduleValues({
                horasLunes: 0,
                horasMartes: 0,
                horasMiercoles: 0,
                horasJueves: 0,
                horasViernes: 0
            });

        }
    );


    // Aplicar la plantilla seleccionada.

    templateSelect?.addEventListener(
        "change",
        () => {

            const templateId =
                templateSelect.value;

            if (templateId) {
                applyCourseTemplate(templateId);
            }

            updateCourseScheduleSummary();

        }
    );


    // Actualizar el resumen cuando cambien los días.

    for (const day of COURSE_DAY_INPUTS) {

        document
            .getElementById(day.id)
            ?.addEventListener(
                "input",
                updateCourseScheduleSummary
            );

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

            const horasSemanales =
                Number(
                    document.getElementById(
                        "horasSemanales"
                    ).value
                );

            // ------------------------------------------------
            // VALIDACIÓN
            // ------------------------------------------------

            if (
                !nombre ||
                !academiaId
            ) {

                alert(
                    "Complete los campos obligatorios del curso."
                );

                return;
            }

            if (
                !Number.isInteger(horasSemanales) ||
                horasSemanales < 1
            ) {
                alert(
                    "Las horas semanales deben ser un número entero mayor que cero."
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

                    horasSemanales,

                    plantillaId,

                    horasLunes:
                        schedule.horasLunes,

                    horasMartes:
                        schedule.horasMartes,

                    horasMiercoles:
                        schedule.horasMiercoles,

                    horasJueves:
                        schedule.horasJueves,

                    horasViernes:
                        schedule.horasViernes

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

                cancelCourseEdit();

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
}

// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.editCourse =
    editCourse;

window.removeCourse =
    removeCourse;