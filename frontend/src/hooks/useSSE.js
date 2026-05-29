import { useEffect } from 'react';

export function useSSE(url, handlers) {
useEffect(() => {
const es = new EventSource(url);
es.onmessage = (e) => {
try {
const data = JSON.parse(e.data);
if (handlers[data.type]) handlers[data.type](data);
} catch {}
};
es.onerror = () => es.close();
return () => es.close();
}, [url]);
}