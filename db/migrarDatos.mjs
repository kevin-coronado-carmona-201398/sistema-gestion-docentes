import AppDaoBetterSQLite
    from "./DaoBetterSqlite3.mjs";

import fs from "node:fs/promises";


// ============================================================
// RUTA DE datos.json
// ============================================================

const DATA_PATH =
    new URL(
        "../datos.json",
        import.meta.url
    );


// ============================================================
// LEER datos.json
// ============================================================

const fileContent =
    await fs.readFile(
        DATA_PATH,
        "utf-8"
    );

const sourceData =
    JSON.parse(
        fileContent
    );


// ============================================================
// CONEXIÓN SQLITE
// ============================================================

const db =
    new AppDaoBetterSQLite(
        "./db/app.db"
    );


// ============================================================
// MAPAS DE IDs
// ============================================================
//
// Los IDs de datos.json no necesariamente coinciden con los
// IDs autogenerados por SQLite.
//
// Ejemplo:
// "Hoao_reu9DI" → 1
//
// Esto nos permite reconstruir correctamente las relaciones.
// ============================================================

const academyIdMap = new Map();
const teacherIdMap = new Map();
const courseIdMap = new Map();
const scheduleIdMap = new Map();
const assignmentIdMap = new Map();


// ============================================================
// INSERTAR Y GUARDAR MAPEO DE ID
// ============================================================

function insertAndMap(
    sql,
    params,
    map,
    originalId
) {

    const result =
        db.run(
            sql,
            params
        );

    const newId =
        Number(
            result.lastInsertRowid
        );

    map.set(
        String(originalId),
        newId
    );

    return newId;

}


// ============================================================
// MIGRACIÓN
// ============================================================

