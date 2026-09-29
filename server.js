const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();

const PORT = 3000;

const DATA_PATH =
    path.join(
        __dirname,
        "datos.json"
    );


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    express.json()
);


// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------

app.use(
    (req, res, next) => {

        res.header(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.header(
            "Access-Control-Allow-Methods",
            "GET,POST,PATCH,DELETE,OPTIONS"
        );

        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );

        if (
            req.method === "OPTIONS"
        ) {

            return res.sendStatus(
                204
            );

        }

        next();

    }
);


// ============================================================
// LEER DATOS
// ============================================================

async function readData() {

    const fileContent =
        await fs.readFile(
            DATA_PATH,
            "utf-8"
        );

    return JSON.parse(
        fileContent
    );

}

// ============================================================
// ESCRIBIR DATOS
// ============================================================

async function writeData(data) {

    await fs.writeFile(
        DATA_PATH,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf-8"
    );
}

// ============================================================
// GENERAR NUEVO ID
// ============================================================

function nextId(collection) {

    const numericIds =
        collection
            .map(
                item =>
                    Number(item.id)
            )
            .filter(
                id =>
                    Number.isFinite(id)
            );

    if (numericIds.length === 0) {
        return "1";
    }

    return String(
        Math.max(
            ...numericIds
        ) + 1
    );
}

// ============================================================
// NORMALIZAR SI / NO
// ============================================================

function normalizeYesNo(
    value,
    defaultValue = "no"
) {

    const normalized =
        String(
            value ?? defaultValue
        )
            .trim()
            .toLowerCase();

    return normalized === "si"
        ? "si"
        : "no";
}


// ============================================================
// VALIDAR NIVEL ACADÉMICO
// ============================================================

function isValidAcademicLevel(
    value
) {
    return [
        "Licenciatura",
        "Maestría",
        "Doctorado"
    ].includes(
        value
    );
}

// ============================================================
// RUTA DE PRUEBA
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "Servidor Express de Gestión Académica funcionando."
        );

    }
);


// ============================================================
// GET ACADEMIAS
// ============================================================

app.get(
    "/academias",
    async (req, res) => {

        try {

            const data =
                await readData();
            res.json(
                data.academias
            );
        } catch (error) {
            console.error(
                "Error al leer academias:",
                error
            );
            res.status(500).json({
                error:
                    "No se pudieron cargar las academias."
            });

        }
    }
);

// ============================================================
// POST ACADEMIA
// ============================================================

app.post(
    "/academias",
    async (req, res) => {
        try {
            const data =
                await readData();
            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();
            const clave =
                String(
                    req.body.clave || ""
                ).trim();
            const descripcion =
                String(
                    req.body.descripcion || ""
                ).trim();

            // ------------------------------------------------
            // VALIDAR CAMPOS OBLIGATORIOS
            // ------------------------------------------------

            if (
                !nombre ||
                !clave
            ) {
                return res.status(400).json({
                    error:
                        "El nombre y la clave de la academia son obligatorios."
                });
            }

            // ------------------------------------------------
            // VALIDAR CLAVE
            // ------------------------------------------------

            if (
                !/^[a-zA-Z0-9]{1,10}$/.test(
                    clave
                )
            ) {
                return res.status(400).json({

                    error:
                        "La clave debe contener únicamente caracteres alfanuméricos y tener máximo 10 caracteres."

                });
            }

            // ------------------------------------------------
            // VALIDAR CLAVE ÚNICA
            // ------------------------------------------------

            const claveExiste =
                data.academias.some(
                    academia =>
                        String(
                            academia.clave
                        )
                            .toLowerCase() ===
                        clave.toLowerCase()
                );

            if (claveExiste) {
                return res.status(409).json({
                    error:
                        "La clave de academia ya existe."
                });
            }

            // ------------------------------------------------
            // CREAR ACADEMIA
            // ------------------------------------------------

            const newAcademy = {
                id:
                    nextId(
                        data.academias
                    ),
                nombre,
                clave,
                descripcion
            };

            data.academias.push(
                newAcademy
            );

            await writeData(
                data
            );

            res.status(201).json(
                newAcademy
            );

        } catch (error) {
            console.error(
                "Error al crear academia:",
                error
            );
            res.status(500).json({
                error:
                    "No se pudo crear la academia."
            });
        }
    }
);

// ============================================================
// PATCH ACADEMIA
// ============================================================

