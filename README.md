# Node.js | Azure Function | Azure AD Autentication

This README shows you how to setup your first Azure function. You can follow these steps to get started quickly. 

**This project uses:**

- NODE JS & Typescript
- Azure Function Core Tools
- ESLIT + Prettier
- Vitest
- Nodemon & Concurrently 1

## Local Development

Because of the nature of `typescript` (TypeScript being a transpiled language) the `func start` command does not watch your code for changes. That is why this project uses `nodemon` + `concurrently`. You can use `npm run dev` for local development.

## Prerequisites

First of install the Azure Function Core tool with your favourite package manager:

```terminal
npm i -g azure-functions-core-tools@4 --unsafe-perm true
```

The Azure Functions Core Tools provide a local development experience for creating, developing, testing, running, and debugging Azure Functions.

### Versions
**v1** (v1.x branch): Requires .NET 4.7.1 Windows Only
**v2** (dev branch): Self-contained cross-platform package
**v3**: (v3.x branch): Self-contained cross-platform package
**v4**: (v4.x branch): Self-contained cross-platform package **(recommended)**

### Check your version

Check your terminal if you have the right version installed using the following command.

```console
func -v
```

## Boilerplate

You can pull the project from the following Github repo.

```console
git clone https://github.com/taderuijter/nv-azure-function-node.git
```

## Build Azure Function

Use the following command to setup a new azure function in your code base. 

```console
func new --name MyFunction --template "HTTP trigger"
```

The `func` command has some build in templates you can use. Just replace the `HTTP Trigger` template with one of the template below. These templates are based on Node js. The func command also supports other languages like Python and C#.

- BlobTrigger - Processes Azure Storage blobs when they're added to a container. You might use this function for image resizing.
- CosmosDBTrigger - Respond to events in an Azure Cosmos DB.
- EventGridTrigger - Respond to events delivered to a subscription in Azure Event Grid.
- EventHubTrigger - Respond to events delivered through Azure Event Hub.
- HTTPTrigger - This template creates a function that is triggered by an HTTP request.
- QueueTrigger - Respond to messages as they arrive in an Azure Storage queue.
- ServiceBusQueueTrigger - Connect your code to other Azure services or on-premises services by listening to message queues.
- ServiceBusTopicTrigger - Connect your code to other Azure services or on-premises services by subscribing to topics.
- TimerTrigger - Execute cleanup or other batch tasks on a predefined schedule.

## Authentication
This Node.js Azure Function protects its own API (HTTP trigger) with the combination of the built-in authentication & authorization feature of Azure Functions (commonly known as "Easy Auth"). 

When you're using Azure App Service Authentication/Authorization (Easy Auth), you do not need to manually decode the bearer token in your function code. [Read the microsoft docs](https://learn.microsoft.com/nl-nl/azure/app-service/overview-authentication-authorization)

You can test authentication by using the following terminal command. Don’t forget to add a valid Bearer token.

```console
$ curl https://<your-function>.azurewebsites.net/api/greeting -H "Authorization: Bearer <valid-access-token>"
Hello from the API server
```

- A missing or invalid (expired, wrong audience, etc) token will result in a `401` response. (Handled by Azure Functions authentication)
- An otherwise valid token without the proper scope will result in a 403 response.
- A valid token with the proper scope of `email` will result in the `Hello from the API server` message.

## Accessing user data
Easy Auth automatically intercepts incoming requests to your application, validates the authentication token, and if the token is valid, it adds user information to the request headers. This user information includes details like the user's ID and the user's Azure AD ID token.

In your Azure Function, you can access user information directly from the headers. For example, the **`X-MS-CLIENT-PRINCIPAL-ID`** header contains the user's ID, and the **`X-MS-TOKEN-AAD-ID-TOKEN`** header contains the user's Azure AD ID token.

```typescript
module.exports = async function (context, req) {
    const userId = req.headers['x-ms-client-principal-id'];

    if (!userId) {
        context.res = {
            status: 401,
            body: "Unauthorized"
        };
        return;
    }

    // If we reach this point, the request is authenticated.
    context.res = {
        status: 200,
        body: "Hello, authenticated user!"
    };
};
```

## Testing authentication locally
At the time of this writing, Function app authentication does not support a local development experience that has parity with the on-Azure runtime. You can still execute this locally with `func start` but the authentication functionality provided by the Function app service on Azure Authentication will not be invoked. 

