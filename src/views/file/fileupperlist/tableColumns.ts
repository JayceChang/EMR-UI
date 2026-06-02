export const columns = [
    {
      title: '上架id',
      dataIndex: 'id',
      key: 'id',
      width:80,
    },
    {
      title: '上架描述',
      dataIndex: 'k_desc',
      color:true,
      key: 'k_desc',
      width:150,
    },    
    {
      title: '库房名称',
      dataIndex: 'k_kufang_name',
      key: 'k_kufang_name',
      width:150,
    },
    {
      title: '库位名称',
      dataIndex: 'k_kuwei_name',
      width:150,
    },
    {
      title: '库位编号',
      dataIndex: 'k_kuwei_bianhao',
      width:150,
    }, 
    {
      title: '库位位置',
      dataIndex: 'k_kuwei_weizhi',
      width:150,
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
      width: 180,
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
      },{
        type:'text',
        label:'查看位置',
        lx:'2',
        click:true,
      }]
    },
];

export const fileColumns=[
  {
    title: '文件名称',
    dataIndex: 'k_name',
    minWidth:150,
    color:true,
  },  
  {
    title: '文件描述',
    dataIndex: 'k_desc',
    minWidth:150,
  },  
  {
    title: '文件类型',
    dataIndex: 'k_lx',
    minWidth:150,
    dicData:[
      {
        value:0,
        label:'文件夹',
        color:'green',
      },
      {
          value:1,
          label:'图片',
      },
      {
          value:2,
          label:'文本',
      },
      {
          value:3,
          label:'文档',
      },
      {
          value:4,
          label:'表格',
      },
      {
          value:5,
          label:'PDF文件',
      },
      {
          value:6,
          label:'视频文件',
      },
      {
        value:7,
        label:'PPT文件',
      },
    ]
  },
  {
    title: '文件操作人',
    dataIndex: 'k_update_user',
    width:120,
  },
  {
    title: '文件操作时间',
    dataIndex: 'k_update_time',
    width:180,
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 80,
    operationData:[{
      type:'link',
      label:'查看',
      lx:'3',
      click:true,
    }]
  },
]