import AppDaoBetterSQLite
    from "./daoBetterSqlite3.mjs";


// ============================================================
// CONEXIÓN A LA BASE DE DATOS
// ============================================================

const db =
    new AppDaoBetterSQLite(
        "./db/app.db"
    );


try {

    db.open();

    console.log(
        "Conectado a SQLite."
    );


    // ========================================================
    // ACTIVAR CLAVES FORÁNEAS
    // ========================================================

    db.run(
        "PRAGMA foreign_keys = ON"
    );


    // ========================================================
    // ACADEMIAS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS academias (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL,

            clave TEXT NOT NULL UNIQUE,

            descripcion TEXT

        )
    `);


    // ========================================================
    // DOCENTES
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS docentes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            numero_empleado TEXT NOT NULL UNIQUE,

            nombre TEXT NOT NULL,

            nivel_academico TEXT NOT NULL,

            titulo_academico TEXT NOT NULL,

            especialidad TEXT,

            sni TEXT NOT NULL DEFAULT 'no'
                CHECK (sni IN ('si', 'no')),

            nivel_sni TEXT,

            prodep TEXT NOT NULL DEFAULT 'no'
                CHECK (prodep IN ('si', 'no')),

            certificaciones TEXT,

            academia_id INTEGER NOT NULL,

            FOREIGN KEY (academia_id)
                REFERENCES academias(id)
                ON DELETE RESTRICT

        )
    `);


    // ========================================================
    // CURSOS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS cursos (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL,

            descripcion TEXT,

            academia_id INTEGER NOT NULL,

            UNIQUE (academia_id, nombre),

            FOREIGN KEY (academia_id)
                REFERENCES academias(id)
                ON DELETE RESTRICT

        )
    `);


    // ========================================================
    // HORARIOS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS horarios (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            clave TEXT NOT NULL UNIQUE,

            dia TEXT NOT NULL,

            hora_inicio TEXT NOT NULL,

            hora_fin TEXT NOT NULL

        )
    `);


    // ========================================================
    // DOMINIOS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS dominios (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            docente_id INTEGER NOT NULL,

            curso_id INTEGER NOT NULL,

            nivel INTEGER NOT NULL
                CHECK (nivel BETWEEN 1 AND 10),

            UNIQUE (docente_id, curso_id),

            FOREIGN KEY (docente_id)
                REFERENCES docentes(id)
                ON DELETE RESTRICT,

            FOREIGN KEY (curso_id)
                REFERENCES cursos(id)
                ON DELETE RESTRICT

        )
    `);


    // ========================================================
    // ASIGNACIONES
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS asignaciones (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            curso_id INTEGER NOT NULL,

            docente_id INTEGER NOT NULL,

            UNIQUE (curso_id, docente_id),

            FOREIGN KEY (curso_id)
                REFERENCES cursos(id)
                ON DELETE RESTRICT,

            FOREIGN KEY (docente_id)
                REFERENCES docentes(id)
                ON DELETE RESTRICT

        )
    `);


    // ========================================================
    // ASIGNACIÓN - HORARIOS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS asignacion_horarios (

            asignacion_id INTEGER NOT NULL,

            horario_id INTEGER NOT NULL,

            PRIMARY KEY (
                asignacion_id,
                horario_id
            ),

            FOREIGN KEY (asignacion_id)
                REFERENCES asignaciones(id)
                ON DELETE CASCADE,

            FOREIGN KEY (horario_id)
                REFERENCES horarios(id)
                ON DELETE RESTRICT

        )
    `);


    // ========================================================
    // CATÁLOGO DE LICENCIATURAS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS licenciaturas (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL UNIQUE

        )
    `);


    // ========================================================
    // CATÁLOGO DE MAESTRÍAS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS maestrias (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL UNIQUE

        )
    `);


    // ========================================================
    // CATÁLOGO DE DOCTORADOS
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS doctorados (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL UNIQUE

        )
    `);


    // ========================================================
    // CATÁLOGO DE NIVELES SNI
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS niveles_sni (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL UNIQUE

        )
    `);


    // ========================================================
    // CATÁLOGO DE ESPECIALIDADES
    // ========================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS especialidades (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL UNIQUE

        )
    `);


    console.log(
        "Tablas creadas correctamente."
    );


} catch (error) {

    console.error(
        "Error al crear las tablas:",
        error.message
    );

} finally {

    db.close();

}