app.patch(
    "/academias/:id",
    async (req, res) => {
        try {
            const data =
                await readData();

            const academyIndex =
                data.academias.findIndex(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                academyIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "La academia no existe."
                });
            }

            const currentAcademy =
                data.academias[
                    academyIndex
                ];

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : currentAcademy.nombre;

            const clave =
                req.body.clave !== undefined
                    ? String(
                        req.body.clave
                    ).trim()
                    : currentAcademy.clave;

            const descripcion =
                req.body.descripcion !== undefined
                    ? String(
                        req.body.descripcion
                    ).trim()
                    : currentAcademy.descripcion;

            // ------------------------------------------------
            // VALIDAR CAMPOS
            // ------------------------------------------------

            if (
                !nombre ||
                !clave
            ) {
                return res.status(400).json({
                    error:
                        "El nombre y la clave de la academia son obligatorios."
                });
            }

            // ------------------------------------------------
            // VALIDAR CLAVE
            // ------------------------------------------------

            if (
                !/^[a-zA-Z0-9]{1,10}$/.test(
                    clave
                )
            ) {
                return res.status(400).json({
                    error:
                        "La clave debe contener únicamente caracteres alfanuméricos y tener máximo 10 caracteres."
                });
            }

            // ------------------------------------------------
            // VALIDAR CLAVE ÚNICA
            // ------------------------------------------------

            const duplicateKey =
                data.academias.some(
                    (academia, index) =>
                        index !== academyIndex &&
                        String(
                            academia.clave
                        )
                            .toLowerCase() ===
                        clave.toLowerCase()
                );

            if (duplicateKey) {
                return res.status(409).json({
                    error:
                        "La clave de academia ya existe."
                });
            }

            // ------------------------------------------------
            // ACTUALIZAR
            // ------------------------------------------------

            const updatedAcademy = {
                ...currentAcademy,
                nombre,
                clave,
                descripcion
            };

            data.academias[
                academyIndex
            ] =
                updatedAcademy;
            await writeData(
                data
            );

            res.json(
                updatedAcademy
            );

        } catch (error) {
            console.error(
                "Error al actualizar academia:",
                error
            );
            res.status(500).json({
                error:
                    "No se pudo actualizar la academia."
            });
        }
    }
);

// ============================================================
// DELETE ACADEMIA
// ============================================================

app.delete(
    "/academias/:id",
    async (req, res) => {
        try {
            const data =
                await readData();
            const academyIndex =
                data.academias.findIndex(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                academyIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "La academia no existe."
                });
            }

            const academy =
                data.academias[
                    academyIndex
                ];

            // ------------------------------------------------
            // COMPROBAR DOCENTES
            // ------------------------------------------------

            const hasTeachers =
                data.docentes.some(
                    docente =>
                        String(
                            docente.academiaId
                        ) ===
                        String(
                            academy.id
                        )
                );

            // ------------------------------------------------
            // COMPROBAR CURSOS
            // ------------------------------------------------

            const hasCourses =
                data.cursos.some(
                    curso =>
                        String(
                            curso.academiaId
                        ) ===
                        String(
                            academy.id
                        )
                );

            if (
                hasTeachers ||
                hasCourses
            ) {
                return res.status(409).json({

                    error:
                        "No se puede eliminar la academia porque tiene docentes o cursos asociados."

                });
            }

            // ------------------------------------------------
            // ELIMINAR
            // ------------------------------------------------

            data.academias.splice(
                academyIndex,
                1
            );

            await writeData(
                data
            );

            res.status(204).send();

        } catch (error) {

            console.error(
                "Error al eliminar academia:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo eliminar la academia."
            });
        }
    }
);

// ============================================================
// GET DOCENTES
// ============================================================

app.get(
    "/docentes",
    async (req, res) => {
        try {
            const data =
                await readData();

            res.json(
                data.docentes
            );

        } catch (error) {
            console.error(
                "Error al leer docentes:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar los docentes."
            });
        }
    }
);

// ============================================================
// POST DOCENTE
// ============================================================

