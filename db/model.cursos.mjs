
class ModelCursos {

    constructor(controller) {
        this.dbController = controller;
    }

    // --------------------------------------------------------
    // VALIDAR HORAS SEMANALES
    // --------------------------------------------------------

    normalizeWeeklyHours(value) {

        const horasSemanales = Number(value);

        if (
            !Number.isInteger(horasSemanales) ||
            horasSemanales < 1 ||
            horasSemanales > 10
        ) {

            const error = new Error(
                "Las horas semanales deben ser un número entero entre 1 y 10."
            );

            error.code = "INVALID_WEEKLY_HOURS";
            throw error;

        }

        return horasSemanales;

    }

    // --------------------------------------------------------
    // OBTENER HORAS DE LAS ASIGNACIONES DE UNA MATERIA
    // No abre ni cierra la conexión.
    // --------------------------------------------------------

    getAssignmentScheduleTotals(courseId) {

        return this.dbController.all(
            `
                SELECT
                    a.id AS asignacionId,

                    COALESCE(
                        SUM(
                            (
                                CAST(SUBSTR(h.hora_fin, 1, 2) AS INTEGER) * 60 +
                                CAST(SUBSTR(h.hora_fin, 4, 2) AS INTEGER)
                            )
                            -
                            (
                                CAST(SUBSTR(h.hora_inicio, 1, 2) AS INTEGER) * 60 +
                                CAST(SUBSTR(h.hora_inicio, 4, 2) AS INTEGER)
                            )
                        ),
                        0
                    ) AS minutosSemanales

                FROM asignaciones a

                LEFT JOIN asignacion_horarios ah
                    ON ah.asignacion_id = a.id

                LEFT JOIN horarios h
                    ON h.id = ah.horario_id

                WHERE a.curso_id = ?

                GROUP BY a.id;
            `,
            [courseId]
        );

    }

    // --------------------------------------------------------
    // CONSULTA INTERNA POR ID
    // No abre ni cierra la conexión.
    // --------------------------------------------------------

    getById(id) {

        return this.dbController.get(
            `
                SELECT
                    id,
                    nombre,
                    descripcion,
                    academia_id AS academiaId,
                    horas_semanales AS horasSemanales
                FROM cursos
                WHERE id = ?;
            `,
            [id]
        );

    }

    // --------------------------------------------------------
    // OBTENER CURSO
    // --------------------------------------------------------

