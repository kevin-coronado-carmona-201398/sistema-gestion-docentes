<<<<<<< HEAD
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
=======
// ============================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN
// ============================================================

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================

const appState = {
    academias: [...mockData.academias],
    docentes: [...mockData.docentes],
    cursos: [...mockData.cursos],
    dominios: [...mockData.dominios],
    asignaciones: [...mockData.asignaciones]
};


// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    inicializarCatalogos();
    cargarTodosLosSelectsAcademia();
    cargarDocentes();
    cargarAcademias();
    cargarCursos();
    cargarDatosAsignacion();
    cargarSelectsDominio();
    configurarEventos();

});


// ============================================================
// CATÁLOGOS
// ============================================================

function inicializarCatalogos() {

    llenarSelect(
        "licenciatura",
        mockData.licenciaturas,
        "Seleccionar..."
    );

    llenarSelect(
        "maestria",
        mockData.maestrias,
        "Seleccionar..."
    );

    llenarSelect(
        "doctorado",
        mockData.doctorados,
        "Seleccionar..."
    );

    llenarSelect(
        "nivelSni",
        mockData.nivelesSNI,
        "No aplica"
    );
}


function llenarSelect(id, opciones, textoInicial) {

    const select = document.getElementById(id);

    if (!select) {
        console.warn(`No existe el elemento con id="${id}"`);
        return;
    }

    select.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = textoInicial;

    select.appendChild(opcionInicial);

    opciones.forEach(opcion => {

        const option = document.createElement("option");

        option.value = opcion;
        option.textContent = opcion;

        select.appendChild(option);

    });
}


// ============================================================
// ACADEMIAS EN SELECTS
// ============================================================

function cargarTodosLosSelectsAcademia() {

    cargarSelectAcademias("filtroAcademiaDocente", "Todas las academias");
    cargarSelectAcademias("academiaDocente", "Seleccionar academia...");
    cargarSelectAcademias("filtroAcademiaCurso", "Todas las academias");
    cargarSelectAcademias("academiaCurso", "Seleccionar academia...");
}


function cargarSelectAcademias(id, textoInicial) {

    const select = document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const opcionInicial = document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent = textoInicial;

    select.appendChild(opcionInicial);

    appState.academias.forEach(academia => {

        const option = document.createElement("option");

        option.value = academia.id;
        option.textContent =
            `${academia.nombre} (${academia.clave})`;

        select.appendChild(option);

    });
}


// ============================================================
// ACADEMIAS
// ============================================================