app.post(
    "/docentes",
    async (req, res) => {
        try {
            const data =
                await readData();

            const numeroEmpleado =
                String(
                    req.body.numeroEmpleado || ""
                ).trim();

            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();

            const nivelAcademico =
                String(
                    req.body.nivelAcademico || ""
                ).trim();

            const tituloAcademico =
                String(
                    req.body.tituloAcademico || ""
                ).trim();

            const especialidad =
                String(
                    req.body.especialidad || ""
                ).trim();

            const academiaId =
                String(
                    req.body.academiaId || ""
                ).trim();

            const sni =
                normalizeYesNo(
                    req.body.sni
                );

            const nivelSni =
                String(
                    req.body.nivelSni || ""
                ).trim();

            const prodep =
                normalizeYesNo(
                    req.body.prodep
                );

            const certificaciones =
                String(
                    req.body.certificaciones || ""
                ).trim();

            // ------------------------------------------------
            // CAMPOS OBLIGATORIOS
            // ------------------------------------------------

            if (
                !numeroEmpleado ||
                !nombre ||
                !nivelAcademico ||
                !tituloAcademico ||
                !academiaId
            ) {
                return res.status(400).json({
                    error:
                        "Número de empleado, nombre, nivel académico, título obtenido y academia son obligatorios."
                });
            }

            // ------------------------------------------------
            // NIVEL ACADÉMICO
            // ------------------------------------------------

            if (
                !isValidAcademicLevel(
                    nivelAcademico
                )
            ) {
                return res.status(400).json({
                    error:
                        "El nivel académico debe ser Licenciatura, Maestría o Doctorado."
                });
            }

            // ------------------------------------------------
            // ACADEMIA
            // ------------------------------------------------

            const academyExists =
                data.academias.some(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        academiaId
                );

            if (!academyExists) {
                return res.status(400).json({
                    error:
                        "La academia seleccionada no existe."
                });
            }

            // ------------------------------------------------
            // VALIDAR NOMBRE ÚNICO DENTRO DE LA ACADEMIA
            // ------------------------------------------------

            const duplicateCourse =
                data.cursos.some(
                    curso =>
                        String(curso.academiaId) ===
                            String(academiaId) &&
                        String(curso.nombre)
                            .trim()
                            .toLowerCase() ===
                            nombre.toLowerCase()
                );

            if (duplicateCourse) {

                return res.status(409).json({

                    error:
                        "Ya existe un curso con ese nombre dentro de la academia seleccionada."

                });

            }

            // ------------------------------------------------
            // NÚMERO DE EMPLEADO ÚNICO
            // ------------------------------------------------

            const employeeExists =
                data.docentes.some(
                    docente =>
                        String(
                            docente.numeroEmpleado
                        )
                            .toLowerCase() ===
                        numeroEmpleado.toLowerCase()
                );

            if (employeeExists) {
                return res.status(409).json({
                    error:
                        "El número de empleado ya existe."
                });
            }

            // ------------------------------------------------
            // SNI
            // ------------------------------------------------

            if (
                sni === "si"
            ) {
                if (!nivelSni) {
                    return res.status(400).json({
                        error:
                            "Debe especificar el nivel SNI cuando el docente pertenece al SNI."
                    });
                }

                const validSniLevel =
                    data.nivelesSNI.some(
                        nivel =>
                            String(
                                nivel.nombre
                            ).toLowerCase() ===
                            nivelSni.toLowerCase()
                    );

                if (!validSniLevel) {
                    return res.status(400).json({
                        error:
                            "El nivel SNI seleccionado no es válido."
                    });
                }
            }

            // ------------------------------------------------
            // CREAR DOCENTE
            // ------------------------------------------------

            const newTeacher = {
                id:
                    nextId(
                        data.docentes
                    ),
                numeroEmpleado,
                nombre,
                nivelAcademico,
                tituloAcademico,
                especialidad,
                academiaId,
                sni,
                nivelSni:
                    sni === "si"
                        ? nivelSni
                        : "",
                prodep,
                certificaciones
            };

            data.docentes.push(
                newTeacher
            );

            await writeData(
                data
            );

            res.status(201).json(
                newTeacher
            );
        } catch (error) {

            console.error(
                "Error al crear docente:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo crear el docente."
            });
        }
    }
);

// ============================================================
// PATCH DOCENTE
// ============================================================

