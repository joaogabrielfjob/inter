import { useState } from 'react';

const fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="22" fill="%23d1d5db"/%3E%3Cpath d="M14 20h20v14H14z" fill="%239ca3af"/%3E%3C/svg%3E';

export function TeamEmblem({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return <img src={!src || failed ? fallback : src} alt={`${name} emblem`} className='h-12' onError={() => setFailed(true)} />;
}
