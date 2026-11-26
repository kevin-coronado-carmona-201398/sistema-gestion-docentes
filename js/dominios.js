
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
// UTILIDADES PARA FILTROS
// ============================================================

function normalizeText(value) {

    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


// ============================================================
// INICIALIZAR FILTROS DE DOMINIOS
// ============================================================

function initDomainFilters() {

    const academySelect =
        document.getElementById(
            "filtroAcademiaDominio"
        );

    const courseSelect =
        document.getElementById(
            "filtroMateriaDominio"
        );

    if (
        !academySelect ||
        !courseSelect
    ) {
        return;
    }

    // --------------------------------------------------------
    // ACADEMIAS
    // --------------------------------------------------------

    academySelect.innerHTML = `

        <option value="">
            Todas las academias
        </option>

        ${appState.academias.map(
            item => `

                <option value="${esc(item.id)}">
                    ${esc(item.nombre)}
                </option>

            `
        ).join("")}

    `;

    // --------------------------------------------------------
    // MATERIAS
    // --------------------------------------------------------

    updateDomainCourseFilter();

}


// ============================================================
// ACTUALIZAR MATERIAS SEGÚN ACADEMIA
// ============================================================

function updateDomainCourseFilter() {

    const academySelect =
        document.getElementById(
            "filtroAcademiaDominio"
        );

    const courseSelect =
        document.getElementById(
            "filtroMateriaDominio"
        );

    if (
        !academySelect ||
        !courseSelect
    ) {
        return;
    }

    const selectedAcademy =
        academySelect.value;

    const previousCourse =
        courseSelect.value;

    const availableCourses =
        appState.cursos.filter(
            item => {

                return (
                    !selectedAcademy ||
                    String(item.academiaId) ===
                    String(selectedAcademy)
                );

            }
        );

    courseSelect.innerHTML = `

        <option value="">
            Todas las materias
        </option>

        ${availableCourses.map(
            item => `

                <option value="${esc(item.id)}">
                    ${esc(item.nombre)}
                </option>

            `
        ).join("")}

    `;

    // Conservar la materia seleccionada si sigue
    // perteneciendo a la academia elegida.

    const courseStillAvailable =
        availableCourses.some(
            item =>
                String(item.id) ===
                String(previousCourse)
        );

    if (courseStillAvailable) {

        courseSelect.value =
            previousCourse;

    }

}

// ============================================================
// GENERAR COMBINACIONES DOCENTE-MATERIA
// ============================================================

function getDomainRows() {

    const domainMap = new Map();

    // Crear un índice de los dominios registrados.

    appState.dominios.forEach(relacion => {

        const key =
            `${relacion.docenteId}::${relacion.cursoId}`;

        domainMap.set(key, relacion);

    });

    const rows = [];

    // Recorrer todos los docentes.

    appState.docentes.forEach(docente => {

        // Obtener únicamente las materias de su academia.

        const courses =
            appState.cursos.filter(
                curso =>
                    String(curso.academiaId) ===
                    String(docente.academiaId)
            );

        // Generar una fila por cada combinación.

        courses.forEach(curso => {

            const key =
                `${docente.id}::${curso.id}`;

            const relacion =
                domainMap.get(key);

            const nivel =
                relacion
                    ? Number(relacion.nivel)
                    : null;

            rows.push({

                docente,

                curso,

                academia:
                    academy(
                        appState,
                        docente.academiaId
                    ),

                nivel:
                    Number.isFinite(nivel)
                        ? nivel
                        : null

            });

        });

    });

    return rows;

}

// ============================================================
// FILTRAR Y ORDENAR DOMINIOS
// ============================================================

function getFilteredDomains() {

    const academyId =
        document.getElementById(
            "filtroAcademiaDominio"
        )?.value ?? "";

    const courseId =
        document.getElementById(
            "filtroMateriaDominio"
        )?.value ?? "";

    const searchText =
        normalizeText(
            document.getElementById(
                "buscarDominio"
            )?.value ?? ""
        );

    const sortOrder =
        document.getElementById(
            "ordenNivelDominio"
        )?.value ?? "asc";

    // --------------------------------------------------------
    // APLICAR FILTROS
    // --------------------------------------------------------

    const filteredRows =
        getDomainRows().filter(
            row => {

                // Academia

                if (
                    academyId &&
                    String(row.docente.academiaId) !==
                    String(academyId)
                ) {
                    return false;
                }

                // Materia

                if (
                    courseId &&
                    String(row.curso.id) !==
                    String(courseId)
                ) {
                    return false;
                }

                // --------------------------------------------------------
                // BUSCADOR POR DOCENTE
                // --------------------------------------------------------

                if (searchText) {

                    const teacherName =
                        normalizeText(
                            row.docente.nombre
                        );

                    if (!teacherName.includes(searchText)) {
                        return false;
                    }

                }

                return true;

            }
        );

    // --------------------------------------------------------
    // ORDENAR POR NIVEL DE DOMINIO
    // --------------------------------------------------------

    filteredRows.sort(
        (a, b) => {

            // Los que no tienen nivel siempre quedan al final.

            if (a.nivel === null && b.nivel !== null) {
                return 1;
            }

            if (a.nivel !== null && b.nivel === null) {
                return -1;
            }

            // Si ambos carecen de nivel, ordenar por docente
            // y después por materia.

            if (
                a.nivel === null &&
                b.nivel === null
            ) {

                const teacherComparison =
                    a.docente.nombre.localeCompare(
                        b.docente.nombre,
                        "es",
                        {
                            sensitivity: "base"
                        }
                    );

                if (teacherComparison !== 0) {
                    return teacherComparison;
                }

                return a.curso.nombre.localeCompare(
                    b.curso.nombre,
                    "es",
                    {
                        sensitivity: "base"
                    }
                );

            }

            // Orden numérico ascendente o descendente.

            const difference =
                a.nivel - b.nivel;

            if (difference !== 0) {

                return sortOrder === "desc"
                    ? -difference
                    : difference;

            }

            // Desempate alfabético.

            return a.docente.nombre.localeCompare(
                b.docente.nombre,
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );

    return filteredRows;

}


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

    // --------------------------------------------------------
    // OBTENER COMBINACIONES FILTRADAS
    // --------------------------------------------------------

    const filteredRows =
        getFilteredDomains();

    if (filteredRows.length === 0) {

        const hasCombinations =
            appState.docentes.some(
                docente =>
                    appState.cursos.some(
                        curso =>
                            String(curso.academiaId) ===
                            String(docente.academiaId)
                    )
            );

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="w3-center"
                >
                    ${
                        hasCombinations
                            ? "No se encontraron resultados con los filtros seleccionados."
                            : "No existen combinaciones de docentes y materias dentro de una misma academia."
                    }
                </td>

            </tr>

        `;

        return;

    }

    // --------------------------------------------------------
    // GENERAR FILAS
    // --------------------------------------------------------

    tableBody.innerHTML =
        filteredRows.map(
            row => `

                <tr>

                    <td>
                        ${esc(row.docente.nombre)}
                    </td>

                    <td>
                        ${esc(row.curso.nombre)}
                    </td>

                    <td>
                        ${esc(
                            row.academia
                                ? row.academia.nombre
                                : "Sin academia"
                        )}
                    </td>

                    <td>
                        ${row.nivel !== null
                            ? esc(row.nivel)
                            : "Sin registrar"
                        }
                    </td>

                </tr>

            `
        ).join("");

}

// ============================================================
// EVENTOS DE LOS FILTROS
// ============================================================

function bindDomainFilterEvents() {

    const academySelect =
        document.getElementById(
            "filtroAcademiaDominio"
        );

    const courseSelect =
        document.getElementById(
            "filtroMateriaDominio"
        );

    const sortSelect =
        document.getElementById(
            "ordenNivelDominio"
        );

    const searchInput =
        document.getElementById(
            "buscarDominio"
        );

    const resetButton =
        document.getElementById(
            "limpiarFiltrosDominios"
        );

    if (
        !academySelect ||
        !courseSelect ||
        !sortSelect ||
        !searchInput ||
        !resetButton
    ) {
        return;
    }

    // --------------------------------------------------------
    // ACADEMIA
    // --------------------------------------------------------

    academySelect.addEventListener(
        "change",
        () => {

            updateDomainCourseFilter();

            renderDomains();

        }
    );

    // --------------------------------------------------------
    // MATERIA
    // --------------------------------------------------------

    courseSelect.addEventListener(
        "change",
        renderDomains
    );

    // --------------------------------------------------------
    // ORDENAMIENTO
    // --------------------------------------------------------

    sortSelect.addEventListener(
        "change",
        renderDomains
    );

    // --------------------------------------------------------
    // BUSCADOR POR DOCENTE
    // --------------------------------------------------------

    searchInput.addEventListener(
        "input",
        renderDomains
    );

    // --------------------------------------------------------
    // RESTABLECER FILTROS
    // --------------------------------------------------------

    resetButton.addEventListener(
        "click",
        () => {

            academySelect.value = "";

            updateDomainCourseFilter();

            courseSelect.value = "";

            sortSelect.value = "asc";

            searchInput.value = "";

            renderDomains();

        }
    );

}


// ============================================================
// FORMULARIO DE DOMINIO
// ============================================================

export function bindDomainEvents() {

    // Inicializar y enlazar los filtros de la tabla.

    initDomainFilters();

    bindDomainFilterEvents();

    renderDomains();


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
            // BUSCAR DOCENTE Y MATERIA
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
                    "El docente o la materia seleccionada no existe."
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
                    "El docente y la materia deben pertenecer a la misma academia."
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
                        String(updatedDomain.id);

                    updatedDomain.docenteId =
                        String(updatedDomain.docenteId);

                    updatedDomain.cursoId =
                        String(updatedDomain.cursoId);

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
                        String(newDomain.id);

                    newDomain.docenteId =
                        String(newDomain.docenteId);

                    newDomain.cursoId =
                        String(newDomain.cursoId);

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