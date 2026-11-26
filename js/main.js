
// ============================================================
// IMPORTACIÓN DE MÓDULOS
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
                        String(item.cursoId),
                    horarioIds:
                        Array.isArray(item.horarioIds)
                            ? item.horarioIds.map(
                                id => String(id)
                            )
                            : []
                })
            );


        appState.horarios =
            data.horarios.map(
                item => ({
                    ...item,
                    id: String(item.id)
                })
            );


        appState.plantillas =
            data.plantillas.map(
                item => ({
                    ...item,
                    id: String(item.id),
                    horasSemanales:
                        Number(item.horasSemanales),
                    activa:
                        Number(item.activa)
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


        // Exponer el estado para depuración.

        window.appState =
            appState;


        // ----------------------------------------------------
        // INICIALIZAR SELECTORES
        // ----------------------------------------------------

        initSelects();


        // ----------------------------------------------------
        // ACADEMIAS
        // ----------------------------------------------------

        renderAcademies();

        bindAcademyEvents();


        // ----------------------------------------------------
        // DOCENTES
        // ----------------------------------------------------

        renderTeachers();

        bindTeacherEvents();


        // ----------------------------------------------------
        // CURSOS
        // ----------------------------------------------------

        renderCourses();

        bindCourseEvents();


        // ----------------------------------------------------
        // DOMINIOS
        // Solo se inicializan en la página que contiene
        // la tabla y el formulario de dominios.
        // ----------------------------------------------------

        if (
            document.getElementById("tbodyDominios")
        ) {

            renderDomains();

        }

        if (
            document.getElementById("formDominio")
        ) {

            bindDomainEvents();

        }


        // ----------------------------------------------------
        // ASIGNACIONES
        // Solo se inicializan en asignacion.html.
        // ----------------------------------------------------

        if (
            document.getElementById("academiaAsignacion")
        ) {

            bindAssignmentEvents();

        }

    } catch (error) {

        console.error(
            "Error al iniciar la aplicación:",
            error
        );

    }

}


// ============================================================
// ESPERAR A QUE EL DOCUMENTO ESTÉ DISPONIBLE
// ============================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}