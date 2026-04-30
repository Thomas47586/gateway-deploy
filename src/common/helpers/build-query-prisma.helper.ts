export const buildQueryPrisma = (request) => {
  let { page, pageSize, filters } = request.query;

  const pageDefault = 1;
  const pageSizeDefault = 3;

  // Đảm bảo là số
  page = Number(page);
  pageSize = Number(pageSize);

  // Nếu gửi chữ
  page = Number(page) || pageDefault;
  pageSize = Number(pageSize) || pageSizeDefault;

  // Nếu số âm
  if (page < 1) page = pageDefault;
  if (page < 1) page = pageSizeDefault;

  // XỬ LÝ INDEX
  // Index - (page - 1) * pageSize
  const index = (page - 1) * pageSize;
  try {
    filters = JSON.parse(filters);
  } catch (error) {
    filters = {};
  }

  //   console.log({ page, pageSize, index, filters });

  // Tìm kiếm trong filter nếu giá trị nào là string thì bọc nó bằng object có key contains
  Object.entries(filters).forEach(([key, value]) => {
    // console.log({ key, value });
    if (typeof value === 'string') {
      filters[key] = {
        contains: value,
      };
    }
  });

  const where = {
    ...filters, // ...phá huỷ dấu {}
    isDeleted: false,
  };

  return {
    page,
    pageSize,
    index,
    where,
  };
};
