// ============================================================
// CONFIGURACIÓN DE LA API
// ============================================================

const API_URL = "http://localhost:3000";


// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================

const appState = {
    academias: [],
    docentes: [],
    cursos: [],
    dominios: [],
    asignaciones: [],
    licenciaturas: [],
    maestrias: [],
    doctorados: [],
    nivelesSNI: [],
    especialidades: []
};

let editingAcademyId = null;
let editingCourseId = null;
let editingTeacherId = null;

// ============================================================
// CARGAR DATOS DESDE JSON SERVER
// ============================================================

async function fetchResource(resource) {

    const response =
        await fetch(`${API_URL}/${resource}`);

    if (!response.ok) {

        throw new Error(
            `${resource}: HTTP ${response.status} - ${response.statusText}`
        );

    }

    const data =
        await response.json();

    if (!Array.isArray(data)) {

        throw new Error(
            `${resource}: la respuesta no es un arreglo.`
        );

    }

    return data;

}


async function loadDataFromAPI() {

    try {
    const [
        academias,
        docentes,
        cursos,
        dominios,
        asignaciones,
        licenciaturas,
        maestrias,
        doctorados,
        nivelesSNI,
        especialidades
    ] = await Promise.all([
        fetchResource("academias"),
        fetchResource("docentes"),
        fetchResource("cursos"),
        fetchResource("dominios"),
        fetchResource("asignaciones"),
        fetchResource("licenciaturas"),
        fetchResource("maestrias"),
        fetchResource("doctorados"),
        fetchResource("nivelesSNI"),
        fetchResource("especialidades")
    ]);

        appState.academias =
            academias.map(item => ({
                ...item,
                id: String(item.id)
            }));

        appState.docentes =
            docentes.map(item => ({
                ...item,
                id: String(item.id),
                academiaId: String(item.academiaId)
            }));

        appState.cursos =
            cursos.map(item => ({
                ...item,
                id: String(item.id),
                academiaId: String(item.academiaId)
            }));

        appState.dominios =
            dominios.map(item => ({
                ...item,
                id: String(item.id),
                docenteId: String(item.docenteId),
                cursoId: String(item.cursoId)
            }));

        appState.asignaciones =
            asignaciones.map(item => ({
                ...item,
                id: String(item.id),
                docenteId: String(item.docenteId),
                cursoId: String(item.cursoId)
            }));

            appState.licenciaturas = licenciaturas;
            appState.maestrias = maestrias;
            appState.doctorados = doctorados;
            appState.nivelesSNI = nivelesSNI;
            appState.especialidades = especialidades;

        console.log(
            "Datos cargados desde JSON Server."
        );

        console.log(
            "Academias:",
            appState.academias
        );

        console.log(
            "Docentes:",
            appState.docentes
        );

        console.log(
            "Cursos:",
            appState.cursos
        );

        console.log(
            "Dominios:",
            appState.dominios
        );

        console.log(
            "Asignaciones:",
            appState.asignaciones
        );


    } catch (error) {

        console.error(
            "Error al cargar datos desde JSON Server:",
            error
        );

        alert(
            `Error al conectar con JSON Server:\n\n${error.message}`
        );

    }

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
        item => String(item.id) === String(id)
    );

}

function domain(
    docenteId,
    cursoId
) {

    const item =
        appState.dominios.find(
            d =>
                String(d.docenteId) === String(docenteId) &&
                String(d.cursoId) === String(cursoId)
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
            String(a.cursoId) === String(cursoId) &&
            String(a.docenteId) === String(docenteId)
    );
}


