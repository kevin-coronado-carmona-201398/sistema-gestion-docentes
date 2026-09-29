class ModelAsignaciones {

    constructor(controller) {

        this.dbController =
            controller;

    }

    get(id) {

        this.dbController.open();

        try {

            const assignment =
                this.dbController.get(
                    `
                    SELECT
                        id,
                        curso_id AS cursoId,
                        docente_id AS docenteId
                    FROM asignaciones
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!assignment) {
                return null;
            }

            const schedules =
                this.dbController.all(
                    `
                    SELECT
                        horario_id
                    FROM asignacion_horarios
                    WHERE asignacion_id = ?
                    ORDER BY horario_id;
                    `,
                    [id]
                );

            return {
                ...assignment,
                horarioIds:
                    schedules.map(
                        item =>
                            item.horario_id
                    )
            };

        } finally {

            this.dbController.close();

        }

    }

    getAll() {

        this.dbController.open();

        try {

            const assignments =
                this.dbController.all(
                    `
                    SELECT
                        id,
                        curso_id AS cursoId,
                        docente_id AS docenteId
                    FROM asignaciones
                    ORDER BY id;
                    `,
                    []
                );

            return assignments.map(
                assignment => {

                    const schedules =
                        this.dbController.all(
                            `
                            SELECT
                                horario_id
                            FROM asignacion_horarios
                            WHERE asignacion_id = ?
                            ORDER BY horario_id;
                            `,
                            [
                                assignment.id
                            ]
                        );

                    return {
                        ...assignment,
                        horarioIds:
                            schedules.map(
                                item =>
                                    item.horario_id
                            )
                    };

                }
            );

        } finally {

            this.dbController.close();

        }

    }

    create(
        cursoId,
        docenteId,
        horarioIds
    ) {

        const uniqueSchedules =
            [
                ...new Set(
                    horarioIds.map(
                        id =>
                            Number(id)
                    )
                )
            ];

        this.dbController.open();

        try {

            return this.dbController.transaction(
                () => {

                    const course =
                        this.dbController.get(
                            `
                            SELECT id, academia_id
                            FROM cursos
                            WHERE id = ?;
                            `,
                            [cursoId]
                        );

                    const teacher =
                        this.dbController.get(
                            `
                            SELECT id, academia_id
                            FROM docentes
                            WHERE id = ?;
                            `,
                            [docenteId]
                        );

                    if (
                        !course ||
                        !teacher
                    ) {

                        const error =
                            new Error(
                                "El docente o el curso no existe."
                            );

                        error.code =
                            "NOT_FOUND";

                        throw error;

                    }

                    if (
                        Number(
                            course.academia_id
                        ) !==
                        Number(
                            teacher.academia_id
                        )
                    ) {

                        const error =
                            new Error(
                                "No se puede asignar un docente de una academia diferente al curso."
                            );

                        error.code =
                            "ACADEMY_MISMATCH";

                        throw error;

                    }

                    if (
                        uniqueSchedules.length === 0
                    ) {

                        const error =
                            new Error(
                                "Debe seleccionar al menos un horario para la asignación."
                            );

                        error.code =
                            "NO_SCHEDULE";

                        throw error;

                    }

                    const duplicate =
                        this.dbController.get(
                            `
                            SELECT id
                            FROM asignaciones
                            WHERE curso_id = ?
                              AND docente_id = ?;
                            `,
                            [
                                cursoId,
                                docenteId
                            ]
                        );

                    if (duplicate) {

                        const error =
                            new Error(
                                "El docente ya está asignado a este curso."
                            );

                        error.code =
                            "DUPLICATE_ASSIGNMENT";

                        throw error;

                    }

                    const placeholders =
                        uniqueSchedules
                            .map(
                                () => "?"
                            )
                            .join(",");

                    const invalidSchedule =
                        this.dbController.get(
                            `
                            SELECT id
                            FROM horarios
                            WHERE id IN (${placeholders})
                            LIMIT 1;
                            `,
                            uniqueSchedules
                        );

                    const totalSchedules =
                        this.dbController.get(
                            `
                            SELECT COUNT(*) AS total
                            FROM horarios
                            WHERE id IN (${placeholders});
                            `,
                            uniqueSchedules
                        );

                    if (
                        totalSchedules.total !==
                        uniqueSchedules.length
                    ) {

                        const error =
                            new Error(
                                "Uno o más horarios seleccionados no existen."
                            );

                        error.code =
                            "INVALID_SCHEDULE";

                        throw error;

                    }

                    const conflict =
                        this.dbController.get(
                            `
                            SELECT
                                a.id,
                                a.curso_id AS cursoId,
                                ah.horario_id AS horarioId
                            FROM asignaciones a
                            INNER JOIN asignacion_horarios ah
                                ON ah.asignacion_id = a.id
                            WHERE a.docente_id = ?
                              AND ah.horario_id IN (${placeholders})
                            LIMIT 1;
                            `,
                            [
                                docenteId,
                                ...uniqueSchedules
                            ]
                        );

                    if (conflict) {

                        const courseConflict =
                            this.dbController.get(
                                `
                                SELECT nombre
                                FROM cursos
                                WHERE id = ?;
                                `,
                                [
                                    conflict.cursoId
                                ]
                            );

                        const schedule =
                            this.dbController.get(
                                `
                                SELECT
                                    dia,
                                    hora_inicio AS horaInicio,
                                    hora_fin AS horaFin
                                FROM horarios
                                WHERE id = ?;
                                `,
                                [
                                    conflict.horarioId
                                ]
                            );

                        const scheduleText =
                            schedule
                                ? `${schedule.dia} ${schedule.horaInicio}-${schedule.horaFin}`
                                : `ID ${conflict.horarioId}`;

                        const error =
                            new Error(
                                "No se puede asignar el docente porque ya tiene otro curso en el mismo horario." +
                                ` Curso en conflicto: ${courseConflict?.nombre || "No identificado"}.` +
                                ` Horario: ${scheduleText}.`
                            );

                        error.code =
                            "SCHEDULE_CONFLICT";

                        throw error;

                    }

                    const assignmentResult =
                        this.dbController.run(
                            `
                            INSERT INTO asignaciones
                            (
                                curso_id,
                                docente_id
                            )
                            VALUES
                            (?, ?);
                            `,
                            [
                                cursoId,
                                docenteId
                            ]
                        );

                    const assignmentId =
                        assignmentResult
                            .lastInsertRowid;

                    for (
                        const horarioId
                        of uniqueSchedules
                    ) {

                        this.dbController.run(
                            `
                            INSERT INTO asignacion_horarios
                            (
                                asignacion_id,
                                horario_id
                            )
                            VALUES
                            (?, ?);
                            `,
                            [
                                assignmentId,
                                horarioId
                            ]
                        );

                    }

                    return {
                        id:
                            assignmentId,
                        cursoId:
                            Number(
                                cursoId
                            ),
                        docenteId:
                            Number(
                                docenteId
                            ),
                        horarioIds:
                            uniqueSchedules
                    };

                }
            );

        } finally {

            this.dbController.close();

        }

    }

    remove(id) {

        this.dbController.open();

        try {

            const result =
                this.dbController.run(
                    `
                    DELETE FROM asignaciones
                    WHERE id = ?;
                    `,
                    [id]
                );

            return (
                result.changes > 0
            );

        } finally {

            this.dbController.close();

        }

    }

}

export default ModelAsignaciones;