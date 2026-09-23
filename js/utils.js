// ============================================================
// ESCAPAR HTML
// ============================================================

export function esc(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ============================================================
// OBTENER ACADEMIA
// ============================================================

export function academy(
    appState,
    id
) {

    return appState.academias.find(
        item =>
            String(item.id) ===
            String(id)
    );

}

// ============================================================
// OBTENER DOMINIO
// ============================================================
export function domain(appState, docenteId, cursoId) {
    return appState.dominios.find(
        item =>
            String(item.docenteId) === String(docenteId) &&
            String(item.cursoId) === String(cursoId)
    );
}

// ============================================================
// VERIFICAR ASIGNACIÓN
// ============================================================

export function assigned(
    appState,
    cursoId,
    docenteId
) {

    return appState.asignaciones.some(
        a =>
            String(a.cursoId) ===
                String(cursoId) &&

            String(a.docenteId) ===
                String(docenteId)
    );

}

// ============================================================
// DOCENTES ASIGNADOS
// ============================================================

export function assignedTeachers(
    appState,
    cursoId
) {

    return appState.asignaciones

        .filter(
            a =>
                String(a.cursoId) ===
                String(cursoId)
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

// ============================================================
// ÚLTIMO GRADO ACADÉMICO
// ============================================================

export function lastDegree(
    docente
) {

    return (
        docente.doctorado ||
        docente.maestria ||
        docente.licenciatura ||
        "No registrado"
    );

}