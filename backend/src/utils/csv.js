/**
 * Converts an array of objects to a CSV string.
 * @param {Array<Object>} data 
 * @param {Array<string>} columns 
 * @returns {string} 
 */
export const toCSV = (data, columns) => {
  if (!data || data.length === 0) return columns.join(',');
  
  const header = columns.join(',');
  const rows = data.map(item => 
    columns.map(col => {
      let val = item[col] ?? '';
      // Handle nested objects (like item.category.name)
      if (col.includes('.')) {
        val = col.split('.').reduce((o, i) => (o ? o[i] : ''), item) ?? '';
      }
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
};