app.patch(
    "/docentes/:id",
    async (req, res) => {
        try {
            const data =
                await readData();

            const teacherIndex =
                data.docentes.findIndex(
                    docente =>
                        String(
                            docente.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                teacherIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "El docente no existe."
                });
            }

            const currentTeacher =
                data.docentes[
                    teacherIndex
                ];

            const numeroEmpleado =
                req.body.numeroEmpleado !== undefined
                    ? String(
                        req.body.numeroEmpleado
                    ).trim()
                    : currentTeacher.numeroEmpleado;

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : currentTeacher.nombre;

            const nivelAcademico =
                req.body.nivelAcademico !== undefined
                    ? String(
                        req.body.nivelAcademico
                    ).trim()
                    : currentTeacher.nivelAcademico;

            const tituloAcademico =
                req.body.tituloAcademico !== undefined
                    ? String(
                        req.body.tituloAcademico
                    ).trim()
                    : currentTeacher.tituloAcademico;

            const especialidad =
                req.body.especialidad !== undefined
                    ? String(
                        req.body.especialidad
                    ).trim()
                    : currentTeacher.especialidad;

            const academiaId =
                req.body.academiaId !== undefined
                    ? String(
                        req.body.academiaId
                    ).trim()
                    : String(
                        currentTeacher.academiaId
                    );

            const sni =
                req.body.sni !== undefined
                    ? normalizeYesNo(
                        req.body.sni
                    )
                    : normalizeYesNo(
                        currentTeacher.sni
                    );

            const nivelSni =
                req.body.nivelSni !== undefined
                    ? String(
                        req.body.nivelSni
                    ).trim()
                    : (
                        currentTeacher.nivelSni || ""
                    );

            const prodep =
                req.body.prodep !== undefined
                    ? normalizeYesNo(
                        req.body.prodep
                    )
                    : normalizeYesNo(
                        currentTeacher.prodep
                    );

            const certificaciones =
                req.body.certificaciones !== undefined
                    ? String(
                        req.body.certificaciones
                    ).trim()
                    : currentTeacher.certificaciones;

            // ------------------------------------------------
            // VALIDACIONES BÁSICAS
            // ------------------------------------------------

            if (
                !numeroEmpleado ||
                !nombre ||
                !nivelAcademico ||
                !tituloAcademico ||
                !academiaId
            ) {
                return res.status(400).json({
                    error:
                        "Número de empleado, nombre, nivel académico, título obtenido y academia son obligatorios."
                });
            }

            if (
                !isValidAcademicLevel(
                    nivelAcademico
                )
            ) {
                return res.status(400).json({
                    error:
                        "El nivel académico no es válido."
                });
            }

            // ------------------------------------------------
            // ACADEMIA EXISTENTE
            // ------------------------------------------------

            const academyExists =
                data.academias.some(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        academiaId
                );

            if (!academyExists) {
                return res.status(400).json({
                    error:
                        "La academia seleccionada no existe."
                });
            }

            // ------------------------------------------------
            // VALIDAR NOMBRE ÚNICO DENTRO DE LA ACADEMIA
            // ------------------------------------------------

            const duplicateCourse =
                data.cursos.some(
                    (curso, index) =>
                        index !== courseIndex &&
                        String(curso.academiaId) ===
                            String(academiaId) &&
                        String(curso.nombre)
                            .trim()
                            .toLowerCase() ===
                            nombre.toLowerCase()
                );

            if (duplicateCourse) {

                return res.status(409).json({

                    error:
                        "Ya existe un curso con ese nombre dentro de la academia seleccionada."

                });

            }

            // ------------------------------------------------
            // NÚMERO DE EMPLEADO ÚNICO
            // ------------------------------------------------

            const employeeExists =
                data.docentes.some(
                    (docente, index) =>
                        index !== teacherIndex &&
                        String(
                            docente.numeroEmpleado
                        )
                            .toLowerCase() ===
                        numeroEmpleado.toLowerCase()
                );

            if (employeeExists) {
                return res.status(409).json({
                    error:
                        "El número de empleado ya existe."
                });
            }

            // ------------------------------------------------
            // CAMBIO DE ACADEMIA
            // ------------------------------------------------

            const academyChanged =
                String(
                    currentTeacher.academiaId
                ) !==
                String(
                    academiaId
                );

            if (academyChanged) {
                const hasDomains =
                    data.dominios.some(
                        dominio =>
                            String(
                                dominio.docenteId
                            ) ===
                            String(
                                currentTeacher.id
                            )
                    );

                const hasAssignments =
                    data.asignaciones.some(
                        asignacion =>
                            String(
                                asignacion.docenteId
                            ) ===
                            String(
                                currentTeacher.id
                            )
                    );

                if (
                    hasDomains ||
                    hasAssignments
                ) {
                    return res.status(409).json({
                        error:
                            "No se puede cambiar de academia a un docente que tiene dominios o asignaciones asociadas."
                    });
                }
            }

            // ------------------------------------------------
            // SNI
            // ------------------------------------------------

            if (
                sni === "si"
            ) {
                if (!nivelSni) {
                    return res.status(400).json({
                        error:
                            "Debe especificar el nivel SNI cuando el docente pertenece al SNI."
                    });
                }

                const validSniLevel =
                    data.nivelesSNI.some(
                        nivel =>
                            String(
                                nivel.nombre
                            ).toLowerCase() ===
                            nivelSni.toLowerCase()
                    );

                if (!validSniLevel) {
                    return res.status(400).json({
                        error:
                            "El nivel SNI seleccionado no es válido."
                    });
                }
            }

            // ------------------------------------------------
            // ACTUALIZAR
            // ------------------------------------------------

            const updatedTeacher = {
                ...currentTeacher,
                numeroEmpleado,
                nombre,
                nivelAcademico,
                tituloAcademico,
                especialidad,
                academiaId,
                sni,
                nivelSni:
                    sni === "si"
                        ? nivelSni
                        : "",
                prodep,
                certificaciones
            };

            data.docentes[
                teacherIndex
            ] =
                updatedTeacher;

            await writeData(
                data
            );

            res.json(
                updatedTeacher
            );

        } catch (error) {

            console.error(
                "Error al actualizar docente:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo actualizar el docente."
            });
        }
    }
);

// ============================================================
// DELETE DOCENTE
// ============================================================

