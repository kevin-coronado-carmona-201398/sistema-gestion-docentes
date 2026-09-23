import {
    appState,
    editState
} from "./state.js";


import {
    createTeacher,
    updateTeacher,
    deleteTeacher
} from "./api.js";


import {
    esc,
    academy,
    assignedTeachers,
    lastDegree
} from "./utils.js";


import {
    initSelects
} from "./selects.js";


// ============================================================
// RENDERIZAR DOCENTES
// ============================================================

export function renderTeachers() {

    const tableBody =
        document.getElementById(
            "tbodyDocentes"
        );


    if (!tableBody) {
        return;
    }


    if (appState.docentes.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="w3-center"
                >
                    No hay docentes registrados.
                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        appState.docentes
            .map(
                docente => {

                    const docenteAcademia =
                        academy(
                            appState,
                            docente.academiaId
                        );


                    const cursosAsignados =
                        appState.asignaciones
                            .filter(
                                asignacion =>
                                    String(
                                        asignacion.docenteId
                                    ) ===
                                    String(
                                        docente.id
                                    )
                            )
                            .map(
                                asignacion => {

                                    const curso =
                                        appState.cursos.find(
                                            item =>
                                                String(
                                                    item.id
                                                ) ===
                                                String(
                                                    asignacion.cursoId
                                                )
                                        );

                                    return curso
                                        ? curso.nombre
                                        : null;

                                }
                            )
                            .filter(Boolean);


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    docente.numeroEmpleado
                                )}
                            </td>

                            <td>
                                ${esc(
                                    docente.nombre
                                )}
                            </td>

                            <td>
                                ${esc(
                                    lastDegree(
                                        docente
                                    )
                                )}
                            </td>

                            <td>
                                ${esc(
                                    docente.especialidad || ""
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
                                ${
                                    cursosAsignados.length > 0
                                        ? cursosAsignados
                                            .map(
                                                curso =>
                                                    esc(curso)
                                            )
                                            .join(", ")
                                        : "Sin materias"
                                }
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-blue w3-margin-right"
                                    onclick='editTeacher(${JSON.stringify(docente.id)})'
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-red"
                                    onclick='removeTeacher(${JSON.stringify(docente.id)})'
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
// EDITAR DOCENTE
// ============================================================

export function editTeacher(id) {

    const docente =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!docente) {
        return;
    }


    const confirmed =
        confirm(
            `¿Desea editar al docente "${docente.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    const form =
        document.getElementById(
            "formDocente"
        );


    if (!form) {
        return;
    }


    document.getElementById(
        "numeroEmpleado"
    ).value =
        docente.numeroEmpleado || "";


    document.getElementById(
        "nombreDocente"
    ).value =
        docente.nombre || "";


    document.getElementById(
        "licenciatura"
    ).value =
        docente.licenciatura || "";


    document.getElementById(
        "maestria"
    ).value =
        docente.maestria || "";


    document.getElementById(
        "doctorado"
    ).value =
        docente.doctorado || "";


    document.getElementById(
        "especialidad"
    ).value =
        docente.especialidad || "";


    document.getElementById(
        "academiaDocente"
    ).value =
        docente.academiaId || "";


    document.getElementById(
        "sni"
    ).value =
        docente.sni || "No";


    document.getElementById(
        "nivelSni"
    ).value =
        docente.nivelSni || "";
    
    const sniSelect =
    document.getElementById("sni");

    const nivelSniSelect =
        document.getElementById("nivelSni");

    if (sniSelect && nivelSniSelect) {

        const sniValue =
            sniSelect.value
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        nivelSniSelect.disabled =
            sniValue !== "si";

    }


    document.getElementById(
        "prodep"
    ).value =
        docente.prodep || "No";


    document.getElementById(
        "certificaciones"
    ).value =
        docente.certificaciones || "";


    editState.teacherId =
        String(docente.id);


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Actualizar docente";

    }


    const clearButton =
        document.getElementById(
            "limpiarDocente"
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

export function cancelTeacherEdit() {

    editState.teacherId = null;


    const form =
        document.getElementById(
            "formDocente"
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
            "Registrar docente";

    }


    const clearButton =
        document.getElementById(
            "limpiarDocente"
        );


    if (clearButton) {

        clearButton.textContent =
            "Limpiar";

    }

}


// ============================================================
// ELIMINAR DOCENTE
// ============================================================

export async function removeTeacher(id) {

    const docente =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!docente) {
        return;
    }


    const hasDomains =
        appState.dominios.some(
            dominio =>
                String(dominio.docenteId) ===
                String(docente.id)
        );


    const hasAssignments =
        appState.asignaciones.some(
            asignacion =>
                String(asignacion.docenteId) ===
                String(docente.id)
        );


    if (
        hasDomains ||
        hasAssignments
    ) {

        alert(
            "No se puede eliminar el docente porque tiene dominios o asignaciones asociadas."
        );

        return;
    }


    const confirmed =
        confirm(
            `¿Está seguro de eliminar al docente "${docente.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteTeacher(
            docente.id
        );


        appState.docentes =
            appState.docentes.filter(
                item =>
                    String(item.id) !==
                    String(docente.id)
            );


        if (
            editState.teacherId &&
            String(editState.teacherId) ===
                String(docente.id)
        ) {

            editState.teacherId = null;

        }


        initSelects();

        renderTeachers();


        alert(
            "Docente eliminado correctamente."
        );


    } catch (error) {

        console.error(
            "Error al eliminar docente:",
            error
        );


        alert(
            "No se pudo eliminar el docente.\n\n" +
            error.message
        );

    }

}


// ============================================================
// FORMULARIO DE DOCENTE
// ============================================================

export function bindTeacherEvents() {

    const form =
        document.getElementById(
            "formDocente"
        );
    
    console.log("bindTeacherEvents ejecutándose");

    if (!form) {
        return;
    }

    // --------------------------------------------------------
    // HABILITAR / DESHABILITAR NIVEL SNI
    // --------------------------------------------------------

    const sniSelect =
        document.getElementById("sni");

    const nivelSniSelect =
        document.getElementById("nivelSni");

    function updateSniLevelState() {

        if (!sniSelect || !nivelSniSelect) {
            return;
        }

        const sniValue =
            sniSelect.value
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");


        console.log(
            "Valor SNI:",
            sniValue
        );

        console.log(
            "Antes de cambiar disabled:",
            nivelSniSelect.disabled
        );


        if (sniValue === "si") {

            nivelSniSelect.disabled = false;

        } else {

            nivelSniSelect.disabled = true;
            nivelSniSelect.value = "";

        }


        console.log(
            "Después de cambiar disabled:",
            nivelSniSelect.disabled
        );

    }


    sniSelect?.addEventListener(
        "change",
        updateSniLevelState
    );

    updateSniLevelState();

    
    // --------------------------------------------------------
    // FORMULARIO
    // --------------------------------------------------------

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const numeroEmpleado =
                document
                    .getElementById(
                        "numeroEmpleado"
                    )
                    .value
                    .trim();


            const nombre =
                document
                    .getElementById(
                        "nombreDocente"
                    )
                    .value
                    .trim();


            const licenciatura =
                document
                    .getElementById(
                        "licenciatura"
                    )
                    .value;


            const maestria =
                document
                    .getElementById(
                        "maestria"
                    )
                    .value;


            const doctorado =
                document
                    .getElementById(
                        "doctorado"
                    )
                    .value;


            const especialidad =
                document
                    .getElementById(
                        "especialidad"
                    )
                    .value
                    .trim();


            const academiaId =
                document
                    .getElementById(
                        "academiaDocente"
                    )
                    .value;


            const sni =
                document
                    .getElementById(
                        "sni"
                    )
                    .value;


            const nivelSni =
                document
                    .getElementById(
                        "nivelSni"
                    )
                    .value;


            const prodep =
                document
                    .getElementById(
                        "prodep"
                    )
                    .value;


            const certificaciones =
                document
                    .getElementById(
                        "certificaciones"
                    )
                    .value
                    .trim();


            // ------------------------------------------------
            // VALIDACIONES
            // ------------------------------------------------

            if (
                !numeroEmpleado ||
                !nombre ||
                !academiaId
            ) {

                alert(
                    "Complete los campos obligatorios del docente."
                );

                return;
            }


            const wasEditing =
                Boolean(
                    editState.teacherId
                );


            // ------------------------------------------------
            // VALIDAR NÚMERO DE EMPLEADO
            // ------------------------------------------------

            const employeeExists =
                appState.docentes.some(
                    docente =>
                        String(docente.id) !==
                            String(
                                editState.teacherId
                            ) &&
                        String(
                            docente.numeroEmpleado
                        ).toLowerCase() ===
                            numeroEmpleado.toLowerCase()
                );


            if (employeeExists) {

                alert(
                    "El número de empleado ya existe."
                );

                return;
            }


            // ------------------------------------------------
            // VALIDAR CAMBIO DE ACADEMIA
            // ------------------------------------------------

            if (wasEditing) {

                const docenteActual =
                    appState.docentes.find(
                        docente =>
                            String(docente.id) ===
                            String(
                                editState.teacherId
                            )
                    );


                if (
                    docenteActual &&
                    String(
                        docenteActual.academiaId
                    ) !==
                    String(academiaId)
                ) {

                    const hasDomains =
                        appState.dominios.some(
                            dominio =>
                                String(
                                    dominio.docenteId
                                ) ===
                                String(
                                    docenteActual.id
                                )
                        );


                    const hasAssignments =
                        appState.asignaciones.some(
                            asignacion =>
                                String(
                                    asignacion.docenteId
                                ) ===
                                String(
                                    docenteActual.id
                                )
                        );


                    if (
                        hasDomains ||
                        hasAssignments
                    ) {

                        alert(
                            "No se puede cambiar de academia a un docente que tiene dominios o asignaciones asociadas."
                        );

                        return;
                    }

                }

            }


            try {

                const teacherData = {

                    numeroEmpleado,
                    nombre,
                    licenciatura,
                    maestria,
                    doctorado,
                    especialidad,
                    academiaId: String(
                        academiaId
                    ),
                    sni,
                    nivelSni,
                    prodep,
                    certificaciones

                };


                // ============================================
                // ACTUALIZAR
                // ============================================

                if (wasEditing) {

                    const updatedTeacher =
                        await updateTeacher(
                            editState.teacherId,
                            teacherData
                        );


                    updatedTeacher.id =
                        String(
                            updatedTeacher.id
                        );


                    updatedTeacher.academiaId =
                        String(
                            updatedTeacher.academiaId
                        );


                    const index =
                        appState.docentes.findIndex(
                            item =>
                                String(item.id) ===
                                String(
                                    editState.teacherId
                                )
                        );


                    if (index !== -1) {

                        appState.docentes[index] =
                            updatedTeacher;

                    }


                    editState.teacherId =
                        null;


                    console.log(
                        "Docente actualizado:",
                        updatedTeacher
                    );

                }

                // ============================================
                // CREAR
                // ============================================

                else {

                    const newTeacher =
                        await createTeacher(
                            teacherData
                        );


                    newTeacher.id =
                        String(
                            newTeacher.id
                        );


                    newTeacher.academiaId =
                        String(
                            newTeacher.academiaId
                        );


                    appState.docentes.push(
                        newTeacher
                    );


                    console.log(
                        "Docente creado:",
                        newTeacher
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
                        "Registrar docente";

                }


                const clearButton =
                    document.getElementById(
                        "limpiarDocente"
                    );


                if (clearButton) {

                    clearButton.textContent =
                        "Limpiar";

                }


                initSelects();

                renderTeachers();


                alert(
                    wasEditing
                        ? "Docente actualizado correctamente."
                        : "Docente registrado correctamente."
                );


            } catch (error) {

                console.error(
                    "Error al guardar docente:",
                    error
                );


                alert(
                    "No se pudo guardar el docente.\n\n" +
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
            "limpiarDocente"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    editState.teacherId
                ) {

                    event.preventDefault();

                    cancelTeacherEdit();

                }

            }
        );

}


// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.editTeacher =
    editTeacher;

window.removeTeacher =
    removeTeacher;