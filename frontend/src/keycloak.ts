import Keycloak from "keycloak-js";
import { config } from "../config-env";

const keycloak = new Keycloak({
  url: config.keycloak.url,
  realm: config.keycloak.realm,
  clientId: config.keycloak.clientId,
})

export default keycloak;