app.delete(
    "/docentes/:id",
    async (req, res) => {

        try {
            const data =
                await readData();

            const teacherIndex =
                data.docentes.findIndex(
                    docente =>
                        String(
                            docente.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                teacherIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "El docente no existe."
                });
            }

            const docente =
                data.docentes[
                    teacherIndex
                ];

            const hasDomains =
                data.dominios.some(
                    dominio =>
                        String(
                            dominio.docenteId
                        ) ===
                        String(
                            docente.id
                        )
                );

            const hasAssignments =
                data.asignaciones.some(
                    asignacion =>
                        String(
                            asignacion.docenteId
                        ) ===
                        String(
                            docente.id
                        )
                );

            if (
                hasDomains ||
                hasAssignments
            ) {
                return res.status(409).json({
                    error:
                        "No se puede eliminar el docente porque tiene dominios o asignaciones asociadas."
                });
            }

            data.docentes.splice(
                teacherIndex,
                1
            );

            await writeData(
                data
            );

            res.status(204).send();

        } catch (error) {
            console.error(
                "Error al eliminar docente:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo eliminar el docente."
            });
        }
    }
);

// ============================================================
// GET CURSOS
// ============================================================

app.get(
    "/cursos",
    async (req, res) => {
        try {
            const data =
                await readData();
            res.json(
                data.cursos
            );
        } catch (error) {
            console.error(
                "Error al leer cursos:",
                error
            );
            res.status(500).json({
                error:
                    "No se pudieron cargar los cursos."
            });
        }
    }
);

// ============================================================
// POST CURSO
// ============================================================

app.post(
    "/cursos",
    async (req, res) => {
        try {
            const data =
                await readData();

            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();

            const descripcion =
                String(
                    req.body.descripcion || ""
                ).trim();

            const academiaId =
                String(
                    req.body.academiaId || ""
                ).trim();

            if (
                !nombre ||
                !academiaId
            ) {
                return res.status(400).json({
                    error:
                        "El nombre del curso y la academia son obligatorios."
                });
            }

            const academyExists =
                data.academias.some(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        academiaId
                );

            if (!academyExists) {
                return res.status(400).json({
                    error:
                        "La academia seleccionada no existe."
                });
            }

            const newCourse = {
                id:
                    nextId(
                        data.cursos
                    ),
                nombre,
                descripcion,
                academiaId
            };

            data.cursos.push(
                newCourse
            );

            await writeData(
                data
            );

            res.status(201).json(
                newCourse
            );

        } catch (error) {
            console.error(
                "Error al crear curso:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo crear el curso."
            });
        }
    }
);

// ============================================================
// PATCH CURSO
// ============================================================

app.patch(
    "/cursos/:id",
    async (req, res) => {
        try {
            const data =
                await readData();

            const courseIndex =
                data.cursos.findIndex(
                    curso =>
                        String(
                            curso.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                courseIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "El curso no existe."
                });
            }

            const currentCourse =
                data.cursos[
                    courseIndex
                ];

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : currentCourse.nombre;

            const descripcion =
                req.body.descripcion !== undefined
                    ? String(
                        req.body.descripcion
                    ).trim()
                    : currentCourse.descripcion;

            const academiaId =
                req.body.academiaId !== undefined
                    ? String(
                        req.body.academiaId
                    ).trim()
                    : String(
                        currentCourse.academiaId
                    );

            if (
                !nombre ||
                !academiaId
            ) {
                return res.status(400).json({
                    error:
                        "El nombre del curso y la academia son obligatorios."
                });
            }

            const academyExists =
                data.academias.some(
                    academia =>
                        String(
                            academia.id
                        ) ===
                        academiaId
                );

            if (!academyExists) {

                return res.status(400).json({
                    error:
                        "La academia seleccionada no existe."
                });

            }

            // ------------------------------------------------
            // CAMBIO DE ACADEMIA
            // ------------------------------------------------

            const academyChanged =
                String(
                    currentCourse.academiaId
                ) !==
                String(
                    academiaId
                );

            if (academyChanged) {

                const hasDomains =
                    data.dominios.some(
                        dominio =>
                            String(
                                dominio.cursoId
                            ) ===
                            String(
                                currentCourse.id
                            )
                    );

                const hasAssignments =
                    data.asignaciones.some(
                        asignacion =>
                            String(
                                asignacion.cursoId
                            ) ===
                            String(
                                currentCourse.id
                            )
                    );

                if (
                    hasDomains ||
                    hasAssignments
                ) {
                    return res.status(409).json({
                        error:
                            "No se puede cambiar de academia un curso que tiene dominios o asignaciones asociadas."
                    });
                }
            }

            const updatedCourse = {
                ...currentCourse,
                nombre,
                descripcion,
                academiaId
            };

            data.cursos[
                courseIndex
            ] =
                updatedCourse;

            await writeData(
                data
            );

            res.json(
                updatedCourse
            );

        } catch (error) {

            console.error(
                "Error al actualizar curso:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo actualizar el curso."
            });
        }
    }
);

// ============================================================
// DELETE CURSO
// ============================================================

