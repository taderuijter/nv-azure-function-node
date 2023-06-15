import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const userId = req.headers["x-ms-client-principal-id"];

  if (!userId) {
    context.res = {
      status: 401,
      body: "Unauthorized user",
    };
    return;
  }

  // If we reach this point, the request is authenticated.
  context.res = {
    status: 200,
    body: "Hello, " + userId + "!",
  };
};

export default httpTrigger;
