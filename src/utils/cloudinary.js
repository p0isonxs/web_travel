const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_TIMEOUT_MS = 30000;

export async function uploadToCloudinary(file, folder = 'general') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di file .env');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `web_travel/${folder}`);

  let res;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData, signal: controller.signal }
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload gambar ke Cloudinary timeout. Coba lagi dengan gambar yang lebih kecil.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload gagal');
  return data.secure_url;
}

export async function uploadMultiple(files, folder = 'general', onProgress) {
  const uploads = [];
  const list = Array.from(files);

  for (const [index, file] of list.entries()) {
    onProgress?.({
      current: index + 1,
      total: list.length,
      fileName: file.name,
    });
    uploads.push(await uploadToCloudinary(file, folder));
  }

  return uploads;
}
