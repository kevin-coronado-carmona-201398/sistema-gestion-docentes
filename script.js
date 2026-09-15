// ============================================================
// CONFIGURACIÓN
// ============================================================

const STORAGE_KEY = "gestionAcademicaState";


// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================

function clone(data) {
    return JSON.parse(JSON.stringify(data));
}


function initialState() {

    return {
        academias: clone(mockData.academias),
        docentes: clone(mockData.docentes),
        cursos: clone(mockData.cursos),
        dominios: clone(mockData.dominios),
        asignaciones: clone(mockData.asignaciones)
    };

}


function loadState() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return initialState();
    }

    try {
        return JSON.parse(raw);
    } catch {
        return initialState();
    }

}


const appState = loadState();


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );

}


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function esc(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function academy(id) {

    return appState.academias.find(
        item => item.id === id
    );

}


function nextId(array) {

    if (array.length === 0) {
        return 1;
    }

    return Math.max(
        ...array.map(item => item.id)
    ) + 1;

}


function domain(
    docenteId,
    cursoId
) {

    const item =
        appState.dominios.find(
            d =>
                d.docenteId === docenteId &&
                d.cursoId === cursoId
        );

    return item
        ? item.nivel
        : null;

}


function assigned(
    cursoId,
    docenteId
) {

    return appState.asignaciones.some(
        a =>
            a.cursoId === cursoId &&
            a.docenteId === docenteId
    );

}


function assignedTeachers(cursoId) {

    return appState.asignaciones
        .filter(
            a => a.cursoId === cursoId
        )
        .map(
            a =>
                appState.docentes.find(
                    d => d.id === a.docenteId
                )
        )
        .filter(Boolean);

}


function lastDegree(docente) {

    return (
        docente.doctorado ||
        docente.maestria ||
        docente.licenciatura ||
        "No registrado"
    );

}


// ============================================================
// LLENADO DE SELECTS
// ============================================================

function fill(
    id,
    items,
    first
) {

    const select =
        document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const initialOption =
        document.createElement("option");

    initialOption.value = "";
    initialOption.textContent = first;

    select.appendChild(initialOption);


    items.forEach(item => {

        const option =
            document.createElement("option");

        option.value = item;
        option.textContent = item;

        select.appendChild(option);

    });

}


function fillAcademies(
    id,
    first
) {

    const select =
        document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const initialOption =
        document.createElement("option");

    initialOption.value = "";
    initialOption.textContent = first;

    select.appendChild(initialOption);


    appState.academias.forEach(
        academia => {

            const option =
                document.createElement("option");

            option.value = academia.id;

            option.textContent =
                `${academia.nombre} (${academia.clave})`;

            select.appendChild(option);

        }
    );

}


function fillPeople(
    id,
    first
) {

    const select =
        document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const initialOption =
        document.createElement("option");

    initialOption.value = "";
    initialOption.textContent = first;

    select.appendChild(initialOption);


    appState.docentes.forEach(
        docente => {

            const option =
                document.createElement("option");

            option.value = docente.id;

            option.textContent =
                `${docente.nombre} (${docente.numeroEmpleado})`;

            select.appendChild(option);

        }
    );

}


function fillCourses(
    id,
    first
) {

    const select =
        document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const initialOption =
        document.createElement("option");

    initialOption.value = "";
    initialOption.textContent = first;

    select.appendChild(initialOption);


    appState.cursos.forEach(
        curso => {

            const option =
                document.createElement("option");

            option.value = curso.id;
            option.textContent = curso.nombre;

            select.appendChild(option);

        }
    );

}


// ============================================================
// INICIALIZAR SELECTS
// ============================================================

function initSelects() {

    fill(
        "licenciatura",
        mockData.licenciaturas,
        "Seleccionar..."
    );

    fill(
        "maestria",
        mockData.maestrias,
        "Seleccionar..."
    );

    fill(
        "doctorado",
        mockData.doctorados,
        "Seleccionar..."
    );

    fill(
        "nivelSni",
        mockData.nivelesSNI,
        "No aplica"
    );


    fillAcademies(
        "academiaDocente",
        "Seleccionar academia..."
    );

    fillAcademies(
        "filtroAcademiaDocente",
        "Todas las academias"
    );

    fillAcademies(
        "academiaCurso",
        "Seleccionar academia..."
    );

    fillAcademies(
        "filtroAcademiaCurso",
        "Todas las academias"
    );


    fillPeople(
        "docenteDominio",
        "Seleccionar docente..."
    );

    fillCourses(
        "cursoDominio",
        "Seleccionar curso..."
    );

    fillCourses(
        "cursoAsignacion",
        "Seleccionar curso..."
    );

}


// ============================================================
// RENDERIZAR ACADEMIAS
// ============================================================

function renderAcademies() {

    const tableBody =
        document.getElementById(
            "tbodyAcademias"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        appState.academias
            .map(
                academia => `

                    <tr>

                        <td>
                            ${esc(academia.clave)}
                        </td>

                        <td>
                            ${esc(academia.nombre)}
                        </td>

                        <td>
                            ${esc(academia.descripcion)}
                        </td>

                        <td>
                            ${
                                appState.docentes.filter(
                                    docente =>
                                        docente.academiaId ===
                                        academia.id
                                ).length
                            }
                        </td>

                        <td>
                            ${
                                appState.cursos.filter(
                                    curso =>
                                        curso.academiaId ===
                                        academia.id
                                ).length
                            }
                        </td>

                    </tr>

                `
            )
            .join("");

}


// ============================================================
// RENDERIZAR DOCENTES
// ============================================================

function renderTeachers() {

    const tableBody =
        document.getElementById(
            "tbodyDocentes"
        );

    if (!tableBody) {
        return;
    }


    const search =
        (
            document.getElementById(
                "buscarDocente"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filter =
        document.getElementById(
            "filtroAcademiaDocente"
        )?.value || "";


    let list =
        appState.docentes.filter(
            docente => {

                const matchesSearch =
                    !search ||
                    docente.nombre
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        docente.numeroEmpleado
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesAcademy =
                    !filter ||
                    docente.academiaId ===
                        Number(filter);


                return (
                    matchesSearch &&
                    matchesAcademy
                );

            }
        );


    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="w3-center"
                >
                    No se encontraron docentes.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        list
            .map(
                docente => {

                    const courses =
                        appState.cursos
                            .filter(
                                curso =>
                                    curso.academiaId ===
                                    docente.academiaId
                            )
                            .map(
                                curso => {

                                    const level =
                                        domain(
                                            docente.id,
                                            curso.id
                                        );

                                    return level === null
                                        ? `${curso.nombre} (Sin registrar)`
                                        : `${curso.nombre} (${level}/10)`;

                                }
                            )
                            .join(", ") ||
                        "Ninguna";


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
                                    lastDegree(docente)
                                )}
                            </td>

                            <td>
                                ${esc(
                                    docente.especialidad ||
                                    "No registrada"
                                )}
                            </td>

                            <td>
                                ${esc(
                                    academy(
                                        docente.academiaId
                                    )?.nombre ||
                                    "Sin academia"
                                )}
                            </td>

                            <td>
                                ${esc(courses)}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


// ============================================================
// RENDERIZAR CURSOS
// ============================================================

function renderCourses() {

    const tableBody =
        document.getElementById(
            "tbodyCursos"
        );

    if (!tableBody) {
        return;
    }


    const search =
        (
            document.getElementById(
                "buscarCurso"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filter =
        document.getElementById(
            "filtroAcademiaCurso"
        )?.value || "";


    let list =
        appState.cursos.filter(
            curso => {

                const matchesSearch =
                    !search ||
                    curso.nombre
                        .toLowerCase()
                        .includes(search) ||
                    (curso.descripcion || "")
                        .toLowerCase()
                        .includes(search);


                const matchesAcademy =
                    !filter ||
                    curso.academiaId ===
                        Number(filter);


                return (
                    matchesSearch &&
                    matchesAcademy
                );

            }
        );


    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="w3-center"
                >
                    No se encontraron cursos.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        list
            .map(
                curso => {

                    const isAssigned =
                        assignedTeachers(
                            curso.id
                        ).length > 0;


                    return `

                        <tr>

                            <td>
                                ${esc(
                                    curso.nombre
                                )}
                            </td>

                            <td>
                                ${esc(
                                    curso.descripcion
                                )}
                            </td>

                            <td>
                                ${esc(
                                    academy(
                                        curso.academiaId
                                    )?.nombre ||
                                    "Sin academia"
                                )}
                            </td>

                            <td>

                                <span
                                    class="
                                        status
                                        ${
                                            isAssigned
                                                ? "status-ok"
                                                : "status-off"
                                        }
                                    "
                                >
                                    ${
                                        isAssigned
                                            ? "Asignado"
                                            : "Disponible"
                                    }
                                </span>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


// ============================================================
// RENDERIZAR ASIGNACIÓN DE CURSOS
// ============================================================

function renderAssignment() {

    const courseId =
        Number(
            document.getElementById(
                "cursoAsignacion"
            )?.value
        );


    const name =
        document.getElementById(
            "detalleNombreCurso"
        );

    const academyName =
        document.getElementById(
            "detalleAcademiaCurso"
        );

    const status =
        document.getElementById(
            "detalleEstadoCurso"
        );

    const assignedNames =
        document.getElementById(
            "detalleDocentesAsignados"
        );

    const candidatesBody =
        document.getElementById(
            "tbodyCandidatos"
        );

    const assignedBody =
        document.getElementById(
            "tbodyAsignados"
        );


    /*
     * La página actual no es la de asignación.
     */
    if (
        !candidatesBody &&
        !name
    ) {
        return;
    }


    /*
     * No hay curso seleccionado.
     */
    if (!courseId) {

        if (name) {
            name.textContent = "—";
        }

        if (academyName) {
            academyName.textContent = "—";
        }

        if (status) {
            status.textContent = "—";
        }

        if (assignedNames) {
            assignedNames.textContent = "—";
        }

        if (candidatesBody) {

            candidatesBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="w3-center"
                    >
                        Seleccione un curso para mostrar candidatos.
                    </td>

                </tr>

            `;

        }


        if (assignedBody) {

            assignedBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="w3-center"
                    >
                        No hay asignaciones para mostrar.
                    </td>

                </tr>

            `;

        }

        return;
    }


    const course =
        appState.cursos.find(
            item =>
                item.id === courseId
        );


    if (!course) {
        return;
    }


    const academyData =
        academy(
            course.academiaId
        );


    const assigned =
        assignedTeachers(
            courseId
        );


    /*
     * Información del curso.
     */

    if (name) {
        name.textContent = course.nombre;
    }

    if (academyName) {
        academyName.textContent =
            academyData?.nombre ||
            "Sin academia";
    }

    if (status) {
        status.textContent =
            assigned.length > 0
                ? "Asignado"
                : "Disponible";
    }

    if (assignedNames) {
        assignedNames.textContent =
            assigned.length > 0
                ? assigned
                    .map(
                        teacher =>
                            teacher.nombre
                    )
                    .join(", ")
                : "Ninguno";
    }


    /*
     * Docentes candidatos.
     */

    let candidates =
        appState.docentes.filter(
            docente =>
                docente.academiaId ===
                course.academiaId
        );


    const order =
        document.getElementById(
            "ordenDominio"
        )?.value || "desc";


    candidates.sort(
        (a, b) => {

            const domainA =
                domain(
                    a.id,
                    course.id
                );

            const domainB =
                domain(
                    b.id,
                    course.id
                );


            if (
                domainA === null &&
                domainB === null
            ) {
                return a.nombre.localeCompare(
                    b.nombre
                );
            }


            if (domainA === null) {
                return 1;
            }


            if (domainB === null) {
                return -1;
            }


            return order === "asc"
                ? domainA - domainB
                : domainB - domainA;

        }
    );


    /*
     * Mostrar candidatos.
     */

    if (candidatesBody) {

        candidatesBody.innerHTML =
            candidates
                .map(
                    docente => {

                        const level =
                            domain(
                                docente.id,
                                course.id
                            );


                        const isAssigned =
                            assigned(
                                course.id,
                                docente.id
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
                                        academyData?.nombre ||
                                        "Sin academia"
                                    )}
                                </td>

                                <td>
                                    ${
                                        level === null
                                            ? "Sin registrar"
                                            : `${level}/10`
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
                                                    onclick="unassign(${course.id}, ${docente.id})"
                                                >
                                                    Desasignar
                                                </button>

                                            `

                                            : `

                                                <button
                                                    type="button"
                                                    class="w3-button w3-small w3-blue"
                                                    onclick="assign(${course.id}, ${docente.id})"
                                                >
                                                    Asignar
                                                </button>

                                            `
                                    }

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }


    /*
     * Mostrar docentes asignados.
     */

    if (assignedBody) {

        if (assigned.length === 0) {

            assignedBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="w3-center"
                    >
                        No hay docentes asignados a este curso.
                    </td>

                </tr>

            `;

        } else {

            assignedBody.innerHTML =
                assigned
                    .map(
                        docente => {

                            const level =
                                domain(
                                    docente.id,
                                    course.id
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
                                            academyData?.nombre ||
                                            "Sin academia"
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            level === null
                                                ? "Sin registrar"
                                                : `${level}/10`
                                        }
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            class="w3-button w3-small w3-red"
                                            onclick="unassign(${course.id}, ${docente.id})"
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

    }

}


// ============================================================
// ASIGNAR DOCENTE
// ============================================================

function assign(
    courseId,
    teacherId
) {

    if (
        assigned(
            courseId,
            teacherId
        )
    ) {
        return;
    }


    const course =
        appState.cursos.find(
            item =>
                item.id === courseId
        );


    const teacher =
        appState.docentes.find(
            item =>
                item.id === teacherId
        );


    if (!course || !teacher) {
        return;
    }


    if (
        course.academiaId !==
        teacher.academiaId
    ) {
        return;
    }


    appState.asignaciones.push({

        id: nextId(
            appState.asignaciones
        ),

        cursoId: courseId,

        docenteId: teacherId

    });


    saveState();

    renderCourses();
    renderAssignment();

}


// ============================================================
// DESASIGNAR DOCENTE
// ============================================================

function unassign(
    courseId,
    teacherId
) {

    appState.asignaciones =
        appState.asignaciones.filter(
            item =>
                !(
                    item.cursoId === courseId &&
                    item.docenteId === teacherId
                )
        );


    saveState();

    renderCourses();
    renderAssignment();

}


// ============================================================
// CARGAR DOMINIO EXISTENTE
// ============================================================

function existingDomain() {

    const teacherId =
        Number(
            document.getElementById(
                "docenteDominio"
            )?.value
        );


    const courseId =
        Number(
            document.getElementById(
                "cursoDominio"
            )?.value
        );


    const levelInput =
        document.getElementById(
            "nivelDominio"
        );


    if (!levelInput) {
        return;
    }


    if (!teacherId || !courseId) {

        levelInput.value = "";

        return;
    }


    const currentLevel =
        domain(
            teacherId,
            courseId
        );


    levelInput.value =
        currentLevel === null
            ? ""
            : currentLevel;

}


// ============================================================
// EVENTOS
// ============================================================

function bind() {

    // --------------------------------------------------------
    // Búsqueda de docentes
    // --------------------------------------------------------

    document
        .getElementById("buscarDocente")
        ?.addEventListener(
            "input",
            renderTeachers
        );


    // --------------------------------------------------------
    // Filtro de docentes
    // --------------------------------------------------------

    document
        .getElementById("filtroAcademiaDocente")
        ?.addEventListener(
            "change",
            renderTeachers
        );


    // --------------------------------------------------------
    // Búsqueda de cursos
    // --------------------------------------------------------

    document
        .getElementById("buscarCurso")
        ?.addEventListener(
            "input",
            renderCourses
        );


    // --------------------------------------------------------
    // Filtro de cursos
    // --------------------------------------------------------

    document
        .getElementById("filtroAcademiaCurso")
        ?.addEventListener(
            "change",
            renderCourses
        );


    // --------------------------------------------------------
    // Selección de curso
    // --------------------------------------------------------

    document
        .getElementById("cursoAsignacion")
        ?.addEventListener(
            "change",
            renderAssignment
        );


    // --------------------------------------------------------
    // Ordenamiento de candidatos
    // --------------------------------------------------------

    document
        .getElementById("ordenDominio")
        ?.addEventListener(
            "change",
            renderAssignment
        );


    // --------------------------------------------------------
    // Dominio: docente
    // --------------------------------------------------------

    document
        .getElementById("docenteDominio")
        ?.addEventListener(
            "change",
            existingDomain
        );


    // --------------------------------------------------------
    // Dominio: curso
    // --------------------------------------------------------

    document
        .getElementById("cursoDominio")
        ?.addEventListener(
            "change",
            existingDomain
        );


    // --------------------------------------------------------
    // SNI
    // --------------------------------------------------------

    document
        .getElementById("sni")
        ?.addEventListener(
            "change",
            () => {

                const enabled =
                    document.getElementById(
                        "sni"
                    ).value === "si";


                const level =
                    document.getElementById(
                        "nivelSni"
                    );


                if (!level) {
                    return;
                }


                level.disabled =
                    !enabled;


                if (!enabled) {
                    level.value = "";
                }

            }
        );


    // --------------------------------------------------------
    // FORMULARIO DE ACADEMIA
    // --------------------------------------------------------

    document
        .getElementById("formAcademia")
        ?.addEventListener(
            "submit",
            event => {

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


                const exists =
                    appState.academias.some(
                        academia =>
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


                appState.academias.push({

                    id: nextId(
                        appState.academias
                    ),

                    nombre,

                    clave,

                    descripcion

                });


                saveState();

                event.target.reset();

                initSelects();

                renderAcademies();


                alert(
                    "Academia registrada correctamente."
                );

            }
        );


    // --------------------------------------------------------
    // FORMULARIO DE CURSO
    // --------------------------------------------------------

    document
        .getElementById("formCurso")
        ?.addEventListener(
            "submit",
            event => {

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
                    Number(
                        document
                            .getElementById(
                                "academiaCurso"
                            )
                            .value
                    );


                if (
                    !nombre ||
                    !academiaId
                ) {

                    alert(
                        "Complete correctamente los datos del curso."
                    );

                    return;
                }


                const exists =
                    appState.cursos.some(
                        curso =>
                            curso.nombre
                                .toLowerCase() ===
                            nombre.toLowerCase()
                    );


                if (exists) {

                    alert(
                        "El nombre del curso ya existe."
                    );

                    return;
                }


                appState.cursos.push({

                    id: nextId(
                        appState.cursos
                    ),

                    nombre,

                    descripcion,

                    academiaId

                });


                saveState();

                event.target.reset();

                initSelects();

                renderCourses();

                renderAcademies();


                alert(
                    "Curso registrado correctamente."
                );

            }
        );


    // --------------------------------------------------------
    // FORMULARIO DE DOCENTE
    // --------------------------------------------------------

    document
        .getElementById("formDocente")
        ?.addEventListener(
            "submit",
            event => {

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


                const academiaId =
                    Number(
                        document
                            .getElementById(
                                "academiaDocente"
                            )
                            .value
                    );


                const sni =
                    document
                        .getElementById("sni")
                        .value === "si";


                if (
                    !numeroEmpleado ||
                    !nombre ||
                    !academiaId
                ) {

                    alert(
                        "Complete los campos obligatorios."
                    );

                    return;
                }


                const exists =
                    appState.docentes.some(
                        docente =>
                            String(
                                docente.numeroEmpleado
                            )
                                .toLowerCase() ===
                            numeroEmpleado.toLowerCase()
                    );


                if (exists) {

                    alert(
                        "El número de empleado ya existe."
                    );

                    return;
                }


                appState.docentes.push({

                    id: nextId(
                        appState.docentes
                    ),

                    numeroEmpleado,

                    nombre,

                    licenciatura:
                        document
                            .getElementById(
                                "licenciatura"
                            )
                            .value,

                    maestria:
                        document
                            .getElementById(
                                "maestria"
                            )
                            .value,

                    doctorado:
                        document
                            .getElementById(
                                "doctorado"
                            )
                            .value,

                    especialidad:
                        document
                            .getElementById(
                                "especialidad"
                            )
                            .value
                            .trim(),

                    sni,

                    nivelSNI:
                        sni
                            ? document
                                .getElementById(
                                    "nivelSni"
                                )
                                .value
                            : "",

                    prodep:
                        document
                            .getElementById(
                                "prodep"
                            )
                            .value === "si",

                    certificaciones:
                        document
                            .getElementById(
                                "certificaciones"
                            )
                            .value
                            .trim(),

                    academiaId

                });


                saveState();

                event.target.reset();


                const level =
                    document.getElementById(
                        "nivelSni"
                    );


                if (level) {

                    level.disabled = true;
                    level.value = "";

                }


                initSelects();

                renderTeachers();

                renderAcademies();


                alert(
                    "Docente registrado correctamente."
                );

            }
        );


    // --------------------------------------------------------
    // FORMULARIO DE DOMINIO
    // --------------------------------------------------------

    document
        .getElementById("formDominio")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const docenteId =
                    Number(
                        document
                            .getElementById(
                                "docenteDominio"
                            )
                            .value
                    );


                const cursoId =
                    Number(
                        document
                            .getElementById(
                                "cursoDominio"
                            )
                            .value
                    );


                const nivel =
                    Number(
                        document
                            .getElementById(
                                "nivelDominio"
                            )
                            .value
                    );


                const docente =
                    appState.docentes.find(
                        item =>
                            item.id === docenteId
                    );


                const curso =
                    appState.cursos.find(
                        item =>
                            item.id === cursoId
                    );


                if (
                    !docenteId ||
                    !cursoId ||
                    !Number.isInteger(nivel) ||
                    nivel < 1 ||
                    nivel > 10
                ) {

                    alert(
                        "El nivel de dominio debe ser un entero entre 1 y 10."
                    );

                    return;
                }


                if (
                    !docente ||
                    !curso ||
                    docente.academiaId !==
                        curso.academiaId
                ) {

                    alert(
                        "El docente y el curso deben pertenecer a la misma academia."
                    );

                    return;
                }


                const old =
                    appState.dominios.find(
                        item =>
                            item.docenteId ===
                                docenteId &&
                            item.cursoId ===
                                cursoId
                    );


                if (old) {

                    old.nivel = nivel;

                } else {

                    appState.dominios.push({

                        id: nextId(
                            appState.dominios
                        ),

                        docenteId,

                        cursoId,

                        nivel

                    });

                }


                saveState();

                event.target.reset();

                renderTeachers();

                renderAssignment();


                alert(
                    "Nivel de dominio guardado correctamente."
                );

            }
        );

}


// ============================================================
// INICIALIZACIÓN FINAL
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initSelects();

        bind();

        renderTeachers();

        renderAcademies();

        renderCourses();

        renderAssignment();

    }
);