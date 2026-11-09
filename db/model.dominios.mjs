class ModelDominios {

    constructor(controller) {

        this.dbController =
            controller;

    }

    get(id) {

        this.dbController.open();

        const data =
            this.dbController.get(
                `
                SELECT
                    id,
                    docente_id AS docenteId,
                    curso_id AS cursoId,
                    nivel
                FROM dominios
                WHERE id = ?;
                `,
                [id]
            );

        this.dbController.close();

        return data;

    }

    getAll() {

        this.dbController.open();

        const data =
            this.dbController.all(
                `
                SELECT
                    id,
                    docente_id AS docenteId,
                    curso_id AS cursoId,
                    nivel
                FROM dominios
                ORDER BY id;
                `,
                []
            );

        this.dbController.close();

        return data;

    }

    create(
        docenteId,
        cursoId,
        nivel
    ) {

        this.dbController.open();

        try {

            const teacher =
                this.dbController.get(
                    `
                    SELECT id, academia_id
                    FROM docentes
                    WHERE id = ?;
                    `,
                    [docenteId]
                );

            const course =
                this.dbController.get(
                    `
                    SELECT id, academia_id
                    FROM cursos
                    WHERE id = ?;
                    `,
                    [cursoId]
                );

            if (
                !teacher ||
                !course
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
                    teacher.academia_id
                ) !==
                Number(
                    course.academia_id
                )
            ) {

                const error =
                    new Error(
                        "El docente y el curso deben pertenecer a la misma academia."
                    );

                error.code =
                    "ACADEMY_MISMATCH";

                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM dominios
                    WHERE docente_id = ?
                      AND curso_id = ?;
                    `,
                    [
                        docenteId,
                        cursoId
                    ]
                );

            if (duplicate) {

                const error =
                    new Error(
                        "Ya existe un dominio registrado para este docente y este curso."
                    );

                error.code =
                    "DUPLICATE_DOMAIN";

                throw error;

            }

            const result =
                this.dbController.run(
                    `
                    INSERT INTO dominios
                    (
                        docente_id,
                        curso_id,
                        nivel
                    )
                    VALUES
                    (?, ?, ?);
                    `,
                    [
                        docenteId,
                        cursoId,
                        nivel
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
        docenteId,
        cursoId,
        nivel
    ) {

        this.dbController.open();

        try {

            const current =
                this.dbController.get(
                    `
                    SELECT id
                    FROM dominios
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!current) {
                return null;
            }

            const teacher =
                this.dbController.get(
                    `
                    SELECT id, academia_id
                    FROM docentes
                    WHERE id = ?;
                    `,
                    [docenteId]
                );

            const course =
                this.dbController.get(
                    `
                    SELECT id, academia_id
                    FROM cursos
                    WHERE id = ?;
                    `,
                    [cursoId]
                );

            if (
                !teacher ||
                !course
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
                    teacher.academia_id
                ) !==
                Number(
                    course.academia_id
                )
            ) {

                const error =
                    new Error(
                        "El docente y el curso deben pertenecer a la misma academia."
                    );

                error.code =
                    "ACADEMY_MISMATCH";

                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM dominios
                    WHERE docente_id = ?
                      AND curso_id = ?
                      AND id <> ?;
                    `,
                    [
                        docenteId,
                        cursoId,
                        id
                    ]
                );

            if (duplicate) {

                const error =
                    new Error(
                        "Ya existe otro dominio para este docente y este curso."
                    );

                error.code =
                    "DUPLICATE_DOMAIN";

                throw error;

            }

            this.dbController.run(
                `
                UPDATE dominios
                SET
                    docente_id = ?,
                    curso_id = ?,
                    nivel = ?
                WHERE id = ?;
                `,
                [
                    docenteId,
                    cursoId,
                    nivel,
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

            const result =
                this.dbController.run(
                    `
                    DELETE FROM dominios
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

export default ModelDominios;