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

let selectedCourseId = null;

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
    console.log("BUSCANDO DOMINIO:");
    console.log("docenteId:", docenteId);
    console.log("cursoId:", cursoId);

    const relation = domain(
        appState,
        docenteId,
        cursoId
    );

    console.log("RELACIÓN ENCONTRADA:", relation);

    if (!relation) {
        return null;
    }

    const nivel = Number(relation.nivel);

    console.log("NIVEL:", nivel);

    return Number.isFinite(nivel)
        ? nivel
        : null;
}

// ============================================================
// RENDERIZAR DOCENTES CANDIDATOS
// ============================================================

export function renderCandidates() {

    const tableBody =
        document.getElementById(
            "tbodyCandidatos"
        );


    if (!tableBody) {
        return;
    }


    const curso =
        getSelectedCourse();


    if (!curso) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="w3-center"
                >
                    Seleccione un curso para mostrar candidatos.
                </td>

            </tr>

        `;

        return;
    }

    const orderSelect =
        document.getElementById(
            "ordenDominio"
        );

    const order =
        orderSelect
            ? orderSelect.value
            : "desc";

    // --------------------------------------------------------
    // CANDIDATOS DE LA MISMA ACADEMIA
    // --------------------------------------------------------

    const candidates =
        appState.docentes
            .filter(
                docente =>
                    String(
                        docente.academiaId
                    ) ===
                    String(
                        curso.academiaId
                    )
            )
            .map(
                docente => ({

                    docente,
                    nivel:
                        getDomainLevel(
                            docente.id,
                            curso.id
                        ),

                    isAssigned:
                        assigned(
                            appState,
                            curso.id,
                            docente.id
                        )

                })
            );

    // --------------------------------------------------------
    // ORDENAR POR DOMINIO
    // --------------------------------------------------------

    candidates.sort(
        (a, b) => {

            const nivelA =
                a.nivel === null
                    ? -1
                    : a.nivel;


            const nivelB =
                b.nivel === null
                    ? -1
                    : b.nivel;


            if (order === "asc") {

                return nivelA - nivelB;

            }


            return nivelB - nivelA;

        }
    );

    if (candidates.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="w3-center"
                >
                    No hay docentes de la misma academia disponibles como candidatos.
                </td>

            </tr>

        `;

        return;
    }

    tableBody.innerHTML =
        candidates
            .map(
                candidate => {

                    const docente =
                        candidate.docente;


                    const docenteAcademia =
                        academy(
                            appState,
                            docente.academiaId
                        );


                    const nivel =
                        candidate.nivel === null
                            ? "Sin dominio"
                            : candidate.nivel;


                    const estado =
                        candidate.isAssigned
                            ? "Asignado"
                            : "Disponible";


                    const action =
                        candidate.isAssigned

                            ? `

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-red"
                                    onclick='unassignCourse(${JSON.stringify(curso.id)}, ${JSON.stringify(docente.id)})'
                                >
                                    Desasignar
                                </button>

                            `

                            : `

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-green"
                                    onclick='assignCourse(${JSON.stringify(curso.id)}, ${JSON.stringify(docente.id)})'
                                >
                                    Asignar
                                </button>

                            `;


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    docente.nombre
                                )}
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
                                    nivel
                                )}
                            </td>

                            <td>
                                ${estado}
                            </td>

                            <td>
                                ${action}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}

// ============================================================
// RENDERIZAR DOCENTES ASIGNADOS
// ============================================================

export function renderAssigned() {

    const tableBody =
        document.getElementById(
            "tbodyAsignados"
        );

    if (!tableBody) {
        return;
    }

    const curso =
        getSelectedCourse();


    if (!curso) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="w3-center"
                >
                    No hay asignaciones para mostrar.
                </td>

            </tr>

        `;

        return;
    }

    const relations =
        appState.asignaciones.filter(
            asignacion =>
                String(
                    asignacion.cursoId
                ) ===
                String(curso.id)
        );


    if (relations.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="w3-center"
                >
                    No hay docentes asignados a este curso.
                </td>

            </tr>

        `;

        return;
    }

    tableBody.innerHTML =
        relations
            .map(
                relation => {

                    const docente =
                        appState.docentes.find(
                            item =>
                                String(item.id) ===
                                String(
                                    relation.docenteId
                                )
                        );


                    if (!docente) {
                        return "";
                    }


                    const docenteAcademia =
                        academy(
                            appState,
                            docente.academiaId
                        );


                    const nivel =
                        getDomainLevel(
                            docente.id,
                            curso.id
                        );


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    docente.nombre
                                )}
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
                                    nivel === null
                                        ? "Sin dominio"
                                        : nivel
                                )}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-red"
                                    onclick='unassignCourse(${JSON.stringify(curso.id)}, ${JSON.stringify(docente.id)})'
                                >
                                    Desasignar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
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

    const courseSelect =
        document.getElementById(
            "cursoAsignacion"
        );

    const orderSelect =
        document.getElementById(
            "ordenDominio"
        );

    courseSelect?.addEventListener(
        "change",
        () => {

            selectedCourseId =
                courseSelect.value || null;


            renderAssignmentPage();

        }
    );

    orderSelect?.addEventListener(
        "change",
        () => {

            renderCandidates();

        }
    );

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