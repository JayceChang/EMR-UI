/**
 * 数据源配置 枚举
 *
 */

//数据源类型
export const DATASOURCE_TYPE_ENUM = {
  ORACLE: {
    value: 1,
    desc: 'ORACLE',
  },
  MYSQL: {
    value: 2,
    desc: 'MYSQL',
  },
  POSTGRESQL: {
    value: 3,
    desc: 'POSTGRESQL',
  },
  SQLSERVER: {
    value: 4,
    desc: 'SQLSERVER',
  }
};

//连接类型
export const CONNECTION_TYPE_ENUM = {
    OLDEB: {
      value: 1,
      desc: 'OLDEB',
    },
    MSDAORA: {
      value: 2,
      desc: 'MSDAORA',
    },
  };

export default {
    DATASOURCE_TYPE_ENUM,
    CONNECTION_TYPE_ENUM
}