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
// LLENAR SELECT DE DÍAS DE HORARIOS
// ============================================================

export function fillScheduleDays(
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


    const days = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes"
    ];


    days.forEach(
        dia => {

            const option =
                document.createElement("option");


            option.value =
                dia;


            option.textContent =
                dia;


            select.appendChild(
                option
            );

        }
    );

}

// ============================================================
// LLENAR SELECT DE HORAS SEGÚN EL DÍA
// ============================================================

export function fillScheduleHours(
    id,
    day,
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


    if (!day) {

        select.disabled = true;

        return;
    }


    const schedules =
        appState.horarios
            .filter(
                horario =>
                    horario.dia === day
            )
            .sort(
                (a, b) =>
                    Number(a.id) -
                    Number(b.id)
            );


    schedules.forEach(
        horario => {

            const option =
                document.createElement("option");


            option.value =
                String(horario.id);


            option.textContent =
                `${horario.horaInicio}-${horario.horaFin}`;


            select.appendChild(
                option
            );

        }
    );


    select.disabled =
        schedules.length === 0;

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