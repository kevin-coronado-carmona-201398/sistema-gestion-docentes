import {
    appState,
    editState
} from "./state.js";


import {
    createAcademy,
    updateAcademy,
    deleteAcademy
} from "./api.js";


import {
    esc
} from "./utils.js";


import {
    initSelects
} from "./selects.js";


// ============================================================
// RENDERIZAR ACADEMIAS
// ============================================================

export function renderAcademies() {

    const tableBody =
        document.getElementById(
            "tbodyAcademias"
        );


    if (!tableBody) {
        return;
    }


    if (
        appState.academias.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="w3-center"
                >
                    No hay academias registradas.
                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        appState.academias
            .map(
                academia => {

                    const teachersCount =
                        appState.docentes.filter(
                            docente =>
                                String(
                                    docente.academiaId
                                ) ===
                                String(
                                    academia.id
                                )
                        ).length;


                    const coursesCount =
                        appState.cursos.filter(
                            curso =>
                                String(
                                    curso.academiaId
                                ) ===
                                String(
                                    academia.id
                                )
                        ).length;


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    academia.clave
                                )}
                            </td>

                            <td>
                                ${esc(
                                    academia.nombre
                                )}
                            </td>

                            <td>
                                ${esc(
                                    academia.descripcion
                                )}
                            </td>

                            <td>
                                ${teachersCount}
                            </td>

                            <td>
                                ${coursesCount}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-blue w3-margin-right"
                                    onclick='editAcademy(${JSON.stringify(academia.id)})'
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    class="w3-button w3-small w3-red"
                                    onclick='removeAcademy(${JSON.stringify(academia.id)})'
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
// EDITAR ACADEMIA
// ============================================================

export function editAcademy(id) {

    const academia =
        appState.academias.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!academia) {
        return;
    }


    const confirmed =
        confirm(
            `¿Desea editar la academia "${academia.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    const form =
        document.getElementById(
            "formAcademia"
        );


    if (!form) {
        return;
    }


    document.getElementById(
        "claveAcademia"
    ).value =
        academia.clave || "";


    document.getElementById(
        "nombreAcademia"
    ).value =
        academia.nombre || "";


    document.getElementById(
        "descripcionAcademia"
    ).value =
        academia.descripcion || "";


    editState.academyId =
        String(academia.id);


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Actualizar academia";

    }


    const clearButton =
        document.getElementById(
            "limpiarAcademia"
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
// CANCELAR EDICIÓN DE ACADEMIA
// ============================================================

export function cancelAcademyEdit() {

    editState.academyId = null;


    const form =
        document.getElementById(
            "formAcademia"
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
            "Registrar academia";

    }


    const clearButton =
        document.getElementById(
            "limpiarAcademia"
        );


    if (clearButton) {

        clearButton.textContent =
            "Limpiar";

    }


    console.log(
        "Edición de academia cancelada."
    );

}


// ============================================================
// ELIMINAR ACADEMIA
// ============================================================

export async function removeAcademy(id) {

    const academia =
        appState.academias.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!academia) {
        return;
    }


    const teachersCount =
        appState.docentes.filter(
            docente =>
                String(docente.academiaId) ===
                String(academia.id)
        ).length;


    const coursesCount =
        appState.cursos.filter(
            curso =>
                String(curso.academiaId) ===
                String(academia.id)
        ).length;


    if (
        teachersCount > 0 ||
        coursesCount > 0
    ) {

        alert(
            `No se puede eliminar la academia "${academia.nombre}" porque tiene ` +
            `${teachersCount} docente(s) y ` +
            `${coursesCount} curso(s) asociados.`
        );

        return;
    }


    const confirmed =
        confirm(
            `¿Está seguro de eliminar la academia "${academia.nombre}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteAcademy(
            academia.id
        );


        appState.academias =
            appState.academias.filter(
                item =>
                    String(item.id) !==
                    String(academia.id)
            );


        if (
            editState.academyId &&
            String(editState.academyId) ===
                String(academia.id)
        ) {

            editState.academyId =
                null;

        }


        initSelects();

        renderAcademies();


        console.log(
            "Academia eliminada:",
            academia
        );


        alert(
            "Academia eliminada correctamente."
        );


    } catch (error) {

        console.error(
            "Error al eliminar academia:",
            error
        );


        alert(
            "No se pudo eliminar la academia.\n\n" +
            error.message
        );

    }

}


