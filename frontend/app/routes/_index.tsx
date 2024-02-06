import { z, ZodErrorMap, SafeParseError, ZodError } from "zod";
import { UserCircleIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { Form, useActionData } from "@remix-run/react";

import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ACCEPTED_DOC_TYPES = ["application/pdf"];

const schemaRegister = z.object({
  website: z.string().url().min(5).max(50),
  about: z.string().min(5).max(144),
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
  email: z.string().email().min(5).max(50),
  country: z.string().min(2).max(20),
  streetAddress: z.string().min(5),
  city: z.string().min(2).max(20),
  state: z.string().min(2).max(20),
  zip: z.string().min(5).max(10),
  image: z
    .any()
    .refine((file) => Boolean(file?._name), "Image is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  resume: z
    .any()
    .refine((file) => Boolean(file?._name), "File is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_DOC_TYPES.includes(file?.type),
      "Only PDF's are accepted."
    ),
});

export async function action({ request }: ActionFunctionArgs) {
  let formData;

  const isMultipart = request.headers
    .get("Content-Type")
    ?.includes("multipart");

  console.log(isMultipart, "is it though");

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000_000,
  });

  if (isMultipart) {
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
  } else {
    formData = await request.formData();
  }

  const formItems = Object.fromEntries(formData);

  const validatedFields = schemaRegister.safeParse({
    website: formItems.website,
    about: formItems.about,
    firstName: formItems.firstName,
    lastName: formItems.lastName,
    email: formItems.email,
    country: formItems.country,
    streetAddress: formItems.streetAddress,
    city: formItems.city,
    state: formItems.region,
    zip: formItems.zip,
    image: formItems.image,
    resume: formItems.resume,
  });

  if (!validatedFields.success) {
    return json({
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Register.",
    });
  }

  return json({
    message: "Success",
    zodErrors: null,
  });
}

interface FormSubmitResponse {}

export default function Index() {
  const formData = useActionData<typeof action>();
  console.log(formData);
  console.dir(formData, { depth: null });
  return (
    <Form
      method="POST"
      encType="multipart/form-data"
      className="my-12 rounded-md border bg-white border-gray-900/10 p-8"
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-4">
              <label
                htmlFor="website"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Website
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="website"
                    id="website"
                    className="flex-1 border-0 bg-transparent py-1.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="www.example.com"
                  />
                </div>
                <FieldError errorMessages={formData?.zodErrors?.website} />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="about"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                About
              </label>
              <div className="mt-2">
                <textarea
                  id="about"
                  name="about"
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  defaultValue={""}
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.about} />
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Write a few sentences about yourself.
              </p>
            </div>

            <div className="col-span-full rounded-md border border-gray-200 w-full">
              <div className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                <div className="flex ">
                  <UserCircleIcon
                    className="h-12 w-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <div className="ml-4 flex-shrink-0">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Photo
                    </label>
                    <input
                      type="file"
                      className="mt-2 flex items-center gap-x-3"
                      name="image"
                      multiple
                    />
                  </div>
                </div>
              </div>
              <FieldError errorMessages={formData?.zodErrors?.image} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                First name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.firstName} />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Last name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.lastName} />
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.email} />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Country
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
              <FieldError errorMessages={formData?.zodErrors?.country} />
            </div>

            <div className="col-span-full">
              <label
                htmlFor="streetAddress"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Street address
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="streetAddress"
                  id="streetAddress"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.streetAddress} />
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label
                htmlFor="city"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                City
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.city} />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="region"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                State / Province
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="region"
                  id="region"
                  autoComplete="address-level1"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.state} />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="zip"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                ZIP / Postal code
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="zip"
                  id="zip"
                  autoComplete="zip"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <FieldError errorMessages={formData?.zodErrors?.zip} />
            </div>

            <div className="col-span-full rounded-md border border-gray-200 w-full">
              <div className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                <div className="flex ">
                  <PaperClipIcon
                    className="h-12 w-12 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div className="ml-4 flex-shrink-0">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Resume
                    </label>
                    <input
                      type="file"
                      className="mt-2 flex items-center gap-x-3"
                      name="resume"
                    />
                  </div>
                </div>
              </div>
              <FieldError errorMessages={formData?.zodErrors?.resume} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </Form>
  );
}

function FieldError({
  errorMessages,
}: {
  readonly errorMessages: string[] | undefined;
}) {
  if (!errorMessages || undefined) return null;
  return errorMessages.map((err: string, index: number) => (
    <div
      key={index}
      className="text-warning text-xs italic mt-1 px-2 text-pink-600"
    >
      {err}
    </div>
  ));
}

function StrapiErrors({ error }: { readonly error: string }) {
  if (!error) return null;
  return <div className="text-warning text-xs italic py-2">{error}</div>;
}
