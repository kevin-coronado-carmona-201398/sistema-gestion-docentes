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

import {
    initSelects
} from "./selects.js";

// ============================================================
// ESTADO LOCAL DEL MÓDULO
// ============================================================

let selectedAcademyId = null;
let selectedCourseId = null;

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


    if (!academySelect || !courseSelect) {
        return;
    }


    const academyId =
        academySelect.value;


    courseSelect.innerHTML = `

        <option value="">
            Seleccionar curso...
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
                curso =>
                    String(curso.academiaId) ===
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
                No hay cursos registrados para esta academia.
            </option>

        `;

        courseSelect.disabled = true;

        return;
    }


    courses.forEach(curso => {

        const option =
            document.createElement("option");

        option.value =
            String(curso.id);

        option.textContent =
            curso.nombre;

        courseSelect.appendChild(
            option
        );

    });


    courseSelect.disabled = false;

}

// ============================================================
// OBTENER CURSO SELECCIONADO
// ============================================================

function getSelectedCourse() {

    if (!selectedCourseId) {
        return null;
    }


    return appState.cursos.find(
        curso =>
            String(curso.id) ===
            String(selectedCourseId)
    );

}

// ============================================================
// MOSTRAR INFORMACIÓN DEL CURSO
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

    const curso =
        getSelectedCourse();

    if (!curso) {

        nombreElement.textContent = "—";
        academiaElement.textContent = "—";
        estadoElement.textContent = "—";
        docentesElement.textContent = "—";

        return;
    }

    const cursoAcademia =
        academy(
            appState,
            curso.academiaId
        );

    const assignedTeacherIds =
        appState.asignaciones
            .filter(
                asignacion =>
                    String(
                        asignacion.cursoId
                    ) ===
                    String(curso.id)
            )
            .map(
                asignacion =>
                    String(
                        asignacion.docenteId
                    )
            );


    const assignedNames =
        appState.docentes
            .filter(
                docente =>
                    assignedTeacherIds.includes(
                        String(docente.id)
                    )
            )
            .map(
                docente =>
                    docente.nombre
            );


    nombreElement.textContent =
        curso.nombre || "—";


    academiaElement.textContent =
        cursoAcademia
            ? cursoAcademia.nombre
            : "Sin academia";


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

