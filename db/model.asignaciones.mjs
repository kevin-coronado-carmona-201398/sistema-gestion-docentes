
class ModelAsignaciones {

    constructor(controller) {

        this.dbController = controller;

    }

    // --------------------------------------------------------
    // CONVERTIR HORA HH:MM A MINUTOS
    // --------------------------------------------------------

    toMinutes(value) {

        const match =
            /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
                String(value)
            );

        if (!match) {
            return null;
        }

        const hours = Number(match[1]);
        const minutes = Number(match[2]);

        return hours * 60 + minutes;

    }

    // --------------------------------------------------------
    // OBTENER ASIGNACIÓN POR ID
    // --------------------------------------------------------

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
                        item => item.horario_id
                    )
            };

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // OBTENER TODAS LAS ASIGNACIONES
    // --------------------------------------------------------

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
                                item => item.horario_id
                            )
                    };

                }
            );

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // CREAR ASIGNACIÓN
    // --------------------------------------------------------

    create(
        cursoId,
        docenteId,
        horarioIds
    ) {

        // ----------------------------------------------------
        // VALIDAR IDENTIFICADORES RECIBIDOS
        // ----------------------------------------------------

        if (!Array.isArray(horarioIds)) {

            const error = new Error(
                "La lista de horarios seleccionados no es válida."
            );

            error.code = "INVALID_SCHEDULE";
            throw error;

        }

        const numericSchedules =
            horarioIds.map(
                id => Number(id)
            );

        if (
            numericSchedules.some(
                id =>
                    !Number.isInteger(id) ||
                    id < 1
            )
        ) {

            const error = new Error(
                "Uno o más identificadores de horario no son válidos."
            );

            error.code = "INVALID_SCHEDULE";
            throw error;

        }

        // Eliminar identificadores duplicados.

        const uniqueSchedules = [
            ...new Set(numericSchedules)
        ];

        if (uniqueSchedules.length === 0) {

            const error = new Error(
                "Debe seleccionar al menos un horario para la asignación."
            );

            error.code = "NO_SCHEDULE";
            throw error;

        }

        this.dbController.open();

        try {

            return this.dbController.transaction(
                () => {

                    // ----------------------------------------
                    // VALIDAR MATERIA Y DOCENTE
                    // ----------------------------------------

                    const course =
                        this.dbController.get(
                            `
                                SELECT
                                    id,
                                    academia_id,
                                    horas_semanales AS horasSemanales
                                FROM cursos
                                WHERE id = ?;
                            `,
                            [cursoId]
                        );

                    const teacher =
                        this.dbController.get(
                            `
                                SELECT
                                    id,
                                    academia_id
                                FROM docentes
                                WHERE id = ?;
                            `,
                            [docenteId]
                        );

                    if (
                        !course ||
                        !teacher
                    ) {

                        const error = new Error(
                            "El docente o el curso no existe."
                        );

                        error.code = "NOT_FOUND";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR HORAS SEMANALES DE LA MATERIA
                    // ----------------------------------------

                    const weeklyHours =
                        Number(course.horasSemanales);

                    if (
                        !Number.isInteger(weeklyHours) ||
                        weeklyHours < 1 ||
                        weeklyHours > 10
                    ) {

                        const error = new Error(
                            "La materia no tiene configuradas correctamente sus horas semanales."
                        );

                        error.code = "COURSE_HOURS_NOT_CONFIGURED";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR ACADEMIA
                    // ----------------------------------------

                    if (
                        Number(course.academia_id) !==
                        Number(teacher.academia_id)
                    ) {

                        const error = new Error(
                            "No se puede asignar un docente de una academia diferente al curso."
                        );

                        error.code = "ACADEMY_MISMATCH";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR ASIGNACIÓN DUPLICADA
                    // ----------------------------------------

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

                        const error = new Error(
                            "El docente ya está asignado a este curso."
                        );

                        error.code = "DUPLICATE_ASSIGNMENT";
                        throw error;

                    }

                    // ----------------------------------------
                    // CONSULTAR HORARIOS SELECCIONADOS
                    // ----------------------------------------

                    const placeholders =
                        uniqueSchedules
                            .map(() => "?")
                            .join(",");

                    const schedules =
                        this.dbController.all(
                            `
                                SELECT
                                    id,
                                    dia,
                                    hora_inicio AS horaInicio,
                                    hora_fin AS horaFin
                                FROM horarios
                                WHERE id IN (${placeholders});
                            `,
                            uniqueSchedules
                        );

                    if (
                        schedules.length !==
                        uniqueSchedules.length
                    ) {

                        const error = new Error(
                            "Uno o más horarios seleccionados no existen."
                        );

                        error.code = "INVALID_SCHEDULE";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR DISTRIBUCIÓN SEMANAL
                    // ----------------------------------------

                    const validDays = new Set([
                        "Lunes",
                        "Martes",
                        "Miércoles",
                        "Jueves",
                        "Viernes"
                    ]);

                    const selectedDays = new Set();

                    let totalMinutes = 0;

                    for (const schedule of schedules) {

                        // Validar día.

                        if (!validDays.has(schedule.dia)) {

                            const error = new Error(
                                `El día ${schedule.dia} no es válido. Solo se permiten horarios de lunes a viernes.`
                            );

                            error.code = "INVALID_SCHEDULE_DAY";
                            throw error;

                        }

                        // Convertir horas a minutos.

                        const start =
                            this.toMinutes(schedule.horaInicio);

                        const end =
                            this.toMinutes(schedule.horaFin);

                        if (
                            start === null ||
                            end === null ||
                            end <= start
                        ) {

                            const error = new Error(
                                "Uno de los horarios seleccionados tiene un intervalo de tiempo inválido."
                            );

                            error.code = "INVALID_SCHEDULE_TIME";
                            throw error;

                        }

                        const duration =
                            end - start;

                        // Solo se permiten sesiones de 1 o 2 horas.

                        if (
                            duration !== 60 &&
                            duration !== 120
                        ) {

                            const error = new Error(
                                "Cada sesión debe durar exactamente una o dos horas."
                            );

                            error.code = "INVALID_SESSION_DURATION";
                            throw error;

                        }

                        // Máximo una sesión por día.

                        if (selectedDays.has(schedule.dia)) {

                            const error = new Error(
                                `La asignación ya tiene una sesión programada para ${schedule.dia}. Solo se permite una sesión diaria.`
                            );

                            error.code = "DAILY_SESSION_LIMIT";
                            throw error;

                        }

                        selectedDays.add(schedule.dia);

                        totalMinutes += duration;

                    }

                    const totalHours =
                        totalMinutes / 60;

                    // La suma debe coincidir con la materia.

                    if (totalHours !== weeklyHours) {

                        const error = new Error(
                            `Los horarios seleccionados suman ${totalHours} horas, pero la materia requiere ${weeklyHours} horas semanales.`
                        );

                        error.code = "WEEKLY_HOURS_MISMATCH";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR CONFLICTOS DEL DOCENTE
                    // ----------------------------------------

                    for (const schedule of schedules) {

                        const conflict =
                            this.dbController.get(
                                `
                                    SELECT
                                        a.id AS asignacionId,
                                        c.nombre AS materia,
                                        h.dia,
                                        h.hora_inicio AS horaInicio,
                                        h.hora_fin AS horaFin

                                    FROM asignaciones a

                                    INNER JOIN cursos c
                                        ON c.id = a.curso_id

                                    INNER JOIN asignacion_horarios ah
                                        ON ah.asignacion_id = a.id

                                    INNER JOIN horarios h
                                        ON h.id = ah.horario_id

                                    WHERE a.docente_id = ?
                                      AND h.dia = ?
                                      AND h.hora_inicio < ?
                                      AND h.hora_fin > ?

                                    LIMIT 1;
                                `,
                                [
                                    docenteId,
                                    schedule.dia,
                                    schedule.horaFin,
                                    schedule.horaInicio
                                ]
                            );

                        if (conflict) {

                            const error = new Error(
                                "No se puede asignar al docente porque ya tiene otra materia en un horario que se superpone." +
                                ` Materia en conflicto: ${conflict.materia}.` +
                                ` Horario: ${conflict.dia} ${conflict.horaInicio}-${conflict.horaFin}.`
                            );

                            error.code = "SCHEDULE_CONFLICT";
                            throw error;

                        }

                    }

                    // ----------------------------------------
                    // INSERTAR ASIGNACIÓN
                    // ----------------------------------------

                    const assignmentResult =
                        this.dbController.run(
                            `
                                INSERT INTO asignaciones
                                (
                                    curso_id,
                                    docente_id
                                )
                                VALUES (?, ?);
                            `,
                            [
                                cursoId,
                                docenteId
                            ]
                        );

                    const assignmentId =
                        assignmentResult.lastInsertRowid;

                    // ----------------------------------------
                    // INSERTAR HORARIOS DE LA ASIGNACIÓN
                    // ----------------------------------------

                    for (const horarioId of uniqueSchedules) {

                        this.dbController.run(
                            `
                                INSERT INTO asignacion_horarios
                                (
                                    asignacion_id,
                                    horario_id
                                )
                                VALUES (?, ?);
                            `,
                            [
                                assignmentId,
                                horarioId
                            ]
                        );

                    }

                    return {
                        id: assignmentId,
                        cursoId: Number(cursoId),
                        docenteId: Number(docenteId),
                        horarioIds: uniqueSchedules
                    };

                }
            );

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // ELIMINAR ASIGNACIÓN
    // --------------------------------------------------------

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