function cargarAcademias() {

    const tbody =
        document.getElementById("tbodyAcademias");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    appState.academias.forEach(academia => {

        const numeroIntegrantes =
            appState.docentes.filter(
                docente =>
                    docente.academiaId === academia.id
            ).length;

        const numeroCursos =
            appState.cursos.filter(
                curso =>
                    curso.academiaId === academia.id
            ).length;

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>${escaparHTML(academia.clave)}</td>

            <td>${escaparHTML(academia.nombre)}</td>

            <td>${escaparHTML(academia.descripcion)}</td>

            <td>${numeroIntegrantes}</td>

            <td>${numeroCursos}</td>
        `;

        tbody.appendChild(fila);

    });
}


// ============================================================
// DOCENTES
// ============================================================

function cargarDocentes() {

    const tbody =
        document.getElementById("tbodyDocentes");

    if (!tbody) {
        return;
    }

    const busqueda =
        document
            .getElementById("buscarDocente")
            ?.value
            .trim()
            .toLowerCase() || "";

    const academiaSeleccionada =
        document
            .getElementById("filtroAcademiaDocente")
            ?.value || "";


    let docentesFiltrados =
        [...appState.docentes];


    // --------------------------------------------------------
    // BUSQUEDA
    // --------------------------------------------------------

    if (busqueda !== "") {

        docentesFiltrados =
            docentesFiltrados.filter(docente => {

                const nombre =
                    docente.nombre
                        .toLowerCase();

                const numeroEmpleado =
                    String(docente.numeroEmpleado)
                        .toLowerCase();

                return (
                    nombre.includes(busqueda) ||
                    numeroEmpleado.includes(busqueda)
                );

            });

    }


    // --------------------------------------------------------
    // FILTRO POR ACADEMIA
    // --------------------------------------------------------

    if (academiaSeleccionada !== "") {

        const academiaId =
            Number(academiaSeleccionada);

        docentesFiltrados =
            docentesFiltrados.filter(
                docente =>
                    docente.academiaId === academiaId
            );

    }


    tbody.innerHTML = "";


    if (docentesFiltrados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="w3-center">
                    No se encontraron docentes.
                </td>
            </tr>
        `;

        return;
    }


    docentesFiltrados.forEach(docente => {

        const academia =
            obtenerAcademia(docente.academiaId);

        const cursosAcademia =
            appState.cursos.filter(
                curso =>
                    curso.academiaId === docente.academiaId
            );


        let materias = "Ninguna";


        if (cursosAcademia.length > 0) {

            materias =
                cursosAcademia
                    .map(curso => {

                        const dominio =
                            obtenerDominio(
                                docente.id,
                                curso.id
                            );

                        return dominio !== null
                            ? `${curso.nombre} (${dominio}/10)`
                            : `${curso.nombre} (Sin registrar)`;

                    })
                    .join(", ");

        }


        // ----------------------------------------------------
        // Último grado académico
        // ----------------------------------------------------

        const ultimoGrado =
            obtenerUltimoGrado(docente);


        const fila =
            document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${escaparHTML(docente.numeroEmpleado)}
            </td>

            <td>
                ${escaparHTML(docente.nombre)}
            </td>

            <td>
                ${escaparHTML(ultimoGrado)}
            </td>

            <td>
                ${escaparHTML(docente.especialidad || "No registrada")}
            </td>

            <td>
                ${academia
                    ? escaparHTML(academia.nombre)
                    : "Sin academia"}
            </td>

            <td>
                ${escaparHTML(materias)}
            </td>

        `;

        tbody.appendChild(fila);

    });
}


// ============================================================
// ÚLTIMO GRADO ACADÉMICO
// ============================================================

function obtenerUltimoGrado(docente) {

    if (docente.doctorado) {
        return docente.doctorado;
    }

    if (docente.maestria) {
        return docente.maestria;
    }

    if (docente.licenciatura) {
        return docente.licenciatura;
    }

    return "No registrado";
}


// ============================================================
// CURSOS
// ============================================================

function cargarCursos() {

    const tbody =
        document.getElementById("tbodyCursos");

    if (!tbody) {
        return;
    }

    const busqueda =
        document
            .getElementById("buscarCurso")
            ?.value
            .trim()
            .toLowerCase() || "";

    const academiaSeleccionada =
        document
            .getElementById("filtroAcademiaCurso")
            ?.value || "";


    let cursosFiltrados =
        [...appState.cursos];


    // --------------------------------------------------------
    // BUSQUEDA
    // --------------------------------------------------------

    if (busqueda !== "") {

        cursosFiltrados =
            cursosFiltrados.filter(curso => {

                const nombre =
                    curso.nombre.toLowerCase();

                const descripcion =
                    (curso.descripcion || "")
                        .toLowerCase();

                return (
                    nombre.includes(busqueda) ||
                    descripcion.includes(busqueda)
                );

            });

    }


    // --------------------------------------------------------
    // FILTRO POR ACADEMIA
    // --------------------------------------------------------

    if (academiaSeleccionada !== "") {

        const academiaId =
            Number(academiaSeleccionada);

        cursosFiltrados =
            cursosFiltrados.filter(
                curso =>
                    curso.academiaId === academiaId
            );

    }


    tbody.innerHTML = "";


    if (cursosFiltrados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="w3-center">
                    No se encontraron cursos.
                </td>
            </tr>
        `;

        return;
    }


    cursosFiltrados.forEach(curso => {

        const academia =
            obtenerAcademia(curso.academiaId);

        const asignados =
            obtenerDocentesAsignados(curso.id);

        const estado =
            asignados.length > 0
                ? "Asignado"
                : "Disponible";


        const fila =
            document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${escaparHTML(curso.nombre)}
            </td>

            <td>
                ${escaparHTML(curso.descripcion || "")}
            </td>

            <td>
                ${academia
                    ? escaparHTML(academia.nombre)
                    : "Sin academia"}
            </td>

            <td>
                ${estado}
            </td>

        `;

        tbody.appendChild(fila);

    });
}


// ============================================================
// ASIGNACIÓN DE CURSOS
// ============================================================

function cargarDatosAsignacion() {

    const selectCurso =
        document.getElementById("cursoAsignacion");

    if (!selectCurso) {
        return;
    }

    selectCurso.innerHTML = `
        <option value="">Seleccionar curso...</option>
    `;

    appState.cursos.forEach(curso => {

        const option =
            document.createElement("option");

        option.value = curso.id;
        option.textContent = curso.nombre;

        selectCurso.appendChild(option);

    });
}


// ============================================================
// MOSTRAR CANDIDATOS
// ============================================================

function mostrarCandidatos() {

    const selectCurso =
        document.getElementById("cursoAsignacion");

    const cursoId =
        Number(selectCurso?.value);


    actualizarInformacionCurso(cursoId);


    if (!cursoId) {

        mostrarMensajeCandidatos(
            "Seleccione un curso para mostrar candidatos."
        );

        cargarTablaAsignados(null);

        return;
    }


    const curso =
        appState.cursos.find(
            curso =>
                curso.id === cursoId
        );


    if (!curso) {
        return;
    }


    let candidatos =
        appState.docentes.filter(
            docente =>
                docente.academiaId ===
                curso.academiaId
        );


    const orden =
        document
            .getElementById("ordenDominio")
            ?.value || "desc";


    candidatos.sort((a, b) => {

        const dominioA =
            obtenerDominio(a.id, curso.id);

        const dominioB =
            obtenerDominio(b.id, curso.id);


        if (dominioA === null && dominioB === null) {
            return a.nombre.localeCompare(b.nombre);
        }


        if (dominioA === null) {
            return 1;
        }


        if (dominioB === null) {
            return -1;
        }


        if (orden === "asc") {
            return dominioA - dominioB;
        }


        return dominioB - dominioA;

    });


    mostrarTablaCandidatos(
        candidatos,
        curso
    );

    cargarTablaAsignados(curso.id);
}


// ============================================================
// INFORMACIÓN DEL CURSO
// ============================================================

function actualizarInformacionCurso(cursoId) {

    const nombre =
        document.getElementById("detalleNombreCurso");

    const academia =
        document.getElementById("detalleAcademiaCurso");

    const estado =
        document.getElementById("detalleEstadoCurso");

    const asignados =
        document.getElementById("detalleDocentesAsignados");


    if (
        !nombre ||
        !academia ||
        !estado ||
        !asignados
    ) {
        return;
    }


    if (!cursoId) {

        nombre.textContent = "—";
        academia.textContent = "—";
        estado.textContent = "—";
        asignados.textContent = "—";

        return;
    }


    const curso =
        appState.cursos.find(
            curso =>
                curso.id === cursoId
        );


    if (!curso) {
        return;
    }


    const academiaCurso =
        obtenerAcademia(curso.academiaId);

    const docentesAsignados =
        obtenerDocentesAsignados(curso.id);


    nombre.textContent =
        curso.nombre;

    academia.textContent =
        academiaCurso
            ? academiaCurso.nombre
            : "Sin academia";

    estado.textContent =
        docentesAsignados.length > 0
            ? "Asignado"
            : "Disponible";

    asignados.textContent =
        docentesAsignados.length > 0
            ? docentesAsignados
                .map(docente => docente.nombre)
                .join(", ")
            : "Ninguno";
}


// ============================================================
// TABLA DE CANDIDATOS
// ============================================================

function mostrarTablaCandidatos(
    candidatos,
    curso
) {

    const tbody =
        document.getElementById("tbodyCandidatos");

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (candidatos.length === 0) {

        mostrarMensajeCandidatos(
            "No hay docentes de esta academia."
        );

        return;
    }


    candidatos.forEach(docente => {

        const dominio =
            obtenerDominio(
                docente.id,
                curso.id
            );

        const asignado =
            estaAsignado(
                curso.id,
                docente.id
            );

        const academia =
            obtenerAcademia(
                docente.academiaId
            );


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${escaparHTML(docente.nombre)}
            </td>

            <td>
                ${academia
                    ? escaparHTML(academia.nombre)
                    : "Sin academia"}
            </td>

            <td>
                ${
                    dominio !== null
                        ? `${dominio}/10`
                        : "Sin registrar"
                }
            </td>

            <td>
                ${
                    asignado
                        ? "Asignado"
                        : "Disponible"
                }
            </td>

            <td>

                ${
                    asignado

                    ? `
                        <button
                            type="button"
                            class="w3-button w3-small w3-red"
                            onclick="desasignarDocente(${curso.id}, ${docente.id})"
                        >
                            Desasignar
                        </button>
                    `

                    : `
                        <button
                            type="button"
                            class="w3-button w3-small w3-blue"
                            onclick="asignarDocente(${curso.id}, ${docente.id})"
                        >
                            Asignar
                        </button>
                    `
                }

            </td>

        `;

        tbody.appendChild(fila);

    });
}


function mostrarMensajeCandidatos(mensaje) {

    const tbody =
        document.getElementById("tbodyCandidatos");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="w3-center">
                ${escaparHTML(mensaje)}
            </td>
        </tr>
    `;
}


// ============================================================
// TABLA DE DOCENTES ASIGNADOS
// ============================================================

function cargarTablaAsignados(cursoId) {

    const tbody =
        document.getElementById("tbodyAsignados");

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (!cursoId) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="w3-center">
                    No hay asignaciones para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    const asignados =
        obtenerDocentesAsignados(cursoId);


    if (asignados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="w3-center">
                    No hay docentes asignados a este curso.
                </td>
            </tr>
        `;

        return;
    }


    const curso =
        appState.cursos.find(
            curso =>
                curso.id === cursoId
        );


    asignados.forEach(docente => {

        const academia =
            obtenerAcademia(docente.academiaId);

        const dominio =
            obtenerDominio(
                docente.id,
                cursoId
            );


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${escaparHTML(docente.nombre)}
            </td>

            <td>
                ${academia
                    ? escaparHTML(academia.nombre)
                    : "Sin academia"}
            </td>

            <td>
                ${
                    dominio !== null
                        ? `${dominio}/10`
                        : "Sin registrar"
                }
            </td>

            <td>
                <button
                    type="button"
                    class="w3-button w3-small w3-red"
                    onclick="desasignarDocente(${curso.id}, ${docente.id})"
                >
                    Desasignar
                </button>
            </td>

        `;

        tbody.appendChild(fila);

    });
}


// ============================================================
// ASIGNAR DOCENTE
// ============================================================

function asignarDocente(
    cursoId,
    docenteId
) {

    if (
        estaAsignado(
            cursoId,
            docenteId
        )
    ) {

        alert(
            "El docente ya está asignado a este curso."
        );

        return;
    }


    const curso =
        appState.cursos.find(
            curso =>
                curso.id === cursoId
        );

    const docente =
        appState.docentes.find(
            docente =>
                docente.id === docenteId
        );


    if (!curso || !docente) {
        return;
    }


    if (
        curso.academiaId !==
        docente.academiaId
    ) {

        alert(
            "No se puede asignar el docente porque pertenece a una academia diferente."
        );

        return;
    }


    const nuevaAsignacion = {

        id: obtenerNuevoId(
            appState.asignaciones
        ),

        cursoId,
        docenteId

    };


    appState.asignaciones.push(
        nuevaAsignacion
    );


    mostrarCandidatos();
    cargarCursos();

}


// ============================================================
// DESASIGNAR DOCENTE
// ============================================================

function desasignarDocente(
    cursoId,
    docenteId
) {

    const indice =
        appState.asignaciones.findIndex(
            asignacion =>
                asignacion.cursoId === cursoId &&
                asignacion.docenteId === docenteId
        );


    if (indice === -1) {
        return;
    }


    appState.asignaciones.splice(
        indice,
        1
    );


    mostrarCandidatos();
    cargarCursos();

}


// ============================================================
// DOMINIO
// ============================================================

function obtenerDominio(
    docenteId,
    cursoId
) {

    const relacion =
        appState.dominios.find(
            dominio =>
                dominio.docenteId === docenteId &&
                dominio.cursoId === cursoId
        );


    if (!relacion) {
        return null;
    }


    return relacion.nivel;
}


// ============================================================
// GUARDAR DOMINIO
// ============================================================

function guardarDominio(
    docenteId,
    cursoId,
    nivel
) {

    nivel = Number(nivel);


    if (
        !Number.isInteger(nivel) ||
        nivel < 1 ||
        nivel > 10
    ) {

        alert(
            "El nivel de dominio debe ser un número entero entre 1 y 10."
        );

        return false;
    }


    const docente =
        appState.docentes.find(
            docente =>
                docente.id === docenteId
        );

    const curso =
        appState.cursos.find(
            curso =>
                curso.id === cursoId
        );


    if (!docente || !curso) {
        return false;
    }


    if (
        docente.academiaId !==
        curso.academiaId
    ) {

        alert(
            "El docente y el curso deben pertenecer a la misma academia."
        );

        return false;
    }


    const existente =
        appState.dominios.find(
            dominio =>
                dominio.docenteId === docenteId &&
                dominio.cursoId === cursoId
        );


    if (existente) {

        existente.nivel = nivel;

    } else {

        appState.dominios.push({

            id: obtenerNuevoId(
                appState.dominios
            ),

            docenteId,
            cursoId,
            nivel

        });

    }


    alert(
        "Nivel de dominio guardado correctamente."
    );


    cargarDocentes();

    mostrarCandidatos();

    return true;
}


// ============================================================
// SELECTS DE DOMINIO
// ============================================================

function cargarSelectsDominio() {

    const docenteSelect =
        document.getElementById("docenteDominio");

    const cursoSelect =
        document.getElementById("cursoDominio");


    if (docenteSelect) {

        docenteSelect.innerHTML = `
            <option value="">
                Seleccionar docente...
            </option>
        `;

        appState.docentes.forEach(docente => {

            const option =
                document.createElement("option");

            option.value = docente.id;

            option.textContent =
                `${docente.nombre} (${docente.numeroEmpleado})`;

            docenteSelect.appendChild(option);

        });

    }


    if (cursoSelect) {

        cursoSelect.innerHTML = `
            <option value="">
                Seleccionar curso...
            </option>
        `;

        appState.cursos.forEach(curso => {

            const option =
                document.createElement("option");

            option.value = curso.id;
            option.textContent = curso.nombre;

            cursoSelect.appendChild(option);

        });

    }

}


// ============================================================
// OBTENER ACADEMIA
// ============================================================

function obtenerAcademia(
    academiaId
) {

    return appState.academias.find(
        academia =>
            academia.id === academiaId
    );
}


// ============================================================
// OBTENER DOCENTES ASIGNADOS
// ============================================================

function obtenerDocentesAsignados(
    cursoId
) {

    return appState.asignaciones
        .filter(
            asignacion =>
                asignacion.cursoId === cursoId
        )
        .map(
            asignacion =>
                appState.docentes.find(
                    docente =>
                        docente.id ===
                        asignacion.docenteId
                )
        )
        .filter(Boolean);
}


// ============================================================
// COMPROBAR ASIGNACIÓN
// ============================================================

function estaAsignado(
    cursoId,
    docenteId
) {

    return appState.asignaciones.some(
        asignacion =>
            asignacion.cursoId === cursoId &&
            asignacion.docenteId === docenteId
    );
}


// ============================================================
// GENERAR NUEVO ID
// ============================================================

function obtenerNuevoId(
    coleccion
) {

    if (coleccion.length === 0) {
        return 1;
    }


    return Math.max(
        ...coleccion.map(
            elemento =>
                elemento.id
        )
    ) + 1;
}


// ============================================================
// EVENTOS
// ============================================================

function configurarEventos() {

    // --------------------------------------------------------
    // Buscar docentes
    // --------------------------------------------------------

    const buscarDocente =
        document.getElementById("buscarDocente");

    if (buscarDocente) {

        buscarDocente.addEventListener(
            "input",
            cargarDocentes
        );

    }


    // --------------------------------------------------------
    // Filtrar docentes por academia
    // --------------------------------------------------------

    const filtroAcademiaDocente =
        document.getElementById(
            "filtroAcademiaDocente"
        );

    if (filtroAcademiaDocente) {

        filtroAcademiaDocente.addEventListener(
            "change",
            cargarDocentes
        );

    }


    // --------------------------------------------------------
    // Buscar cursos
    // --------------------------------------------------------

    const buscarCurso =
        document.getElementById("buscarCurso");

    if (buscarCurso) {

        buscarCurso.addEventListener(
            "input",
            cargarCursos
        );

    }


    // --------------------------------------------------------
    // Filtrar cursos por academia
    // --------------------------------------------------------

    const filtroAcademiaCurso =
        document.getElementById(
            "filtroAcademiaCurso"
        );

    if (filtroAcademiaCurso) {

        filtroAcademiaCurso.addEventListener(
            "change",
            cargarCursos
        );

    }


    // --------------------------------------------------------
    // Curso para asignación
    // --------------------------------------------------------

    const cursoAsignacion =
        document.getElementById(
            "cursoAsignacion"
        );

    if (cursoAsignacion) {

        cursoAsignacion.addEventListener(
            "change",
            mostrarCandidatos
        );

    }


    // --------------------------------------------------------
    // Ordenamiento por dominio
    // --------------------------------------------------------

    const ordenDominio =
        document.getElementById(
            "ordenDominio"
        );

    if (ordenDominio) {

        ordenDominio.addEventListener(
            "change",
            mostrarCandidatos
        );

    }


    // --------------------------------------------------------
    // SNI
    // --------------------------------------------------------

    const sni =
        document.getElementById("sni");

    const nivelSni =
        document.getElementById("nivelSni");


    if (sni && nivelSni) {

        sni.addEventListener(
            "change",
            () => {

                const tieneSni =
                    sni.value === "si";

                nivelSni.disabled =
                    !tieneSni;

                if (!tieneSni) {
                    nivelSni.value = "";
                }

            }
        );

    }


    // --------------------------------------------------------
    // Formulario docente
    // --------------------------------------------------------

    const formularioDocente =
        document.getElementById(
            "formDocente"
        );

    if (formularioDocente) {

        formularioDocente.addEventListener(
            "submit",
            manejarFormularioDocente
        );

    }


    // --------------------------------------------------------
    // Formulario academia
    // --------------------------------------------------------

    const formularioAcademia =
        document.getElementById(
            "formAcademia"
        );

    if (formularioAcademia) {

        formularioAcademia.addEventListener(
            "submit",
            manejarFormularioAcademia
        );

    }


    // --------------------------------------------------------
    // Formulario curso
    // --------------------------------------------------------

    const formularioCurso =
        document.getElementById(
            "formCurso"
        );

    if (formularioCurso) {

        formularioCurso.addEventListener(
            "submit",
            manejarFormularioCurso
        );

    }


    // --------------------------------------------------------
    // Formulario dominio
    // --------------------------------------------------------

    const formularioDominio =
        document.getElementById(
            "formDominio"
        );

    if (formularioDominio) {

        formularioDominio.addEventListener(
            "submit",
            manejarFormularioDominio
        );

    }


    // --------------------------------------------------------
    // Cambiar docente de dominio
    // --------------------------------------------------------

    const docenteDominio =
        document.getElementById(
            "docenteDominio"
        );

    const cursoDominio =
        document.getElementById(
            "cursoDominio"
        );


    if (docenteDominio && cursoDominio) {

        docenteDominio.addEventListener(
            "change",
            cargarDominioExistente
        );

        cursoDominio.addEventListener(
            "change",
            cargarDominioExistente
        );

    }

}


// ============================================================
// FORMULARIO DOCENTE
// ============================================================

function manejarFormularioDocente(
    event
) {

    event.preventDefault();


    const numeroEmpleado =
        document
            .getElementById("numeroEmpleado")
            .value
            .trim();

    const nombre =
        document
            .getElementById("nombreDocente")
            .value
            .trim();

    const academiaId =
        Number(
            document
                .getElementById("academiaDocente")
                .value
        );


    if (!numeroEmpleado || !nombre) {

        alert(
            "Complete los campos obligatorios."
        );

        return;
    }


    const empleadoExiste =
        appState.docentes.some(
            docente =>
                String(docente.numeroEmpleado)
                    .toLowerCase() ===
                numeroEmpleado.toLowerCase()
        );


    if (empleadoExiste) {

        alert(
            "El número de empleado ya existe."
        );

        return;
    }


    if (!academiaId) {

        alert(
            "Debe seleccionar una academia."
        );

        return;
    }


    const sni =
        document.getElementById("sni").value === "si";


    const nivelSNI =
        sni
            ? document.getElementById("nivelSni").value
            : "";


    const prodep =
        document.getElementById("prodep").value === "si";


    const nuevoDocente = {

        id: obtenerNuevoId(
            appState.docentes
        ),

        numeroEmpleado,

        nombre,

        licenciatura:
            document
                .getElementById("licenciatura")
                .value,

        maestria:
            document
                .getElementById("maestria")
                .value,

        doctorado:
            document
                .getElementById("doctorado")
                .value,

        especialidad:
            document
                .getElementById("especialidad")
                .value
                .trim(),

        sni,

        nivelSNI,

        prodep,

        certificaciones:
            document
                .getElementById("certificaciones")
                .value
                .trim(),

        academiaId

    };


    appState.docentes.push(
        nuevoDocente
    );


    alert(
        "Docente registrado correctamente."
    );


    document
        .getElementById("formDocente")
        .reset();


    const nivelSniSelect =
        document.getElementById("nivelSni");

    if (nivelSniSelect) {

        nivelSniSelect.disabled = true;
        nivelSniSelect.value = "";

    }


    cargarDocentes();
    cargarAcademias();
    cargarSelectsDominio();
}


// ============================================================
// FORMULARIO ACADEMIA
// ============================================================

function manejarFormularioAcademia(
    event
) {

    event.preventDefault();


    const nombre =
        document
            .getElementById("nombreAcademia")
            .value
            .trim();

    const clave =
        document
            .getElementById("claveAcademia")
            .value
            .trim();

    const descripcion =
        document
            .getElementById("descripcionAcademia")
            .value
            .trim();


    const claveValida =
        /^[a-zA-Z0-9]{1,10}$/;


    if (!claveValida.test(clave)) {

        alert(
            "La clave debe ser alfanumérica y tener máximo 10 caracteres."
        );

        return;
    }


    if (!nombre) {

        alert(
            "Debe ingresar un nombre para la academia."
        );

        return;
    }


    const claveExiste =
        appState.academias.some(
            academia =>
                academia.clave
                    .toLowerCase() ===
                clave.toLowerCase()
        );


    if (claveExiste) {

        alert(
            "La clave de academia ya existe."
        );

        return;
    }


    const nuevaAcademia = {

        id: obtenerNuevoId(
            appState.academias
        ),

        nombre,
        clave,
        descripcion

    };


    appState.academias.push(
        nuevaAcademia
    );


    alert(
        "Academia registrada correctamente."
    );


    document
        .getElementById("formAcademia")
        .reset();


    cargarAcademias();
    cargarTodosLosSelectsAcademia();
}


// ============================================================
// FORMULARIO CURSO
// ============================================================

function manejarFormularioCurso(
    event
) {

    event.preventDefault();


    const nombre =
        document
            .getElementById("nombreCurso")
            .value
            .trim();

    const descripcion =
        document
            .getElementById("descripcionCurso")
            .value
            .trim();

    const academiaId =
        Number(
            document
                .getElementById("academiaCurso")
                .value
        );


    if (!nombre) {

        alert(
            "Debe ingresar un nombre para el curso."
        );

        return;
    }


    if (!academiaId) {

        alert(
            "Debe seleccionar una academia."
        );

        return;
    }


    const nombreExiste =
        appState.cursos.some(
            curso =>
                curso.nombre
                    .toLowerCase() ===
                nombre.toLowerCase()
        );


    if (nombreExiste) {

        alert(
            "El nombre del curso ya existe."
        );

        return;
    }


    const nuevoCurso = {

        id: obtenerNuevoId(
            appState.cursos
        ),

        nombre,
        descripcion,
        academiaId

    };


    appState.cursos.push(
        nuevoCurso
    );


    alert(
        "Curso registrado correctamente."
    );


    document
        .getElementById("formCurso")
        .reset();


    cargarCursos();
    cargarAcademias();
    cargarDatosAsignacion();
    cargarSelectsDominio();
}


// ============================================================
// FORMULARIO DOMINIO
// ============================================================

function manejarFormularioDominio(
    event
) {

    event.preventDefault();


    const docenteId =
        Number(
            document
                .getElementById("docenteDominio")
                .value
        );

    const cursoId =
        Number(
            document
                .getElementById("cursoDominio")
                .value
        );

    const nivel =
        document
            .getElementById("nivelDominio")
            .value;


    if (!docenteId || !cursoId) {

        alert(
            "Debe seleccionar un docente y un curso."
        );

        return;
    }


    const guardado =
        guardarDominio(
            docenteId,
            cursoId,
            nivel
        );


    if (guardado) {

        document
            .getElementById("formDominio")
            .reset();

    }

}


// ============================================================
// CARGAR DOMINIO EXISTENTE
// ============================================================

function cargarDominioExistente() {

    const docenteId =
        Number(
            document
                .getElementById("docenteDominio")
                .value
        );

    const cursoId =
        Number(
            document
                .getElementById("cursoDominio")
                .value
        );

    const campoNivel =
        document.getElementById("nivelDominio");


    if (
        !docenteId ||
        !cursoId ||
        !campoNivel
    ) {

        campoNivel.value = "";

        return;
    }


    const dominio =
        obtenerDominio(
            docenteId,
            cursoId
        );


    campoNivel.value =
        dominio !== null
            ? dominio
            : "";

}


// ============================================================
// SEGURIDAD BÁSICA PARA TEXTO
// ============================================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
>>>>>>> 277328fd1937c02e37dd6b3f05942bcdfc3c7231
