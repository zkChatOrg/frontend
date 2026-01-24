// API Route for handling large file uploads (up to 20 MB)
// Uses Node.js runtime with disabled body parser for multipart/form-data support

export const runtime = "nodejs"

// Disable the built-in body parser to handle multipart/form-data manually
export const config = {
  api: { bodyParser: false },
}

export async function POST(request: Request) {
  try {
    // Read the incoming request as FormData
    // This works with multipart/form-data without needing external libraries
    const formData = await request.formData()

    // Extract the file from the FormData
    const file = formData.get("file")

    // Validate that a file was provided
    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: "No file provided or invalid file format" }, { status: 400 })
    }

    // Convert Blob to Buffer for processing
    // This allows us to handle the file data in memory
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get file metadata
    const fileName = file instanceof File ? file.name : "unknown"
    const fileSize = buffer.length
    const fileType = file.type || "application/octet-stream"

    // Log file details for debugging
    console.log(`[Upload] Received file: ${fileName}`)
    console.log(`[Upload] File size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
    console.log(`[Upload] File type: ${fileType}`)

    // Here you could save the file to /tmp, cloud storage, etc.
    // For demonstration, we're just returning the metadata
    // Example: await fs.writeFile(`/tmp/${fileName}`, buffer)

    // Return success response with file metadata
    return Response.json({
      success: true,
      file: {
        name: fileName,
        size: fileSize,
        sizeFormatted: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        type: fileType,
      },
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("[Upload] Error processing file:", error)

    // Handle specific error types
    if (error instanceof Error) {
      return Response.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    return Response.json({ error: "An unexpected error occurred during upload" }, { status: 500 })
  }
}
