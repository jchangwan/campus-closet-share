import api from './client';

export async function uploadImages(files = []) {
  const form = new FormData();
  Array.from(files).forEach(f => form.append('files', f));
  const res = await api.post('/files/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { urls: [...] }
}