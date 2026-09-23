// ============================================================
// CONFIGURACIÓN
// ============================================================

export const API_URL =
    "http://localhost:3000";


// ============================================================
// GET - RECURSO
// ============================================================

export async function fetchResource(resource) {

    const response =
        await fetch(
            `${API_URL}/${resource}`
        );


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

// ============================================================
// CARGAR TODOS LOS RECURSOS
// ============================================================

export async function loadDataFromAPI() {

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


    return {

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

    };
}

// ============================================================
// ACADEMIAS
// ============================================================

export async function createAcademy(data) {

    const response =
        await fetch(
            `${API_URL}/academias`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Error al crear academia: HTTP ${response.status}`
        );

    }


    return await response.json();

}

export async function updateAcademy(
    id,
    data
) {

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

export async function deleteAcademy(id) {

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
// DOCENTES
// ============================================================

export async function createTeacher(data) {

    const response = await fetch(
        `${API_URL}/docentes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {

        throw new Error(
            `docentes: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();
}


export async function updateTeacher(id, data) {

    const response = await fetch(
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
            `docentes: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();
}


export async function deleteTeacher(id) {

    const response = await fetch(
        `${API_URL}/docentes/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {

        throw new Error(
            `docentes: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return true;
}

// ============================================================
// CURSOS
// ============================================================

export async function createCourse(data) {

    const response = await fetch(
        `${API_URL}/cursos`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {

        throw new Error(
            `cursos: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();

}

export async function updateCourse(id, data) {

    const response = await fetch(
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
            `cursos: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();

}

export async function deleteCourse(id) {

    const response = await fetch(
        `${API_URL}/cursos/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {

        throw new Error(
            `cursos: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return true;

}

// ============================================================
// DOMINIOS
// ============================================================

export async function createDomain(data) {

    const response = await fetch(
        `${API_URL}/dominios`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {

        throw new Error(
            `dominios: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();

}

export async function updateDomain(id, data) {

    const response = await fetch(
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
            `dominios: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return await response.json();

}

// ============================================================
// ASIGNACIONES
// ============================================================

export async function createAssignment(data) {

    const response = await fetch(
        `${API_URL}/asignaciones`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {

        throw new Error(
            `asignaciones: HTTP ${response.status} - ${response.statusText}`
        );

    }


    return await response.json();

}

export async function deleteAssignment(id) {

    const response = await fetch(
        `${API_URL}/asignaciones/${id}`,
        {
            method: "DELETE"
        }
    );


    if (!response.ok) {

        throw new Error(
            `asignaciones: HTTP ${response.status} - ${response.statusText}`
        );

    }

    return true;

}