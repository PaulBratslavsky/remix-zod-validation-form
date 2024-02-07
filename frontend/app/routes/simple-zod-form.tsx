import z, { type ZodSchema } from "zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export const meta = () => {
  return [{ title: "Trellix Login" }];
};

async function validate(request: Request, schema: ZodSchema) {
  let formData = await request.formData();

  let email = String(formData.get("email") ?? "");
  let password = String(formData.get("password") ?? "");
  let validatedSchema = schema.safeParse({ email, password });

  if (!validatedSchema.success) {
    return {
      data: null,
      errors: validatedSchema.error.flatten().fieldErrors,
    };
  } else {
    return {
      data: validatedSchema.data,
      errors: null,
    };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const validationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  let validationResponse = await validate(request, validationSchema);

  if (validationResponse?.errors) {
    return json({ ok: false, errors: validationResponse.errors }, 400);
  } else {
    // do something
    return redirect("/success");
  }
}

export default function Signup() {
  let actionResult = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2
          id="login-header"
          className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Log in Zod Simple
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <Form className="space-y-6" method="post">
            <div className="flex flex-col">
              <label htmlFor="email">
                Email address
                {actionResult?.errors?.email && (
                  <p id="email-error" className="text-red-500">
                    {actionResult.errors.email}
                  </p>
                )}
              </label>
              <input
                autoFocus
                id="email"
                name="email"
                type="text"
                aria-describedby={
                  actionResult?.errors?.email ? "email-error" : "login-header"
                }
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">
                Password
                {actionResult?.errors?.password && (
                  <p id="password-error" className="text-red-500">
                    {actionResult.errors.password}
                  </p>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                aria-describedby="password-error"
              />
            </div>

            <div>
              <button type="submit">Sign in</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
