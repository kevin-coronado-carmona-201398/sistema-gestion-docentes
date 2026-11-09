
const SELECT_TEMPLATE = `
    SELECT
        id,
        nombre,
        horas_semanales AS horasSemanales,
        tipo,
        horas_lunes AS horasLunes,
        horas_martes AS horasMartes,
        horas_miercoles AS horasMiercoles,
        horas_jueves AS horasJueves,
        horas_viernes AS horasViernes,
        activa
    FROM plantillas
`;

const DAY_FIELDS = [
    ["horasLunes", "horas_lunes"],
    ["horasMartes", "horas_martes"],
    ["horasMiercoles", "horas_miercoles"],
    ["horasJueves", "horas_jueves"],
    ["horasViernes", "horas_viernes"]
];

function createError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function normalizeTemplateData(data, current = null) {

    const nombre =
        String(
            data.nombre ?? current?.nombre ?? ""
        ).trim();

    const horasSemanales =
        Number(
            data.horasSemanales ??
            current?.horasSemanales
        );

    const days = {};

    for (const [field] of DAY_FIELDS) {

        days[field] = Number(
            data[field] ??
            current?.[field] ??
            0
        );

    }

    let activa = current?.activa ?? 1;

    if (data.activa !== undefined) {

        if (
            data.activa === true ||
            data.activa === 1 ||
            data.activa === "1"
        ) {
            activa = 1;
        }
        else if (
            data.activa === false ||
            data.activa === 0 ||
            data.activa === "0"
        ) {
            activa = 0;
        }
        else {
            throw createError(
                "El estado de la plantilla no es válido.",
                "INVALID_TEMPLATE"
            );
        }

    }

    if (!nombre) {
        throw createError(
            "El nombre de la plantilla es obligatorio.",
            "INVALID_TEMPLATE"
        );
    }

    if (
        !Number.isInteger(horasSemanales) ||
        horasSemanales < 1 ||
        horasSemanales > 10
    )   {
        throw createError(
            "Las horas semanales deben ser un entero mayor que cero.",
            "INVALID_TEMPLATE"
        );
    }

    for (const [field] of DAY_FIELDS) {

        if (
            !Number.isInteger(days[field]) ||
            days[field] < 0 ||
            days[field] > 2
        ) {
            throw createError(
                `El valor de ${field} debe ser 0, 1 o 2.`,
                "INVALID_TEMPLATE"
            );
        }

    }

    const totalDays =
        Object.values(days).reduce(
            (total, hours) => total + hours,
            0
        );

    if (totalDays !== horasSemanales) {
        throw createError(
            "La distribución de los días debe sumar exactamente las horas semanales.",
            "INVALID_TEMPLATE"
        );
    }

    return {
        nombre,
        horasSemanales,
        ...days,
        activa
    };

}

function buildDefaultDistribution(
    horasSemanales,
    primaryDays,
    secondaryDays
) {

    const days = {
        horasLunes: 0,
        horasMartes: 0,
        horasMiercoles: 0,
        horasJueves: 0,
        horasViernes: 0
    };

    let remaining = horasSemanales;

    // 1. Priorizar los días principales.

    for (const day of primaryDays) {

        const hours =
            Math.min(2, remaining);

        days[day] = hours;
        remaining -= hours;

    }

    // 2. Utilizar viernes para completar
    // una hora impar cuando sea necesario.

    if (
        remaining > 0 &&
        remaining % 2 === 1
    ) {

        days.horasViernes = 1;
        remaining -= 1;

    }

    // 3. Incorporar los días secundarios.

    for (const day of secondaryDays) {

        const hours =
            Math.min(2, remaining);

        days[day] = hours;
        remaining -= hours;

    }

    // 4. Utilizar viernes para las horas restantes.

    if (remaining > 0) {

        const available =
            2 - days.horasViernes;

        const hours =
            Math.min(available, remaining);

        days.horasViernes += hours;
        remaining -= hours;

    }

    if (remaining !== 0) {
        throw new Error(
            "No fue posible generar la distribución semanal."
        );
    }

    return days;

}

class ModelPlantillas {

    constructor(controller) {
        this.dbController = controller;
    }

