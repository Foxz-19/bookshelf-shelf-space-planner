/** @typedef {'attempting'|'rooting'|'potted'|'failed'} Status */
/** @typedef {{id:string,name:string,method:string,startedAt:string,status:Status,note:string,createdAt:string}} Propagation */
export const STATUSES = /** @type {const} */ (['attempting', 'rooting', 'potted', 'failed']);
export const STATUS_LABELS = { attempting: 'Attempting', rooting: 'Rooting', potted: 'Potted up', failed: 'Failed' };