function assignedTeachers(cursoId) {

    return appState.asignaciones

        .filter(
            a =>
                String(a.cursoId) === String(cursoId)
        )

        .map(
            a =>
                appState.docentes.find(
                    d =>
                        String(d.id) ===
                        String(a.docenteId)
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

        const value =
            typeof item === "object"
                ? item.nombre
                : item;

        option.value = value;
        option.textContent = value;

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
        appState.licenciaturas,
        "Seleccionar..."
    );

    fill(
        "maestria",
        appState.maestrias,
        "Seleccionar..."
    );

    fill(
        "doctorado",
        appState.doctorados,
        "Seleccionar..."
    );

    fill(
        "nivelSni",
        appState.nivelesSNI,
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


    if (appState.academias.length === 0) {

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
                                        String(
                                            docente.academiaId
                                        ) ===
                                        String(
                                            academia.id
                                        )
                                ).length
                            }
                        </td>

                        <td>
                            ${
                                appState.cursos.filter(
                                    curso =>
                                        String(
                                            curso.academiaId
                                        ) ===
                                        String(
                                            academia.id
                                        )
                                ).length
                            }
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


    const list =
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
                    String(docente.academiaId) ===
                    String(filter);


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
                    colspan="7"
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
                                    String(
                                        curso.academiaId
                                    ) ===
                                    String(
                                        docente.academiaId
                                    )
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

function editTeacher(id) {

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
        docente.sni
            ? "si"
            : "no";


    document.getElementById(
        "nivelSni"
    ).value =
        docente.nivelSNI || "";


    document.getElementById(
        "nivelSni"
    ).disabled =
        !docente.sni;


    document.getElementById(
        "prodep"
    ).value =
        docente.prodep
            ? "si"
            : "no";


    document.getElementById(
        "certificaciones"
    ).value =
        docente.certificaciones || "";


    editingTeacherId =
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
// CANCELAR EDICIÓN DE DOCENTE
// ============================================================

function cancelTeacherEdit() {

    editingTeacherId = null;

    const form =
        document.getElementById(
            "formDocente"
        );


    if (!form) {
        return;
    }


    form.reset();


    const level =
        document.getElementById(
            "nivelSni"
        );


    if (level) {

        level.disabled = true;
        level.value = "";

    }


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


    console.log(
        "Edición de docente cancelada."
    );

}

// ============================================================
// ELIMINAR DOCENTE
// ============================================================

async function removeTeacher(id) {

    const docente =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!docente) {
        return;
    }


    const domainCount =
        appState.dominios.filter(
            dominio =>
                String(dominio.docenteId) ===
                String(docente.id)
        ).length;


    const assignmentCount =
        appState.asignaciones.filter(
            asignacion =>
                String(asignacion.docenteId) ===
                String(docente.id)
        ).length;


    if (
        domainCount > 0 ||
        assignmentCount > 0
    ) {

        alert(
            `No se puede eliminar al docente "${docente.nombre}" porque tiene ` +
            `${domainCount} dominio(s) y ` +
            `${assignmentCount} asignación(es) asociada(s).`
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
            editingTeacherId &&
            String(editingTeacherId) ===
                String(docente.id)
        ) {

            editingTeacherId = null;

        }


        initSelects();

        renderTeachers();

        renderAcademies();

        renderCourses();

        renderAssignment();


        console.log(
            "Docente eliminado:",
            docente
        );


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


    const list =
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
                    String(curso.academiaId) ===
                    String(filter);


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
                    colspan="5"
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
                                    curso.descripcion ||
                                    ""
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

function editCourse(id) {

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


    editingCourseId =
        String(curso.id);


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Actualizar curso";

    }


    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

// ============================================================
// ELIMINAR CURSO
// ============================================================

async function removeCourse(id) {

    const curso =
        appState.cursos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!curso) {
        return;
    }


    const domainCount =
        appState.dominios.filter(
            dominio =>
                String(dominio.cursoId) ===
                String(curso.id)
        ).length;


    const assignmentCount =
        appState.asignaciones.filter(
            asignacion =>
                String(asignacion.cursoId) ===
                String(curso.id)
        ).length;


    if (
        domainCount > 0 ||
        assignmentCount > 0
    ) {

        alert(
            `No se puede eliminar el curso "${curso.nombre}" porque tiene ` +
            `${domainCount} dominio(s) y ` +
            `${assignmentCount} asignación(es) asociada(s).`
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
            editingCourseId &&
            String(editingCourseId) ===
                String(curso.id)
        ) {

            editingCourseId = null;

        }


        initSelects();

        renderCourses();

        renderAcademies();

        renderTeachers();

        renderAssignment();


        console.log(
            "Curso eliminado:",
            curso
        );


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
// RENDERIZAR ASIGNACIÓN DE CURSOS
// ============================================================

function renderAssignment() {

    const courseId =
    document.getElementById(
        "cursoAsignacion"
    )?.value || "";


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
            String(item.id) ===
            String(courseId)
    );


    if (!course) {
        return;
    }


    const academyData =
        academy(
            course.academiaId
        );


    const assignedList =
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
        assignedList.length > 0
            ? "Asignado"
            : "Disponible";
    }

    if (assignedNames) {
    assignedNames.textContent =
        assignedList.length > 0

            ? assignedList
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
                String(docente.academiaId) ===
                String(course.academiaId)
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
                                                onclick="unassign('${course.id}', '${docente.id}')"
                                            >
                                                Desasignar
                                            </button>

                                        `

                                        : `

                                            <button
                                                type="button"
                                                class="w3-button w3-small w3-blue"
                                                onclick='assign(${JSON.stringify(course.id)}, ${JSON.stringify(docente.id)})'
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

        if (assignedList.length === 0) {

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
                assignedList
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
                                            onclick='unassign(${JSON.stringify(course.id)}, ${JSON.stringify(docente.id)})'
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

async function assign(
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
                String(item.id) ===
                String(courseId)
        );


    const teacher =
        appState.docentes.find(
            item =>
                String(item.id) ===
                String(teacherId)
        );


    if (!course || !teacher) {
        return;
    }


    if (
        String(course.academiaId) !==
        String(teacher.academiaId)
    ) {

        alert(
            "El docente y el curso deben pertenecer a la misma academia."
        );

        return;

    }


    try {

        const nuevaAsignacion =
            await createAssignment({

                cursoId: String(courseId),

                docenteId: String(teacherId)

            });


        appState.asignaciones.push(
            nuevaAsignacion
        );


        console.log(
            "Asignación creada:",
            nuevaAsignacion
        );


        renderCourses();

        renderAssignment();


    } catch (error) {

        console.error(
            "Error al asignar docente:",
            error
        );


        alert(
            "No se pudo realizar la asignación.\n\n" +
            error.message
        );

    }
}

// ============================================================
// CARGAR DOMINIO EXISTENTE
// ============================================================

function existingDomain() {

    const teacherId =
        document.getElementById(
            "docenteDominio"
        )?.value || "";


    const courseId =
        document.getElementById(
            "cursoDominio"
        )?.value || "";


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
// API - CREAR ACADEMIA
// ============================================================

async function createAcademy(data) {
    const response =
        await fetch(`${API_URL}/academias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    if (!response.ok) {
        throw new Error(
            `Error al crear academia: HTTP ${response.status}`
        );
    }

    return await response.json();
}

// ============================================================
// API - ACTUALIZAR ACADEMIA
// ============================================================

async function updateAcademy(id, data) {

    const response =
        await fetch(
            `${API_URL}/academias/${id}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al actualizar academia: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// EDITAR ACADEMIA
// ============================================================

function editAcademy(id) {

    const academia =
        academy(id);

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


    editingAcademyId =
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

function cancelAcademyEdit() {

    editingAcademyId = null;


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

async function removeAcademy(id) {

    const academia =
        academy(id);

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
            `${teachersCount} docente(s) y ${coursesCount} curso(s) asociados.`
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
            editingAcademyId &&
            String(editingAcademyId) ===
                String(academia.id)
        ) {

            editingAcademyId = null;

        }


        initSelects();

        renderAcademies();

        renderTeachers();

        renderCourses();

        renderAssignment();


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
// API - ELIMINAR ACADEMIA
// ============================================================

async function deleteAcademy(id) {

    const response =
        await fetch(
            `${API_URL}/academias/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al eliminar academia: HTTP ${response.status}`
        );

    }


    return true;

}

// ============================================================
// API - CREAR CURSO
// ============================================================

async function createCourse(data) {

    const response =
        await fetch(`${API_URL}/cursos`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


    if (!response.ok) {

        throw new Error(
            `Error al crear curso: HTTP ${response.status}`
        );

    }


    return await response.json();

}

// ============================================================
// API - ACTUALIZAR CURSO
// ============================================================

async function updateCourse(id, data) {

    const response =
        await fetch(
            `${API_URL}/cursos/${id}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al actualizar curso: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// API - ELIMINAR CURSO
// ============================================================

async function deleteCourse(id) {

    const response =
        await fetch(
            `${API_URL}/cursos/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al eliminar curso: HTTP ${response.status}`
        );

    }


    return true;

}


// ============================================================
// API - CREAR DOCENTE
// ============================================================

async function createTeacher(data) {

    const response =
        await fetch(`${API_URL}/docentes`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


    if (!response.ok) {

        throw new Error(
            `Error al crear docente: HTTP ${response.status}`
        );

    }


    return await response.json();

}

// ============================================================
// API - ACTUALIZAR DOCENTE
// ============================================================

async function updateTeacher(id, data) {

    const response =
        await fetch(
            `${API_URL}/docentes/${id}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al actualizar docente: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// API - ELIMINAR DOCENTE
// ============================================================

async function deleteTeacher(id) {

    const response =
        await fetch(
            `${API_URL}/docentes/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al eliminar docente: HTTP ${response.status}`
        );

    }


    return true;

}

// ============================================================
// API - CREAR DOMINIO
// ============================================================

async function createDomain(data) {

    const response =
        await fetch(`${API_URL}/dominios`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


    if (!response.ok) {

        throw new Error(
            `Error al crear dominio: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// API - ACTUALIZAR DOMINIO
// ============================================================

async function updateDomain(id, data) {

    const response =
        await fetch(
            `${API_URL}/dominios/${id}`,
            {

                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al actualizar dominio: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// API - CREAR ASIGNACIÓN
// ============================================================

async function createAssignment(data) {

    const response =
        await fetch(`${API_URL}/asignaciones`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


    if (!response.ok) {

        throw new Error(
            `Error al crear asignación: HTTP ${response.status}`
        );

    }


    return await response.json();

}


// ============================================================
// API - ELIMINAR ASIGNACIÓN
// ============================================================

async function deleteAssignment(id) {
    const response = await fetch(
        `${API_URL}/asignaciones/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Error al eliminar asignación: HTTP ${response.status}`
        );
    }

    return true;
}

async function unassign(courseId, teacherId) {

    const assignment = appState.asignaciones.find(
        a =>
            String(a.cursoId) === String(courseId) &&
            String(a.docenteId) === String(teacherId)
    );

    if (!assignment) {
        return;
    }

    try {

        await deleteAssignment(assignment.id);

        appState.asignaciones =
            appState.asignaciones.filter(
                a => String(a.id) !== String(assignment.id)
            );

        renderCourses();
        renderAssignment();

        console.log("Asignación eliminada:", assignment);

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
                Boolean(editingAcademyId);

                const exists =
                    appState.academias.some(
                        academia =>
                            String(academia.id) !==
                                String(editingAcademyId) &&
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

                    // ========================================================
                    // ACTUALIZAR ACADEMIA
                    // ========================================================

                    if (wasEditing) {

                        const updatedAcademy =
                            await updateAcademy(
                                editingAcademyId,
                                {
                                    nombre,
                                    clave,
                                    descripcion
                                }
                            );


                        const index =
                            appState.academias.findIndex(
                                item =>
                                    String(item.id) ===
                                    String(editingAcademyId)
                            );


                        if (index !== -1) {

                            appState.academias[index] =
                                updatedAcademy;

                        }


                        console.log(
                            "Academia actualizada:",
                            updatedAcademy
                        );


                        editingAcademyId =
                            null;
                        
                        const clearButton =
                        document.getElementById(
                            "limpiarAcademia"
                        );


                        if (clearButton) {
                            clearButton.textContent =
                                "Limpiar";
                        }

                    }


                    // ========================================================
                    // CREAR ACADEMIA
                    // ========================================================

                    else {

                        const nuevaAcademia =
                            await createAcademy({

                                nombre,
                                clave,
                                descripcion

                            });


                        appState.academias.push(
                            nuevaAcademia
                        );


                        console.log(
                            "Academia creada:",
                            nuevaAcademia
                        );

                    }


                    // ========================================================
                    // ACTUALIZAR INTERFAZ
                    // ========================================================

                    event.target.reset();


                    const submitButton =
                        event.target.querySelector(
                            'button[type="submit"]'
                        );


                    if (submitButton) {

                        submitButton.textContent =
                            "Registrar academia";

                    }


                    initSelects();

                    renderAcademies();

                    renderTeachers();

                    renderCourses();


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
    // CANCELAR / LIMPIAR FORMULARIO DE ACADEMIA
    // --------------------------------------------------------

    document
        .getElementById(
            "limpiarAcademia"
        )
        ?.addEventListener(
            "click",
            event => {

                if (editingAcademyId) {

                    event.preventDefault();

                    cancelAcademyEdit();

                }

            }
        );

    // --------------------------------------------------------
    // FORMULARIO DE CURSO
    // --------------------------------------------------------

    document
        .getElementById("formCurso")
        ?.addEventListener(
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
                        "Complete correctamente los datos del curso."
                    );

                    return;
                }


                const wasEditing =
                Boolean(editingCourseId);


                const exists =
                    appState.cursos.some(
                        curso =>
                            String(curso.id) !==
                                String(editingCourseId) &&

                            String(curso.academiaId) ===
                                String(academiaId) &&

                            curso.nombre
                                .toLowerCase() ===
                                nombre.toLowerCase()
                    );


                if (exists) {

                    alert(
                        "El nombre del curso ya existe en esta academia."
                    );

                    return;
                }


                try {

                    // ========================================================
                    // ACTUALIZAR CURSO
                    // ========================================================

                    if (wasEditing) {

                        const updatedCourse =
                            await updateCourse(
                                editingCourseId,
                                {
                                    nombre,
                                    descripcion,
                                    academiaId
                                }
                            );


                        const index =
                            appState.cursos.findIndex(
                                item =>
                                    String(item.id) ===
                                    String(editingCourseId)
                            );


                        if (index !== -1) {

                            appState.cursos[index] =
                                updatedCourse;

                        }


                        console.log(
                            "Curso actualizado:",
                            updatedCourse
                        );


                        editingCourseId =
                            null;

                    }


                    // ========================================================
                    // CREAR CURSO
                    // ========================================================

                    else {

                        const nuevoCurso =
                            await createCourse({

                                nombre,
                                descripcion,
                                academiaId

                            });


                        appState.cursos.push(
                            nuevoCurso
                        );


                        console.log(
                            "Curso creado:",
                            nuevoCurso
                        );

                    }


                    // ========================================================
                    // ACTUALIZAR INTERFAZ
                    // ========================================================

                    event.target.reset();


                    const submitButton =
                        event.target.querySelector(
                            'button[type="submit"]'
                        );


                    if (submitButton) {

                        submitButton.textContent =
                            "Registrar curso";

                    }


                    initSelects();

                    renderCourses();

                    renderAcademies();

                    renderTeachers();

                    renderAssignment();


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
    // FORMULARIO DE DOCENTE
    // --------------------------------------------------------

    document
        .getElementById("formDocente")
        ?.addEventListener(
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


                const academiaId =
                    document
                        .getElementById(
                            "academiaDocente"
                        )
                        .value;


                const sni =
                    document
                        .getElementById("sni")
                        .value === "si";


                // ------------------------------------------------
                // VALIDACIÓN
                // ------------------------------------------------

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

                const wasEditing =
                Boolean(editingTeacherId);

                const exists =
                    appState.docentes.some(
                        docente =>
                            String(docente.id) !==
                                String(editingTeacherId) &&

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

                // ------------------------------------------------
                // CREAR OBJETO
                // ------------------------------------------------

                const nuevoDocente = {

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

                };

                try {

                    // ========================================================
                    // ACTUALIZAR DOCENTE
                    // ========================================================
                    if (wasEditing) {

                        const docenteActualizado =
                            await updateTeacher(
                                editingTeacherId,
                                nuevoDocente
                            );


                        const index =
                            appState.docentes.findIndex(
                                item =>
                                    String(item.id) ===
                                    String(editingTeacherId)
                            );


                        if (index !== -1) {

                            appState.docentes[index] =
                                docenteActualizado;

                        }


                        console.log(
                            "Docente actualizado:",
                            docenteActualizado
                        );


                        editingTeacherId =
                            null;


                        const clearButton =
                            document.getElementById(
                                "limpiarDocente"
                            );


                        if (clearButton) {

                            clearButton.textContent =
                                "Limpiar";

                        }

                    }
                    // ========================================================
                    // CREAR DOCENTE
                    // ========================================================

                    else {

                        const docenteCreado =
                            await createTeacher(
                                nuevoDocente
                            );


                        appState.docentes.push(
                            docenteCreado
                        );


                        console.log(
                            "Docente creado:",
                            docenteCreado
                        );

                    }


                    // ========================================================
                    // LIMPIAR FORMULARIO
                    // ========================================================

                    event.target.reset();


                    const level =
                        document.getElementById(
                            "nivelSni"
                        );


                    if (level) {

                        level.disabled = true;

                        level.value = "";

                    }


                    const submitButton =
                        event.target.querySelector(
                            'button[type="submit"]'
                        );


                    if (submitButton) {

                        submitButton.textContent =
                            "Registrar docente";

                    }


                    initSelects();

                    renderTeachers();

                    renderAcademies();

                    renderAssignment();


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
// CANCELAR / LIMPIAR FORMULARIO DE DOCENTE
// --------------------------------------------------------

document
    .getElementById(
        "limpiarDocente"
    )
    ?.addEventListener(
        "click",
        event => {

            if (editingTeacherId) {

                event.preventDefault();

                cancelTeacherEdit();

            }

        }
    );

// --------------------------------------------------------
// FORMULARIO DE DOMINIO
// --------------------------------------------------------

document
    .getElementById("formDominio")
    ?.addEventListener(
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


            // ------------------------------------------------
            // VALIDACIÓN
            // ------------------------------------------------

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

            const old =
                appState.dominios.find(
                    item =>
                        String(item.docenteId) ===
                            String(docenteId) &&
                        String(item.cursoId) ===
                            String(cursoId)
                );


            try {

                // ------------------------------------------------
                // ACTUALIZAR DOMINIO EXISTENTE
                // ------------------------------------------------

                if (old) {

                    const updatedDomain =
                        await updateDomain(
                            old.id,
                            {
                                nivel
                            }
                        );


                    const index =
                        appState.dominios.findIndex(
                            item =>
                                String(item.id) ===
                                String(old.id)
                        );


                    if (index !== -1) {

                        appState.dominios[index] =
                            updatedDomain;

                    }

                }


                // ------------------------------------------------
                // CREAR DOMINIO NUEVO
                // ------------------------------------------------

                else {

                    const newDomain =
                        await createDomain({

                            docenteId,

                            cursoId,

                            nivel

                        });


                    appState.dominios.push(
                        newDomain
                    );

                }


                // ------------------------------------------------
                // ACTUALIZAR INTERFAZ
                // ------------------------------------------------

                event.target.reset();

                renderTeachers();

                renderAssignment();


                console.log(
                    "Dominio guardado correctamente."
                );


                alert(
                    "Nivel de dominio guardado correctamente."
                );


            } catch (error) {

                console.error(
                    "Error al guardar dominio:",
                    error
                );


                alert(
                    "No se pudo guardar el nivel de dominio.\n\n" +
                    error.message
                );

            }

        }
    );
}

// ============================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================

async function startApp() {

    await loadDataFromAPI();

    initSelects();

    bind();

    renderTeachers();

    renderAcademies();

    renderCourses();

    renderAssignment();

}


// ============================================================
// INICIAR CUANDO EL DOM ESTÉ DISPONIBLE
// ============================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}