// ============================================================
// FORMULARIO DE ACADEMIA
// ============================================================

export function bindAcademyEvents() {

    const form =
        document.getElementById(
            "formAcademia"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const clave =
                document
                    .getElementById(
                        "claveAcademia"
                    )
                    .value
                    .trim();


            const nombre =
                document
                    .getElementById(
                        "nombreAcademia"
                    )
                    .value
                    .trim();


            const descripcion =
                document
                    .getElementById(
                        "descripcionAcademia"
                    )
                    .value
                    .trim();


            // ------------------------------------------------
            // VALIDACIÓN
            // ------------------------------------------------

            if (
                !/^[A-Za-z0-9]{1,10}$/.test(
                    clave
                ) ||
                !nombre
            ) {

                alert(
                    "Complete correctamente los datos de la academia."
                );

                return;
            }


            const wasEditing =
                Boolean(
                    editState.academyId
                );


            const exists =
                appState.academias.some(
                    academia =>
                        String(academia.id) !==
                            String(
                                editState.academyId
                            ) &&
                        academia.clave
                            .toLowerCase() ===
                            clave.toLowerCase()
                );


            if (exists) {

                alert(
                    "La clave de academia ya existe."
                );

                return;
            }


            try {

                // ============================================
                // ACTUALIZAR
                // ============================================

                if (wasEditing) {

                    const updatedAcademy =
                        await updateAcademy(
                            editState.academyId,
                            {
                                nombre,
                                clave,
                                descripcion
                            }
                        );


                    updatedAcademy.id =
                        String(
                            updatedAcademy.id
                        );


                    const index =
                        appState.academias.findIndex(
                            item =>
                                String(item.id) ===
                                String(
                                    editState.academyId
                                )
                        );


                    if (index !== -1) {

                        appState.academias[index] =
                            updatedAcademy;

                    }


                    console.log(
                        "Academia actualizada:",
                        updatedAcademy
                    );


                    editState.academyId =
                        null;

                }

                // ============================================
                // CREAR
                // ============================================

                else {

                    const nuevaAcademia =
                        await createAcademy({

                            nombre,
                            clave,
                            descripcion

                        });


                    nuevaAcademia.id =
                        String(
                            nuevaAcademia.id
                        );


                    appState.academias.push(
                        nuevaAcademia
                    );


                    console.log(
                        "Academia creada:",
                        nuevaAcademia
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
                        "Registrar academia";

                }


                const clearButton =
                    document.getElementById(
                        "limpiarAcademia"
                    );


                if (clearButton) {

                    clearButton.textContent =
                        "Limpiar";

                }


                initSelects();

                renderAcademies();


                alert(
                    wasEditing
                        ? "Academia actualizada correctamente."
                        : "Academia registrada correctamente."
                );


            } catch (error) {

                console.error(
                    "Error al guardar academia:",
                    error
                );


                alert(
                    "No se pudo guardar la academia.\n\n" +
                    error.message
                );

            }

        }
    );


    // --------------------------------------------------------
    // CANCELAR / LIMPIAR
    // --------------------------------------------------------

    document
        .getElementById(
            "limpiarAcademia"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    editState.academyId
                ) {

                    event.preventDefault();

                    cancelAcademyEdit();

                }

            }
        );

}


// ============================================================
// COMPATIBILIDAD TEMPORAL CON onclick
// ============================================================

window.editAcademy =
    editAcademy;

window.removeAcademy =
    removeAcademy;