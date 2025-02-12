package rag;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.openfga.sdk.api.client.OpenFgaClient;
import dev.openfga.sdk.api.client.model.ClientTupleKey;
import dev.openfga.sdk.api.client.model.ClientWriteRequest;
import dev.openfga.sdk.api.configuration.ClientConfiguration;
import dev.openfga.sdk.api.configuration.ClientCredentials;
import dev.openfga.sdk.api.configuration.ClientWriteOptions;
import dev.openfga.sdk.api.configuration.Credentials;
import dev.openfga.sdk.api.model.CreateStoreRequest;
import dev.openfga.sdk.api.model.WriteAuthorizationModelRequest;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.List;

public class FGAInit {
    static {
        Dotenv.configure().systemProperties().load();
    }

    public static void main(String[] args) throws Exception {
        // create a new FGA store
        var config = new ClientConfiguration()
                .apiUrl(System.getProperty("FGA_API_URL", "http://localhost:8080"))
                // Credentials required only for Auth0 FGA
                .credentials(new Credentials(new ClientCredentials()
                        .apiTokenIssuer(System.getProperty("FGA_API_TOKEN_ISSUER", "auth.fga.dev"))
                        .apiAudience(System.getProperty("FGA_API_AUDIENCE", "https://api.us1.fga.dev/"))
                        .clientId(System.getProperty("FGA_CLIENT_ID"))
                        .clientSecret(System.getProperty("FGA_CLIENT_SECRET"))));

        var fgaClient = new OpenFgaClient(config);
        var body = new CreateStoreRequest().name("FGA Demo Store");
        var store = fgaClient.createStore(body).get();
        fgaClient.setStoreId(store.getId());

        System.out.println("FGA Store ID: " + store.getId());

        // Create FGA model
        var schema = """
                {
                  "schema_version":"1.1",
                  "type_definitions": [
                    {
                      "type":"user"
                    },
                    {
                      "metadata": {
                        "relations": {
                          "owner": {
                            "directly_related_user_types": [
                              {
                                "type":"user"
                              }
                            ]
                          },
                          "viewer": {
                            "directly_related_user_types": [
                              {
                                "type":"user"
                              },
                              {
                                "type":"user",
                                "wildcard": {}
                              }
                            ]
                          }
                        }
                      },
                      "relations": {
                        "owner": {
                          "this": {}
                        },
                        "viewer": {
                          "this": {}
                        }
                      },
                      "type":"doc"
                    }
                  ]
                }
                """;

        var mapper = new ObjectMapper().findAndRegisterModules();
        var authorizationModel = fgaClient
                .writeAuthorizationModel(mapper.readValue(schema, WriteAuthorizationModelRequest.class))
                .get();

        System.out.println("Model created: " + authorizationModel.getAuthorizationModelId());


        // Create Tuples
        var request = new ClientWriteRequest()
                .writes(List.of(
                        new ClientTupleKey()
                                .user("user:*")
                                .relation("viewer")
                                ._object("doc:public-doc"),
                        new ClientTupleKey()
                                .user("user:user1")
                                .relation("viewer")
                                ._object("doc:private-doc")
                ));

        var options = new ClientWriteOptions()
                .authorizationModelId(authorizationModel.getAuthorizationModelId())
                .disableTransactions(false);

        var response = fgaClient.write(request, options).get();

        System.out.println("Tuples created: Status " + response.getStatusCode());
    }
}
