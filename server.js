const express = require("express");
const path = require("node:path");

const app = express();

const AppDaoBetterSQLite =
    require("./db/DaoBetterSqlite3.mjs").default;

const ModelAcademias =
    require("./db/model.academias.mjs").default;

const ModelDocentes =
    require("./db/model.docentes.mjs").default;

const ModelCursos =
    require("./db/model.cursos.mjs").default;

const ModelDominios =
    require("./db/model.dominios.mjs").default;

const ModelHorarios =
    require("./db/model.horarios.mjs").default;

const ModelAsignaciones =
    require("./db/model.asignaciones.mjs").default;

const ModelCatalogos =
    require("./db/model.catalogos.mjs").default;

const PORT = 3000;

// ============================================================
// SQLITE
// ============================================================

const controllerDB =
    new AppDaoBetterSQLite(
        path.join(
            __dirname,
            "db",
            "app.db"
        )
    );

const modelAcademias =
    new ModelAcademias(
        controllerDB
    );

const modelDocentes =
    new ModelDocentes(
        controllerDB
    );

const modelCursos =
    new ModelCursos(
        controllerDB
    );

const modelDominios =
    new ModelDominios(
        controllerDB
    );

const modelHorarios =
    new ModelHorarios(
        controllerDB
    );

const modelAsignaciones =
    new ModelAsignaciones(
        controllerDB
    );

const modelCatalogos =
    new ModelCatalogos(
        controllerDB
    );

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    express.json()
);

// ============================================================
// CORS
// ============================================================

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
// VALIDAR SI / NO
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
// ACADEMIAS
// ============================================================

