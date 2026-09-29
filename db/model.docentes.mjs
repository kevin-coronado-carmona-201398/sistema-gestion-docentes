class ModelDocentes {

    constructor(controller) {

        this.dbController =
            controller;

    }

    get(id) {

        const sql = `
            SELECT
                id,
                numero_empleado AS numeroEmpleado,
                nombre,
                nivel_academico AS nivelAcademico,
                titulo_academico AS tituloAcademico,
                especialidad,
                sni,
                nivel_sni AS nivelSni,
                prodep,
                certificaciones,
                academia_id AS academiaId
            FROM docentes
            WHERE id = ?;
        `;

        this.dbController.open();

        const data =
            this.dbController.get(
                sql,
                [id]
            );

        this.dbController.close();

        return data;

    }

    getAll() {

        const sql = `
            SELECT
                id,
                numero_empleado AS numeroEmpleado,
                nombre,
                nivel_academico AS nivelAcademico,
                titulo_academico AS tituloAcademico,
                especialidad,
                sni,
                nivel_sni AS nivelSni,
                prodep,
                certificaciones,
                academia_id AS academiaId
            FROM docentes
            ORDER BY nombre;
        `;

        this.dbController.open();

        const data =
            this.dbController.all(
                sql,
                []
            );

        this.dbController.close();

        return data;

    }

    create(data) {

        this.dbController.open();

        try {

            const employeeExists =
                this.dbController.get(
                    `
                    SELECT id
                    FROM docentes
                    WHERE LOWER(numero_empleado) =
                          LOWER(?)
                    LIMIT 1;
                    `,
                    [
                        data.numeroEmpleado
                    ]
                );

            if (employeeExists) {

                const error =
                    new Error(
                        "El número de empleado ya existe."
                    );

                error.code =
                    "DUPLICATE_EMPLOYEE";

                throw error;

            }

            const academy =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [
                        data.academiaId
                    ]
                );

            if (!academy) {

                const error =
                    new Error(
                        "La academia seleccionada no existe."
                    );

                error.code =
                    "ACADEMY_NOT_FOUND";

                throw error;

            }

            if (
                data.sni === "si"
            ) {

                const sniLevel =
                    this.dbController.get(
                        `
                        SELECT id
                        FROM niveles_sni
                        WHERE LOWER(nombre) =
                              LOWER(?);
                        `,
                        [
                            data.nivelSni
                        ]
                    );

                if (!sniLevel) {

                    const error =
                        new Error(
                            "El nivel SNI seleccionado no es válido."
                        );

                    error.code =
                        "INVALID_SNI";

                    throw error;

                }

            }

            const result =
                this.dbController.run(
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
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    `,
                    [
                        data.numeroEmpleado,
                        data.nombre,
                        data.nivelAcademico,
                        data.tituloAcademico,
                        data.especialidad,
                        data.sni,
                        data.nivelSni,
                        data.prodep,
                        data.certificaciones,
                        data.academiaId
                    ]
                );

            return this.get(
                result.lastInsertRowid
            );

        } finally {

            this.dbController.close();

        }

    }

    update(
        id,
        data
    ) {

        this.dbController.open();

        try {

            const current =
                this.dbController.get(
                    `
                    SELECT *
                    FROM docentes
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!current) {
                return null;
            }

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM docentes
                    WHERE LOWER(numero_empleado) =
                          LOWER(?)
                      AND id <> ?;
                    `,
                    [
                        data.numeroEmpleado,
                        id
                    ]
                );

            if (duplicate) {

                const error =
                    new Error(
                        "El número de empleado ya existe."
                    );

                error.code =
                    "DUPLICATE_EMPLOYEE";

                throw error;

            }

            const academy =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [
                        data.academiaId
                    ]
                );

            if (!academy) {

                const error =
                    new Error(
                        "La academia seleccionada no existe."
                    );

                error.code =
                    "ACADEMY_NOT_FOUND";

                throw error;

            }

            const academyChanged =
                Number(
                    current.academia_id
                ) !==
                Number(
                    data.academiaId
                );

            if (academyChanged) {

                const domains =
                    this.dbController.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM dominios
                        WHERE docente_id = ?;
                        `,
                        [id]
                    );

                const assignments =
                    this.dbController.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM asignaciones
                        WHERE docente_id = ?;
                        `,
                        [id]
                    );

                if (
                    domains.total > 0 ||
                    assignments.total > 0
                ) {

                    const error =
                        new Error(
                            "No se puede cambiar de academia a un docente que tiene dominios o asignaciones asociadas."
                        );

                    error.code =
                        "HAS_RELATIONS";

                    throw error;

                }

            }

            if (
                data.sni === "si"
            ) {

                const sniLevel =
                    this.dbController.get(
                        `
                        SELECT id
                        FROM niveles_sni
                        WHERE LOWER(nombre) =
                              LOWER(?);
                        `,
                        [
                            data.nivelSni
                        ]
                    );

                if (!sniLevel) {

                    const error =
                        new Error(
                            "El nivel SNI seleccionado no es válido."
                        );

                    error.code =
                        "INVALID_SNI";

                    throw error;

                }

            }

            this.dbController.run(
                `
                UPDATE docentes
                SET
                    numero_empleado = ?,
                    nombre = ?,
                    nivel_academico = ?,
                    titulo_academico = ?,
                    especialidad = ?,
                    sni = ?,
                    nivel_sni = ?,
                    prodep = ?,
                    certificaciones = ?,
                    academia_id = ?
                WHERE id = ?;
                `,
                [
                    data.numeroEmpleado,
                    data.nombre,
                    data.nivelAcademico,
                    data.tituloAcademico,
                    data.especialidad,
                    data.sni,
                    data.nivelSni,
                    data.prodep,
                    data.certificaciones,
                    data.academiaId,
                    id
                ]
            );

            return this.get(id);

        } finally {

            this.dbController.close();

        }

    }

    remove(id) {

        this.dbController.open();

        try {

            const teacher =
                this.dbController.get(
                    `
                    SELECT id
                    FROM docentes
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!teacher) {
                return false;
            }

            const domains =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM dominios
                    WHERE docente_id = ?;
                    `,
                    [id]
                );

            const assignments =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM asignaciones
                    WHERE docente_id = ?;
                    `,
                    [id]
                );

            if (
                domains.total > 0 ||
                assignments.total > 0
            ) {

                const error =
                    new Error(
                        "No se puede eliminar el docente porque tiene dominios o asignaciones asociadas."
                    );

                error.code =
                    "HAS_RELATIONS";

                throw error;

            }

            this.dbController.run(
                `
                DELETE FROM docentes
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

export default ModelDocentes;