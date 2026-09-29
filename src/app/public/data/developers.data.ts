import { DeveloperProfile } from "./developer-profile";

/**
 * Fuente unica de verdad para la informacion publica del equipo ROA.
 *
 * Se reutiliza tanto en `contact` como en `developers` para evitar divergencia
 * entre bios, roles, imagenes o correos publicados.
 */
export const DEVELOPERS_DATA: DeveloperProfile[] = [
  {
    name: "Ing. Paola Ingavelez",
    roleKey: "developers.members.paola.role",
    image: "assets/img/developW.png",
    emails: [],
  },
  {
    name: "Ing. Ángel Pérez",
    roleKey: "developers.members.angelPerez.role",
    image: "assets/img/develop1.png",
    emails: [],
  },
  {
    name: "Ing. Edwin Marquez",
    roleKey: "developers.members.edwin.role",
    image: "assets/img/develop3.png",
    emails: ["emarquezl@est.ups.edu.ec", "edwi1999@hotmail.com"],
  },
  {
    name: "Ing. Claudio Maldonado",
    roleKey: "developers.members.claudio.role",
    image: "assets/img/develop.png",
    emails: ["cmaldonadom3@est.ups.edu.ec", "claudio.mldo@outlook.com"],
  },
  {
    name: "Ing. Bryam Chimbo",
    roleKey: "developers.members.bryam.role",
    image: "assets/img/develop2.png",
    emails: ["bchimboa1@est.ups.edu.ec", "bry4mchimbo@gmail.com"],
  },
  {
    name: "Ing. Ángel Paqui",
    roleKey: "developers.members.angelPaqui.role",
    image: "assets/img/develop2.png",
    emails: ["apaquig@est.ups.edu.ec", "angelpaqui36@gmail.com"],
  },
  {
    name: "Ing. Sebastian Uyaguari",
    roleKey: "developers.members.sebastian.role",
    image: "assets/img/develop3.png",
    emails: [],
  },
];