    seedDefaults() {

        this.dbController.open();

        try {

            const patterns = [

                {
                    nombre: "Plantilla A - Lunes y miércoles",

                    primaryDays: [
                        "horasLunes",
                        "horasMiercoles"
                    ],

                    secondaryDays: [
                        "horasMartes",
                        "horasJueves"
                    ]
                },

                {
                    nombre: "Plantilla B - Martes y jueves",

                    primaryDays: [
                        "horasMartes",
                        "horasJueves"
                    ],

                    secondaryDays: [
                        "horasLunes",
                        "horasMiercoles"
                    ]
                }

            ];

            let inserted = 0;

            for (
                let horas = 1;
                horas <= 10;
                horas++
            ) {

                for (const pattern of patterns) {

                    const existing =
                        this.dbController.get(
                            `
                                SELECT id
                                FROM plantillas
                                WHERE nombre = ?
                                AND horas_semanales = ?
                                AND tipo = 'predeterminada';
                            `,
                            [
                                pattern.nombre,
                                horas
                            ]
                        );

                    if (existing) {
                        continue;
                    }

                    const distribution =
                        buildDefaultDistribution(
                            horas,
                            pattern.primaryDays,
                            pattern.secondaryDays
                        );

                    this.dbController.run(
                        `
                            INSERT INTO plantillas
                            (
                                nombre,
                                horas_semanales,
                                tipo,
                                horas_lunes,
                                horas_martes,
                                horas_miercoles,
                                horas_jueves,
                                horas_viernes,
                                activa
                            )
                            VALUES (
                                ?, ?,
                                'predeterminada',
                                ?, ?, ?, ?, ?,
                                1
                            );
                        `,
                        [
                            pattern.nombre,
                            horas,
                            distribution.horasLunes,
                            distribution.horasMartes,
                            distribution.horasMiercoles,
                            distribution.horasJueves,
                            distribution.horasViernes
                        ]
                    );

                    inserted++;

                }

            }

            console.log(
                `Plantillas predeterminadas verificadas. Nuevas: ${inserted}.`
            );

            return inserted;

        } finally {

            this.dbController.close();

        }

    }

    getAll({
        horasSemanales = null,
        soloActivas = false
    } = {}) {

        this.dbController.open();

        try {

            const conditions = [];
            const params = [];

            if (horasSemanales !== null) {

                conditions.push(
                    "horas_semanales = ?"
                );

                params.push(horasSemanales);

            }

            if (soloActivas) {
                conditions.push("activa = 1");
            }

            const where =
                conditions.length > 0
                    ? `WHERE ${conditions.join(" AND ")}`
                    : "";

            return this.dbController.all(
                `
                ${SELECT_TEMPLATE}
                ${where}
                ORDER BY
                    horas_semanales,
                    tipo,
                    nombre;
                `,
                params
            );

        } finally {
            this.dbController.close();
        }

    }

    get(id) {

        this.dbController.open();

        try {

            return this.dbController.get(
                `
                ${SELECT_TEMPLATE}
                WHERE id = ?;
                `,
                [id]
            ) || null;

        } finally {
            this.dbController.close();
        }

    }