app.delete(
    "/cursos/:id",
    async (req, res) => {

        try {

            const data =
                await readData();

            const courseIndex =
                data.cursos.findIndex(
                    curso =>
                        String(
                            curso.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                courseIndex === -1
            ) {

                return res.status(404).json({

                    error:
                        "El curso no existe."

                });

            }

            const curso =
                data.cursos[
                    courseIndex
                ];

            const hasDomains =
                data.dominios.some(
                    dominio =>
                        String(
                            dominio.cursoId
                        ) ===
                        String(
                            curso.id
                        )
                );

            const hasAssignments =
                data.asignaciones.some(
                    asignacion =>
                        String(
                            asignacion.cursoId
                        ) ===
                        String(
                            curso.id
                        )
                );

            if (
                hasDomains ||
                hasAssignments
            ) {

                return res.status(409).json({

                    error:
                        "No se puede eliminar el curso porque tiene dominios o asignaciones asociadas."

                });

            }

            data.cursos.splice(
                courseIndex,
                1
            );

            await writeData(
                data
            );

            res.status(204).send();

        } catch (error) {

            console.error(
                "Error al eliminar curso:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo eliminar el curso."

            });

        }

    }
);

// ============================================================
// GET DOMINIOS
// ============================================================

app.get(
    "/dominios",
    async (req, res) => {

        try {

            const data =
                await readData();


            res.json(
                data.dominios
            );

        } catch (error) {

            console.error(
                "Error al leer dominios:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron cargar los dominios."

            });

        }

    }
);

// ============================================================
// POST DOMINIO
// ============================================================

app.post(
    "/dominios",
    async (req, res) => {

        try {

            const data =
                await readData();

            const docenteId =
                String(
                    req.body.docenteId || ""
                ).trim();

            const cursoId =
                String(
                    req.body.cursoId || ""
                ).trim();

            const nivel =
                Number(
                    req.body.nivel
                );

            // ------------------------------------------------
            // VALIDAR NIVEL
            // ------------------------------------------------

            if (
                !Number.isInteger(nivel) ||
                nivel < 1 ||
                nivel > 10
            ) {
                return res.status(400).json({
                    error:
                        "El nivel de dominio debe ser un número entero entre 1 y 10."
                });
            }

            const docente =
                data.docentes.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        docenteId
                );

            const curso =
                data.cursos.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        cursoId
                );

            if (
                !docente ||
                !curso
            ) {
                return res.status(404).json({
                    error:
                        "El docente o el curso no existe."
                });
            }

            // ------------------------------------------------
            // MISMA ACADEMIA
            // ------------------------------------------------

            if (
                String(
                    docente.academiaId
                ) !==
                String(
                    curso.academiaId
                )
            ) {

                return res.status(409).json({

                    error:
                        "El docente y el curso deben pertenecer a la misma academia."

                });

            }

            // ------------------------------------------------
            // RELACIÓN ÚNICA
            // ------------------------------------------------

            const relationExists =
                data.dominios.some(
                    dominio =>
                        String(
                            dominio.docenteId
                        ) ===
                        docenteId &&
                        String(
                            dominio.cursoId
                        ) ===
                        cursoId
                );

            if (relationExists) {
                return res.status(409).json({
                    error:
                        "Ya existe un dominio registrado para este docente y este curso."
                });
            }

            const newDomain = {
                id:
                    nextId(
                        data.dominios
                    ),
                docenteId,
                cursoId,
                nivel
            };

            data.dominios.push(
                newDomain
            );

            await writeData(
                data
            );

            res.status(201).json(
                newDomain
            );

        } catch (error) {

            console.error(
                "Error al crear dominio:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo crear el dominio."
            });
        }
    }
);

// ============================================================
// PATCH DOMINIO
// ============================================================

app.patch(
    "/dominios/:id",
    async (req, res) => {

        try {

            const data =
                await readData();

            const domainIndex =
                data.dominios.findIndex(
                    dominio =>
                        String(
                            dominio.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                domainIndex === -1
            ) {
                return res.status(404).json({
                    error:
                        "El dominio no existe."
                });

            }

            const currentDomain =
                data.dominios[
                    domainIndex
                ];

            const docenteId =
                req.body.docenteId !== undefined
                    ? String(
                        req.body.docenteId
                    ).trim()
                    : String(
                        currentDomain.docenteId
                    );

            const cursoId =
                req.body.cursoId !== undefined
                    ? String(
                        req.body.cursoId
                    ).trim()
                    : String(
                        currentDomain.cursoId
                    );

            const nivel =
                req.body.nivel !== undefined
                    ? Number(
                        req.body.nivel
                    )
                    : Number(
                        currentDomain.nivel
                    );

            if (
                !Number.isInteger(nivel) ||
                nivel < 1 ||
                nivel > 10
            ) {

                return res.status(400).json({

                    error:
                        "El nivel de dominio debe ser un número entero entre 1 y 10."

                });

            }

            const docente =
                data.docentes.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        docenteId
                );

            const curso =
                data.cursos.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        cursoId
                );


            if (
                !docente ||
                !curso
            ) {

                return res.status(404).json({

                    error:
                        "El docente o el curso no existe."

                });

            }

            if (
                String(
                    docente.academiaId
                ) !==
                String(
                    curso.academiaId
                )
            ) {

                return res.status(409).json({

                    error:
                        "El docente y el curso deben pertenecer a la misma academia."

                });

            }

            const duplicateRelation =
                data.dominios.some(
                    (dominio, index) =>
                        index !== domainIndex &&
                        String(
                            dominio.docenteId
                        ) ===
                        docenteId &&
                        String(
                            dominio.cursoId
                        ) ===
                        cursoId
                );


            if (
                duplicateRelation
            ) {

                return res.status(409).json({
                    error:
                        "Ya existe otro dominio para este docente y este curso."
                });
            }

            const updatedDomain = {
                ...currentDomain,
                docenteId,
                cursoId,
                nivel
            };

            data.dominios[
                domainIndex
            ] =
                updatedDomain;


            await writeData(
                data
            );

            res.json(
                updatedDomain
            );


        } catch (error) {

            console.error(
                "Error al actualizar dominio:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudo actualizar el dominio."

            });
        }
    }
);

