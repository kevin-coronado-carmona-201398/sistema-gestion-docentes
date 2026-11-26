
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

        return (
            Number(match[1]) * 60 +
            Number(match[2])
        );

    }

    // --------------------------------------------------------
    // NORMALIZAR DÍA
    // Permite comparar Miércoles y Miercoles.
    // --------------------------------------------------------

    normalizeDay(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();

    }

    // --------------------------------------------------------
    // CONSULTA INTERNA DE ASIGNACIÓN
    // No abre ni cierra la conexión.
    // --------------------------------------------------------

    getById(id) {

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
            horarioIds: schedules.map(
                item => item.horario_id
            )
        };

    }

    // --------------------------------------------------------
    // OBTENER ASIGNACIÓN POR ID
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
                            [assignment.id]
                        );

                    return {
                        ...assignment,
                        horarioIds: schedules.map(
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
    // CREAR ASIGNACIÓN PENDIENTE
    // Solo registra la relación materia-docente.
    // Los horarios se configuran posteriormente.
    // --------------------------------------------------------

    create(
        cursoId,
        docenteId
    ) {

        const normalizedCourseId =
            Number(cursoId);

        const normalizedTeacherId =
            Number(docenteId);

        if (
            !Number.isInteger(normalizedCourseId) ||
            normalizedCourseId < 1 ||
            !Number.isInteger(normalizedTeacherId) ||
            normalizedTeacherId < 1
        ) {

            const error = new Error(
                "El identificador del curso o del docente no es válido."
            );

            error.code = "NOT_FOUND";
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
                            [normalizedCourseId]
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
                            [normalizedTeacherId]
                        );

                    if (
                        !course ||
                        !teacher
                    ) {

                        const error = new Error(
                            "El docente o la materia no existe."
                        );

                        error.code = "NOT_FOUND";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR HORAS SEMANALES
                    // ----------------------------------------

                    const weeklyHours =
                        Number(course.horasSemanales);

                    if (
                        !Number.isInteger(weeklyHours) ||
                        weeklyHours < 1 ||
                        weeklyHours > 10
                    ) {

                        const error = new Error(
                            "La materia debe tener configuradas sus horas semanales antes de asignar un docente."
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
                            "No se puede asignar un docente de una academia diferente a la materia."
                        );

                        error.code = "ACADEMY_MISMATCH";
                        throw error;

                    }

                    // ----------------------------------------
                    // EVITAR ASIGNACIÓN DUPLICADA
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
                                normalizedCourseId,
                                normalizedTeacherId
                            ]
                        );

                    if (duplicate) {

                        const error = new Error(
                            "El docente ya está asignado a esta materia."
                        );

                        error.code = "DUPLICATE_ASSIGNMENT";
                        throw error;

                    }

                    // ----------------------------------------
                    // REGISTRAR ASIGNACIÓN PENDIENTE
                    // ----------------------------------------

                    const result =
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
                                normalizedCourseId,
                                normalizedTeacherId
                            ]
                        );

                    return {
                        id: result.lastInsertRowid,
                        cursoId: normalizedCourseId,
                        docenteId: normalizedTeacherId,
                        horarioIds: []
                    };

                }
            );

        } finally {

            this.dbController.close();

        }

    }

    // --------------------------------------------------------
    // CONFIRMAR O ACTUALIZAR HORARIOS
    // Reemplaza los horarios anteriores solamente cuando
    // la nueva programación cumple todas las validaciones.
    // --------------------------------------------------------

    updateSchedules(
        assignmentId,
        horarioIds
    ) {

        const normalizedAssignmentId =
            Number(assignmentId);

        if (
            !Number.isInteger(normalizedAssignmentId) ||
            normalizedAssignmentId < 1
        ) {

            const error = new Error(
                "El identificador de la asignación no es válido."
            );

            error.code = "ASSIGNMENT_NOT_FOUND";
            throw error;

        }

        // ----------------------------------------------------
        // VALIDAR IDENTIFICADORES DE HORARIO
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

        const uniqueSchedules = [
            ...new Set(numericSchedules)
        ];

        if (uniqueSchedules.length === 0) {

            const error = new Error(
                "Debe seleccionar al menos un horario para confirmar la asignación."
            );

            error.code = "NO_SCHEDULE";
            throw error;

        }

        this.dbController.open();

        try {

            return this.dbController.transaction(
                () => {

                    // ----------------------------------------
                    // CONSULTAR ASIGNACIÓN Y RELACIONES
                    // ----------------------------------------

                    const assignment =
                        this.dbController.get(
                            `
                                SELECT
                                    a.id,
                                    a.curso_id AS cursoId,
                                    a.docente_id AS docenteId,
                                    c.nombre AS materia,
                                    c.academia_id AS academiaCurso,
                                    c.horas_semanales AS horasSemanales,
                                    d.academia_id AS academiaDocente

                                FROM asignaciones a

                                INNER JOIN cursos c
                                    ON c.id = a.curso_id

                                INNER JOIN docentes d
                                    ON d.id = a.docente_id

                                WHERE a.id = ?;
                            `,
                            [normalizedAssignmentId]
                        );

                    if (!assignment) {

                        const error = new Error(
                            "La asignación que intenta configurar no existe."
                        );

                        error.code = "ASSIGNMENT_NOT_FOUND";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR HORAS SEMANALES
                    // ----------------------------------------

                    const weeklyHours =
                        Number(assignment.horasSemanales);

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
                        Number(assignment.academiaCurso) !==
                        Number(assignment.academiaDocente)
                    ) {

                        const error = new Error(
                            "El docente y la materia deben pertenecer a la misma academia."
                        );

                        error.code = "ACADEMY_MISMATCH";
                        throw error;

                    }

                    // ----------------------------------------
                    // CONSULTAR BLOQUES HORARIOS
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
                    // VALIDAR DÍAS, DURACIONES Y HORAS
                    // ----------------------------------------

                    const validDays = new Set([
                        "lunes",
                        "martes",
                        "miercoles",
                        "jueves",
                        "viernes"
                    ]);

                    const selectedDays = new Set();

                    let totalMinutes = 0;

                    for (const schedule of schedules) {

                        const day =
                            this.normalizeDay(schedule.dia);

                        if (!validDays.has(day)) {

                            const error = new Error(
                                `El día ${schedule.dia} no es válido. Solo se permiten horarios de lunes a viernes.`
                            );

                            error.code = "INVALID_SCHEDULE_DAY";
                            throw error;

                        }

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

                        if (selectedDays.has(day)) {

                            const error = new Error(
                                `La asignación ya tiene una sesión programada para ${schedule.dia}. Solo se permite una sesión diaria.`
                            );

                            error.code = "DAILY_SESSION_LIMIT";
                            throw error;

                        }

                        selectedDays.add(day);

                        totalMinutes += duration;

                    }

                    // ----------------------------------------
                    // VALIDAR TOTAL SEMANAL
                    // ----------------------------------------

                    if (
                        totalMinutes !== weeklyHours * 60
                    ) {

                        const actualHours =
                            totalMinutes / 60;

                        const error = new Error(
                            `Los horarios seleccionados suman ${actualHours} horas, pero la materia requiere ${weeklyHours} horas semanales.`
                        );

                        error.code = "WEEKLY_HOURS_MISMATCH";
                        throw error;

                    }

                    // ----------------------------------------
                    // VALIDAR CONFLICTOS CON OTRAS ASIGNACIONES
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
                                      AND a.id <> ?
                                      AND h.dia = ?
                                      AND h.hora_inicio < ?
                                      AND h.hora_fin > ?

                                    LIMIT 1;
                                `,
                                [
                                    assignment.docenteId,
                                    normalizedAssignmentId,
                                    schedule.dia,
                                    schedule.horaFin,
                                    schedule.horaInicio
                                ]
                            );

                        if (conflict) {

                            const error = new Error(
                                "No se puede confirmar el horario porque el docente ya tiene otra materia en un intervalo que se superpone." +
                                ` Materia en conflicto: ${conflict.materia}.` +
                                ` Horario: ${conflict.dia} ${conflict.horaInicio}-${conflict.horaFin}.`
                            );

                            error.code = "SCHEDULE_CONFLICT";
                            throw error;

                        }

                    }

                    // ----------------------------------------
                    // REEMPLAZAR HORARIOS ANTERIORES
                    // ----------------------------------------

                    this.dbController.run(
                        `
                            DELETE FROM asignacion_horarios
                            WHERE asignacion_id = ?;
                        `,
                        [normalizedAssignmentId]
                    );

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
                                normalizedAssignmentId,
                                horarioId
                            ]
                        );

                    }

                    // ----------------------------------------
                    // DEVOLVER ASIGNACIÓN ACTUALIZADA
                    // ----------------------------------------

                    return {
                        id: normalizedAssignmentId,
                        cursoId: Number(assignment.cursoId),
                        docenteId: Number(assignment.docenteId),
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
    // Los horarios asociados se eliminan mediante CASCADE.
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

            return result.changes > 0;

        } finally {

            this.dbController.close();

        }

    }

}

export default ModelAsignaciones;