function getDomainLevel(docenteId, cursoId) {

    const relation = domain(
        appState,
        docenteId,
        cursoId
    );

    if (!relation) {
        return null;
    }

    const nivel = Number(relation.nivel);

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

                <td
                    colspan="12"
                    class="w3-center"
                >
                    Seleccione una academia y un curso para mostrar candidatos.
                </td>

            </tr>

        `;

        return;
    }


    let candidates =
        appState.docentes.filter(
            docente =>
                String(docente.academiaId) ===
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

                <td
                    colspan="12"
                    class="w3-center"
                >
                    No hay docentes en esta academia.
                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        candidates
            .map(docente => {

                const docenteAcademia =
                    academy(
                        appState,
                        docente.academiaId
                    );


                const domainLevel =
                    getDomainLevel(
                        docente.id,
                        course.id
                    );


                const isAssigned =
                    assigned(
                        appState,
                        course.id,
                        docente.id
                    );


                const sni =
                    String(
                        docente.sni || "no"
                    )
                        .trim()
                        .toLowerCase();


                const hasSni =
                    sni === "si";


                const prodep =
                    String(
                        docente.prodep || "no"
                    )
                        .trim()
                        .toLowerCase();


                const certificationText =
                    docente.certificaciones
                        ? esc(
                            docente.certificaciones
                        ).replace(
                            /\n/g,
                            "<br>"
                        )
                        : "—";


                return `

                    <tr>

                        <td>
                            ${esc(
                                docente.nombre
                            )}
                            <br>
                            <span class="w3-small">
                                N.º ${esc(
                                    docente.numeroEmpleado
                                )}
                            </span>
                        </td>


                        <td>
                            ${esc(
                                docenteAcademia
                                    ? docenteAcademia.nombre
                                    : "Sin academia"
                            )}
                        </td>


                        <td>
                            ${esc(
                                docente.nivelAcademico || "—"
                            )}
                        </td>


                        <td>
                            ${esc(
                                docente.tituloAcademico || "—"
                            )}
                        </td>


                        <td>
                            ${esc(
                                docente.especialidad || "—"
                            )}
                        </td>


                        <td>
                            ${
                                prodep === "si"
                                    ? "Sí"
                                    : "No"
                            }
                        </td>


                        <td>
                            ${
                                hasSni
                                    ? "Sí"
                                    : "No"
                            }
                        </td>


                        <td>
                            ${
                                hasSni
                                    ? esc(
                                        docente.nivelSni || "Sin nivel"
                                    )
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
                            ${
                                isAssigned
                                    ? "Asignado"
                                    : "Disponible"
                            }
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
                                                ${JSON.stringify(docente.id)}
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
                                                ${JSON.stringify(docente.id)}
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

    if (!course) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="12"
                    class="w3-center"
                >
                    Seleccione un curso para mostrar los docentes asignados.
                </td>
            </tr>
        `;

        return;
    }

    // --------------------------------------------------------
    // Obtener asignaciones del curso seleccionado
    // --------------------------------------------------------

    const assignments =
        appState.asignaciones.filter(
            asignacion =>
                String(asignacion.cursoId) ===
                String(course.id)
        );

    // --------------------------------------------------------
    // Obtener los docentes asociados a esas asignaciones
    // --------------------------------------------------------

    const teachers =
        assignments
            .map(asignacion =>
                appState.docentes.find(
                    docente =>
                        String(docente.id) ===
                        String(asignacion.docenteId)
                )
            )
            .filter(Boolean);

    if (teachers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="12"
                    class="w3-center"
                >
                    No hay docentes asignados a este curso.
                </td>
            </tr>
        `;

        return;
    }

    // --------------------------------------------------------
    // Renderizar tabla
    // --------------------------------------------------------

    tableBody.innerHTML =
        teachers
            .map(docente => {

                const docenteAcademia =
                    academy(
                        appState,
                        docente.academiaId
                    );

                const domainLevel =
                    getDomainLevel(
                        docente.id,
                        course.id
                    );

                const sni =
                    String(
                        docente.sni || "no"
                    )
                        .trim()
                        .toLowerCase();

                const hasSni =
                    sni === "si";

                const prodep =
                    String(
                        docente.prodep || "no"
                    )
                        .trim()
                        .toLowerCase();

                const certificationText =
                    docente.certificaciones
                        ? esc(
                            docente.certificaciones
                        ).replace(
                            /\n/g,
                            "<br>"
                        )
                        : "—";

                return `
                    <tr>

                        <td>
                            ${esc(
                                docente.nombre
                            )}
                            <br>
                            <span class="w3-small">
                                N.º ${esc(
                                    docente.numeroEmpleado
                                )}
                            </span>
                        </td>

                        <td>
                            ${esc(
                                docenteAcademia
                                    ? docenteAcademia.nombre
                                    : "Sin academia"
                            )}
                        </td>

                        <td>
                            ${esc(
                                docente.nivelAcademico || "—"
                            )}
                        </td>

                        <td>
                            ${esc(
                                docente.tituloAcademico || "—"
                            )}
                        </td>

                        <td>
                            ${esc(
                                docente.especialidad || "—"
                            )}
                        </td>

                        <td>
                            ${
                                prodep === "si"
                                    ? "Sí"
                                    : "No"
                            }
                        </td>

                        <td>
                            ${
                                hasSni
                                    ? "Sí"
                                    : "No"
                            }
                        </td>

                        <td>
                            ${
                                hasSni
                                    ? esc(
                                        docente.nivelSni || "Sin nivel"
                                    )
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
                            Asignado
                        </td>

                        <td>

                            <button
                                type="button"
                                class="w3-button w3-small w3-red"
                                onclick='unassignCourse(
                                    ${JSON.stringify(course.id)},
                                    ${JSON.stringify(docente.id)}
                                )'
                            >
                                Desasignar
                            </button>

                        </td>

                    </tr>
                `;

            })
            .join("");
}

// ============================================================
// RENDERIZAR TODA LA INFORMACIÓN
// ============================================================

function renderAssignmentPage() {

    renderCourseDetails();
    renderCandidates();
    renderAssigned();

}

// ============================================================
// VERIFICAR CONFLICTOS DE HORARIO
// ============================================================