// ============================================================
// DELETE DOMINIO
// ============================================================

app.delete(
    "/dominios/:id",
    async (req, res) => {

        try {

            const data =
                await readData();

            const domainIndex =
                data.dominios.findIndex(
                    dominio =>
                        String(
                            dominio.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                domainIndex === -1
            ) {

                return res.status(404).json({

                    error:
                        "El dominio no existe."

                });

            }

            data.dominios.splice(
                domainIndex,
                1
            );

            await writeData(
                data
            );

            res.status(204).send();

        } catch (error) {
            console.error(
                "Error al eliminar dominio:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo eliminar el dominio."
            });
        }
    }
);

// ============================================================
// GET HORARIOS
// ============================================================

app.get("/horarios", async (req, res) => {

    try {

        const data = await readData();

        res.json(data.horarios);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "No se pudieron cargar los horarios."
        });

    }

});

// ============================================================
// GET ASIGNACIONES
// ============================================================

app.get(
    "/asignaciones",
    async (req, res) => {

        try {

            const data =
                await readData();


            res.json(
                data.asignaciones
            );

        } catch (error) {

            console.error(
                "Error al leer asignaciones:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar las asignaciones."
            });
        }
    }
);

// ============================================================
// POST ASIGNACIÓN
// ============================================================

app.post(
    "/asignaciones",
    async (req, res) => {

        try {

            const data =
                await readData();


            const cursoId =
                String(
                    req.body.cursoId || ""
                ).trim();


            const docenteId =
                String(
                    req.body.docenteId || ""
                ).trim();


            // ------------------------------------------------
            // NORMALIZAR HORARIOS
            // ------------------------------------------------

            const horarioIds =
                Array.isArray(
                    req.body.horarioIds
                )
                    ? [
                        ...new Set(
                            req.body.horarioIds.map(
                                id => String(id)
                            )
                        )
                    ]
                    : [];


            // ------------------------------------------------
            // VALIDAR HORARIOS
            // ------------------------------------------------

            if (
                horarioIds.length === 0
            ) {

                return res.status(400).json({

                    error:
                        "Debe seleccionar al menos un horario para la asignación."

                });

            }


            // ------------------------------------------------
            // BUSCAR CURSO Y DOCENTE
            // ------------------------------------------------

            const curso =
                data.cursos.find(
                    item =>
                        String(item.id) ===
                        cursoId
                );


            const docente =
                data.docentes.find(
                    item =>
                        String(item.id) ===
                        docenteId
                );


            if (
                !curso ||
                !docente
            ) {

                return res.status(404).json({

                    error:
                        "El docente o el curso no existe."

                });

            }


            // ------------------------------------------------
            // MISMA ACADEMIA
            // ------------------------------------------------

            if (
                String(curso.academiaId) !==
                String(docente.academiaId)
            ) {

                return res.status(409).json({

                    error:
                        "No se puede asignar un docente de una academia diferente al curso."

                });

            }


            // ------------------------------------------------
            // VALIDAR QUE LOS HORARIOS EXISTAN
            // ------------------------------------------------

            const invalidSchedule =
                horarioIds.find(
                    horarioId =>
                        !data.horarios.some(
                            horario =>
                                String(horario.id) ===
                                String(horarioId)
                        )
                );


            if (
                invalidSchedule !==
                undefined
            ) {

                return res.status(400).json({

                    error:
                        `El horario con ID ${invalidSchedule} no existe.`

                });

            }


            // ------------------------------------------------
            // EVITAR DUPLICADOS
            // ------------------------------------------------

            const alreadyAssigned =
                data.asignaciones.some(
                    asignacion =>
                        String(
                            asignacion.cursoId
                        ) ===
                        cursoId &&
                        String(
                            asignacion.docenteId
                        ) ===
                        docenteId
                );


            if (
                alreadyAssigned
            ) {

                return res.status(409).json({

                    error:
                        "El docente ya está asignado a este curso."

                });

            }


            // ------------------------------------------------
            // VERIFICAR CONFLICTOS DE HORARIO
            // ------------------------------------------------

            const teacherAssignments =
                data.asignaciones.filter(
                    asignacion =>
                        String(
                            asignacion.docenteId
                        ) ===
                        docenteId
                );


            for (
                const assignment
                of teacherAssignments
            ) {

                const existingScheduleIds =
                    Array.isArray(
                        assignment.horarioIds
                    )
                        ? assignment.horarioIds.map(
                            id => String(id)
                        )
                        : [];


                const conflictingScheduleId =
                    horarioIds.find(
                        horarioId =>
                            existingScheduleIds.includes(
                                String(horarioId)
                            )
                    );


                if (
                    conflictingScheduleId !==
                    undefined
                ) {

                    const conflictingCourse =
                        data.cursos.find(
                            cursoItem =>
                                String(
                                    cursoItem.id
                                ) ===
                                String(
                                    assignment.cursoId
                                )
                        );


                    const horario =
                        data.horarios.find(
                            horarioItem =>
                                String(
                                    horarioItem.id
                                ) ===
                                String(
                                    conflictingScheduleId
                                )
                        );


                    const horarioTexto =
                        horario
                            ? `${horario.dia} ${horario.horaInicio}-${horario.horaFin}`
                            : `ID ${conflictingScheduleId}`;


                    return res.status(409).json({

                        error:
                            "No se puede asignar el docente porque ya tiene otro curso en el mismo horario." +
                            ` Curso en conflicto: ${conflictingCourse?.nombre || "No identificado"}.` +
                            ` Horario: ${horarioTexto}.`

                    });

                }

            }


            // ------------------------------------------------
            // CREAR ASIGNACIÓN
            // ------------------------------------------------

            const newAssignment = {

                id:
                    nextId(
                        data.asignaciones
                    ),

                cursoId,

                docenteId,

                horarioIds

            };


            data.asignaciones.push(
                newAssignment
            );


            await writeData(
                data
            );


            res.status(201).json(
                newAssignment
            );


        } catch (error) {

            console.error(
                "Error al crear asignación:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudo crear la asignación."

            });

        }

    }
);

