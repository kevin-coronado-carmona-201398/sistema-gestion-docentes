const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();

const PORT = 3001;

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