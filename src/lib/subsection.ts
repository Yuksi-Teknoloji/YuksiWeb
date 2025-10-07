// src/lib/subsection.ts
export type ApiSubSection = {
  id: number;
  title: string;
  contentType: string | number; // GET: string, PUT: number
  showInMenu: boolean;
  showInFooter: boolean;
  content: string;
  isActive: boolean;
  isDeleted: boolean;
};

export const CONTENT_TYPES = [
  { value: 1, label: 'Destek' },
  { value: 2, label: 'Hakkimizda' },
  { value: 3, label: 'Iletisim' },
  { value: 4, label: 'GizlilikPolitikasi' },
  { value: 5, label: 'KullanimKosullari' },
] as const;

export function enumToLabel(v: number) {
  return CONTENT_TYPES.find((x) => x.value === v)?.label ?? 'Destek';
}

export function labelToEnum(lbl: string) {
  return (
    CONTENT_TYPES.find(
      (x) => x.label.toLowerCase() === String(lbl).trim().toLowerCase()
    )?.value ?? 1
  );
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(
  /\/+$/,
  ''
);

/**
 * Tek bir alt bölüm döndürür.
 * - contentType eşleştirilir (string gelebileceği için labelToEnum ile normalize edilir)
 * - Yalnızca isActive:true ve isDeleted:false olan ilk uygun kayıt döndürülür
 */
export async function fetchSubSectionByType(typeValue: number): Promise<ApiSubSection | null> {
  const res = await fetch(`${API_BASE}/api/SubSection`, { cache: 'no-store' });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = json?.message || json?.title || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const list: ApiSubSection[] = Array.isArray(json?.data) ? json.data : [];

  // 1) contentType eşleştir
  const byType = list.filter((it) => {
    const asNum =
      typeof it.contentType === 'number' ? it.contentType : labelToEnum(String(it.contentType));
    return asNum === typeValue;
  });

  // 2) sadece aktif ve silinmemiş olanlar
  const filtered = byType.filter((it) => it.isActive === true && it.isDeleted === false);

  // 3) ilk uygun kayıt
  return filtered[0] ?? null;
}

/**
 * Çoklu sonuç gerekir ise:
 * - contentType eşleşen VE isActive:true & isDeleted:false olanların listesini döndürür
 */
export async function fetchActiveSubSectionsByType(typeValue: number): Promise<ApiSubSection[]> {
  const res = await fetch(`${API_BASE}/api/SubSection`, { cache: 'no-store' });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = json?.message || json?.title || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const list: ApiSubSection[] = Array.isArray(json?.data) ? json.data : [];

  return list.filter((it) => {
    const asNum =
      typeof it.contentType === 'number' ? it.contentType : labelToEnum(String(it.contentType));
    return asNum === typeValue && it.isActive === true && it.isDeleted === false;
  });
}
