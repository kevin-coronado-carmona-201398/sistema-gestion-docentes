import { appState } from "./state.js";


// ============================================================
// LLENAR SELECT GENÉRICO
// ============================================================

export function fill(
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


    select.appendChild(
        initialOption
    );


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


// ============================================================
// LLENAR SELECT DE ACADEMIAS
// ============================================================

export function fillAcademies(
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


    select.appendChild(
        initialOption
    );


    appState.academias.forEach(
        academia => {

            const option =
                document.createElement("option");


            option.value =
                academia.id;


            option.textContent =
                `${academia.nombre} (${academia.clave})`;


            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// LLENAR SELECT DE DOCENTES
// ============================================================

export function fillPeople(
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


    select.appendChild(
        initialOption
    );


    appState.docentes.forEach(
        docente => {

            const option =
                document.createElement("option");


            option.value =
                docente.id;


            option.textContent =
                `${docente.nombre} (${docente.numeroEmpleado})`;


            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// LLENAR SELECT DE CURSOS
// ============================================================

export function fillCourses(
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


    select.appendChild(
        initialOption
    );


    appState.cursos.forEach(
        curso => {

            const option =
                document.createElement("option");


            option.value =
                curso.id;


            option.textContent =
                curso.nombre;


            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// INICIALIZAR TODOS LOS SELECTS
// ============================================================

export function initSelects() {

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