import {
    appState
} from "./state.js";

import {
    createDomain,
    updateDomain
} from "./api.js";

import {
    esc,
    academy,
    domain
} from "./utils.js";

import {
    initSelects
} from "./selects.js";

// ============================================================
// RENDERIZAR DOMINIOS
// ============================================================

export function renderDomains() {

    const tableBody =
        document.getElementById(
            "tbodyDominios"
        );

    if (!tableBody) {
        return;
    }

    if (appState.dominios.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="w3-center"
                >
                    No hay dominios registrados.
                </td>

            </tr>

        `;

        return;
    }

    tableBody.innerHTML =
        appState.dominios
            .map(
                relacion => {

                    const docente =
                        appState.docentes.find(
                            item =>
                                String(item.id) ===
                                String(
                                    relacion.docenteId
                                )
                        );


                    const curso =
                        appState.cursos.find(
                            item =>
                                String(item.id) ===
                                String(
                                    relacion.cursoId
                                )
                        );

                    const docenteAcademia =
                        docente
                            ? academy(
                                appState,
                                docente.academiaId
                            )
                            : null;

                    return `

                        <tr>

                            <td>
                                ${esc(
                                    docente
                                        ? docente.nombre
                                        : "Docente no encontrado"
                                )}
                            </td>

                            <td>
                                ${esc(
                                    curso
                                        ? curso.nombre
                                        : "Curso no encontrado"
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
                                    relacion.nivel
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}

// ============================================================
// FORMULARIO DE DOMINIO
// ============================================================

export function bindDomainEvents() {

    const form =
        document.getElementById(
            "formDominio"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const docenteId =
                document
                    .getElementById(
                        "docenteDominio"
                    )
                    .value;

            const cursoId =
                document
                    .getElementById(
                        "cursoDominio"
                    )
                    .value;

            const nivel =
                Number(
                    document
                        .getElementById(
                            "nivelDominio"
                        )
                        .value
                );

            // ------------------------------------------------
            // VALIDACIONES
            // ------------------------------------------------

            if (
                !docenteId ||
                !cursoId ||
                !Number.isInteger(nivel) ||
                nivel < 1 ||
                nivel > 10
            ) {

                alert(
                    "Complete correctamente los datos del dominio."
                );

                return;
            }

            // ------------------------------------------------
            // BUSCAR DOCENTE Y CURSO
            // ------------------------------------------------

            const docente =
                appState.docentes.find(
                    item =>
                        String(item.id) ===
                        String(docenteId)
                );


            const curso =
                appState.cursos.find(
                    item =>
                        String(item.id) ===
                        String(cursoId)
                );


            if (
                !docente ||
                !curso
            ) {

                alert(
                    "El docente o el curso seleccionado no existe."
                );

                return;
            }


            // ------------------------------------------------
            // VALIDAR MISMA ACADEMIA
            // ------------------------------------------------

            if (
                String(docente.academiaId) !==
                String(curso.academiaId)
            ) {

                alert(
                    "El docente y el curso deben pertenecer a la misma academia."
                );

                return;
            }

            // ------------------------------------------------
            // BUSCAR DOMINIO EXISTENTE
            // ------------------------------------------------

            const existing =
                domain(
                    appState,
                    docenteId,
                    cursoId
                );

            try {

                // ============================================
                // ACTUALIZAR
                // ============================================

                if (existing) {

                    const updatedDomain =
                        await updateDomain(
                            existing.id,
                            {
                                docenteId:
                                    String(docenteId),
                                cursoId:
                                    String(cursoId),
                                nivel
                            }
                        );

                    updatedDomain.id =
                        String(
                            updatedDomain.id
                        );

                    updatedDomain.docenteId =
                        String(
                            updatedDomain.docenteId
                        );

                    updatedDomain.cursoId =
                        String(
                            updatedDomain.cursoId
                        );


                    const index =
                        appState.dominios.findIndex(
                            item =>
                                String(item.id) ===
                                String(existing.id)
                        );


                    if (index !== -1) {

                        appState.dominios[index] =
                            updatedDomain;

                    }

                    alert(
                        "Dominio actualizado correctamente."
                    );

                }

                // ============================================
                // CREAR
                // ============================================

                else {

                    const newDomain =
                        await createDomain(
                            {
                                docenteId:
                                    String(docenteId),
                                cursoId:
                                    String(cursoId),
                                nivel
                            }
                        );


                    newDomain.id =
                        String(
                            newDomain.id
                        );

                    newDomain.docenteId =
                        String(
                            newDomain.docenteId
                        );

                    newDomain.cursoId =
                        String(
                            newDomain.cursoId
                        );


                    appState.dominios.push(
                        newDomain
                    );

                    alert(
                        "Dominio registrado correctamente."
                    );

                }

                form.reset();

                initSelects();

                renderDomains();

            } catch (error) {

                console.error(
                    "Error al guardar dominio:",
                    error
                );

                alert(
                    "No se pudo guardar el dominio.\n\n" +
                    error.message
                );

            }

        }
    );

}