/** UI copy — kept in one place for tweaks without touching layout */

export const landingCopy = {
  badgeKicker: 'QA',
  badgeTitle: 'Shell',
  heroTitle: 'WebView QA',
  heroSubtitle: 'ส่ง headers กับ navigation แรกจาก native',
  sectionRuntime: 'Runtime',
  sectionHeaders: 'Headers',
  sectionFields: 'Overrides',
  labelPlatform: 'Platform',
  labelApp: 'App',
  labelUrlBase: 'URL ฐาน',
  sectionQueryParams: 'พารามิเตอร์ URL (?…&…)',
  labelQueryKey: 'ชื่อพารามิเตอร์',
  labelQueryValue: 'ค่า',
  addQueryParam: 'เพิ่มพารามิเตอร์',
  removeQueryParam: 'ลบแถว',
  composedUrlPreview: 'URL รวมแล้ว',
  composedUrlPreviewHint: 'อัปเดตทันทีขณะกรอกพารามิเตอร์',
  hintQueryParams:
    'แถวว่างจะถูกข้าม · ใส่ค่าแบบดิบได้ (เช่น redirect_uri = /package)',
  fillOauthSessionsBase: 'ตั้งฐานเป็น …/api/oauth/sessions',
  footnote: 'Headers ติด request แรกจาก native เท่านั้น',
  ctaOpen: 'เปิด WebView',
} as const;

export const webViewCopy = {
  screenTitle: 'WebView',
  hintReload: 'ไป = แนบ headers ใหม่',
  loadFailedTitle: 'โหลดไม่สำเร็จ',
  retry: 'ลองใหม่',
} as const;