However, you can emulate the behavior of Easy Auth in your local development environment by manually adding the headers that Easy Auth would add to your requests. For example, you can add the `X-MS-CLIENT-PRINCIPAL-ID` and `X-MS-TOKEN-AAD-ID-TOKEN` headers to your requests when you're testing your functions locally.

Another approach is to create a middleware function that simulates Easy Auth by checking for a bearer token in the **`Authorization`** header of the request, decoding and validating the token, and adding the user information to the headers. You can use this middleware function when you're testing your functions locally, and disable it when you're running your functions in Azure.

Please note that these approaches only simulate the behavior of Easy Auth and are not a perfect match. For example, they don't handle token refresh, and they might not support all authentication providers. For the most accurate testing, you should deploy your functions to Azure and test them there.

## Setup

### Register the app

First, complete the steps in [Register an API application with the Microsoft identity platform](https://docs.microsoft.com/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#register-the-web-api) to register the sample app.

Use these settings in your app registration.

| App registration <br/> setting | Value for this sample app                                            | Notes                                                                           |
|-------------------------------:|:---------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| **Name**                       | `node-azure-function-api`                                            | Suggested value for this sample. <br/> You can change the app name at any time. |
| **Supported account types**    | **Accounts in this organizational directory only (Single tenant)**   | Suggested value for this sample.                                                |
| **Platform type**              | _None_                                                               | No redirect URI required; don't select a platform.                              |
| **Scopes defined by this API** | **Scope name**: `Greeting.Read`<br/>**Who can consent?**: **Admins and users**<br/>**Admin consent display name**: `Read API Greetings`<br/>**Admin consent description**: `Allows the user to see greetings from the API.`<br/>**User consent display name**: `Read API Greetings`<br/>**User consent description**: `Allows you to see greetings from the API.`<br/>**State**: **Enabled** | Required scope for this sample. |

> :information_source: **Bold text** in the table matches (or is similar to) a UI element in the Azure portal, while `code formatting` indicates a value you enter into a text box in the Azure portal.

### Enable Function app authentication

Next, complete the steps in [Enable Azure Active Directory in your App Service app](https://docs.microsoft.com/azure/app-service/configure-authentication-provider-aad?toc=/azure/azure-functions/toc.json#-enable-azure-active-directory-in-your-app-service-app) to add Azure Active Directory as an identity provider for your API.

Use these settings in your identity provider configuration.

| Identity provider setting       | Value for this sample app                               | Notes                                                                            |
|--------------------------------:|:--------------------------------------------------------|:---------------------------------------------------------------------------------|
| **Identity provider**           | **Microsoft**                                           | Required value for this sample.                                                  |
| **App registration type**       | **Provide the details of an existing app registration** | Required value for this sample.                                                  |
| **Application (client) ID**     | `<client-id>`                                           | Required value for this sample. <br/> 'Application (client) ID' of the API's app registration in Azure portal - this value is a GUID     |
| **Client secret (recommended)** | _None_                                                  | Suggested value for this sample. <br/> This sample doesn't require this feature. |
| **Issuer URL**                  | `https://login.microsoftonline.com/<tenant-id>/v2.0`    | Required value for this sample. <br/> Update to include 'Tenant ID' of your Azure AD instance - this value is a GUID                     |
| **Allowed token audiences**     | `api://<client-id>`                                     | Required value for this sample. <br/> 'Application ID URI' of app registration in Azure portal - this value typically starts with api:// |
| **Restrict access**             | **Require authentication**                              | Required value for this sample.                                                  |
| **Unauthenticated requests**    | **HTTP 401 Unauthorized: recommended for APIs**         | Suggested value for this sample.                                                 |
| **Token store**                 | _Unselected_                                            | Suggested value for this sample.                                                 |

> :information_source: **Bold text** in the table matches (or is similar to) a UI element in the Azure portal, while `code formatting` indicates a value you enter into a text box in the Azure portal.

## Access the API

Using Postman, curl, or a similar application, issue an HTTP GET request to https://<your-function-app-name>.azurewebsites.net/api/greeting with an `Authorization` header of `Bearer {VALID-ACCESS-TOKEN}`.

For example, if you use curl and everything worked, you should receive a response from the Azure Function similar to this.

```console
$ curl https://<your-function>.azurewebsites.net/api/greeting -H "Authorization: Bearer <valid-access-token>"
Hello from the API server
```
