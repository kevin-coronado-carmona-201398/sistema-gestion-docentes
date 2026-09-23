// ============================================================
// IMPORTACIÓN DE MODULOS
// ============================================================

import {
    appState
} from "./state.js";


import {
    loadDataFromAPI
} from "./api.js";

import {
    initSelects
} from "./selects.js";


import {
    renderAcademies,
    bindAcademyEvents
} from "./academias.js";

import {
    renderTeachers,
    bindTeacherEvents
} from "./docentes.js";

import {
    renderCourses,
    bindCourseEvents
} from "./cursos.js";

import {
    renderDomains,
    bindDomainEvents
} from "./dominios.js";

import {
    bindAssignmentEvents
} from "./asignaciones.js";

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function startApp() {

    try {

        const data =
            await loadDataFromAPI();


        // ----------------------------------------------------
        // NORMALIZAR DATOS
        // ----------------------------------------------------

        appState.academias =
            data.academias.map(
                item => ({
                    ...item,
                    id: String(item.id)
                })
            );


        appState.docentes =
            data.docentes.map(
                item => ({
                    ...item,
                    id: String(item.id),
                    academiaId:
                        String(item.academiaId)
                })
            );


        appState.cursos =
            data.cursos.map(
                item => ({
                    ...item,
                    id: String(item.id),
                    academiaId:
                        String(item.academiaId)
                })
            );


        appState.dominios =
            data.dominios.map(
                item => ({
                    ...item,
                    id: String(item.id),
                    docenteId:
                        String(item.docenteId),
                    cursoId:
                        String(item.cursoId)
                })
            );


        appState.asignaciones =
            data.asignaciones.map(
                item => ({
                    ...item,
                    id: String(item.id),
                    docenteId:
                        String(item.docenteId),
                    cursoId:
                        String(item.cursoId)
                })
            );


        appState.licenciaturas =
            data.licenciaturas;


        appState.maestrias =
            data.maestrias;


        appState.doctorados =
            data.doctorados;


        appState.nivelesSNI =
            data.nivelesSNI;


        appState.especialidades =
            data.especialidades;


        console.log(
            "Datos cargados desde JSON Server."
        );

        initSelects();

        renderAcademies();
        bindAcademyEvents();

        renderTeachers();
        bindTeacherEvents();

        renderCourses();
        bindCourseEvents();

        renderDomains();
        bindDomainEvents();

        bindAssignmentEvents();

    } catch (error) {

        console.error(
            "Error al iniciar la aplicación:",
            error
        );


        alert(
            `Error al conectar con JSON Server:\n\n${error.message}`
        );

    }

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}