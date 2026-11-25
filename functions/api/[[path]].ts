import worker from "../../worker/index";

export const onRequest = async (context: {
  request: Request;
  env: {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
  };
}) => {
  return worker.fetch(context.request, context.env);
};