    create(data) {

        const template =
            normalizeTemplateData(data);

        this.dbController.open();

        try {

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM plantillas
                    WHERE horas_semanales = ?
                      AND LOWER(nombre) = LOWER(?);
                    `,
                    [
                        template.horasSemanales,
                        template.nombre
                    ]
                );

            if (duplicate) {
                throw createError(
                    "Ya existe una plantilla con ese nombre y carga horaria.",
                    "DUPLICATE_TEMPLATE"
                );
            }

            const result =
                this.dbController.run(
                    `
                    INSERT INTO plantillas (
                        nombre,
                        horas_semanales,
                        tipo,
                        horas_lunes,
                        horas_martes,
                        horas_miercoles,
                        horas_jueves,
                        horas_viernes,
                        activa
                    )
                    VALUES (?, ?, 'personalizada', ?, ?, ?, ?, ?, ?);
                    `,
                    [
                        template.nombre,
                        template.horasSemanales,
                        template.horasLunes,
                        template.horasMartes,
                        template.horasMiercoles,
                        template.horasJueves,
                        template.horasViernes,
                        template.activa
                    ]
                );

            return this.dbController.get(
                `
                ${SELECT_TEMPLATE}
                WHERE id = ?;
                `,
                [result.lastInsertRowid]
            );

        } finally {
            this.dbController.close();
        }

    }

    duplicate(id, nombre = "") {

        this.dbController.open();

        try {

            return this.dbController.transaction(
                () => {

                    const source =
                        this.dbController.get(
                            `
                            ${SELECT_TEMPLATE}
                            WHERE id = ?;
                            `,
                            [id]
                        );

                    if (!source) {
                        throw createError(
                            "La plantilla que desea duplicar no existe.",
                            "TEMPLATE_NOT_FOUND"
                        );
                    }

                    if (Number(source.activa) !== 1) {
                        throw createError(
                            "No se pueden duplicar plantillas inactivas.",
                            "INACTIVE_TEMPLATE"
                        );
                    }

                    const newName =
                        String(nombre || "").trim() ||
                        `${source.nombre} - Copia`;

                    const duplicate =
                        this.dbController.get(
                            `
                            SELECT id
                            FROM plantillas
                            WHERE horas_semanales = ?
                              AND LOWER(nombre) = LOWER(?);
                            `,
                            [
                                source.horasSemanales,
                                newName
                            ]
                        );

                    if (duplicate) {
                        throw createError(
                            "Ya existe una plantilla con ese nombre y carga horaria.",
                            "DUPLICATE_TEMPLATE"
                        );
                    }

                    const result =
                        this.dbController.run(
                            `
                            INSERT INTO plantillas (
                                nombre,
                                horas_semanales,
                                tipo,
                                horas_lunes,
                                horas_martes,
                                horas_miercoles,
                                horas_jueves,
                                horas_viernes,
                                activa
                            )
                            VALUES (?, ?, 'personalizada', ?, ?, ?, ?, ?, 1);
                            `,
                            [
                                newName,
                                source.horasSemanales,
                                source.horasLunes,
                                source.horasMartes,
                                source.horasMiercoles,
                                source.horasJueves,
                                source.horasViernes
                            ]
                        );

                    return this.dbController.get(
                        `
                        ${SELECT_TEMPLATE}
                        WHERE id = ?;
                        `,
                        [result.lastInsertRowid]
                    );

                }
            );

        } finally {
            this.dbController.close();
        }

    }

    update(id, data) {

        this.dbController.open();

        try {

            const current =
                this.dbController.get(
                    `
                    ${SELECT_TEMPLATE}
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!current) {
                throw createError(
                    "La plantilla no existe.",
                    "TEMPLATE_NOT_FOUND"
                );
            }

            if (current.tipo !== "personalizada") {
                throw createError(
                    "Las plantillas predeterminadas están protegidas. Duplique la plantilla para modificarla.",
                    "PREDEFINED_TEMPLATE"
                );
            }

            const template =
                normalizeTemplateData(
                    data,
                    current
                );

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM plantillas
                    WHERE horas_semanales = ?
                      AND LOWER(nombre) = LOWER(?)
                      AND id <> ?;
                    `,
                    [
                        template.horasSemanales,
                        template.nombre,
                        id
                    ]
                );

            if (duplicate) {
                throw createError(
                    "Ya existe otra plantilla con ese nombre y carga horaria.",
                    "DUPLICATE_TEMPLATE"
                );
            }

            if (template.activa === 0) {

                const usage =
                    this.dbController.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM cursos
                        WHERE plantilla_id = ?;
                        `,
                        [id]
                    );

                if (usage.total > 0) {
                    throw createError(
                        "No se puede desactivar una plantilla que está siendo utilizada por cursos.",
                        "TEMPLATE_IN_USE"
                    );
                }

            }

            this.dbController.run(
                `
                UPDATE plantillas
                SET
                    nombre = ?,
                    horas_semanales = ?,
                    horas_lunes = ?,
                    horas_martes = ?,
                    horas_miercoles = ?,
                    horas_jueves = ?,
                    horas_viernes = ?,
                    activa = ?
                WHERE id = ?;
                `,
                [
                    template.nombre,
                    template.horasSemanales,
                    template.horasLunes,
                    template.horasMartes,
                    template.horasMiercoles,
                    template.horasJueves,
                    template.horasViernes,
                    template.activa,
                    id
                ]
            );

            return this.dbController.get(
                `
                ${SELECT_TEMPLATE}
                WHERE id = ?;
                `,
                [id]
            );

        } finally {
            this.dbController.close();
        }

    }

}

export default ModelPlantillas;