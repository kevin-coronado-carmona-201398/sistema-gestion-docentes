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
    initSelects
} from "./selects.js";

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
                !academiaId
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
                        String(academiaId)

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

                form.reset();


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

}

// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.editCourse =
    editCourse;

window.removeCourse =
    removeCourse;