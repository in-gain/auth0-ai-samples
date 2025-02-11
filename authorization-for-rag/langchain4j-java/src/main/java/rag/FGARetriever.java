package rag;

import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.query.Query;
import dev.openfga.sdk.api.client.OpenFgaClient;
import dev.openfga.sdk.api.client.model.ClientBatchCheckItem;
import dev.openfga.sdk.api.client.model.ClientBatchCheckRequest;
import dev.openfga.sdk.api.configuration.ClientBatchCheckOptions;
import dev.openfga.sdk.api.configuration.ClientConfiguration;
import dev.openfga.sdk.api.configuration.ClientCredentials;
import dev.openfga.sdk.api.configuration.Credentials;
import dev.openfga.sdk.api.model.ConsistencyPreference;
import dev.openfga.sdk.errors.FgaInvalidParameterException;
import dev.openfga.sdk.errors.FgaValidationError;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * A retriever that allows filtering documents based on access control checks
 * using OpenFGA. This class wraps an underlying retriever and performs batch
 * checks on retrieved documents, returning only the ones that pass the
 * specified access criteria.
 *
 * <p>
 * The FGARetriever requires a buildQuery function to specify how access checks
 * are formed for each document, the checks are executed via an OpenFGA client
 * or equivalent mechanism. The checks are then mapped back to their
 * corresponding
 * documents to filter out those for which access is denied.
 * </p>
 *
 * <p>
 * Example usage:
 * </p>
 *
 * <pre>
 * FGARetriever retriever = FGARetriever.create(
 *         baseRetriever,
 *         "user1",
 *         content -> new FGATuple(
 *                 "user:" + userId,
 *                 "viewer",
 *                 "doc:" + content.metadata().get("id")));
 * </pre>
 */
public class FGARetriever implements ContentRetriever {
    private final ContentRetriever baseRetriever;
    private final OpenFgaClient fgaClient;
    private final ConsistencyPreference consistencyPreference;
    private final Function<Content, ClientBatchCheckItem> buildQuery;

    FGARetriever(ContentRetriever baseRetriever, Function<Content, ClientBatchCheckItem> buildQuery, ConsistencyPreference consistencyPreference, OpenFgaClient fgaClient) throws Exception {
        this.baseRetriever = baseRetriever;
        this.fgaClient = fgaClient;
        this.buildQuery = buildQuery;
        this.consistencyPreference = consistencyPreference;
    }

    FGARetriever(ContentRetriever baseRetriever, Function<Content, ClientBatchCheckItem> buildQuery, ConsistencyPreference consistencyPreference) throws Exception {
        this(baseRetriever,
                buildQuery,
                consistencyPreference,
                new OpenFgaClient(new ClientConfiguration()
                        .apiUrl(System.getProperty("FGA_API_URL", "https://api.us1.fga.dev"))
                        .storeId(System.getProperty("FGA_STORE_ID"))
                        .credentials(new Credentials(new ClientCredentials()
                                .apiTokenIssuer(System.getProperty("FGA_API_TOKEN_ISSUER", "auth.fga.dev"))
                                .apiAudience(System.getProperty("FGA_API_AUDIENCE", "https://api.us1.fga.dev/"))
                                .clientId(System.getProperty("FGA_CLIENT_ID"))
                                .clientSecret(System.getProperty("FGA_CLIENT_SECRET"))
                        ))
                )
        );

    }

    FGARetriever(ContentRetriever baseRetriever, Function<Content, ClientBatchCheckItem> buildQuery) throws Exception {
        this(baseRetriever, buildQuery, ConsistencyPreference.HIGHER_CONSISTENCY);
    }

    /**
     * Creates a new FGARetriever instance using the given arguments and optional OpenFgaClient.
     *
     * @param retriever  - The underlying retriever instance to fetch documents.
     * @param buildQuery - A function to generate access check requests for each document.
     * @return A newly created FGARetriever instance configured with the provided arguments.
     */
    public static FGARetriever create(ContentRetriever retriever, Function<Content, ClientBatchCheckItem> buildQuery) throws Exception {
        return new FGARetriever(retriever, buildQuery);
    }


    /**
     * Retrieves documents based on the provided query parameters, processes
     * them through a checker function,
     * and filters the documents based on permissions.
     *
     * @param query - The query parameters used to retrieve content.
     * @return Filtered Content
     */
    @Override
    public List<Content> retrieve(Query query) {
        // First, get relevant documents from the base retriever
        List<Content> relevantContent = baseRetriever.retrieve(query);

        // Create data structures to track checks and document mappings
        List<ClientBatchCheckItem> checks = new ArrayList<>();
        var documentToObject = new HashMap<>();
        var seenChecks = new HashSet<>();

        // Process each document to build checks
        for (Content doc : relevantContent) {
            ClientBatchCheckItem check = buildQuery.apply(doc);
            var checkKey = getCheckKey(check);
            documentToObject.put(doc, checkKey);

            // Skip duplicate checks for same user, object, and relation
            if (!seenChecks.contains(checkKey)) {
                seenChecks.add(checkKey);
                checks.add(check);
            }
        }

        try {
            var permissionsMap = checkPermissions(checks);
            // filter based on permission
            return relevantContent.stream()
                    .filter(doc -> Boolean.TRUE.equals(permissionsMap.get(documentToObject.get(doc))))
                    .collect(Collectors.toList());
        } catch (FgaInvalidParameterException | FgaValidationError | ExecutionException | InterruptedException e) {
            throw new RuntimeException(e);
        }


    }

    /**
     * Checks permissions for a list of client requests.
     *
     * @param checks - An array of `ClientBatchCheckItem` objects representing the permissions to be checked.
     * @return A `Map` where the keys are object identifiers and the values are booleans indicating whether the permission is allowed.
     */
    private Map<String, Boolean> checkPermissions(List<ClientBatchCheckItem> checks) throws FgaInvalidParameterException, FgaValidationError, ExecutionException, InterruptedException {
        var options = new ClientBatchCheckOptions().consistency(consistencyPreference);
        var request = new ClientBatchCheckRequest().checks(checks);
        var response = fgaClient.batchCheck(request, options).get();

        Map<String, Boolean> permissionMap = new HashMap<>();
        for (var result : response.getResult()) {
            var checkKey = getCheckKey(result.getRequest());
            permissionMap.put(checkKey, result.isAllowed());
        }
        return permissionMap;
    }

    private String getCheckKey(ClientBatchCheckItem check) {
        return check.getUser() + "|" + check.getObject() + "|" + check.getRelation();
    }
}