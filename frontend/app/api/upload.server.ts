export async function uploadImage(image: any) {
  const baseUrl = process.env.STRAPI_API_URL;

  if (!baseUrl) throw new Error("STRAPI_API_URL environment variable is not defined.");
  
  const path = "/api/upload";
  const url = baseUrl + path;

  const formData = new FormData();
  formData.append("files", image, image.name);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`Failed to upload image. Status: ${response.status} ${response.statusText}`);

    const dataResponse = await response.json();

    return dataResponse;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Error uploading image: ${error instanceof Error ? error.message : String(error)}`);
  }
}