    get(id) {

        this.dbController.open();

        try {

            return this.getById(id);

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // OBTENER TODOS LOS CURSOS
    // --------------------------------------------------------

    getAll() {

        this.dbController.open();

        try {

            return this.dbController.all(
                `
                    SELECT
                        id,
                        nombre,
                        descripcion,
                        academia_id AS academiaId,
                        horas_semanales AS horasSemanales
                    FROM cursos
                    ORDER BY nombre;
                `,
                []
            );

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // CREAR CURSO
    // --------------------------------------------------------

    create(
        nombre,
        descripcion,
        academiaId,
        horasSemanales
    ) {

        this.dbController.open();

        try {

            const weeklyHours =
                this.normalizeWeeklyHours(horasSemanales);

            const academy =
                this.dbController.get(
                    `
                        SELECT id
                        FROM academias
                        WHERE id = ?;
                    `,
                    [academiaId]
                );

            if (!academy) {

                const error = new Error(
                    "La academia seleccionada no existe."
                );

                error.code = "ACADEMY_NOT_FOUND";
                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                        SELECT id
                        FROM cursos
                        WHERE academia_id = ?
                          AND LOWER(nombre) = LOWER(?);
                    `,
                    [academiaId, nombre]
                );

            if (duplicate) {

                const error = new Error(
                    "Ya existe un curso con ese nombre dentro de la academia seleccionada."
                );

                error.code = "DUPLICATE_COURSE";
                throw error;

            }

            const result =
                this.dbController.run(
                    `
                        INSERT INTO cursos
                        (
                            nombre,
                            descripcion,
                            academia_id,
                            horas_semanales
                        )
                        VALUES (?, ?, ?, ?);
                    `,
                    [
                        nombre,
                        descripcion,
                        academiaId,
                        weeklyHours
                    ]
                );

            return this.getById(
                result.lastInsertRowid
            );

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // ACTUALIZAR CURSO
    // --------------------------------------------------------

    update(
        id,
        nombre,
        descripcion,
        academiaId,
        horasSemanales
    ) {

        this.dbController.open();

        try {

            const current =
                this.getById(id);

            if (!current) {
                return null;
            }

            const weeklyHours =
                this.normalizeWeeklyHours(horasSemanales);

            const academy =
                this.dbController.get(
                    `
                        SELECT id
                        FROM academias
                        WHERE id = ?;
                    `,
                    [academiaId]
                );

            if (!academy) {

                const error = new Error(
                    "La academia seleccionada no existe."
                );

                error.code = "ACADEMY_NOT_FOUND";
                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                        SELECT id
                        FROM cursos
                        WHERE academia_id = ?
                          AND LOWER(nombre) = LOWER(?)
                          AND id <> ?;
                    `,
                    [
                        academiaId,
                        nombre,
                        id
                    ]
                );

            if (duplicate) {

                const error = new Error(
                    "Ya existe un curso con ese nombre dentro de la academia seleccionada."
                );

                error.code = "DUPLICATE_COURSE";
                throw error;

            }

            // ------------------------------------------------
            // VALIDAR CAMBIO DE HORAS SEMANALES
            // ------------------------------------------------

            const hoursChanged =
                Number(current.horasSemanales) !== weeklyHours;

            if (hoursChanged) {

                const assignments =
                    this.getAssignmentScheduleTotals(id);

                const incompatibleAssignments =
                    assignments.filter(
                        assignment =>
                            Number(assignment.minutosSemanales) !==
                            weeklyHours * 60
                    );

                if (
                    incompatibleAssignments.length > 0
                ) {

                    const error = new Error(
                        "No se pueden modificar las horas semanales porque una o más asignaciones existentes no cumplen con la nueva cantidad de horas. Ajuste primero sus horarios."
                    );

                    error.code = "COURSE_ASSIGNMENT_HOURS_MISMATCH";
                    throw error;

                }

            }

            // ------------------------------------------------
            // VALIDAR CAMBIO DE ACADEMIA
            // ------------------------------------------------

            const academyChanged =
                Number(current.academiaId) !==
                Number(academiaId);

            if (academyChanged) {

                const domains =
                    this.dbController.get(
                        `
                            SELECT COUNT(*) AS total
                            FROM dominios
                            WHERE curso_id = ?;
                        `,
                        [id]
                    );

                const assignments =
                    this.dbController.get(
                        `
                            SELECT COUNT(*) AS total
                            FROM asignaciones
                            WHERE curso_id = ?;
                        `,
                        [id]
                    );

                if (
                    domains.total > 0 ||
                    assignments.total > 0
                ) {

                    const error = new Error(
                        "No se puede cambiar de academia un curso que tiene dominios o asignaciones asociadas."
                    );

                    error.code = "HAS_RELATIONS";
                    throw error;

                }

            }

            // ------------------------------------------------
            // ACTUALIZAR INFORMACIÓN
            // ------------------------------------------------

            this.dbController.run(
                `
                    UPDATE cursos
                    SET
                        nombre = ?,
                        descripcion = ?,
                        academia_id = ?,
                        horas_semanales = ?
                    WHERE id = ?;
                `,
                [
                    nombre,
                    descripcion,
                    academiaId,
                    weeklyHours,
                    id
                ]
            );

            return this.getById(id);

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // ELIMINAR CURSO
    // --------------------------------------------------------

    remove(id) {

        this.dbController.open();

        try {

            const course =
                this.dbController.get(
                    `
                        SELECT id
                        FROM cursos
                        WHERE id = ?;
                    `,
                    [id]
                );

            if (!course) {
                return false;
            }

            const domains =
                this.dbController.get(
                    `
                        SELECT COUNT(*) AS total
                        FROM dominios
                        WHERE curso_id = ?;
                    `,
                    [id]
                );

            const assignments =
                this.dbController.get(
                    `
                        SELECT COUNT(*) AS total
                        FROM asignaciones
                        WHERE curso_id = ?;
                    `,
                    [id]
                );

            if (
                domains.total > 0 ||
                assignments.total > 0
            ) {

                const error = new Error(
                    "No se puede eliminar el curso porque tiene dominios o asignaciones asociadas."
                );

                error.code = "HAS_RELATIONS";
                throw error;

            }

            this.dbController.run(
                `
                    DELETE FROM cursos
                    WHERE id = ?;
                `,
                [id]
            );

            return true;

        } finally {

            this.dbController.close();

        }

    }

}

export default ModelCursos;