export const columns = [
    {
      title: '库位id',
      dataIndex: 'id',
      key: 'id',
      width:80,
    },
    {
      title: '库位名称',
      dataIndex: 'k_name',
      width:100,
    },
    {
      title: '库位编号',
      dataIndex: 'k_bianhao',
      width:100,
    },
    {
      title: '库位位置',
      dataIndex: 'k_weizhi',
      width:150,
    },
    {
      title: '库位描述',
      dataIndex: 'k_desc',
      width:200,
    },
    {
      title: '已上架文件数量',
      dataIndex: 'k_file_num',
      width:100,
    },
    {
      title: '库位状态',
      dataIndex: 'k_status',
      key: 'k_status',
      width:80,
      dicData:[{
        value:'1',
        label:'已启用',
        color:'green'
      },{
        value:'-1',
        label:'已停用',
        color:'volcano'
      }]
    },
    {
      title: '库位排序',
      dataIndex: 'k_sort',
      width:80,
    },
    {
      title: '操作人',
      dataIndex: 'k_update_user',
      width:100,
    },
    {
      title: '操作时间',
      dataIndex: 'k_update_time',
      width:150,
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 120,
      operationData:[{
        type:'link',
        label:'编辑',
        lx:'1',
        click:true,
      },{
        type:'link',
        label:'删除',
        lx:'-1',
        danger:true,
        click:true,
      }]
    },
];