// ============================================================
// DELETE ASIGNACIÓN
// ============================================================

app.delete(
    "/asignaciones/:id",
    async (req, res) => {
        try {
            const data =
                await readData();

            const assignmentIndex =
                data.asignaciones.findIndex(
                    asignacion =>
                        String(
                            asignacion.id
                        ) ===
                        String(
                            req.params.id
                        )
                );

            if (
                assignmentIndex === -1
            ) {
                return res.status(404).json({

                    error:
                        "La asignación no existe."

                });
            }

            data.asignaciones.splice(
                assignmentIndex,
                1
            );

            await writeData(
                data
            );

            res.status(204).send();

        } catch (error) {

            console.error(
                "Error al eliminar asignación:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudo eliminar la asignación."
            });
        }
    }
);

// ============================================================
// GET LICENCIATURAS
// ============================================================

app.get(
    "/licenciaturas",
    async (req, res) => {

        try {

            const data =
                await readData();

            res.json(
                data.licenciaturas
            );

        } catch (error) {

            console.error(
                "Error al leer licenciaturas:",
                error
            );

            res.status(500).json({

                error:
                    "No se pudieron cargar las licenciaturas."

            });
        }
    }
);

// ============================================================
// GET MAESTRÍAS
// ============================================================

app.get(
    "/maestrias",
    async (req, res) => {
        try {
            const data =
                await readData();

            res.json(
                data.maestrias
            );

        } catch (error) {

            console.error(
                "Error al leer maestrías:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron cargar las maestrías."

            });

        }

    }
);

// ============================================================
// GET DOCTORADOS
// ============================================================

app.get(
    "/doctorados",
    async (req, res) => {

        try {
            const data =
                await readData();

            res.json(
                data.doctorados
            );

        } catch (error) {

            console.error(
                "Error al leer doctorados:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar los doctorados."
            });
        }
    }
);

// ============================================================
// GET NIVELES SNI
// ============================================================

app.get(
    "/nivelesSNI",
    async (req, res) => {

        try {

            const data =
                await readData();

            res.json(
                data.nivelesSNI
            );

        } catch (error) {
            console.error(
                "Error al leer niveles SNI:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar los niveles SNI."
            });
        }
    }
);

// ============================================================
// GET ESPECIALIDADES
// ============================================================

app.get(
    "/especialidades",
    async (req, res) => {
        try {

            const data =
                await readData();


            res.json(
                data.especialidades
            );
        } catch (error) {

            console.error(
                "Error al leer especialidades:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar las especialidades."
            });
        }

    }
);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor Express ejecutándose en http://localhost:${PORT}`
        );

    }
);