function findScheduleConflict(
    docenteId,
    cursoId
) {

    const cursoActual =
        appState.cursos.find(
            curso =>
                String(curso.id) ===
                String(cursoId)
        );


    if (!cursoActual) {
        return null;
    }


    const currentScheduleIds =
        Array.isArray(
            cursoActual.horarioIds
        )
            ? cursoActual.horarioIds.map(
                id => String(id)
            )
            : [];


    if (currentScheduleIds.length === 0) {
        return null;
    }


    const assignments =
        appState.asignaciones.filter(
            asignacion =>
                String(
                    asignacion.docenteId
                ) ===
                    String(docenteId) &&
                String(
                    asignacion.cursoId
                ) !==
                    String(cursoId)
        );


    for (
        const assignment
        of assignments
    ) {

        const otherCourse =
            appState.cursos.find(
                curso =>
                    String(curso.id) ===
                    String(
                        assignment.cursoId
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
            currentScheduleIds.find(
                scheduleId =>
                    otherScheduleIds.includes(
                        scheduleId
                    )
            );


        if (
            conflictingScheduleId
        ) {

            const docente =
                appState.docentes.find(
                    item =>
                        String(item.id) ===
                        String(docenteId)
                );


            const horario =
                appState.horarios.find(
                    item =>
                        String(item.id) ===
                        String(
                            conflictingScheduleId
                        )
                );


            return {
                docente,
                otherCourse,
                horario
            };

        }

    }


    return null;

}

// ============================================================
// ASIGNAR DOCENTE A CURSO
// ============================================================

export async function assignCourse(
    courseId,
    teacherId
) {

    const curso =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(courseId)
        );

    const docente =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(teacherId)
        );

    if (
        !curso ||
        !docente
    ) {
        return;
    }

    // --------------------------------------------------------
    // VALIDAR MISMA ACADEMIA
    // --------------------------------------------------------

    if (
        String(curso.academiaId) !==
        String(docente.academiaId)
    ) {

        alert(
            "El docente y el curso deben pertenecer a la misma academia."
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
            "El docente ya está asignado a este curso."
        );

        return;
    }

    // --------------------------------------------------------
// VALIDAR CONFLICTO DE HORARIO
// --------------------------------------------------------

const scheduleConflict =
    findScheduleConflict(
        docente.id,
        curso.id
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
            "No se puede asignar el docente porque ya tiene otro curso en el mismo horario.\n\n" +
            `Docente: ${docenteNombre}\n` +
            `Curso en conflicto: ${cursoNombre}\n` +
            `Horario: ${horarioTexto}`
        );


        return;

    }

    try {
                
        const newAssignment =
            await createAssignment(
                {
                    cursoId:
                        String(courseId),

                    docenteId:
                        String(teacherId)
                }
            );


        newAssignment.id =
            String(
                newAssignment.id
            );


        newAssignment.cursoId =
            String(
                newAssignment.cursoId
            );


        newAssignment.docenteId =
            String(
                newAssignment.docenteId
            );


        appState.asignaciones.push(
            newAssignment
        );

        renderAssignmentPage();

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
                String(
                    item.cursoId
                ) ===
                String(courseId) &&
                String(
                    item.docenteId
                ) ===
                String(teacherId)
        );

    if (!assignment) {
        return;
    }

    const docente =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(teacherId)
        );

    const curso =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(courseId)
        );

    const confirmed =
        confirm(
            `¿Está seguro de desasignar a "${docente?.nombre || "este docente"}" del curso "${curso?.nombre || "este curso"}"?`
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

    // ============================================================
    // CARGAR ACADEMIAS PARA ASIGNACIÓN
    // ============================================================

    const academySelect =
        document.getElementById(
            "academiaAsignacion"
        );


    const courseSelect =
        document.getElementById(
            "cursoAsignacion"
        );


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
            .forEach(academia => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(academia.id);

                option.textContent =
                    academia.nombre;

                academySelect.appendChild(
                    option
                );

            });

    }


    // ============================================================
    // EVENTOS DE SELECCIÓN
    // ============================================================

    if (academySelect) {

        academySelect.addEventListener(
            "change",
            () => {

                selectedAcademyId =
                    academySelect.value || null;

                selectedCourseId = null;

                fillAssignmentCourses();

                renderAssignmentPage();

            }
        );

    }


    if (courseSelect) {

        courseSelect.addEventListener(
            "change",
            () => {

                selectedCourseId =
                    courseSelect.value || null;

                renderAssignmentPage();

            }
        );

    }

    // --------------------------------------------------------
    // ACTUALIZAR CANDIDATOS DESPUÉS DE CAMBIAR DOMINIO
    // --------------------------------------------------------

    document.addEventListener(
        "dominioActualizado",
        () => {

            renderAssignmentPage();

        }
    );

    // --------------------------------------------------------
    // RENDER INICIAL
    // --------------------------------------------------------

    selectedCourseId =
        courseSelect?.value || null;


    renderAssignmentPage();

}

// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.assignCourse =
    assignCourse;

window.unassignCourse =
    unassignCourse;