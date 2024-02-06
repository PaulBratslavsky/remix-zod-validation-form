export async function strapiPost(formData: any, path: string) {
  const baseUrl = process.env.STRAPI_API_URL;

  if (!baseUrl) throw new Error("STRAPI_API_URL environment variable is not defined.");
  if (!path) throw new Error("Path is not defined.");

  const url = baseUrl + path;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const dataResponse = await response.json();
    return dataResponse;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(
      `Error uploading image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
