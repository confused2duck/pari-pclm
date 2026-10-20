import {put, get, head, del, BlobNotFoundError} from '@vercel/blob';
export class PrivateBlobBucket {
  constructor(token) { this.token = token; }
  async put(pathname, value, options = {}) {
    return put(pathname, value, {access:'private', token:this.token,
      addRandomSuffix:false, allowOverwrite:pathname.startsWith('backups/'),
      contentType:options.httpMetadata?.contentType || 'application/octet-stream'});
  }
  async get(pathname) {
    const result = await get(pathname,{access:'private',token:this.token,useCache:false});
    return result?.statusCode === 200 ? {body:result.stream,size:result.blob.size} : null;
  }
  async head(pathname) {
    try { return await head(pathname,{token:this.token}); }
    catch(error) { if(error instanceof BlobNotFoundError) return null; throw error; }
  }
  async delete(pathname) { await del(pathname,{token:this.token}); }
}
