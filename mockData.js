const mockData = {
  licenciaturas: [
    "Ingeniería en Tecnologías de Cómputo y Comunicaciones",
    "Ingeniería en Sistemas Computacionales",
    "Ingeniería en Tecnologías de la Información",
    "Ingeniería Electrónica",
    "Ingeniería en Telecomunicaciones"
  ],
  maestrias: [
    "Maestría en Tecnologías de la Información",
    "Maestría en Ciencias de la Computación",
    "Maestría en Ingeniería de Software",
    "Maestría en Telecomunicaciones"
  ],
  doctorados: [
    "Doctorado en Ciencias de la Computación",
    "Doctorado en Tecnologías de la Información",
    "Doctorado en Ingeniería"
  ],
  nivelesSNI: ["Candidato", "Nivel 1", "Nivel 2", "Nivel 3"],
  academias: [
    {id:1,nombre:"Academia de Computación",clave:"ACOMP01",descripcion:"Academia relacionada con programación, bases de datos y desarrollo de software."},
    {id:2,nombre:"Academia de Redes",clave:"ARED01",descripcion:"Academia relacionada con redes, telecomunicaciones y administración de infraestructura."},
    {id:3,nombre:"Academia de Sistemas",clave:"ASIS01",descripcion:"Academia relacionada con análisis, diseño y administración de sistemas."}
  ],
  docentes: [
    {id:1,numeroEmpleado:"EMP001",nombre:"Ana López Martínez",licenciatura:"Ingeniería en Tecnologías de Cómputo y Comunicaciones",maestria:"Maestría en Ciencias de la Computación",doctorado:"",especialidad:"Bases de datos y desarrollo de software",sni:true,nivelSNI:"Candidato",prodep:true,certificaciones:"Oracle Database, Microsoft Azure",academiaId:1},
    {id:2,numeroEmpleado:"EMP002",nombre:"Carlos Hernández Pérez",licenciatura:"Ingeniería en Sistemas Computacionales",maestria:"Maestría en Tecnologías de la Información",doctorado:"Doctorado en Ciencias de la Computación",especialidad:"Inteligencia artificial y programación",sni:true,nivelSNI:"Nivel 1",prodep:true,certificaciones:"AWS Certified Cloud Practitioner",academiaId:1},
    {id:3,numeroEmpleado:"EMP003",nombre:"María González Ramírez",licenciatura:"Ingeniería en Telecomunicaciones",maestria:"Maestría en Telecomunicaciones",doctorado:"",especialidad:"Redes y telecomunicaciones",sni:false,nivelSNI:"",prodep:true,certificaciones:"Cisco CCNA",academiaId:2},
    {id:4,numeroEmpleado:"EMP004",nombre:"Jorge Sánchez Torres",licenciatura:"Ingeniería Electrónica",maestria:"Maestría en Telecomunicaciones",doctorado:"",especialidad:"Redes inalámbricas e infraestructura",sni:false,nivelSNI:"",prodep:false,certificaciones:"Cisco CCNA, Fortinet",academiaId:2},
    {id:5,numeroEmpleado:"EMP005",nombre:"Laura Martínez Díaz",licenciatura:"Ingeniería en Sistemas Computacionales",maestria:"Maestría en Ingeniería de Software",doctorado:"Doctorado en Ingeniería",especialidad:"Ingeniería de software y análisis de sistemas",sni:true,nivelSNI:"Nivel 2",prodep:true,certificaciones:"Scrum Master",academiaId:3}
  ],
  cursos: [
    {id:1,nombre:"Bases de Datos",descripcion:"Diseño, administración y gestión de bases de datos.",academiaId:1},
    {id:2,nombre:"Estructuras de Datos",descripcion:"Estudio y aplicación de estructuras de datos.",academiaId:1},
    {id:3,nombre:"Programación",descripcion:"Fundamentos y técnicas de programación.",academiaId:1},
    {id:4,nombre:"Redes de Computadoras",descripcion:"Fundamentos de redes y comunicación de datos.",academiaId:2},
    {id:5,nombre:"Telecomunicaciones",descripcion:"Principios de sistemas de telecomunicaciones.",academiaId:2},
    {id:6,nombre:"Análisis de Sistemas",descripcion:"Análisis, modelado y especificación de sistemas.",academiaId:3}
  ],
  dominios: [
    {id:1,docenteId:1,cursoId:1,nivel:10},{id:2,docenteId:1,cursoId:2,nivel:8},{id:3,docenteId:1,cursoId:3,nivel:9},
    {id:4,docenteId:2,cursoId:1,nivel:8},{id:5,docenteId:2,cursoId:2,nivel:10},{id:6,docenteId:2,cursoId:3,nivel:9},
    {id:7,docenteId:3,cursoId:4,nivel:10},{id:8,docenteId:3,cursoId:5,nivel:9},{id:9,docenteId:4,cursoId:4,nivel:8},
    {id:10,docenteId:4,cursoId:5,nivel:7},{id:11,docenteId:5,cursoId:6,nivel:10}
  ],
  asignaciones: [{id:1,cursoId:1,docenteId:1},{id:2,cursoId:4,docenteId:3}]
};