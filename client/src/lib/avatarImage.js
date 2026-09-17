const SIZE = 256;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/** Center-crops an image file to a small square JPEG suitable for a profile icon. */
export async function toAvatarBlob(file) {
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Choose an image under 10 MB.");

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Couldn't read that image. Try a JPEG or PNG.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  // JPEG has no transparency; fill so transparent PNGs don't turn black.
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE,
  );
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that image."))),
      "image/jpeg",
      0.9,
    );
  });
}