try {

    db.open();

    console.log(
        "Conectado a SQLite."
    );


    // --------------------------------------------------------
    // ACTIVAR CLAVES FORÁNEAS
    // --------------------------------------------------------

    db.run(
        "PRAGMA foreign_keys = ON"
    );


    // --------------------------------------------------------
    // EVITAR MIGRACIÓN DUPLICADA
    // --------------------------------------------------------

    const existingData =
        db.get(`
            SELECT COUNT(*) AS total
            FROM academias
        `);


    if (
        existingData.total > 0
    ) {

        throw new Error(
            "La base de datos ya contiene datos. No se realizará una segunda migración."
        );

    }


    // --------------------------------------------------------
    // INICIAR TRANSACCIÓN
    // --------------------------------------------------------

    db.run(
        "BEGIN TRANSACTION"
    );


    // ========================================================
    // ACADEMIAS
    // ========================================================

    for (
        const academia
        of sourceData.academias
    ) {

        insertAndMap(
            `
            INSERT INTO academias
                (
                    nombre,
                    clave,
                    descripcion
                )
            VALUES
                (?, ?, ?)
            `,
            [
                academia.nombre,
                academia.clave,
                academia.descripcion || null
            ],
            academyIdMap,
            academia.id
        );

    }


    // ========================================================
    // LICENCIATURAS
    // ========================================================

    for (
        const item
        of sourceData.licenciaturas
    ) {

        db.run(
            `
            INSERT INTO licenciaturas
                (
                    nombre
                )
            VALUES
                (?)
            `,
            [
                item.nombre
            ]
        );

    }


    // ========================================================
    // MAESTRÍAS
    // ========================================================

    for (
        const item
        of sourceData.maestrias
    ) {

        db.run(
            `
            INSERT INTO maestrias
                (
                    nombre
                )
            VALUES
                (?)
            `,
            [
                item.nombre
            ]
        );

    }


    // ========================================================
    // DOCTORADOS
    // ========================================================

    for (
        const item
        of sourceData.doctorados
    ) {

        db.run(
            `
            INSERT INTO doctorados
                (
                    nombre
                )
            VALUES
                (?)
            `,
            [
                item.nombre
            ]
        );

    }


    // ========================================================
    // NIVELES SNI
    // ========================================================

    for (
        const item
        of sourceData.nivelesSNI
    ) {

        db.run(
            `
            INSERT INTO niveles_sni
                (
                    nombre
                )
            VALUES
                (?)
            `,
            [
                item.nombre
            ]
        );

    }


    // ========================================================
    // ESPECIALIDADES
    // ========================================================

    for (
        const item
        of sourceData.especialidades
    ) {

        db.run(
            `
            INSERT INTO especialidades
                (
                    nombre
                )
            VALUES
                (?)
            `,
            [
                item.nombre
            ]
        );

    }


    // ========================================================
    // HORARIOS
    // ========================================================

    for (
        const horario
        of sourceData.horarios
    ) {

        insertAndMap(
            `
            INSERT INTO horarios
                (
                    clave,
                    dia,
                    hora_inicio,
                    hora_fin
                )
            VALUES
                (?, ?, ?, ?)
            `,
            [
                horario.clave,
                horario.dia,
                horario.horaInicio,
                horario.horaFin
            ],
            scheduleIdMap,
            horario.id
        );

    }


    // ========================================================
    // DOCENTES
    // ========================================================

    for (
        const docente
        of sourceData.docentes
    ) {

        const academiaId =
            academyIdMap.get(
                String(
                    docente.academiaId
                )
            );


        if (
            academiaId === undefined
        ) {

            throw new Error(
                `No se encontró la academia del docente ${docente.nombre}.`
            );

        }


        insertAndMap(
            `
            INSERT INTO docentes
                (
                    numero_empleado,
                    nombre,
                    nivel_academico,
                    titulo_academico,
                    especialidad,
                    sni,
                    nivel_sni,
                    prodep,
                    certificaciones,
                    academia_id
                )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                docente.numeroEmpleado,
                docente.nombre,
                docente.nivelAcademico,
                docente.tituloAcademico,
                docente.especialidad || null,
                docente.sni || "no",
                docente.nivelSni || null,
                docente.prodep || "no",
                docente.certificaciones || null,
                academiaId
            ],
            teacherIdMap,
            docente.id
        );

    }


    // ========================================================
    // CURSOS
    // ========================================================

    for (
        const curso
        of sourceData.cursos
    ) {

        const academiaId =
            academyIdMap.get(
                String(
                    curso.academiaId
                )
            );


        if (
            academiaId === undefined
        ) {

            throw new Error(
                `No se encontró la academia del curso ${curso.nombre}.`
            );

        }


        insertAndMap(
            `
            INSERT INTO cursos
                (
                    nombre,
                    descripcion,
                    academia_id
                )
            VALUES
                (?, ?, ?)
            `,
            [
                curso.nombre,
                curso.descripcion || null,
                academiaId
            ],
            courseIdMap,
            curso.id
        );

    }


    // ========================================================
    // DOMINIOS
    // ========================================================

    for (
        const dominio
        of sourceData.dominios
    ) {

        const docenteId =
            teacherIdMap.get(
                String(
                    dominio.docenteId
                )
            );


        const cursoId =
            courseIdMap.get(
                String(
                    dominio.cursoId
                )
            );


        if (
            docenteId === undefined ||
            cursoId === undefined
        ) {

            throw new Error(
                `No se pudo resolver el docente o curso del dominio ${dominio.id}.`
            );

        }


        db.run(
            `
            INSERT INTO dominios
                (
                    docente_id,
                    curso_id,
                    nivel
                )
            VALUES
                (?, ?, ?)
            `,
            [
                docenteId,
                cursoId,
                Number(
                    dominio.nivel
                )
            ]
        );

    }


    // ========================================================
    // ASIGNACIONES
    // ========================================================

    for (
        const asignacion
        of sourceData.asignaciones
    ) {

        const docenteId =
            teacherIdMap.get(
                String(
                    asignacion.docenteId
                )
            );


        const cursoId =
            courseIdMap.get(
                String(
                    asignacion.cursoId
                )
            );


        if (
            docenteId === undefined ||
            cursoId === undefined
        ) {

            throw new Error(
                `No se pudo resolver el docente o curso de la asignación ${asignacion.id}.`
            );

        }


        insertAndMap(
            `
            INSERT INTO asignaciones
                (
                    curso_id,
                    docente_id
                )
            VALUES
                (?, ?)
            `,
            [
                cursoId,
                docenteId
            ],
            assignmentIdMap,
            asignacion.id
        );

    }


    // ========================================================
    // ASIGNACIÓN - HORARIOS
    // ========================================================

    for (
        const asignacion
        of sourceData.asignaciones
    ) {

        const assignmentId =
            assignmentIdMap.get(
                String(
                    asignacion.id
                )
            );


        if (
            assignmentId === undefined
        ) {

            throw new Error(
                `No se pudo resolver la asignación ${asignacion.id}.`
            );

        }


        const horarioIds =
            Array.isArray(
                asignacion.horarioIds
            )
                ? asignacion.horarioIds
                : [];


        for (
            const horarioId
            of horarioIds
        ) {

            const sqliteScheduleId =
                scheduleIdMap.get(
                    String(
                        horarioId
                    )
                );


            if (
                sqliteScheduleId === undefined
            ) {

                throw new Error(
                    `No se pudo resolver el horario ${horarioId} de la asignación ${asignacion.id}.`
                );

            }


            db.run(
                `
                INSERT INTO asignacion_horarios
                    (
                        asignacion_id,
                        horario_id
                    )
                VALUES
                    (?, ?)
                `,
                [
                    assignmentId,
                    sqliteScheduleId
                ]
            );

        }

    }


    // ========================================================
    // CONFIRMAR TRANSACCIÓN
    // ========================================================

    db.run(
        "COMMIT"
    );


    console.log(
        "Migración completada correctamente."
    );


    // ========================================================
    // MOSTRAR CANTIDADES
    // ========================================================

    const tables = [
        "academias",
        "docentes",
        "cursos",
        "horarios",
        "dominios",
        "asignaciones",
        "asignacion_horarios",
        "licenciaturas",
        "maestrias",
        "doctorados",
        "niveles_sni",
        "especialidades"
    ];


    console.log(
        "\nRegistros migrados:"
    );


    for (
        const table
        of tables
    ) {

        const result =
            db.get(
                `
                SELECT COUNT(*) AS total
                FROM ${table}
                `
            );


        console.log(
            `${table}: ${result.total}`
        );

    }


} catch (error) {

    try {

        db.run(
            "ROLLBACK"
        );

    } catch {
        // La transacción podría no haber comenzado.
    }


    console.error(
        "Error durante la migración:",
        error.message
    );


} finally {

    db.close();

}