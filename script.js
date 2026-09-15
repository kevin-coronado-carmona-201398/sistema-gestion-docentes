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
