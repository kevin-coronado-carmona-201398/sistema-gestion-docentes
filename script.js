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

    cargarAcademias();

    cargarDocentes();

    cargarCursos();

    cargarDatosAsignacion();

    configurarEventos();

});


// ============================================================
// CATÁLOGOS
// ============================================================

function inicializarCatalogos() {

    llenarSelect(
        "licenciatura",
        mockData.licenciaturas
    );

    llenarSelect(
        "maestria",
        mockData.maestrias
    );

    llenarSelect(
        "doctorado",
        mockData.doctorados
    );

    llenarSelect(
        "nivelSNI",
        mockData.nivelesSNI
    );
}


function llenarSelect(id, opciones) {

    const select = document.getElementById(id);

    if (!select) {
        return;
    }

    opciones.forEach(opcion => {

        const option = document.createElement("option");

        option.value = opcion;

        option.textContent = opcion;

        select.appendChild(option);

    });
}


// ============================================================
// ACADEMIAS
// ============================================================

function cargarAcademias() {

    const select = document.getElementById("academia");

    if (!select) {
        return;
    }

    select.innerHTML =
        '<option value="">Seleccione una academia</option>';

    appState.academias.forEach(academia => {

        const option = document.createElement("option");

        option.value = academia.id;

        option.textContent =
            `${academia.nombre} (${academia.clave})`;

        select.appendChild(option);

    });
}


// ============================================================
// DOCENTES
// ============================================================