app.get(
    "/academias",
    (req, res) => {

        try {

            res.json(
                modelAcademias.getAll()
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

app.post(
    "/academias",
    (req, res) => {

        try {

            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();

            const claveOriginal =
                String(
                    req.body.clave || ""
                );

            const clave =
                claveOriginal.trim();

            const descripcion =
                String(
                    req.body.descripcion || ""
                ).trim();

            if (
                !nombre ||
                !clave
            ) {

                return res.status(400).json({
                    error:
                        "El nombre y la clave de la academia son obligatorios."
                });

            }

            if (
                /\s/.test(claveOriginal)
            ) {

                return res.status(400).json({
                    error:
                        "La clave no puede contener espacios."
                });

            }

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

            const academy =
                modelAcademias.create(
                    nombre,
                    clave,
                    descripcion
                );

            res.status(201).json(
                academy
            );

        } catch (error) {

            console.error(
                "Error al crear academia:",
                error
            );

            if (
                error.message ===
                "La clave de academia ya existe."
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            res.status(500).json({
                error:
                    "No se pudo crear la academia."
            });

        }

    }
);

app.patch(
    "/academias/:id",
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            const current =
                modelAcademias.get(
                    id
                );

            if (!current) {

                return res.status(404).json({
                    error:
                        "La academia no existe."
                });

            }

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : current.nombre;

            const clave =
                req.body.clave !== undefined
                    ? String(
                        req.body.clave
                    ).trim()
                    : current.clave;

            const descripcion =
                req.body.descripcion !== undefined
                    ? String(
                        req.body.descripcion
                    ).trim()
                    : (
                        current.descripcion ||
                        ""
                    );

            if (
                !nombre ||
                !clave
            ) {

                return res.status(400).json({
                    error:
                        "El nombre y la clave de la academia son obligatorios."
                });

            }

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

            const academy =
                modelAcademias.update(
                    id,
                    nombre,
                    clave,
                    descripcion
                );

            res.json(
                academy
            );

        } catch (error) {

            if (
                error.message ===
                "La clave de academia ya existe."
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.delete(
    "/academias/:id",
    (req, res) => {

        try {

            const deleted =
                modelAcademias.remove(
                    Number(
                        req.params.id
                    )
                );

            if (!deleted) {

                return res.status(404).json({
                    error:
                        "La academia no existe."
                });

            }

            res.status(204).send();

        } catch (error) {

            if (
                error.code ===
                "HAS_RELATIONS"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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
// DOCENTES
// ============================================================

app.get(
    "/docentes",
    (req, res) => {

        try {

            res.json(
                modelDocentes.getAll()
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

app.post(
    "/docentes",
    (req, res) => {

        try {

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
                Number(
                    req.body.academiaId
                );

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
                        "El nivel académico debe ser Licenciatura, Maestría o Doctorado."
                });

            }

            if (
                sni === "si" &&
                !nivelSni
            ) {

                return res.status(400).json({
                    error:
                        "Debe especificar el nivel SNI cuando el docente pertenece al SNI."
                });

            }

            const teacher =
                modelDocentes.create({

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

                });

            res.status(201).json(
                teacher
            );

        } catch (error) {

            if (
                error.code ===
                "DUPLICATE_EMPLOYEE"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "ACADEMY_NOT_FOUND"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "INVALID_SNI"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

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

app.patch(
    "/docentes/:id",
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            const current =
                modelDocentes.get(
                    id
                );

            if (!current) {

                return res.status(404).json({
                    error:
                        "El docente no existe."
                });

            }

            const numeroEmpleado =
                req.body.numeroEmpleado !== undefined
                    ? String(
                        req.body.numeroEmpleado
                    ).trim()
                    : current.numeroEmpleado;

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : current.nombre;

            const nivelAcademico =
                req.body.nivelAcademico !== undefined
                    ? String(
                        req.body.nivelAcademico
                    ).trim()
                    : current.nivelAcademico;

            const tituloAcademico =
                req.body.tituloAcademico !== undefined
                    ? String(
                        req.body.tituloAcademico
                    ).trim()
                    : current.tituloAcademico;

            const especialidad =
                req.body.especialidad !== undefined
                    ? String(
                        req.body.especialidad
                    ).trim()
                    : (
                        current.especialidad ||
                        ""
                    );

            const academiaId =
                req.body.academiaId !== undefined
                    ? Number(
                        req.body.academiaId
                    )
                    : Number(
                        current.academiaId
                    );

            const sni =
                req.body.sni !== undefined
                    ? normalizeYesNo(
                        req.body.sni
                    )
                    : normalizeYesNo(
                        current.sni
                    );

            const nivelSni =
                req.body.nivelSni !== undefined
                    ? String(
                        req.body.nivelSni
                    ).trim()
                    : (
                        current.nivelSni ||
                        ""
                    );

            const prodep =
                req.body.prodep !== undefined
                    ? normalizeYesNo(
                        req.body.prodep
                    )
                    : normalizeYesNo(
                        current.prodep
                    );

            const certificaciones =
                req.body.certificaciones !== undefined
                    ? String(
                        req.body.certificaciones
                    ).trim()
                    : (
                        current.certificaciones ||
                        ""
                    );

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

            if (
                sni === "si" &&
                !nivelSni
            ) {

                return res.status(400).json({
                    error:
                        "Debe especificar el nivel SNI cuando el docente pertenece al SNI."
                });

            }

            const teacher =
                modelDocentes.update(
                    id,
                    {

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

                    }
                );

            res.json(
                teacher
            );

        } catch (error) {

            if (
                error.code ===
                "DUPLICATE_EMPLOYEE"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "ACADEMY_NOT_FOUND"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "INVALID_SNI"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "HAS_RELATIONS"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.delete(
    "/docentes/:id",
    (req, res) => {

        try {

            const deleted =
                modelDocentes.remove(
                    Number(
                        req.params.id
                    )
                );

            if (!deleted) {

                return res.status(404).json({
                    error:
                        "El docente no existe."
                });

            }

            res.status(204).send();

        } catch (error) {

            if (
                error.code ===
                "HAS_RELATIONS"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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
// CURSOS
// ============================================================

app.get(
    "/cursos",
    (req, res) => {

        try {

            res.json(
                modelCursos.getAll()
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

app.post(
    "/cursos",
    (req, res) => {

        try {

            const nombre =
                String(
                    req.body.nombre || ""
                ).trim();

            const descripcion =
                String(
                    req.body.descripcion || ""
                ).trim();

            const academiaId =
                Number(
                    req.body.academiaId
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

            const course =
                modelCursos.create(
                    nombre,
                    descripcion,
                    academiaId
                );

            res.status(201).json(
                course
            );

        } catch (error) {

            if (
                error.code ===
                "ACADEMY_NOT_FOUND"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "DUPLICATE_COURSE"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.patch(
    "/cursos/:id",
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            const current =
                modelCursos.get(
                    id
                );

            if (!current) {

                return res.status(404).json({
                    error:
                        "El curso no existe."
                });

            }

            const nombre =
                req.body.nombre !== undefined
                    ? String(
                        req.body.nombre
                    ).trim()
                    : current.nombre;

            const descripcion =
                req.body.descripcion !== undefined
                    ? String(
                        req.body.descripcion
                    ).trim()
                    : (
                        current.descripcion ||
                        ""
                    );

            const academiaId =
                req.body.academiaId !== undefined
                    ? Number(
                        req.body.academiaId
                    )
                    : Number(
                        current.academiaId
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

            const course =
                modelCursos.update(
                    id,
                    nombre,
                    descripcion,
                    academiaId
                );

            res.json(
                course
            );

        } catch (error) {

            if (
                error.code ===
                "ACADEMY_NOT_FOUND"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "DUPLICATE_COURSE"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "HAS_RELATIONS"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.delete(
    "/cursos/:id",
    (req, res) => {

        try {

            const deleted =
                modelCursos.remove(
                    Number(
                        req.params.id
                    )
                );

            if (!deleted) {

                return res.status(404).json({
                    error:
                        "El curso no existe."
                });

            }

            res.status(204).send();

        } catch (error) {

            if (
                error.code ===
                "HAS_RELATIONS"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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
// DOMINIOS
// ============================================================

app.get(
    "/dominios",
    (req, res) => {

        try {

            res.json(
                modelDominios.getAll()
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

app.post(
    "/dominios",
    (req, res) => {

        try {

            const docenteId =
                Number(
                    req.body.docenteId
                );

            const cursoId =
                Number(
                    req.body.cursoId
                );

            const nivel =
                Number(
                    req.body.nivel
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

            const domain =
                modelDominios.create(
                    docenteId,
                    cursoId,
                    nivel
                );

            res.status(201).json(
                domain
            );

        } catch (error) {

            if (
                error.code ===
                "NOT_FOUND"
            ) {

                return res.status(404).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "ACADEMY_MISMATCH"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "DUPLICATE_DOMAIN"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.patch(
    "/dominios/:id",
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            const current =
                modelDominios.get(
                    id
                );

            if (!current) {

                return res.status(404).json({
                    error:
                        "El dominio no existe."
                });

            }

            const docenteId =
                req.body.docenteId !== undefined
                    ? Number(
                        req.body.docenteId
                    )
                    : Number(
                        current.docenteId
                    );

            const cursoId =
                req.body.cursoId !== undefined
                    ? Number(
                        req.body.cursoId
                    )
                    : Number(
                        current.cursoId
                    );

            const nivel =
                req.body.nivel !== undefined
                    ? Number(
                        req.body.nivel
                    )
                    : Number(
                        current.nivel
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

            const domain =
                modelDominios.update(
                    id,
                    docenteId,
                    cursoId,
                    nivel
                );

            res.json(
                domain
            );

        } catch (error) {

            if (
                error.code ===
                "NOT_FOUND"
            ) {

                return res.status(404).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "ACADEMY_MISMATCH"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "DUPLICATE_DOMAIN"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.delete(
    "/dominios/:id",
    (req, res) => {

        try {

            const deleted =
                modelDominios.remove(
                    Number(
                        req.params.id
                    )
                );

            if (!deleted) {

                return res.status(404).json({
                    error:
                        "El dominio no existe."
                });

            }

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
// HORARIOS
// ============================================================

app.get(
    "/horarios",
    (req, res) => {

        try {

            res.json(
                modelHorarios.getAll()
            );

        } catch (error) {

            console.error(
                "Error al leer horarios:",
                error
            );

            res.status(500).json({
                error:
                    "No se pudieron cargar los horarios."
            });

        }

    }
);

// ============================================================
// ASIGNACIONES
// ============================================================

app.get(
    "/asignaciones",
    (req, res) => {

        try {

            res.json(
                modelAsignaciones.getAll()
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

app.post(
    "/asignaciones",
    (req, res) => {

        try {

            const cursoId =
                Number(
                    req.body.cursoId
                );

            const docenteId =
                Number(
                    req.body.docenteId
                );

            const horarioIds =
                Array.isArray(
                    req.body.horarioIds
                )
                    ? req.body.horarioIds
                    : [];

            const assignment =
                modelAsignaciones.create(
                    cursoId,
                    docenteId,
                    horarioIds
                );

            res.status(201).json(
                assignment
            );

        } catch (error) {

            if (
                error.code ===
                "NO_SCHEDULE"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "NOT_FOUND"
            ) {

                return res.status(404).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "ACADEMY_MISMATCH"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "INVALID_SCHEDULE"
            ) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "DUPLICATE_ASSIGNMENT"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

            if (
                error.code ===
                "SCHEDULE_CONFLICT"
            ) {

                return res.status(409).json({
                    error:
                        error.message
                });

            }

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

app.delete(
    "/asignaciones/:id",
    (req, res) => {

        try {

            const deleted =
                modelAsignaciones.remove(
                    Number(
                        req.params.id
                    )
                );

            if (!deleted) {

                return res.status(404).json({
                    error:
                        "La asignación no existe."
                });

            }

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
// CATÁLOGOS
// ============================================================

app.get(
    "/licenciaturas",
    (req, res) => {

        try {

            res.json(
                modelCatalogos
                    .getLicenciaturas()
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

app.get(
    "/maestrias",
    (req, res) => {

        try {

            res.json(
                modelCatalogos
                    .getMaestrias()
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

app.get(
    "/doctorados",
    (req, res) => {

        try {

            res.json(
                modelCatalogos
                    .getDoctorados()
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

app.get(
    "/nivelesSNI",
    (req, res) => {

        try {

            res.json(
                modelCatalogos
                    .getNivelesSNI()
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

app.get(
    "/especialidades",
    (req, res) => {

        try {

            res.json(
                modelCatalogos
                    .getEspecialidades()
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