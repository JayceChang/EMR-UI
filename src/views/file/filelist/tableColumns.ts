export const columns = [
    {
      title: '文件id',
      dataIndex: 'id',
      width:80,
    },
    {
      title: '文件名称',
      dataIndex: 'k_name',
      width:150,
    },
    {
      title: '文件描述',
      dataIndex: 'k_desc',
      width:200,
    },
    {
      title: '文件类型',
      dataIndex: 'k_lx',
      width:100,
      dicData:[
        {
            value:'1',
            label:'图片',
        },
        {
            value:'2',
            label:'文本',
        },
        {
            value:'3',
            label:'文档',
        },
        {
            value:'4',
            label:'表格',
        },
        {
            value:'5',
            label:'PDF文件',
        },
        {
            value:'6',
            label:'视频文件',
        },
        {
          value:'7',
          label:'PPT文件',
      },
      ]
    },
    {
      title: '文件目录',
      dataIndex: 'k_mulu',
      width:200,
    },
    {
      title: '文件状态',
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
      },{
        value:'0',
        label:'已删除',
        color:'red'
      }]
    },
    // {
    //   title: '文件排序',
    //   dataIndex: 'k_sort',
    //   width:80,
    // },
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
      width: 200,
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
        type:'link',
        label:'查看',
        lx:'3',
        click:true,
      },{
        type:'text',
        label:'更多',
        lx:'duo',
        children:[{
          label:'下载文件',
          lx:'4',
          icon:'VerticalAlignBottomOutlined',
          click:true,
        },{
          label:'共享文件',
          lx:'5',
          icon:'ShareAltOutlined',
          click:true,
        },{
          label:'移动文件',
          lx:'6',
          icon:'SubnodeOutlined',
          click:true,
        },{
          label:'复制文件',
          lx:'7',
          icon:'SisternodeOutlined',
          click:true,
        }],
      }]
    },
];

export const columns_del = [
  {
    title: '文件id',
    dataIndex: 'id',
    width:80,
  },
  {
    title: '文件名称',
    dataIndex: 'k_name',
    width:200,
  },
  {
    title: '文件描述',
    dataIndex: 'k_desc',
    width:200,
  },
  {
    title: '文件类型',
    dataIndex: 'k_lx',
    width:100,
    dicData:[
      {
          value:'1',
          label:'图片',
      },
      {
          value:'2',
          label:'文本',
      },
      {
          value:'3',
          label:'文档',
      },
      {
          value:'4',
          label:'表格',
      },
      {
          value:'5',
          label:'PDF文件',
      },
      {
          value:'6',
          label:'视频文件',
      },
    ]
  },
  {
    title: '文件状态',
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
    },{
      value:'0',
      label:'已删除',
      color:'red'
    }]
  },
  {
    title: '文件排序',
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
    width: 150,
    operationData:[{
      type:'link',
      label:'恢复',
      lx:'2',
      click:true,
    },{
      type:'link',
      label:'彻底删除',
      lx:'-2',
      danger:true,
      click:true,
    }]
  },
];


export const columns_share = [
  {
    title: '文件id',
    dataIndex: 'id',
    width:80,
  },
  {
    title: '文件名称',
    dataIndex: 'k_name',
    width:200,
  },
  {
    title: '文件描述',
    dataIndex: 'k_desc',
    width:200,
  },
  {
    title: '文件类型',
    dataIndex: 'k_lx',
    width:100,
    dicData:[
      {
          value:'1',
          label:'图片',
      },
      {
          value:'2',
          label:'文本',
      },
      {
          value:'3',
          label:'文档',
      },
      {
          value:'4',
          label:'表格',
      },
      {
          value:'5',
          label:'PDF文件',
      },
      {
          value:'6',
          label:'视频文件',
      },
      {
        value:'7',
        label:'PPT文件',
    },
    ]
  },
  {
    title: '文件目录',
    dataIndex: 'k_mulu',
    width:180,
  },
  {
    title: '文件状态',
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
    },{
      value:'0',
      label:'已删除',
      color:'red'
    }]
  },
  // {
  //   title: '文件排序',
  //   dataIndex: 'k_sort',
  //   width:80,
  // },
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
    width: 150,
    operationData:[{
      type:'link',
      label:'查看',
      lx:'3',
      click:true,
    },{
      type:'text',
      label:'更多',
      lx:'duo',
      children:[{
        label:'下载文件',
        lx:'4',
        icon:'VerticalAlignBottomOutlined',
        click:true,
      },{
        label:'复制文件',
        lx:'7',
        icon:'SisternodeOutlined',
        click:true,
      }],
    }]
  },
];