function cargarDocentes() {

    const tabla = document.getElementById("tablaDocentes");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    appState.docentes.forEach(docente => {

        const academia =
            obtenerAcademia(docente.academiaId);

        const fila =
            document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${docente.numeroEmpleado}
            </td>

            <td>
                ${docente.nombre}
            </td>

            <td>
                ${docente.licenciatura}
            </td>

            <td>
                ${docente.especialidad}
            </td>

            <td>
                ${academia ? academia.nombre : "Sin academia"}
            </td>

            <td>
                ${docente.sni
                    ? docente.nivelSNI
                    : "No"}
            </td>

            <td>
                ${docente.prodep
                    ? "Sí"
                    : "No"}
            </td>

        `;

        tabla.appendChild(fila);

    });
}


// ============================================================
// CURSOS
// ============================================================

function cargarCursos() {

    const tabla = document.getElementById("tablaCursos");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    appState.cursos.forEach(curso => {

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
                ${curso.nombre}
            </td>

            <td>
                ${curso.descripcion}
            </td>

            <td>
                ${academia
                    ? academia.nombre
                    : "Sin academia"}
            </td>

            <td>
                ${estado}
            </td>

            <td>
                ${asignados.length > 0
                    ? asignados
                        .map(docente => docente.nombre)
                        .join(", ")
                    : "Ninguno"}
            </td>

        `;

        tabla.appendChild(fila);

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

    selectCurso.innerHTML =
        '<option value="">Seleccione un curso</option>';

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
        Number(selectCurso.value);

    if (!cursoId) {
        return;
    }

    const curso =
        appState.cursos.find(
            curso => curso.id === cursoId
        );

    if (!curso) {
        return;
    }


    // --------------------------------------------------------
    // Solo docentes de la misma academia
    // --------------------------------------------------------

    let candidatos =
        appState.docentes.filter(
            docente =>
                docente.academiaId === curso.academiaId
        );


    // --------------------------------------------------------
    // Sorting:
    //
    // Mayor dominio → menor dominio
    //
    // Los docentes sin dominio quedan al final.
    // --------------------------------------------------------

    candidatos.sort((a, b) => {

        const dominioA =
            obtenerDominio(a.id, curso.id);

        const dominioB =
            obtenerDominio(b.id, curso.id);

        if (dominioA === null) {
            return 1;
        }

        if (dominioB === null) {
            return -1;
        }

        return dominioB - dominioA;

    });


    mostrarTablaCandidatos(
        candidatos,
        curso
    );
}


// ============================================================
// TABLA DE CANDIDATOS
// ============================================================

function mostrarTablaCandidatos(
    candidatos,
    curso
) {

    const tabla =
        document.getElementById(
            "tablaCandidatos"
        );

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";


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


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${docente.nombre}
            </td>

            <td>
                ${docente.numeroEmpleado}
            </td>

            <td>
                ${dominio !== null
                    ? dominio
                    : "Sin registrar"}
            </td>

            <td>

                ${
                    asignado

                    ? `
                        <button
                            class="w3-button w3-small w3-red"
                            onclick="
                                desasignarDocente(
                                    ${curso.id},
                                    ${docente.id}
                                )
                            "
                        >
                            Desasignar
                        </button>
                    `

                    : `
                        <button
                            class="w3-button w3-small w3-blue"
                            onclick="
                                asignarDocente(
                                    ${curso.id},
                                    ${docente.id}
                                )
                            "
                        >
                            Asignar
                        </button>
                    `
                }

            </td>

        `;


        tabla.appendChild(fila);

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
            curso => curso.id === cursoId
        );

    const docente =
        appState.docentes.find(
            docente => docente.id === docenteId
        );


    if (!curso || !docente) {
        return;
    }


    // --------------------------------------------------------
    // Regla de negocio:
    //
    // El docente y el curso deben pertenecer
    // a la misma academia.
    // --------------------------------------------------------

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

        cursoId: cursoId,

        docenteId: docenteId

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
// REGISTRAR / ACTUALIZAR DOMINIO
// ============================================================

function guardarDominio(
    docenteId,
    cursoId,
    nivel
) {

    nivel = Number(nivel);


    // --------------------------------------------------------
    // Validación
    // --------------------------------------------------------

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
            docente => docente.id === docenteId
        );

    const curso =
        appState.cursos.find(
            curso => curso.id === cursoId
        );


    if (!docente || !curso) {
        return false;
    }


    // --------------------------------------------------------
    // Regla de academia
    // --------------------------------------------------------

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

            docenteId: docenteId,

            cursoId: cursoId,

            nivel: nivel

        });

    }


    return true;
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

    const asignaciones =
        appState.asignaciones.filter(
            asignacion =>
                asignacion.cursoId === cursoId
        );


    return asignaciones
        .map(asignacion =>
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
            elemento => elemento.id
        )
    ) + 1;
}


// ============================================================
// EVENTOS
// ============================================================

function configurarEventos() {


    // --------------------------------------------------------
    // Selección de curso para asignación
    // --------------------------------------------------------

    const selectCurso =
        document.getElementById(
            "cursoAsignacion"
        );


    if (selectCurso) {

        selectCurso.addEventListener(
            "change",
            mostrarCandidatos
        );

    }


    // --------------------------------------------------------
    // SNI
    // --------------------------------------------------------

    const checkboxSNI =
        document.getElementById(
            "sni"
        );


    const nivelSNI =
        document.getElementById(
            "nivelSNI"
        );


    if (
        checkboxSNI &&
        nivelSNI
    ) {

        checkboxSNI.addEventListener(
            "change",
            () => {

                nivelSNI.disabled =
                    !checkboxSNI.checked;

                if (
                    !checkboxSNI.checked
                ) {

                    nivelSNI.value = "";

                }

            }
        );

    }


    // --------------------------------------------------------
    // FORMULARIO DE DOCENTE
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
    // FORMULARIO DE ACADEMIA
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
    // FORMULARIO DE CURSO
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

}


// ============================================================
// FORMULARIO DOCENTE
// ============================================================

function manejarFormularioDocente(
    event
) {

    event.preventDefault();


    const numeroEmpleado =
        document.getElementById(
            "numeroEmpleado"
        ).value.trim();


    const nombre =
        document.getElementById(
            "nombre"
        ).value.trim();


    const academiaId =
        Number(
            document.getElementById(
                "academia"
            ).value
        );


    // --------------------------------------------------------
    // Número de empleado único
    // --------------------------------------------------------

    const empleadoExiste =
        appState.docentes.some(
            docente =>
                docente.numeroEmpleado
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
        document.getElementById(
            "sni"
        ).checked;


    const nivelSNI =
        sni
            ? document.getElementById(
                "nivelSNI"
            ).value
            : "";


    const nuevoDocente = {

        id: obtenerNuevoId(
            appState.docentes
        ),

        numeroEmpleado,

        nombre,

        licenciatura:
            document.getElementById(
                "licenciatura"
            ).value,

        maestria:
            document.getElementById(
                "maestria"
            ).value,

        doctorado:
            document.getElementById(
                "doctorado"
            ).value,

        especialidad:
            document.getElementById(
                "especialidad"
            ).value.trim(),

        sni,

        nivelSNI,

        prodep:
            document.getElementById(
                "prodep"
            ).checked,

        certificaciones:
            document.getElementById(
                "certificaciones"
            ).value.trim(),

        academiaId

    };


    appState.docentes.push(
        nuevoDocente
    );


    alert(
        "Docente registrado correctamente."
    );


    formularioDocente.reset();


    document.getElementById(
        "nivelSNI"
    ).disabled = true;


    cargarDocentes();

    cargarAcademias();

}


// ============================================================
// FORMULARIO ACADEMIA
// ============================================================

function manejarFormularioAcademia(
    event
) {

    event.preventDefault();


    const nombre =
        document.getElementById(
            "nombreAcademia"
        ).value.trim();


    const clave =
        document.getElementById(
            "claveAcademia"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "descripcionAcademia"
        ).value.trim();


    // --------------------------------------------------------
    // Validación de clave
    //
    // Máximo 10 caracteres
    // Solo caracteres alfanuméricos
    // --------------------------------------------------------

    const claveValida =
        /^[a-zA-Z0-9]{1,10}$/;


    if (
        !claveValida.test(clave)
    ) {

        alert(
            "La clave debe ser alfanumérica y tener máximo 10 caracteres."
        );

        return;
    }


    // --------------------------------------------------------
    // Clave única
    // --------------------------------------------------------

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
        .getElementById(
            "formAcademia"
        )
        .reset();


    cargarAcademias();

}


// ============================================================
// FORMULARIO CURSO
// ============================================================

function manejarFormularioCurso(
    event
) {

    event.preventDefault();


    const nombre =
        document.getElementById(
            "nombreCurso"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "descripcionCurso"
        ).value.trim();


    const academiaId =
        Number(
            document.getElementById(
                "academiaCurso"
            ).value
        );


    if (!academiaId) {

        alert(
            "Debe seleccionar una academia."
        );

        return;
    }


    // --------------------------------------------------------
    // Nombre único
    // --------------------------------------------------------

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
        .getElementById(
            "formCurso"
        )
        .reset();


    cargarCursos();

    cargarDatosAsignacion();

}